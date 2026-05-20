const STATUS_CONFIG = {
  processing:        { label: "Processing",        fg: "var(--warning)",       bg: "var(--warning-soft)",  border: "#fde68a" },
  researching:       { label: "Researching",       fg: "var(--accent-dark)",   bg: "var(--accent-soft)",   border: "var(--border-accent)" },
  planning:          { label: "Planning",          fg: "#0f766e",              bg: "var(--teal-soft)",     border: "#99f6e4" },
  revising_research: { label: "Re-researching",    fg: "var(--accent-dark)",   bg: "var(--accent-soft)",   border: "var(--border-accent)" },
  revising_plan:     { label: "Revising plan",     fg: "#c2410c",              bg: "var(--peach-soft)",    border: "#fdba74" },
  awaiting_review:   { label: "Awaiting review",   fg: "var(--accent-dark)",   bg: "var(--accent-soft)",   border: "var(--border-accent)" },
  approved:          { label: "Approved",          fg: "#15803d",              bg: "var(--success-soft)",  border: "#86efac" },
  failed:            { label: "Failed",            fg: "#991b1b",              bg: "var(--error-soft)",    border: "#fca5a5" },
};

export const PROCESSING_STATUSES = ["processing", "researching", "planning", "revising_research", "revising_plan"];

export default function StatusBadge({ status }) {
  const info = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  const isProcessing = PROCESSING_STATUSES.includes(status);

  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium"
      style={{ background: info.bg, color: info.fg, border: `1px solid ${info.border}` }}
    >
      <span
        className={`w-2 h-2 rounded-full ${isProcessing ? "animate-pulse-soft" : ""}`}
        style={{ background: info.fg }}
      />
      <span>{info.label}</span>
    </div>
  );
}
