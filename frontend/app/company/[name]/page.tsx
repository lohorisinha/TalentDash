"use client";
import { useEffect, useState } from "react";
import { use } from "react";

interface Salary {
  id: string; company: string; role: string; level: string;
  location: string; experience_years: number;
  base_salary: number; bonus: number; stock: number; total_compensation: number;
}
interface CompanyData {
  salaries: Salary[];
  median_compensation: number;
  level_distribution: Record<string, number>;
}

function smartFmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const COMPANY_COLORS: Record<string, string> = {
  google: "bg-red-500", meta: "bg-blue-500", amazon: "bg-orange-500",
  microsoft: "bg-green-500", apple: "bg-zinc-500", flipkart: "bg-yellow-500",
  swiggy: "bg-orange-600", zepto: "bg-purple-500",
};

const LEVEL_STYLE: Record<string, { pill: string; bar: string }> = {
  L3: { pill: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-400" },
  L4: { pill: "bg-sky-100 text-sky-800",         bar: "bg-sky-500" },
  L5: { pill: "bg-violet-100 text-violet-800",   bar: "bg-violet-500" },
  L6: { pill: "bg-amber-100 text-amber-800",     bar: "bg-amber-400" },
};

function TcStrip({ base, bonus, stock, total }: { base: number; bonus: number; stock: number; total: number }) {
  if (!total) return null;
  const bp = (base / total) * 100, bop = (bonus / total) * 100, sp = 100 - bp - bop;
  return (
    <div className="w-full">
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-1.5">
        <div className="bg-[#c8f135]" style={{ width: `${bp}%` }} />
        <div className="bg-sky-400"   style={{ width: `${bop}%` }} />
        <div className="bg-violet-400" style={{ width: `${sp}%` }} />
      </div>
      <div className="flex gap-2 text-[9px] text-zinc-400">
        <span className="text-[#6b7c1a] font-semibold">{smartFmt(base)}</span>
        <span>+</span>
        <span className="text-sky-600 font-semibold">{smartFmt(bonus)}</span>
        <span>+</span>
        <span className="text-violet-600 font-semibold">{smartFmt(stock)}</span>
      </div>
    </div>
  );
}

export default function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [data, setData] = useState<CompanyData | null>(null);
  const [error, setError] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/${name}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData).catch(() => setError(true));
  }, [name]);

  if (error) return (
    <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-400 font-medium">Company not found</p>
        <a href="/" className="mt-3 text-sm text-[#0f0f0f] font-semibold hover:underline block">← Back</a>
      </div>
    </main>
  );
  if (!data) return <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center text-zinc-400 text-sm">Loading…</main>;

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const avatarColor = COMPANY_COLORS[name.toLowerCase()] ?? "bg-zinc-400";
  const levels = Object.keys(data.level_distribution).sort();
  const filtered = selectedLevel ? data.salaries.filter(s => s.level === selectedLevel) : data.salaries;
  const topTC = data.salaries[0]?.total_compensation ?? 0;
  const avgBase = data.salaries.length ? Math.round(data.salaries.reduce((a, s) => a + s.base_salary, 0) / data.salaries.length) : 0;

  const levelStats = levels.map(l => {
    const ls = data.salaries.filter(s => s.level === l);
    return { level: l, avg: ls.length ? Math.round(ls.reduce((a, s) => a + s.total_compensation, 0) / ls.length) : 0, count: ls.length };
  });
  const maxLevelAvg = Math.max(...levelStats.map(l => l.avg), 1);

  return (
    <main className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <section className="bg-[#0f0f0f] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <a href="/" className="text-white/40 hover:text-white/70 text-xs transition-colors mb-5 inline-block">← All companies</a>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
              {displayName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{displayName}</h1>
              <p className="text-white/40 text-sm mt-0.5">{data.salaries.length} verified {data.salaries.length === 1 ? "entry" : "entries"}</p>
            </div>
            <a href="/compare" className="ml-auto bg-[#c8f135] text-[#0f0f0f] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#d4f550] transition-colors">
              ⇌ Compare offers
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Key numbers */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
            <div className="bg-[#0f0f0f] rounded-xl px-4 py-4 mb-3">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-0.5">Median TC</p>
              <p className="text-2xl font-black text-[#c8f135]">{smartFmt(data.median_compensation)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Top TC", val: topTC },
                { label: "Avg base", val: avgBase },
              ].map(({ label, val }) => (
                <div key={label} className="bg-zinc-50 rounded-xl px-3 py-3">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-base font-black text-zinc-800">{smartFmt(val)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Avg TC by level */}
          {levelStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
              <h3 className="text-sm font-bold text-zinc-800 mb-4">Avg TC by level</h3>
              <div className="space-y-3">
                {levelStats.map(({ level, avg, count }) => {
                  const style = LEVEL_STYLE[level] ?? { pill: "bg-zinc-100 text-zinc-600", bar: "bg-zinc-400" };
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.pill}`}>{level}</span>
                        <div className="text-right">
                          <span className="text-xs font-black text-zinc-800">{smartFmt(avg)}</span>
                          <span className="text-[9px] text-zinc-400 ml-1">({count})</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${style.bar}`} style={{ width: `${(avg / maxLevelAvg) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TC legend */}
          <div className="bg-[#0f0f0f] rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">TC legend</h3>
            {[
              { color: "bg-[#c8f135]", label: "Base" },
              { color: "bg-sky-400",   label: "Bonus" },
              { color: "bg-violet-400",label: "Stock" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                <span className="text-xs text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-800">All entries</h2>
              <span className="text-xs text-zinc-400">{filtered.length} records</span>
            </div>

            {levels.length > 0 && (
              <div className="px-5 py-2.5 border-b border-zinc-100 flex gap-1.5 flex-wrap">
                <button onClick={() => setSelectedLevel(null)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${selectedLevel === null ? "bg-[#0f0f0f] text-[#c8f135]" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
                  All
                </button>
                {levels.map(l => {
                  const s = LEVEL_STYLE[l] ?? { pill: "bg-zinc-100 text-zinc-600" };
                  return (
                    <button key={l} onClick={() => setSelectedLevel(selectedLevel === l ? null : l)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${selectedLevel === l ? "bg-[#0f0f0f] text-[#c8f135]" : `${s.pill} hover:opacity-80`}`}>
                      {l} <span className="opacity-50">({data.level_distribution[l]})</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {["Role", "Level", "Location", "Exp", "TC Breakdown", "Total TC"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className={`border-b border-zinc-50 hover:bg-[#f5f4f0] transition-colors ${i % 2 === 0 ? "" : "bg-zinc-50/40"}`}>
                      <td className="px-4 py-3 font-semibold text-zinc-700 max-w-[130px] truncate">{s.role}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${(LEVEL_STYLE[s.level] ?? { pill: "bg-zinc-100 text-zinc-600" }).pill}`}>{s.level}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{s.location}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.experience_years}y</td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <TcStrip base={s.base_salary} bonus={s.bonus} stock={s.stock} total={s.total_compensation} />
                      </td>
                      <td className="px-4 py-3 font-black text-[#0f0f0f] whitespace-nowrap">{smartFmt(s.total_compensation)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-400">No entries for this level</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}