// Single adapter layer between the Next.js UI and the FastAPI backend.
// UI speaks: { status, daily_plan, trip_summary, research_summary, final_plan, ... }
// Backend speaks: { stage, days, draft_itinerary, research, final_itinerary, ... }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── HTTP helper ────────────────────────────────────────────────────────────

async function request(path, init) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = typeof body?.detail === "string" ? body.detail : JSON.stringify(body);
    } catch {
      try { detail = await res.text(); } catch {}
    }
    throw new Error(detail);
  }
  return res.json();
}

// ─── Mapping: stage → status ────────────────────────────────────────────────

const STAGE_TO_STATUS = {
  research: "researching",
  planning: "planning",
  awaiting_review: "awaiting_review",
  final: "approved",
  error: "failed",
};

function deriveStatus(state) {
  const stage = state?.stage;
  const previous = state?.previous_stage;
  if (stage === "research" && previous) return "revising_research";
  if (stage === "planning" && previous) return "revising_plan";
  return STAGE_TO_STATUS[stage] || "processing";
}

// ─── Mapping: backend Itinerary → UI itinerary ──────────────────────────────

function adaptItinerary(it) {
  if (!it) return null;
  const dailyPlan = (it.days || []).map((d) => ({
    day: d.day,
    date: d.date,
    theme: d.theme,
    morning: d.morning,
    afternoon: d.afternoon,
    evening: d.evening,
    estimated_cost_inr: d.estimated_cost,
  }));

  const budget_breakdown =
    it.budget_breakdown ||
    (it.total_estimated_cost ? { total_estimated: it.total_estimated_cost } : null);

  // Packing is now rendered in its own card; keep trip_summary text-only.
  const trip_summary = it.notes || undefined;

  return {
    trip_summary: trip_summary || undefined,
    budget_breakdown,
    daily_plan: dailyPlan,
    destination: it.destination,
    travelers: it.travelers,
    currency: it.currency,
    total_estimated_cost: it.total_estimated_cost,
    packing_list: it.packing_list,
    notes: it.notes,
  };
}

// ─── Mapping: backend ResearchOutput → UI research_summary ──────────────────

function adaptResearch(r, state) {
  if (!r) return null;
  const lines = [];
  if (r.summary) lines.push(r.summary, "");
  if (r.attractions?.length) {
    lines.push("## Attractions");
    r.attractions.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
  }
  if (r.local_tips?.length) {
    lines.push("## Local tips");
    r.local_tips.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
  }
  if (r.safety?.length) {
    lines.push("## Safety");
    r.safety.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
  }
  if (r.best_time) {
    lines.push("## Best time");
    lines.push(r.best_time);
  }

  return {
    destination: state?.destination,
    travel_dates:
      state?.start_date && state?.end_date
        ? `${state.start_date} → ${state.end_date}`
        : undefined,
    summary: lines.join("\n").trim(),
    raw_tool_outputs: [], // backend doesn't expose raw tool calls today
  };
}

// ─── Mapping: whole state → UI plan response ────────────────────────────────

function adaptPlanResponse(planId, payload) {
  const status = deriveStatus(payload);
  return {
    plan_id: planId,
    status,
    message:
      status === "researching" ? "Researching your destination..."
      : status === "planning" ? "Drafting your itinerary..."
      : status === "revising_research" ? "Re-researching with your feedback..."
      : status === "revising_plan" ? "Revising the plan..."
      : undefined,
    draft_itinerary: adaptItinerary(payload.draft_itinerary),
    research_summary: adaptResearch(payload.research, payload),
    pending_review: payload.pending_review,
    revision_count: payload.revision_count || 0,
  };
}

function adaptFinalResponse(planId, payload, state) {
  const itinerary = adaptItinerary(payload.final_itinerary);

  const overview = {
    destination: state?.destination || itinerary?.destination,
    dates:
      state?.start_date && state?.end_date
        ? `${state.start_date} → ${state.end_date}`
        : undefined,
    travelers: state?.travelers || itinerary?.travelers,
    budget_range_inr:
      state?.budget
        ? `INR ${Number(state.budget).toLocaleString()}`
        : itinerary?.total_estimated_cost
          ? `INR ${itinerary.total_estimated_cost.toLocaleString()}`
          : undefined,
    interests: state?.interests || [],
    revisions_made: state?.revision_count || 0,
  };

  return {
    plan_id: planId,
    final_plan: {
      trip_overview: overview,
      itinerary,
    },
  };
}

// ─── Public API (consumed by UI components) ────────────────────────────────

export async function createPlan(form) {
  const body = {
    destination: form.destination,
    start_date: form.start_date,
    end_date: form.end_date,
    travelers: Number(form.num_travelers || form.travelers || 1),
    budget: Number(form.budget_max || form.budget_min || form.budget || 0),
    interests: form.interests || [],
  };
  const data = await request("/plan", { method: "POST", body: JSON.stringify(body) });
  return adaptPlanResponse(data.plan_id, data);
}

export async function getPlanStatus(planId) {
  const data = await request(`/plan/${planId}`);
  return adaptPlanResponse(planId, data);
}

export async function submitReview(planId, reviewData) {
  const data = await request(`/plan/${planId}/review`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
  return adaptPlanResponse(planId, data);
}

export async function getFinalPlan(planId) {
  const [final, state] = await Promise.all([
    request(`/plan/${planId}/final`),
    request(`/plan/${planId}`).catch(() => ({})),
  ]);
  return adaptFinalResponse(planId, final, state);
}
