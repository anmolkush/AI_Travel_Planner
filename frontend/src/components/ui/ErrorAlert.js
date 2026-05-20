export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div
      className="rounded-xl p-4 text-sm flex items-start gap-3"
      style={{
        background: "var(--error-soft)",
        border: "1px solid #fca5a5",
        color: "#991b1b",
      }}
    >
      <span
        className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: "var(--error)" }}
      />
      <span className="flex-1">{message}</span>
    </div>
  );
}
