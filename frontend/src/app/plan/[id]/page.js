"use client";
import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { getPlanStatus, submitReview, getFinalPlan } from "@/lib/api";
import StatusBadge, { PROCESSING_STATUSES } from "@/components/plan/StatusBadge";
import ProcessingState from "@/components/plan/ProcessingState";
import ItineraryDisplay from "@/components/plan/ItineraryDisplay";
import ReviewPanel from "@/components/plan/ReviewPanel";
import FinalPlanView from "@/components/plan/FinalPlanView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";

export default function PlanPage({ params }) {
  const { id: planId } = use(params);
  const [plan, setPlan] = useState(null);
  const [finalPlan, setFinalPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getPlanStatus(planId);
      setPlan(data);
      if (data.status === "approved") {
        try {
          const final = await getFinalPlan(planId);
          setFinalPlan(final);
        } catch {}
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (plan?.status && !["awaiting_review", "approved", "failed"].includes(plan.status)) {
        fetchStatus();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus, plan?.status]);

  const handleReview = async (reviewData) => {
    setReviewLoading(true);
    setError("");
    try {
      await submitReview(planId, reviewData);
      setPlan((prev) => ({ ...prev, status: "processing" }));
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your plan..." />;

  const isProcessing = PROCESSING_STATUSES.includes(plan?.status);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors hover:underline"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>←</span> Start a new plan
        </Link>

        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight" style={{ color: "var(--text-primary)" }}>
              Your travel plan
            </h1>
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              Plan ID: {planId}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={plan?.status} />
          </div>
        </div>
      </div>

      <ErrorAlert message={error} />

      <div className="space-y-4 mt-4">
        {isProcessing && <ProcessingState plan={plan} />}

        {plan?.status === "awaiting_review" && plan?.draft_itinerary && (
          <>
            <ItineraryDisplay itinerary={plan.draft_itinerary} />
            <ReviewPanel onReview={handleReview} loading={reviewLoading} />
          </>
        )}

        {plan?.status === "approved" && finalPlan && <FinalPlanView finalPlan={finalPlan} />}
      </div>
    </div>
  );
}
