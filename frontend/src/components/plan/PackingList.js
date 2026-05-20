const CATEGORY_HINTS = [
  { match: /pass(port)?|visa|ticket|boarding|id|license/i, label: "Documents", dot: "#ef4444" },
  { match: /charger|adapter|cable|power|battery|phone|camera/i, label: "Electronics", dot: "#8b5cf6" },
  { match: /jacket|sweater|shirt|tee|pants|jeans|short|dress|sock|underwear|cloth|wear/i, label: "Clothing", dot: "#0ea5e9" },
  { match: /shoe|sneaker|sandal|boot/i, label: "Footwear", dot: "#0284c7" },
  { match: /sunscreen|hat|umbrella|raincoat|sunglass|repellent|cap/i, label: "Weather", dot: "#f59e0b" },
  { match: /medicine|first.?aid|tablet|prescription|sanitizer|mask/i, label: "Health", dot: "#14b8a6" },
  { match: /toothbrush|paste|shampoo|soap|toilet|towel|razor|deodorant/i, label: "Toiletries", dot: "#f97316" },
];

function bucket(item) {
  const hit = CATEGORY_HINTS.find((c) => c.match.test(item));
  return hit || { label: "Other", dot: "#94a3b8" };
}

export default function PackingList({ items }) {
  if (!items || items.length === 0) return null;

  const grouped = items.reduce((acc, item) => {
    const { label, dot } = bucket(item);
    if (!acc[label]) acc[label] = { dot, items: [] };
    acc[label].items.push(item);
    return acc;
  }, {});

  const order = ["Documents", "Electronics", "Clothing", "Footwear", "Weather", "Health", "Toiletries", "Other"];
  const sections = order.filter((k) => grouped[k]).map((k) => ({ label: k, ...grouped[k] }));

  return (
    <div className="card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
          Packing list
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}
        >
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: section.dot }}
              />
              <p
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {section.label}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.items.map((it, i) => (
                <span
                  key={`${section.label}-${i}`}
                  className="text-xs px-2.5 py-1 rounded-full capitalize"
                  style={{
                    background: "var(--bg-tint)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
