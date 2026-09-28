import http from "node:http";

/**
 * YumAI backend.
 * Holds the Gemini key, builds the prompts and talks to the model.
 * The key never reaches the browser.
 */

const PORT = Number(process.env.API_PORT ?? process.env.PORT ?? 8787);
const HOST = "0.0.0.0";
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
// If the preferred model is busy or retired for this key, try these in order.
const FALLBACK_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
];
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MAX_BODY = 8 * 1024 * 1024; // 8 MB — a downscaled food photo fits easily

/* ------------------------------------------------------------------ *
 * plumbing
 * ------------------------------------------------------------------ */

function allowedOrigins() {
  return [
    process.env.MYTHEX_WEB_ORIGIN,
    process.env.CORS_ORIGIN,
    process.env.EXTRA_CORS_ORIGINS,
  ]
    .filter(Boolean)
    .join(",")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function cors(req) {
  const headers = { Vary: "Origin" };
  const origin = req.headers.origin;
  const list = allowedOrigins();
  if (origin && (list.includes("*") || list.includes(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
  headers["Access-Control-Allow-Headers"] = "content-type";
  return headers;
}

function sendJson(req, res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...cors(req),
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error("That image is too large."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("Invalid request body."), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

const clean = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* ------------------------------------------------------------------ *
 * prompts
 * ------------------------------------------------------------------ */

function profileSummary(p) {
  if (!p || typeof p !== "object") return "";
  const bits = [];
  if (clean(p.name, 40)) bits.push(`name ${clean(p.name, 40)}`);
  if (clean(p.age, 3)) bits.push(`age ${clean(p.age, 3)}`);
  if (clean(p.weight, 5)) bits.push(`${clean(p.weight, 5)} kg`);
  if (clean(p.height, 5)) bits.push(`${clean(p.height, 5)} cm`);
  if (clean(p.activity, 20)) bits.push(`${clean(p.activity, 20)} activity level`);
  if (clean(p.foodPreference, 30)) bits.push(`prefers ${clean(p.foodPreference, 30)} food`);
  if (clean(p.healthInfo, 300)) bits.push(`notes: ${clean(p.healthInfo, 300)}`);
  return bits.length ? `User profile — ${bits.join(", ")}.` : "";
}

function mealSummary(m) {
  if (!m || typeof m !== "object") return "";
  const name = clean(m.foodName, 60);
  if (!name) return "";
  return `Their most recent scanned meal: ${name}, about ${Number(m.calories) || 0} kcal, ` +
    `${Number(m.protein) || 0} g protein, ${Number(m.carbs) || 0} g carbs, ${Number(m.fat) || 0} g fat.`;
}

const CHAT_SYSTEM = [
  "You are YumAI, a warm and practical food & nutrition assistant for students and young active people, mainly in an Indian campus setting: hostel mess, canteen, tiffin, cheap local food, ₹ budgets.",
  "Give specific, usable answers — real dishes and portion ideas, not vague advice. Prefer short paragraphs or dashes. Stay under 160 words unless the user asks for detail.",
  "You are not a doctor or dietitian. For medical conditions, pregnancy, allergies or eating-disorder concerns, say plainly that they should check with a professional.",
].join(" ");

const ANALYSIS_SYSTEM = [
  "You are YumAI's plate scanner. You look at one photo of a meal and estimate its nutrition.",
  "Reply with JSON only — no prose, no markdown — using exactly this shape:",
  `{"identified":true,"foodName":"","confidence":"High","portion":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"sodium":0,"ingredients":[],"positives":[],"concerns":[],"suggestions":[],"healthScore":0,"note":""}`,
  'Rules: confidence is exactly "High", "Medium" or "Low". Numbers are for the single serving actually visible in the photo, calories in kcal, sodium in mg, macros in grams. healthScore is 0-100 for overall nutrient balance.',
  "If the photo does not clearly show food, set identified to false, keep the name generic and explain why in note — never invent dishes you cannot see.",
  "ingredients: 3-8 items. positives / concerns: 1-4 short points each. suggestions: 2-4 practical fixes (what to add or remove next time). note: one or two sentences about how certain you are.",
].join(" ");

const EAT_SYSTEM = [
  "You are YumAI's meal suggester. A student tells you what they are doing right now and what they can spend; you suggest what to eat.",
  "Reply with JSON only — no prose, no markdown — using exactly this shape:",
  `{"title":"","text":"","foods":[{"name":"","price":"₹50","why":""}]}`,
  "Give 3 to 5 foods that are easy to get in that situation and fit the budget in Indian rupees. Respect their food preference absolutely. The text is 2-3 sentences on why this works now.",
].join(" ");

/* ------------------------------------------------------------------ *
 * gemini
 * ------------------------------------------------------------------ */

const modelChain = () =>
  [MODEL, ...FALLBACK_MODELS].filter((m, i, all) => m && all.indexOf(m) === i);

function geminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw Object.assign(
      new Error("No Gemini API key is configured for this project yet."),
      { status: 503 },
    );
  }
  return key;
}

/** One call to one model. Throws an error flagged `retryable` when another model may do better. */
async function callModel(model, { contents, system, json = false, temperature = 0.7, maxTokens = 4096 }) {
  const generationConfig = { temperature, maxOutputTokens: maxTokens };
  if (json) generationConfig.responseMimeType = "application/json";

  const payload = { contents, generationConfig };
  if (system) payload.systemInstruction = { parts: [{ text: system }] };

  let res;
  try {
    res = await fetch(`${API_BASE}/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": geminiKey() },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw Object.assign(new Error(`Could not reach Gemini: ${e.message}`), {
      status: 502,
      retryable: true,
    });
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || `Gemini request failed (${res.status})`;
    throw Object.assign(new Error(message), {
      status: res.status === 429 ? 429 : 502,
      retryable:
        res.status === 429 ||
        res.status >= 500 ||
        /high demand|overloaded|no longer available|not found|not supported|quota/i.test(message),
    });
  }

  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p?.text || "")
    .join("")
    .trim();

  if (!text) {
    throw Object.assign(new Error("The model returned an empty response."), {
      status: 502,
      retryable: true,
    });
  }

  return text;
}

/** Plain-text reply: first model in the chain that answers wins. */
async function generate(args) {
  let lastError = null;
  for (const model of modelChain()) {
    try {
      return { text: await callModel(model, args), model };
    } catch (err) {
      lastError = err;
      if (!err.retryable) throw err;
    }
  }
  throw lastError || new Error("All Gemini models are busy right now — please try again.");
}

/** JSON reply: keep going down the chain until one model returns JSON we can actually read. */
async function generateJson(args) {
  let lastError = null;
  for (const model of modelChain()) {
    let text;
    try {
      text = await callModel(model, args);
    } catch (err) {
      lastError = err;
      if (!err.retryable) throw err;
      continue;
    }
    try {
      return { result: parseJson(text), model };
    } catch (err) {
      lastError = err; // truncated or malformed — try the next model
    }
  }
  throw lastError || new Error("The AI is busy right now — please try again.");
}

function parseJson(text) {
  const cleaned = String(text)
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    const err = new Error("The AI reply could not be read. Please try again.");
    err.status = 502;
    err.raw = cleaned.slice(0, 500);
    throw err;
  }
}

function imagePart(image) {
  const url = typeof image === "string" ? image : image?.dataUrl;
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(
    String(url || ""),
  );
  if (!match) return null;
  return { inlineData: { mimeType: match[1], data: match[2] } };
}

function toContents(messages, limit = 14) {
  const list = Array.isArray(messages) ? messages.slice(-limit) : [];
  const out = [];
  for (const m of list) {
    const text = clean(m?.text, 4000);
    if (!text) continue;
    out.push({
      role: m.role === "model" || m.role === "assistant" ? "model" : "user",
      parts: [{ text }],
    });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

/* ------------------------------------------------------------------ *
 * result shaping — the UI can rely on every field existing
 * ------------------------------------------------------------------ */

const asInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};
const asList = (v, max = 8) =>
  (Array.isArray(v) ? v : [])
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);

function shapeAnalysis(raw, fallbackName = "Your meal") {
  const confidence = ["High", "Medium", "Low"].includes(raw?.confidence)
    ? raw.confidence
    : "Medium";
  const identified = raw?.identified !== false && Boolean(clean(raw?.foodName, 80));
  return {
    identified,
    foodName: clean(raw?.foodName, 80) || fallbackName,
    confidence,
    portion: clean(raw?.portion, 80) || "1 serving",
    calories: asInt(raw?.calories),
    protein: asInt(raw?.protein),
    carbs: asInt(raw?.carbs),
    fat: asInt(raw?.fat),
    fiber: asInt(raw?.fiber),
    sugar: asInt(raw?.sugar),
    sodium: asInt(raw?.sodium),
    ingredients: asList(raw?.ingredients, 8),
    positives: asList(raw?.positives, 4),
    concerns: asList(raw?.concerns, 4),
    suggestions: asList(raw?.suggestions, 4),
    healthScore: Math.min(100, asInt(raw?.healthScore)),
    note: clean(raw?.note, 400),
  };
}

function shapeEat(raw) {
  const foods = (Array.isArray(raw?.foods) ? raw.foods : [])
    .map((f) => ({
      name: clean(f?.name, 80),
      price: clean(f?.price, 24),
      why: clean(f?.why, 200),
    }))
    .filter((f) => f.name)
    .slice(0, 6);
  return {
    title: clean(raw?.title, 80) || "Your suggestion",
    text: clean(raw?.text, 600),
    foods,
  };
}

/* ------------------------------------------------------------------ *
 * routes
 * ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "local"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors(req));
    return res.end();
  }

  try {
    if (url.pathname === "/api/health") {
      return sendJson(req, res, 200, {
        ok: true,
        model: MODEL,
        keyConfigured: Boolean(process.env.GEMINI_API_KEY),
      });
    }

    // ---- food chat -------------------------------------------------
    if (url.pathname === "/api/chat" && req.method === "POST") {
      const body = await readBody(req);
      const contents = toContents(body?.messages);
      if (!contents.length) {
        return sendJson(req, res, 400, { error: "Type a question first." });
      }
      const system = [CHAT_SYSTEM, profileSummary(body?.profile), mealSummary(body?.lastMeal)]
        .filter(Boolean)
        .join("\n");
      const { text, model } = await generate({
        contents,
        system,
        temperature: 0.75,
        maxTokens: 4096,
      });
      return sendJson(req, res, 200, { reply: text, model });
    }

    // ---- photo analysis --------------------------------------------
    if (url.pathname === "/api/analyze" && req.method === "POST") {
      const body = await readBody(req);
      const part = imagePart(body?.image);
      if (!part) {
        return sendJson(req, res, 400, { error: "Please choose a food photo first." });
      }
      const system = [ANALYSIS_SYSTEM, profileSummary(body?.profile)]
        .filter(Boolean)
        .join("\n");
      const { result: raw, model } = await generateJson({
        contents: [
          {
            role: "user",
            parts: [
              part,
              {
                text:
                  "Analyse this meal photo and reply with the JSON object described in your instructions.",
              },
            ],
          },
        ],
        system,
        json: true,
        temperature: 0.35,
        maxTokens: 8192,
      });
      return sendJson(req, res, 200, { result: shapeAnalysis(raw), model });
    }

    // ---- what should I eat now -------------------------------------
    if (url.pathname === "/api/eat-now" && req.method === "POST") {
      const body = await readBody(req);
      const situation = clean(body?.situation, 40) || "class";
      const budget = asInt(body?.budget);
      const system = [EAT_SYSTEM, profileSummary(body?.profile), mealSummary(body?.lastMeal)]
        .filter(Boolean)
        .join("\n");
      const { result: raw, model } = await generateJson({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  `Right now I am: ${situation}. My budget for this meal is about ₹${budget}. ` +
                  "What should I eat? Reply with the JSON object described in your instructions.",
              },
            ],
          },
        ],
        system,
        json: true,
        temperature: 0.8,
        maxTokens: 8192,
      });
      return sendJson(req, res, 200, { result: shapeEat(raw), model });
    }

    return sendJson(req, res, 404, { error: "Not found" });
  } catch (err) {
    const status = err?.status || 500;
    return sendJson(req, res, status, {
      error: err?.message || "Something went wrong on our side. Please try again.",
      ...(err?.raw && process.env.YUMAI_DEBUG ? { raw: err.raw } : {}),
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`YumAI api listening on ${HOST}:${PORT} (model: ${MODEL})`);
});
