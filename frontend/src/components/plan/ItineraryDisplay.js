import DayCard from "@/components/plan/DayCard";
import BudgetBreakdown from "@/components/plan/BudgetBreakdown";
import PackingList from "@/components/plan/PackingList";

export default function ItineraryDisplay({ itinerary }) {
  if (!itinerary) return null;

  const dailyPlan = itinerary.daily_plan || [];
  const summary = itinerary.trip_summary;
  const perPerson = itinerary.budget_breakdown?.per_person_total;
  const headerBits = [
    itinerary.destination,
    itinerary.travelers ? `${itinerary.travelers} traveler${itinerary.travelers > 1 ? "s" : ""}` : null,
    perPerson != null ? `~₹${Number(perPerson).toLocaleString("en-IN")} / person` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {headerBits.length > 0 && (
        <p
          className="text-base sm:text-lg font-semibold tracking-tight"
          style={{ color: "var(--accent-dark)" }}
        >
          {headerBits.join(" · ")}
        </p>
      )}

      {summary && (
        <div className="card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Trip summary
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {typeof summary === "string" ? summary : JSON.stringify(summary)}
          </p>
        </div>
      )}

      <BudgetBreakdown budget={itinerary.budget_breakdown} />

      {dailyPlan.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mt-2 mb-1">
            <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
              Day-by-day itinerary
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}
            >
              {dailyPlan.length} {dailyPlan.length === 1 ? "day" : "days"}
            </span>
          </div>
          {dailyPlan.map((day, i) => (
            <DayCard key={i} day={day} index={i} />
          ))}
        </div>
      )}

      <PackingList items={itinerary.packing_list} />

      {!dailyPlan.length && itinerary.raw_plan && (
        <div className="card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Itinerary
          </h3>
          <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {itinerary.raw_plan}
          </pre>
        </div>
      )}
    </div>
  );
}
