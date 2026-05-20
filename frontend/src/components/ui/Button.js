"use client";

export default function Button({ children, variant = "primary", loading = false, disabled = false, className = "", ...props }) {
  const variants = {
    primary: {
      background: "linear-gradient(135deg, var(--accent), var(--teal))",
      color: "#fff",
      border: "1px solid transparent",
      boxShadow: "0 6px 16px rgba(14, 165, 233, 0.25)",
    },
    success: {
      background: "linear-gradient(135deg, #22c55e, #15803d)",
      color: "#fff",
      border: "1px solid transparent",
      boxShadow: "0 6px 16px rgba(22, 163, 74, 0.22)",
    },
    danger: {
      background: "#fff",
      color: "var(--error)",
      border: "1px solid var(--error)",
    },
    accent: {
      background: "linear-gradient(135deg, var(--peach), #f97316)",
      color: "#fff",
      border: "1px solid transparent",
      boxShadow: "0 6px 16px rgba(251, 146, 60, 0.25)",
    },
    ghost: {
      background: "#fff",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    },
  };

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      style={{ ...variants[variant], opacity: isDisabled ? 0.55 : 1, cursor: isDisabled ? "not-allowed" : "pointer" }}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
          {children}
        </span>
      ) : children}
    </button>
  );
}
