"use client";

const INTEREST_OPTIONS = [
  "food", "culture", "nature", "adventure", "history", "art",
  "shopping", "nightlife", "relaxation", "photography", "architecture",
  "wellness", "beach", "music", "sports", "family",
];

export default function InterestPicker({ selected = [], onChange }) {
  const toggle = (interest) => {
    onChange(
      selected.includes(interest)
        ? selected.filter((i) => i !== interest)
        : [...selected, interest]
    );
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
        Interests
        <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
          · pick at least one
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((key) => {
          const isActive = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className="px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer capitalize hover:-translate-y-0.5"
              style={{
                background: isActive ? "var(--accent-soft)" : "#fff",
                color: isActive ? "var(--accent-dark)" : "var(--text-secondary)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                boxShadow: isActive ? "0 4px 10px rgba(14, 165, 233, 0.12)" : "var(--shadow-sm)",
              }}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
