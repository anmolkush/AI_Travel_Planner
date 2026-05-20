export default function HeroSection() {
  return (
    <div className="text-center mb-10 max-w-2xl mx-auto">
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
        style={{
          background: "var(--accent-soft)",
          color: "var(--accent-dark)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: "var(--accent)" }} />
        Powered by real-time web research
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight" style={{ color: "var(--text-primary)" }}>
        Plan your dream trip
        <span
          className="block mt-1"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--teal))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          with AI agents
        </span>
      </h1>

      <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Two specialised agents research your destination and craft a day-by-day itinerary.
        Review, tweak, or approve the draft — you&apos;re always in the loop.
      </p>
    </div>
  );
}
