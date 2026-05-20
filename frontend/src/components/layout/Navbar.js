import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 w-full z-50 border-b"
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(14px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm"
            style={{
              background: "linear-gradient(135deg, var(--accent-light), var(--teal))",
              color: "#fff",
            }}
          >
            ✈
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              AI Travel Planner
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Multi-agent · LangGraph
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent-dark)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            Live web research
          </span>
        </div>
      </div>
    </nav>
  );
}
