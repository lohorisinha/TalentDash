"use client";
import { useEffect, useState } from "react";

interface Salary {
  id: string; company: string; role: string; level: string; total_compensation: number;
}
interface CompareResult {
  salary1: { id: string; company: string; role: string; level: string; base: number; bonus: number; stock: number; total: number };
  salary2: { id: string; company: string; role: string; level: string; base: number; bonus: number; stock: number; total: number };
  diff: { base: number; bonus: number; stock: number; total: number };
}

function smartFmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const COMPANY_COLORS: Record<string, string> = {
  google: "bg-red-500", meta: "bg-blue-500", amazon: "bg-orange-500",
  microsoft: "bg-green-500", apple: "bg-zinc-500", flipkart: "bg-yellow-500",
  swiggy: "bg-orange-600", zepto: "bg-purple-500",
};

const LEVEL_STYLE: Record<string, string> = {
  L3: "bg-emerald-100 text-emerald-800",
  L4: "bg-sky-100 text-sky-800",
  L5: "bg-violet-100 text-violet-800",
  L6: "bg-amber-100 text-amber-800",
};

function Avatar({ name }: { name: string }) {
  const color = COMPANY_COLORS[name?.toLowerCase()] ?? "bg-zinc-400";
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold ${color}`}>
      {name?.charAt(0).toUpperCase()}
    </span>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden w-full">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ComparePage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/salaries`)
      .then(r => r.json())
      .then(d => setSalaries(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!id1 || !id2 || id1 === id2) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/compare?salaryId1=${id1}&salaryId2=${id2}`)
      .then(r => r.json()).then(setResult);
  }, [id1, id2]);

  const rows = result
    ? [
        { key: "base",  label: "Base salary",  v1: result.salary1.base,  v2: result.salary2.base,  d: result.diff.base,  color: "bg-[#c8f135]" },
        { key: "bonus", label: "Annual bonus",  v1: result.salary1.bonus, v2: result.salary2.bonus, d: result.diff.bonus, color: "bg-sky-400" },
        { key: "stock", label: "Stock / RSU",   v1: result.salary1.stock, v2: result.salary2.stock, d: result.diff.stock, color: "bg-violet-400" },
        { key: "total", label: "Total TC",      v1: result.salary1.total, v2: result.salary2.total, d: result.diff.total, color: "bg-[#0f0f0f]" },
      ]
    : [];

  const winner = result
    ? result.salary1.total >= result.salary2.total ? result.salary1 : result.salary2
    : null;

  return (
    <main className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <section className="bg-[#0f0f0f] text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <a href="/" className="text-white/40 hover:text-white/70 text-xs transition-colors mb-4 inline-block">← Back to salaries</a>
          <h1 className="text-3xl font-black tracking-tight">Compare offers</h1>
          <p className="text-white/40 text-sm mt-1">Pick two salaries to see a side-by-side breakdown.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { label: "Offer A", val: id1, set: setId1, accent: "ring-[#c8f135]" },
            { label: "Offer B", val: id2, set: setId2, accent: "ring-sky-400" },
          ].map(({ label, val, set, accent }) => (
            <div key={label} className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{label}</label>
              <select value={val} onChange={e => set(e.target.value)}
                className={`w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent} bg-white text-zinc-800`}>
                <option value="">Select a salary…</option>
                {salaries.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.company.toUpperCase()} — {s.role} ({s.level}) — {smartFmt(s.total_compensation)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {!result && (id1 || id2) && (
          <div className="text-center py-12 text-zinc-400 text-sm">Select both offers to compare</div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Winner banner */}
            {winner && (
              <div className="bg-[#0f0f0f] text-white rounded-2xl px-6 py-4 flex items-center gap-4">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Higher total comp</p>
                  <p className="font-black text-lg capitalize">{winner.company} <span className="text-[#c8f135]">({winner.role})</span></p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-white/40">Total TC</p>
                  <p className="font-black text-xl text-[#c8f135]">{smartFmt(winner.total)}</p>
                </div>
              </div>
            )}

            {/* Company cards */}
            <div className="grid grid-cols-2 gap-4">
              {[result.salary1, result.salary2].map((s, i) => (
                <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 ${i === 0 ? "border-[#c8f135]/40" : "border-sky-200"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar name={s.company} />
                    <div>
                      <p className="font-bold text-sm capitalize text-zinc-900">{s.company}</p>
                      <p className="text-xs text-zinc-400">{s.role}</p>
                    </div>
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${LEVEL_STYLE[s.level] ?? "bg-zinc-100 text-zinc-600"}`}>{s.level}</span>
                  </div>
                  <p className="text-2xl font-black text-[#0f0f0f]">{smartFmt(s.total)}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Total compensation</p>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50">
                <h2 className="text-sm font-bold text-zinc-800">Breakdown comparison</h2>
              </div>
              <div className="divide-y divide-zinc-50">
                {rows.map(({ key, label, v1, v2, d, color }) => {
                  const maxVal = Math.max(v1, v2, 1);
                  const isTotal = key === "total";
                  return (
                    <div key={key} className={`px-5 py-4 ${isTotal ? "bg-zinc-50" : ""}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold uppercase tracking-widest ${isTotal ? "text-zinc-900" : "text-zinc-500"}`}>{label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          d > 0 ? "bg-emerald-100 text-emerald-700" :
                          d < 0 ? "bg-red-100 text-red-600" :
                          "bg-zinc-100 text-zinc-500"
                        }`}>
                          {d > 0 ? `+${smartFmt(d)}` : d < 0 ? `-${smartFmt(-d)}` : "equal"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[{ val: v1, label: result.salary1.company }, { val: v2, label: result.salary2.company }].map(({ val, label: lbl }, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-zinc-400 capitalize font-medium">{lbl}</span>
                              <span className={`text-sm font-black ${isTotal ? "text-[#0f0f0f]" : "text-zinc-700"}`}>{smartFmt(val)}</span>
                            </div>
                            <Bar value={val} max={maxVal} color={i === 0 ? color : "bg-sky-300"} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}