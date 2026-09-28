import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.03] ${className}`}
    >
      {children}
    </div>
  );
}

/** The shared page container: full width on phones, comfortably wider on desktop. */
export function PageBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-md px-4 pt-4 pb-8 sm:max-w-2xl sm:px-6 lg:max-w-5xl lg:px-8 lg:pb-12 ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 active:scale-[0.99] ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-bold tracking-wide text-slate-600 uppercase">
        {label}
        {hint && <span className="text-[10px] font-medium normal-case text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#fbfbf9]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3 sm:max-w-2xl sm:px-6 lg:max-w-5xl lg:px-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300"
          >
            ←
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 lg:text-lg">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      {label}
    </span>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700"
    >
      {message}
    </p>
  );
}

export function ListCard({
  title,
  items,
  tone = "slate",
}: {
  title: string;
  items: string[];
  tone?: "slate" | "green" | "amber" | "violet";
}) {
  if (!items.length) return null;
  const tones: Record<string, string> = {
    slate: "border-slate-200 bg-white",
    green: "border-emerald-200 bg-emerald-50/60",
    amber: "border-amber-200 bg-amber-50/60",
    violet: "border-violet-200 bg-violet-50/60",
  };
  return (
    <div className={`rounded-3xl border p-4 ${tones[tone]}`}>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
