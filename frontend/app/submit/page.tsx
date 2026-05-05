"use client";
import { useState } from "react";

const LEVELS = ["L3", "L4", "L5"];
const COMPANIES = ["Google", "Meta", "Amazon", "Microsoft", "Apple", "Flipkart", "Swiggy", "Zepto", "Razorpay", "Other"];
const ROLES = ["Software Engineer", "Senior Software Engineer", "SDE I", "SDE II", "SDE III", "ML Engineer", "Data Scientist", "Data Engineer", "Product Manager", "SRE", "DevOps Engineer", "Backend Engineer", "Frontend Engineer", "Full Stack Engineer"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Mumbai", "Delhi/NCR", "Pune", "Chennai", "Remote"];

type Status = "idle" | "loading" | "success" | "error";

export default function SubmitPage() {
  const [form, setForm] = useState({
    company: "", role: "", level: "", location: "",
    experience_years: "", base_salary: "", bonus: "", stock: "",
  });
  const [customCompany, setCustomCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const totalTC = (() => {
    const b = parseFloat(form.base_salary) || 0;
    const bo = parseFloat(form.bonus) || 0;
    const s = parseFloat(form.stock) || 0;
    return b + bo + s;
  })();

  function smartFmt(n: number) {
    if (n >= 100000) return `$${(n / 1000).toFixed(0)}K`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return n > 0 ? `$${n}` : "—";
  }

  async function handleSubmit() {
    const company = form.company === "Other" ? customCompany.trim() : form.company;
    if (!company || !form.role || !form.level || !form.location || !form.experience_years || !form.base_salary) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingest-salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.toLowerCase(),
          role: form.role,
          level: form.level,
          location: form.location,
          experience_years: parseFloat(form.experience_years),
          base_salary: parseFloat(form.base_salary),
          bonus: parseFloat(form.bonus) || 0,
          stock: parseFloat(form.stock) || 0,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#c8f135] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
          <h2 className="text-xl font-black text-[#0f0f0f] mb-2">Salary submitted!</h2>
          <p className="text-zinc-400 text-sm mb-6">Thanks for contributing. Your data helps others negotiate better.</p>
          <div className="flex gap-3 justify-center">
            <a href="/" className="bg-[#0f0f0f] text-[#c8f135] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors">
              View salaries
            </a>
            <button
              onClick={() => { setStatus("idle"); setForm({ company: "", role: "", level: "", location: "", experience_years: "", base_salary: "", bonus: "", stock: "" }); }}
              className="bg-zinc-100 text-zinc-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Submit another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <section className="bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <a href="/" className="text-white/40 hover:text-white/70 text-xs transition-colors mb-5 inline-block">← Back to salaries</a>
          <h1 className="text-3xl font-black tracking-tight">Submit your salary</h1>
          <p className="text-white/40 text-sm mt-1">Anonymous. Helps the community negotiate better.</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

        {/* Live TC preview */}
        <div className={`rounded-2xl border p-5 flex items-center justify-between transition-all ${totalTC > 0 ? "bg-[#0f0f0f] border-transparent" : "bg-white border-black/5"}`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest ${totalTC > 0 ? "text-white/40" : "text-zinc-400"}`}>Estimated total TC</p>
            <p className={`text-3xl font-black mt-0.5 ${totalTC > 0 ? "text-[#c8f135]" : "text-zinc-300"}`}>{smartFmt(totalTC)}</p>
          </div>
          {totalTC > 0 && (
            <div className="text-right text-xs text-white/40 space-y-0.5">
              <p>Base: <span className="text-white/70 font-semibold">{smartFmt(parseFloat(form.base_salary) || 0)}</span></p>
              <p>Bonus: <span className="text-white/70 font-semibold">{smartFmt(parseFloat(form.bonus) || 0)}</span></p>
              <p>Stock: <span className="text-white/70 font-semibold">{smartFmt(parseFloat(form.stock) || 0)}</span></p>
            </div>
          )}
          {totalTC === 0 && <p className="text-zinc-300 text-sm">Fill in your comp below</p>}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50">
            <h2 className="text-sm font-bold text-zinc-800">Your details</h2>
            <p className="text-xs text-zinc-400 mt-0.5">All submissions are anonymous</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Company *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {COMPANIES.map(c => (
                  <button key={c} type="button"
                    onClick={() => set("company", c)}
                    className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${form.company === c ? "bg-[#0f0f0f] text-[#c8f135] border-transparent" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300"}`}>
                    {c}
                  </button>
                ))}
              </div>
              {form.company === "Other" && (
                <input
                  placeholder="Company name"
                  value={customCompany}
                  onChange={e => setCustomCompany(e.target.value)}
                  className="mt-2 w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8f135] focus:border-transparent"
                />
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Role *</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8f135] focus:border-transparent bg-white text-zinc-800">
                <option value="">Select role…</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Level + Location row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Level *</label>
                <div className="flex gap-2">
                  {LEVELS.map(l => (
                    <button key={l} type="button"
                      onClick={() => set("level", l)}
                      className={`flex-1 text-sm font-bold py-2.5 rounded-xl border transition-all ${form.level === l ? "bg-[#0f0f0f] text-[#c8f135] border-transparent" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Location *</label>
                <select value={form.location} onChange={e => set("location", e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8f135] focus:border-transparent bg-white text-zinc-800">
                  <option value="">Select…</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Years of experience *</label>
              <input type="number" min="0" max="40" placeholder="e.g. 3"
                value={form.experience_years} onChange={e => set("experience_years", e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8f135] focus:border-transparent" />
            </div>

            {/* Compensation */}
            <div className="border-t border-zinc-100 pt-4">
              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">Compensation (annual, in your currency)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "base_salary", label: "Base salary *", placeholder: "e.g. 2000000", color: "focus:ring-[#c8f135]" },
                  { key: "bonus",       label: "Annual bonus",  placeholder: "e.g. 200000",  color: "focus:ring-sky-400" },
                  { key: "stock",       label: "Stock / RSU",   placeholder: "e.g. 800000",  color: "focus:ring-violet-400" },
                ].map(({ key, label, placeholder, color }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">{label}</label>
                    <input type="number" min="0" placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={e => set(key, e.target.value)}
                      className={`w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${color} focus:border-transparent`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="w-full bg-[#0f0f0f] hover:bg-zinc-800 disabled:opacity-50 text-[#c8f135] font-black text-sm py-3.5 rounded-xl transition-colors"
            >
              {status === "loading" ? "Submitting…" : "Submit salary →"}
            </button>

            <p className="text-center text-[10px] text-zinc-400">Your submission is 100% anonymous. No account required.</p>
          </div>
        </div>
      </div>
    </main>
  );
}