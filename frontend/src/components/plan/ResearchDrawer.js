"use client";
import { useEffect, useState } from "react";

/** Right-side drawer with three tabs:
 *    - Summary    → LLM-formatted research markdown (existing behaviour)
 *    - Web search → raw Serper JSON per query
 *    - Weather    → raw OpenWeatherMap current + forecast JSON
 */
export default function ResearchDrawer({ open, onClose, research }) {
  const [tab, setTab] = useState("summary");

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!research) return null;

  const summary = research.summary || research.research_highlights || "";
  const raw = Array.isArray(research.raw_tool_outputs) ? research.raw_tool_outputs : [];
  const webCalls = raw.filter((r) => r.kind === "web_search");
  const weatherCalls = raw.filter((r) => r.kind === "weather");
  const destination = research.destination;
  const dates = research.travel_dates;

  const tabs = [
    { key: "summary",  label: "Summary",          count: null },
    { key: "web",      label: "Web search (raw)", count: webCalls.length },
    { key: "weather",  label: "Weather (raw)",    count: weatherCalls.length },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(15, 23, 42, 0.32)" }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-out shadow-2xl flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          width: "min(560px, 100vw)",
          background: "#fff",
          borderLeft: "1px solid var(--border)",
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-start justify-between gap-3"
          style={{
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, var(--accent-soft), #f0fdfa)",
          }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <span
              className="mt-0.5 w-1 h-9 rounded-full flex-shrink-0"
              style={{ background: "var(--accent)" }}
            />
            <div className="leading-tight min-w-0">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Live research
              </h3>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                {destination ? destination : "Destination intel"}
                {dates ? ` · ${dates}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
            style={{
              background: "#fff",
              color: "var(--accent-dark)",
              border: "1px solid var(--border-accent)",
            }}
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b" style={{ borderColor: "var(--border)" }}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-3 py-2 text-sm font-medium transition-colors relative cursor-pointer"
                style={{
                  color: active ? "var(--accent-dark)" : "var(--text-secondary)",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {t.label}
                {typeof t.count === "number" && (
                  <span
                    className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: active ? "var(--accent-soft)" : "var(--bg-soft)",
                      color: active ? "var(--accent-dark)" : "var(--text-muted)",
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "summary" && <SummaryView summary={summary} />}
          {tab === "web" && <WebRawView calls={webCalls} />}
          {tab === "weather" && <WeatherRawView calls={weatherCalls} />}
        </div>
      </aside>
    </>
  );
}

/* ──────────────── Summary (markdown-lite) ──────────────── */

function SummaryView({ summary }) {
  if (!summary) {
    return <Empty text="No summary yet — the research agent hasn't finished." />;
  }
  return <div>{renderMarkdownLite(summary)}</div>;
}

function renderMarkdownLite(text) {
  const lines = text.split("\n");
  const blocks = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="space-y-1.5 my-2 ml-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
            <span style={{ color: "var(--text-secondary)" }}>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
      return;
    }
    flushList(idx);
    if (!line.trim()) return;

    if (line.startsWith("### ")) {
      blocks.push(<h5 key={idx} className="text-sm font-semibold mt-3 mb-1" style={{ color: "var(--text-primary)" }}>{renderInline(line.slice(4))}</h5>);
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h4 key={idx} className="text-base font-semibold mt-4 mb-1.5 flex items-center gap-2" style={{ color: "var(--accent-dark)" }}>
          <span className="w-1 h-4 rounded-full" style={{ background: "var(--accent)" }} />
          {renderInline(line.slice(3))}
        </h4>
      );
    } else if (line.startsWith("# ")) {
      blocks.push(<h3 key={idx} className="text-lg font-bold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>{renderInline(line.slice(2))}</h3>);
    } else {
      blocks.push(<p key={idx} className="text-sm leading-relaxed my-1.5" style={{ color: "var(--text-secondary)" }}>{renderInline(line)}</p>);
    }
  });
  flushList("end");
  return blocks;
}

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*)|(https?:\/\/[^\s)]+)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1]) {
      parts.push(<strong key={`b-${key++}`} style={{ color: "var(--text-primary)", fontWeight: 600 }}>{match[1].slice(2, -2)}</strong>);
    } else if (match[2]) {
      let host;
      try { host = new URL(match[2]).hostname.replace("www.", ""); }
      catch { host = match[2]; }
      parts.push(
        <a key={`l-${key++}`} href={match[2]} target="_blank" rel="noopener noreferrer"
           className="underline decoration-dotted hover:decoration-solid"
           style={{ color: "var(--accent-dark)" }}>
          {host}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : text;
}

/* ──────────────── Raw Serper view ──────────────── */

function WebRawView({ calls }) {
  if (!calls.length) {
    return <Empty text="No Serper calls captured yet. The research agent runs them at the start of the workflow." />;
  }
  return (
    <div className="space-y-4">
      {calls.map((call, idx) => (
        <SerperCall key={idx} call={call} idx={idx} />
      ))}
    </div>
  );
}

function SerperCall({ call, idx }) {
  const [showJson, setShowJson] = useState(false);
  const { query, data } = call;
  const error = data?.error;
  const organic = Array.isArray(data?.organic) ? data.organic : [];
  const kg = data?.knowledgeGraph;
  const answerBox = data?.answerBox;
  const paa = Array.isArray(data?.peopleAlsoAsk) ? data.peopleAlsoAsk : [];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Query header */}
      <div className="px-3.5 py-2.5 flex items-start justify-between gap-3" style={{ background: "var(--bg-tint)" }}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Query {idx + 1}
          </p>
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {query}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="text-[11px] font-medium px-2 py-1 rounded-md flex-shrink-0"
          style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          {showJson ? "Hide JSON" : "Show JSON"}
        </button>
      </div>

      <div className="px-3.5 py-3 space-y-3" style={{ background: "#fff" }}>
        {error && (
          <p className="text-xs" style={{ color: "var(--error)" }}>Error: {error}</p>
        )}

        {kg && (
          <Section label="Knowledge graph">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{kg.title}</p>
            {kg.description && <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-secondary)" }}>{kg.description}</p>}
          </Section>
        )}

        {answerBox && (
          <Section label="Answer box">
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {answerBox.answer || answerBox.snippet}
            </p>
          </Section>
        )}

        {organic.length > 0 && (
          <Section label={`Organic results · ${organic.length}`}>
            <ol className="space-y-2.5">
              {organic.slice(0, 8).map((item, i) => (
                <li key={i} className="text-xs leading-relaxed">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                    style={{ color: "var(--accent-dark)" }}
                  >
                    {item.title}
                  </a>
                  {item.snippet && (
                    <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.snippet}</p>
                  )}
                  {item.link && (
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                      {(() => { try { return new URL(item.link).hostname.replace("www.", ""); } catch { return item.link; } })()}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {paa.length > 0 && (
          <Section label="People also ask">
            <ul className="space-y-1.5">
              {paa.slice(0, 4).map((q, i) => (
                <li key={i} className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>Q: </span>{q.question}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {showJson && (
          <pre
            className="text-[10px] leading-relaxed p-3 rounded-lg overflow-x-auto"
            style={{
              background: "#0f172a",
              color: "#a5f3fc",
              maxHeight: 320,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ──────────────── Raw weather view ──────────────── */

function WeatherRawView({ calls }) {
  if (!calls.length) {
    return <Empty text="No weather calls captured yet." />;
  }
  return (
    <div className="space-y-4">
      {calls.map((call, idx) => (
        <WeatherCall key={idx} call={call} idx={idx} />
      ))}
    </div>
  );
}

function WeatherCall({ call, idx }) {
  const [showJson, setShowJson] = useState(false);
  const { query, data } = call;
  const error = data?.error;
  const current = data?.current;
  const forecast = data?.forecast;

  // Aggregate forecast into daily summary
  const daily = {};
  if (forecast?.list) {
    for (const entry of forecast.list) {
      const date = new Date(entry.dt * 1000).toISOString().slice(0, 10);
      if (!daily[date]) daily[date] = { temps: [], desc: [] };
      daily[date].temps.push(entry.main.temp);
      daily[date].desc.push(entry.weather[0]?.description);
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="px-3.5 py-2.5 flex items-start justify-between gap-3" style={{ background: "var(--bg-tint)" }}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Lookup {idx + 1}
          </p>
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {query}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="text-[11px] font-medium px-2 py-1 rounded-md flex-shrink-0"
          style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          {showJson ? "Hide JSON" : "Show JSON"}
        </button>
      </div>

      <div className="px-3.5 py-3 space-y-3" style={{ background: "#fff" }}>
        {error && (
          <p className="text-xs" style={{ color: "var(--error)" }}>Error: {error}</p>
        )}

        {current && (
          <Section label={`Current conditions in ${current.name || query}`}>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Temp"     value={`${current.main?.temp?.toFixed(1)}°C`} />
              <Metric label="Feels"    value={`${current.main?.feels_like?.toFixed(1)}°C`} />
              <Metric label="Humidity" value={`${current.main?.humidity}%`} />
              <Metric label="Wind"     value={`${current.wind?.speed} m/s`} />
            </div>
            <p className="text-xs mt-2 capitalize" style={{ color: "var(--text-secondary)" }}>
              {current.weather?.[0]?.description}
            </p>
          </Section>
        )}

        {Object.keys(daily).length > 0 && (
          <Section label={`Forecast · ${Object.keys(daily).length} days`}>
            <ul className="space-y-1.5">
              {Object.entries(daily).slice(0, 7).map(([date, d]) => {
                const min = Math.min(...d.temps).toFixed(0);
                const max = Math.max(...d.temps).toFixed(0);
                const mode = [...new Set(d.desc)][0];
                return (
                  <li key={date} className="text-xs flex items-baseline gap-2">
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{date}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{min}–{max}°C</span>
                    <span className="capitalize" style={{ color: "var(--text-muted)" }}>· {mode}</span>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {showJson && (
          <pre
            className="text-[10px] leading-relaxed p-3 rounded-lg overflow-x-auto"
            style={{
              background: "#0f172a",
              color: "#a5f3fc",
              maxHeight: 320,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ──────────────── Small helpers ──────────────── */

function Section({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div
      className="rounded-lg p-2"
      style={{ background: "var(--bg-tint)", border: "1px solid var(--border)" }}
    >
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="text-center py-10">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{text}</p>
    </div>
  );
}
