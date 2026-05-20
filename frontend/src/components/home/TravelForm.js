"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlan } from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ErrorAlert from "@/components/ui/ErrorAlert";
import InterestPicker from "@/components/home/InterestPicker";

export default function TravelForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    destination: "",
    start_date: "",
    end_date: "",
    budget_min: "",
    budget_max: "",
    num_travelers: 1,
    interests: [],
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.interests.length === 0) {
      setError("Select at least one interest");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        budget_min: Number(form.budget_min),
        budget_max: Number(form.budget_max),
        num_travelers: Number(form.num_travelers),
      };
      const res = await createPlan(payload);
      router.push(`/plan/${res.plan_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card p-6 sm:p-7 space-y-5" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="flex items-center gap-2 pb-1">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
            style={{ background: "var(--accent-soft)", color: "var(--accent-dark)" }}
          >
            1
          </span>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Where & when
          </h2>
        </div>

        <Input
          label="Destination" required
          placeholder="e.g. Tokyo, Japan"
          value={form.destination}
          onChange={(e) => update("destination", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start date" type="date" required
            value={form.start_date} onChange={(e) => update("start_date", e.target.value)} />
          <Input label="End date" type="date" required
            value={form.end_date} onChange={(e) => update("end_date", e.target.value)} />
        </div>
      </div>

      <div className="card p-6 sm:p-7 space-y-5" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="flex items-center gap-2 pb-1">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
            style={{ background: "var(--teal-soft)", color: "#0f766e" }}
          >
            2
          </span>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Budget & travellers
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Min budget (₹)" type="number" required min="1"
            placeholder="50000"
            value={form.budget_min} onChange={(e) => update("budget_min", e.target.value)} />
          <Input label="Max budget (₹)" type="number" required min="1"
            placeholder="200000"
            value={form.budget_max} onChange={(e) => update("budget_max", e.target.value)} />
        </div>

        <div className="max-w-[180px]">
          <Input label="Travellers" type="number" required min="1" max="20"
            value={form.num_travelers}
            onChange={(e) => update("num_travelers", e.target.value)} />
        </div>
      </div>

      <div className="card p-6 sm:p-7" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="flex items-center gap-2 pb-4">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
            style={{ background: "var(--peach-soft)", color: "#c2410c" }}
          >
            3
          </span>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            What you love
          </h2>
        </div>
        <InterestPicker selected={form.interests} onChange={(val) => update("interests", val)} />
      </div>

      <ErrorAlert message={error} />

      <Button type="submit" variant="primary" loading={loading} className="w-full py-4 text-base">
        {loading ? "Spinning up agents..." : "Generate my travel plan"}
      </Button>

      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        We&apos;ll research live data, build a draft itinerary, then pause for your approval.
      </p>
    </form>
  );
}
