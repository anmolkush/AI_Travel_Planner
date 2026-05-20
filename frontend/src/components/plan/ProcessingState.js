export default function ProcessingState({ plan }) {
  const s = plan?.status;
  const isResearching = s === "researching" || s === "revising_research";
  const isPlanning = s === "planning" || s === "revising_plan";

  const steps = [
    { key: "validate", label: "Validate input",       done: true },
    { key: "research", label: "Research destination", done: isPlanning, active: isResearching },
    { key: "plan",     label: "Draft itinerary",      done: false,      active: isPlanning },
    { key: "review",   label: "Awaiting your review", done: false,      active: false },
  ];

  return (
    <div className="card p-8 sm:p-10 text-center" style={{ boxShadow: "var(--shadow-md)" }}>
      <div className="flex justify-center mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-soft"
          style={{
            background: "linear-gradient(135deg, var(--accent-soft), var(--teal-soft))",
            border: "1px solid var(--border-accent)",
          }}
        >
          <div
            className="w-7 h-7 rounded-full animate-spin-slow"
            style={{
              border: "3px solid #fff",
              borderTopColor: "var(--accent)",
            }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        {plan?.message || "Agents are working..."}
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Live web research + itinerary planning. Usually takes 30–60 seconds.
      </p>

      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                background: step.done
                  ? "var(--success-soft)"
                  : step.active
                  ? "var(--accent-soft)"
                  : "var(--bg-soft)",
                color: step.done
                  ? "#15803d"
                  : step.active
                  ? "var(--accent-dark)"
                  : "var(--text-muted)",
                border: `1px solid ${
                  step.done ? "#86efac" : step.active ? "var(--accent)" : "var(--border)"
                }`,
              }}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-6 sm:w-10 h-px"
                style={{ background: step.done ? "var(--success)" : "var(--border)" }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs" style={{ color: "var(--text-muted)" }}>
        {steps.map((step) => (
          <span key={step.key} className="w-14 sm:w-24 text-center truncate">
            {step.label}
          </span>
        ))}
      </div>

      {plan?.revision_count > 0 && (
        <p
          className="mt-5 inline-block text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: "var(--peach-soft)", color: "#c2410c", border: "1px solid #fdba74" }}
        >
          Revision #{plan.revision_count}
        </p>
      )}

      <p className="mt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
        Auto-refreshing every 4s
      </p>
    </div>
  );
}
