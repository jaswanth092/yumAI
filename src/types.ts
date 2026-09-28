export type Screen =
  | "welcome"
  | "login"
  | "signup"
  | "profile"
  | "home"
  | "analysis"
  | "nutrition"
  | "eatNow"
  | "chat"
  | "history"
  | "privacy";

export type Profile = {
  name: string;
  age: string;
  weight: string;
  height: string;
  activity: "low" | "moderate" | "high" | "";
  foodPreference: "vegetarian" | "non-vegetarian" | "vegan" | "eggetarian" | "";
  healthInfo: string;
};

export const emptyProfile: Profile = {
  name: "",
  age: "",
  weight: "",
  height: "",
  activity: "moderate",
  foodPreference: "vegetarian",
  healthInfo: "",
};

export type AnalysisResult = {
  identified: boolean;
  foodName: string;
  confidence: "High" | "Medium" | "Low";
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients: string[];
  positives: string[];
  concerns: string[];
  suggestions: string[];
  healthScore: number;
  note: string;
};

export type Analysis = AnalysisResult & {
  id: string;
  at: number;
  image?: string;
};

export type EatResult = {
  title: string;
  text: string;
  foods: { name: string; price: string; why: string }[];
};

export type ChatMessage = { role: "user" | "model"; text: string };

export const SITUATIONS: { key: string; label: string; icon: string }[] = [
  { key: "class", label: "Class", icon: "📚" },
  { key: "lab", label: "Lab", icon: "💻" },
  { key: "exam", label: "Exam", icon: "📝" },
  { key: "sports", label: "Sports", icon: "🏃" },
  { key: "home", label: "At Home", icon: "🏠" },
  { key: "travelling", label: "Travelling", icon: "🚌" },
];
