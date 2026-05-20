"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ReviewPanel({ onReview, loading }) {
  const [activeTab, setActiveTab] = useState("approve");
  const [feedback, setFeedback] = useState("");
  const [modifications, setModifications] = useState("");

  const handleSubmit = (action) => {
    const reviewData = { action };
    if (action === "reject") reviewData.feedback = feedback;
    if (action === "modify") reviewData.feedback = modifications;
    onReview(reviewData);
  };

  const tabs = [
    { key: "approve", label: "Approve", hint: "Accept as-is" },
    { key: "reject",  label: "Reject",  hint: "Send back for re-research" },
    { key: "modify",  label: "Modify",  hint: "Tweak specific parts" },
  ];

  const textareaStyle = {
    background: "#fff",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <div
      className="card overflow-hidden"
      style={{
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border-accent)",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{
          background: "linear-gradient(135deg, var(--accent-soft), #f0fdfa)",
          borderColor: "var(--border)",
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Your turn — review this draft
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          The workflow is paused, waiting for your decision
        </p>
      </div>

      <div className="px-5 pt-4 flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                background: active ? "var(--accent)" : "#fff",
                color: active ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                boxShadow: active ? "0 4px 10px rgba(14, 165, 233, 0.20)" : "var(--shadow-sm)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="px-5 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        {tabs.find((t) => t.key === activeTab)?.hint}
      </p>

      <div className="p-5">
        {activeTab === "approve" && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Looks good? Approve to finalise and lock in this itinerary.
            </p>
            <Button variant="success" loading={loading} onClick={() => handleSubmit("approve")}>
              Approve plan
            </Button>
          </div>
        )}

        {activeTab === "reject" && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              The research agent will re-run with your feedback as guidance.
            </p>
            <textarea
              rows={3}
              placeholder='e.g. "Skip the temples, add more nightlife and street food"'
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-xl p-3.5 text-sm outline-none resize-none transition-all"
              style={textareaStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 4px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "var(--shadow-sm)";
              }}
            />
            <Button variant="danger" loading={loading} disabled={!feedback} onClick={() => handleSubmit("reject")}>
              Reject & re-research
            </Button>
          </div>
        )}

        {activeTab === "modify" && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              The planner will revise just the parts you mention — research stays.
            </p>
            <textarea
              rows={3}
              placeholder='e.g. "Swap Day 3 temple with a cooking class. Prefer ryokan over hotel."'
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              className="w-full rounded-xl p-3.5 text-sm outline-none resize-none transition-all"
              style={textareaStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 4px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "var(--shadow-sm)";
              }}
            />
            <Button variant="accent" loading={loading} disabled={!modifications} onClick={() => handleSubmit("modify")}>
              Apply modifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
