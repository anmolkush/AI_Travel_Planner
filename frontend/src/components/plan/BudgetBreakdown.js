const CATEGORY_COLORS = {
  accommodation:              "var(--accent)",
  food_and_dining:            "#f97316",
  activities_and_attractions: "var(--teal)",
  local_transport:            "#8b5cf6",
  shopping_and_miscellaneous: "#ec4899",
  emergency_reserve:          "#ef4444",
};

function formatVal(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return `₹${v.toLocaleString("en-IN")}`;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function BudgetBreakdown({ budget }) {
  if (!budget) return null;

  const entries = Object.entries(budget).filter(([k]) => k !== "per_person_total");

  return (
    <div className="card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
      <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Budget breakdown
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map(([key, val]) => {
          const color = CATEGORY_COLORS[key] || "var(--accent)";
          return (
            <div
              key={key}
              className="rounded-xl p-3.5"
              style={{
                background: "var(--bg-tint)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <p className="text-[11px] font-medium uppercase tracking-wide capitalize" style={{ color: "var(--text-muted)" }}>
                  {key.replace(/_/g, " ")}
                </p>
              </div>
              <p className="font-semibold text-sm" style={{ color }}>
                {formatVal(val)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
