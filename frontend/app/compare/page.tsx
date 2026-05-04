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

export default function ComparePage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/salaries`).then(r => r.json()).then(setSalaries);
  }, []);

  useEffect(() => {
    if (!id1 || !id2) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/compare?salaryId1=${id1}&salaryId2=${id2}`)
      .then(r => r.json()).then(setResult);
  }, [id1, id2]);

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString()}`;
  const diff = (n: number) => n === 0
    ? <span className="text-gray-400">—</span>
    : n > 0
    ? <span className="text-green-600">+{fmt(n)}</span>
    : <span className="text-red-500">-{fmt(n)}</span>;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <a href="/" className="text-blue-600 hover:underline text-sm">← Back</a>
      <h1 className="text-3xl font-bold mt-2 mb-6">Compare Salaries</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[{ label: "Salary 1", val: id1, set: setId1 }, { label: "Salary 2", val: id2, set: setId2 }].map(({ label, val, set }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <select value={val} onChange={e => set(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a salary...</option>
              {salaries.map(s => (
                <option key={s.id} value={s.id}>
                  {s.company.toUpperCase()} — {s.role} ({s.level}) — ${s.total_compensation.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {result && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-semibold w-28"></th>
                <th className="px-4 py-3 text-left font-semibold capitalize">{result.salary1.company} ({result.salary1.role})</th>
                <th className="px-4 py-3 text-left font-semibold capitalize">{result.salary2.company} ({result.salary2.role})</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(["base", "bonus", "stock", "total"] as const).map(key => (
                <tr key={key} className={key === "total" ? "bg-gray-50 font-bold" : ""}>
                  <td className="px-4 py-3 text-gray-500 capitalize">{key === "total" ? "Total Comp" : key}</td>
                  <td className="px-4 py-3">${result.salary1[key].toLocaleString()}</td>
                  <td className="px-4 py-3">${result.salary2[key].toLocaleString()}</td>
                  <td className="px-4 py-3">{diff(result.diff[key])}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 text-gray-500">Level</td>
                <td className="px-4 py-3">{result.salary1.level}</td>
                <td className="px-4 py-3">{result.salary2.level}</td>
                <td className="px-4 py-3 text-gray-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}