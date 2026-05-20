"use client";

export default function Input({ label, ...props }) {
  const style = {
    background: "#fff",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: "12px",
    padding: "12px 14px",
    width: "100%",
    outline: "none",
    fontSize: "14px",
    transition: "all 0.2s",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <input
        style={style}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 4px var(--accent-glow)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "var(--shadow-sm)";
        }}
        {...props}
      />
    </div>
  );
}
