export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div
          className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin-slow"
          style={{
            border: "3px solid var(--accent-soft)",
            borderTopColor: "var(--accent)",
          }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{text}</p>
      </div>
    </div>
  );
}
