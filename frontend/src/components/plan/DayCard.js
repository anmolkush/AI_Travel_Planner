const TIME_META = {
  morning:   { label: "Morning",   accent: "#d97706", bg: "#fffbeb", dot: "#f59e0b" },
  afternoon: { label: "Afternoon", accent: "#0284c7", bg: "#f0f9ff", dot: "#0ea5e9" },
  evening:   { label: "Evening",   accent: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
};

const _FILLER = ["rest", "free time", "leisure", "personal time", "explore on your own", "relax", "local exploration", "optional"];

function normaliseSlot(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    const text = raw.trim();
    return text && !_FILLER.includes(text.toLowerCase()) ? { activity: text } : null;
  }
  if (typeof raw !== "object") return null;
  const activity = (raw.activity || raw.title || raw.name || "").toString().trim();
  const description = (raw.description || raw.details || "").toString().trim();
  if (!activity && !description) return null;
  if (_FILLER.includes(activity.toLowerCase())) return null;
  return {
    activity: activity || description,
    description: activity ? description : "",
    cost: raw.estimated_cost_inr ?? raw.cost ?? null,
  };
}

export default function DayCard({ day, index }) {
  const slots = ["morning", "afternoon", "evening"]
    .map((time) => ({ time, meta: TIME_META[time], data: normaliseSlot(day[time]) }))
    .filter((s) => s.data);

  const meals = day.meals && typeof day.meals === "object"
    ? Object.entries(day.meals).filter(([, v]) => v && String(v).trim())
    : [];

  return (
    <div className="card card-hover p-5 transition-all duration-200" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold leading-none"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--teal))",
              color: "#fff",
            }}
          >
            <span className="text-[9px] font-medium opacity-90 tracking-wider">DAY</span>
            <span className="text-sm mt-0.5">{day.day || index + 1}</span>
          </div>
          {day.date && (
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {day.date}
            </span>
          )}
        </div>
        {day.theme && (
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent-dark)",
              border: "1px solid var(--border-accent)",
            }}
          >
            {day.theme}
          </span>
        )}
      </div>

      {slots.length > 0 ? (
        <div className="space-y-2.5">
          {slots.map(({ time, meta, data }) => (
            <div
              key={time}
              className="rounded-xl p-3.5"
              style={{ background: meta.bg, border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: meta.dot }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: meta.accent }}
                >
                  {meta.label}
                </span>
                {data.cost > 0 && (
                  <span className="ml-auto text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    ₹{Number(data.cost).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {data.activity}
              </p>
              {data.description && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {data.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
          No scheduled activities for this day.
        </p>
      )}

      {meals.length > 0 && (
        <div
          className="rounded-xl p-3.5 mt-3"
          style={{ background: "#fef7ed", border: "1px solid #fed7aa" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#c2410c" }}>
              Meals
            </span>
          </div>
          <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
            {meals.map(([meal, rec]) => (
              <div key={meal} className="flex gap-2">
                <span className="capitalize font-medium min-w-[80px]" style={{ color: "var(--text-primary)" }}>
                  {meal}
                </span>
                <span>{typeof rec === "string" ? rec : JSON.stringify(rec)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
