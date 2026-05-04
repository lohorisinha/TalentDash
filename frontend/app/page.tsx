"use client";
import { useEffect, useState } from "react";

interface Salary {
  id: string;
  company: string;
  role: string;
  level: string;
  location: string;
  experience_years: number;
  total_compensation: number;
  base_salary: number;
  bonus: number;
  stock: number;
}

export default function Home() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [filters, setFilters] = useState({ company: "", role: "", level: "", location: "" });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/salaries?${params}`)
      .then(r => r.json())
      .then(setSalaries);
  }, [filters]);

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Comp Engine</h1>
      <p className="text-gray-500 mb-6">Real compensation data. Structured. Comparable.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {["company", "role", "level", "location"].map(key => (
          <input
            key={key}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={filters[key as keyof typeof filters]}
            onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      {salaries.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-lg">No salaries found</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {["Company", "Role", "Level", "Location", "Exp (yrs)", "Base", "Bonus", "Stock", "Total Comp"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salaries.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium capitalize">
                    <a href={`/company/${s.company}`} className="text-blue-600 hover:underline">{s.company}</a>
                  </td>
                  <td className="px-4 py-3">{s.role}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{s.level}</span></td>
                  <td className="px-4 py-3">{s.location}</td>
                  <td className="px-4 py-3">{s.experience_years}</td>
                  <td className="px-4 py-3">${s.base_salary.toLocaleString()}</td>
                  <td className="px-4 py-3">${s.bonus.toLocaleString()}</td>
                  <td className="px-4 py-3">${s.stock.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-green-600">${s.total_compensation.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-right">
        <a href="/compare" className="text-blue-600 hover:underline text-sm">→ Compare two salaries</a>
      </div>
    </main>
  );
}