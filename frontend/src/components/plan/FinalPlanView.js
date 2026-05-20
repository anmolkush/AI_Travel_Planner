import ItineraryDisplay from "@/components/plan/ItineraryDisplay";

export default function FinalPlanView({ finalPlan }) {
  if (!finalPlan) return null;

  const plan = finalPlan.final_plan || {};
  const overview = plan.trip_overview;
  const itinerary = plan.itinerary || plan;

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-6 flex items-start gap-4"
        style={{
          background: "linear-gradient(135deg, var(--success-soft), var(--teal-soft))",
          border: "1px solid #86efac",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <span
          className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: "var(--success)" }}
        />
        <div>
          <h2 className="text-lg font-bold mb-0.5" style={{ color: "#14532d" }}>
            Plan approved & finalised
          </h2>
          <p className="text-sm" style={{ color: "#166534" }}>
            Your travel plan is locked in. Have an amazing trip!
          </p>
        </div>
      </div>

      {overview && (
        <div className="card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Trip overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <OverviewItem label="Destination" value={overview.destination} />
            <OverviewItem label="Dates"       value={overview.dates} />
            <OverviewItem label="Travellers"  value={overview.travelers} />
            <OverviewItem label="Budget"      value={overview.budget_range_inr} />
            <OverviewItem label="Interests"   value={(overview.interests || []).join(", ")} />
            <OverviewItem label="Revisions"   value={overview.revisions_made ?? 0} />
          </div>
        </div>
      )}

      <ItineraryDisplay itinerary={itinerary} />
    </div>
  );
}

function OverviewItem({ label, value }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "var(--bg-tint)", border: "1px solid var(--border)" }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {value || "—"}
      </p>
    </div>
  );
}
