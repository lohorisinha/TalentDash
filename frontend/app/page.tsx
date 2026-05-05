"use client";
import { useEffect, useState, useRef } from "react";

interface Salary {
  id: string; company: string; role: string; level: string;
  location: string; experience_years: number;
  total_compensation: number; base_salary: number; bonus: number; stock: number;
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function fmtUSD(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const smartFmt = (n: number) => n > 50000 ? fmtUSD(n) : fmt(n);

const COMPANY_COLORS: Record<string, string> = {
  google: "bg-red-500", meta: "bg-blue-500", amazon: "bg-orange-500",
  microsoft: "bg-green-500", apple: "bg-zinc-500", flipkart: "bg-yellow-500",
  swiggy: "bg-orange-600", zepto: "bg-purple-500", razorpay: "bg-blue-600",
};

const LEVEL_STYLE: Record<string, string> = {
  L3: "bg-emerald-100 text-emerald-800",
  L4: "bg-sky-100 text-sky-800",
  L5: "bg-violet-100 text-violet-800",
  L6: "bg-amber-100 text-amber-800",
};

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function TcStrip({ base, bonus, stock, total }: { base: number; bonus: number; stock: number; total: number }) {
  if (!total) return null;
  const bp = (base / total) * 100;
  const bop = (bonus / total) * 100;
  const sp = 100 - bp - bop;
  return (
    <div className="flex h-1 rounded-full overflow-hidden w-full gap-px">
      <div className="bg-[#c8f135]" style={{ width: `${bp}%` }} />
      <div className="bg-sky-400" style={{ width: `${bop}%` }} />
      <div className="bg-violet-400" style={{ width: `${sp}%` }} />
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const color = COMPANY_COLORS[name.toLowerCase()] ?? "bg-zinc-400";
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-white text-[10px] font-bold ${color} flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function Home() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [filters, setFilters] = useState({ company: "", role: "", level: "", location: "" });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/salaries?${params}`)
      .then(r => r.json())
      .then(d => { setSalaries(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters]);

  const companies = [...new Set(salaries.map(s => s.company))];
  const sorted = [...salaries].sort((a, b) => a.total_compensation - b.total_compensation);
  const medianTC = sorted.length
    ? sorted[Math.floor(sorted.length / 2)].total_compensation
    : 0;

  const levelDist = salaries.reduce((acc, s) => { acc[s.level] = (acc[s.level] || 0) + 1; return acc; }, {} as Record<string, number>);
  const companyRanked = companies.map(c => {
    const cs = salaries.filter(s => s.company === c);
    return { name: c, avg: Math.round(cs.reduce((a, s) => a + s.total_compensation, 0) / cs.length), count: cs.length };
  }).sort((a, b) => b.avg - a.avg);
  const maxAvg = companyRanked[0]?.avg || 1;

  const levels = [...new Set(salaries.map(s => s.level))].sort();
  const [activeLevel, setActiveLevel] = useState("");
  const filteredSalaries = activeLevel ? salaries.filter(s => s.level === activeLevel) : salaries;
  const totalPages = Math.ceil(filteredSalaries.length / PAGE_SIZE);
  const paginated = filteredSalaries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cCount = useCountUp(companies.length);
  const sCount = useCountUp(salaries.length);

  return (
    <main>
      {/* HERO */}
      <section className="bg-[#0f0f0f] text-white">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-14">
          <div className="fade-up fade-up-1 inline-flex items-center gap-2 bg-white/10 border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8f135] animate-pulse" />
            Transparent · Level-normalized · Real TC
          </div>
          <h1 className="fade-up fade-up-2 text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5 max-w-2xl">
            Stop guessing.<br />
            <span className="text-[#c8f135]">See the numbers.</span>
          </h1>
          <p className="fade-up fade-up-3 text-white/50 text-lg leading-relaxed max-w-lg mb-10">
            Real base, bonus, and stock breakdowns — structured by L3/L4/L5 so you can compare across companies without the guesswork.
          </p>
          <div className="fade-up fade-up-4 flex flex-wrap gap-3 mb-12">
            <a href="#salaries" className="bg-[#c8f135] text-[#0f0f0f] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#d4f550] transition-colors">
              Browse salaries ↓
            </a>
            <a href="/compare" className="bg-white/10 border border-white/10 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-white/15 transition-colors">
              Compare offers →
            </a>
          </div>

          {/* Inline stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { val: sCount || "—", label: "Salary records" },
              { val: cCount || "—", label: "Companies" },
              { val: medianTC ? smartFmt(medianTC) : "—", label: "Median TC" },
              { val: "L3–L5", label: "Levels" },
            ].map(({ val, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-white/40 text-xs mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDEBAR */}
        <div className="flex flex-col gap-4">

          {/* Company leaderboard */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0f0f0f]">Top paying companies</h3>
              <span className="text-xs text-zinc-400">{companies.length} tracked</span>
            </div>
            {companyRanked.length === 0 ? (
              <p className="text-sm text-zinc-400">No data yet</p>
            ) : (
              <div className="space-y-4">
                {companyRanked.slice(0, 7).map((c, i) => {
                  const dot = COMPANY_COLORS[c.name.toLowerCase()] ?? "bg-zinc-400";
                  return (
                    <a href={`/company/${c.name}`} key={c.name} className="block group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 w-4">{i + 1}</span>
                          <Avatar name={c.name} />
                          <span className="text-sm font-semibold capitalize text-zinc-800 group-hover:text-[#0f0f0f] transition-colors">{c.name}</span>
                        </div>
                        <span className="text-sm font-bold text-[#0f0f0f]">{smartFmt(c.avg)}</span>
                      </div>
                      <div className="h-1 bg-zinc-100 rounded-full ml-10">
                        <div className={`h-full rounded-full ${dot} opacity-70 transition-all duration-700`} style={{ width: `${(c.avg / maxAvg) * 100}%` }} />
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level breakdown */}
          {Object.keys(levelDist).length > 0 && (
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#0f0f0f] mb-4">Level breakdown</h3>
              <div className="space-y-2.5">
                {Object.entries(levelDist).sort().map(([level, count]) => {
                  const total = salaries.length;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${LEVEL_STYLE[level] ?? "bg-zinc-100 text-zinc-600"}`}>{level}</span>
                        <span className="text-xs text-zinc-400">{count} entries · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full">
                        <div className="h-full bg-[#c8f135] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TC legend */}
          <div className="bg-[#0f0f0f] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">How TC is calculated</h3>
            <div className="space-y-2 text-xs">
              {[
                { color: "bg-[#c8f135]", label: "Base salary", desc: "Fixed monthly pay" },
                { color: "bg-sky-400", label: "Annual bonus", desc: "Performance-based" },
                { color: "bg-violet-400", label: "Stock / RSU", desc: "Annualized vest value" },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
                  <div>
                    <span className="text-white font-semibold">{label}</span>
                    <span className="text-white/40 ml-1.5">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/30 text-[10px] leading-relaxed">Each row shows a TC breakdown strip. The colored bar shows the proportion of base (green), bonus (blue), and stock (purple).</p>
            </div>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="lg:col-span-2" id="salaries">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50">
              <div>
                <h2 className="text-sm font-bold text-[#0f0f0f]">Salary database</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{loading ? "Loading…" : `${filteredSalaries.length} records`}</p>
              </div>
              <a href="/compare" className="text-xs font-bold text-[#0f0f0f] bg-[#c8f135] hover:bg-[#d4f550] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                ⇌ Compare offers
              </a>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-zinc-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["company", "role", "level", "location"] as const).map(key => (
                <input key={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={filters[key]}
                  onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                  className="border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#c8f135] focus:border-transparent bg-white placeholder:text-zinc-400"
                />
              ))}
            </div>

            {/* Level quick filter */}
            {levels.length > 0 && (
              <div className="px-5 py-2.5 border-b border-zinc-100 flex gap-1.5 flex-wrap">
                <button onClick={() => { setActiveLevel(""); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${activeLevel === "" ? "bg-[#0f0f0f] text-[#c8f135]" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
                  All
                </button>
                {levels.map(l => (
                  <button key={l} onClick={() => { setActiveLevel(activeLevel === l ? "" : l); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${activeLevel === l ? "bg-[#0f0f0f] text-[#c8f135]" : `${LEVEL_STYLE[l] ?? "bg-zinc-100 text-zinc-600"} hover:opacity-80`}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div className="py-20 text-center text-zinc-400 text-sm">Loading…</div>
            ) : filteredSalaries.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-zinc-400 font-medium text-sm">No results</p>
                <p className="text-zinc-400 text-xs mt-1">Try clearing your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      {["Company", "Role", "Lvl", "Loc", "Exp", "Breakdown", "Total TC"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((s, i) => (
                      <tr key={s.id} className={`border-b border-zinc-50 hover:bg-[#f5f4f0] transition-colors ${i % 2 === 0 ? "" : "bg-zinc-50/40"}`}>
                        <td className="px-4 py-3">
                          <a href={`/company/${s.company}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Avatar name={s.company} />
                            <span className="font-semibold capitalize text-zinc-800">{s.company}</span>
                          </a>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 max-w-[110px] truncate font-medium">{s.role}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${LEVEL_STYLE[s.level] ?? "bg-zinc-100 text-zinc-600"}`}>{s.level}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{s.location}</td>
                        <td className="px-4 py-3 text-zinc-400">{s.experience_years}y</td>
                        <td className="px-4 py-3 min-w-[110px]">
                          <TcStrip base={s.base_salary} bonus={s.bonus} stock={s.stock} total={s.total_compensation} />
                          <div className="flex gap-2 text-[9px] text-zinc-400 mt-1">
                            <span>{smartFmt(s.base_salary)}</span>
                            <span className="text-zinc-300">+</span>
                            <span>{smartFmt(s.bonus)}</span>
                            <span className="text-zinc-300">+</span>
                            <span>{smartFmt(s.stock)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-black text-[#0f0f0f] whitespace-nowrap">{smartFmt(s.total_compensation)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
                    <span className="text-xs text-zinc-400">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 font-semibold disabled:opacity-30 hover:bg-zinc-50 transition-colors"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 font-semibold disabled:opacity-30 hover:bg-zinc-50 transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="font-black text-white">Talent<span className="text-[#c8f135]">Dash</span></span>
          <p className="text-white/30 text-xs">Salary transparency for Indian tech.</p>
        </div>
      </footer>
    </main>
  );
}