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

export default function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [data, setData] = useState<CompanyData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/${name}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true));
  }, [name]);

  if (error) return <div className="p-8 text-red-500">Company not found.</div>;
  if (!data) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <a href="/" className="text-blue-600 hover:underline text-sm">← Back</a>
      <h1 className="text-3xl font-bold capitalize mt-2 mb-6">{name}</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border rounded-lg p-5">
          <p className="text-gray-500 text-sm mb-1">Median Total Comp</p>
          <p className="text-2xl font-bold text-green-600">${data.median_compensation.toLocaleString()}</p>
        </div>
        <div className="border rounded-lg p-5">
          <p className="text-gray-500 text-sm mb-2">Level Distribution</p>
          {Object.entries(data.level_distribution).map(([level, count]) => (
            <div key={level} className="flex justify-between text-sm">
              <span className="font-semibold text-blue-700">{level}</span>
              <span>{count} {count === 1 ? "entry" : "entries"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {["Role", "Level", "Location", "Exp (yrs)", "Base", "Bonus", "Stock", "Total Comp"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.salaries.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
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
    </main>
  );
}