"use client";

import React from "react";
import data from "./wirtschaftswetter.data.json";

export default function WetterVergleich() {
  const regions = (data.regions ?? []) as readonly string[];
  type Region = (typeof regions)[number];

  const rueckblick = (data.rueckblickValues ?? {}) as Record<
    Region,
    Array<{ label: string; value: number }>
  >;

  const initialA = (regions[0] as Region) ?? ("" as Region);
  const initialB = (regions[1] as Region) ?? (regions[0] as Region);

  const [regionA, setRegionA] = React.useState<Region>(initialA);
  const [regionB, setRegionB] = React.useState<Region>(initialB);

  const optionsA = React.useMemo(
    () => regions.filter((r) => r !== regionB),
    [regions, regionB]
  );
  const optionsB = React.useMemo(
    () => regions.filter((r) => r !== regionA),
    [regions, regionA]
  );

  React.useEffect(() => {
    if (regionA === regionB && regions.length > 1) {
      const fallback = regions.find((r) => r !== regionA) as Region | undefined;
      if (fallback) setRegionB(fallback);
    }
  }, [regionA, regionB, regions]);

  const rows = React.useMemo(() => {
    const a = (rueckblick[regionA] ?? []) as Array<{ label: string; value: number }>;
    const b = (rueckblick[regionB] ?? []) as Array<{ label: string; value: number }>;
    const mapA = new Map(a.map((x) => [x.label, x.value]));
    const mapB = new Map(b.map((x) => [x.label, x.value]));
    const labels = a
      .map((x) => x.label)
      .filter((l) => mapB.has(l)); // intersection by label

    return labels.map((label) => {
      const valA = mapA.get(label) ?? 0;
      const valB = mapB.get(label) ?? 0;
      return { label, a: valA, b: valB, diff: valA - valB };
    });
  }, [regionA, regionB, rueckblick]);

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Wetter-Vergleich</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label htmlFor="wv-a" className="block text-xs text-gray-500 mb-1">
            Region A
          </label>
          <select
            id="wv-a"
            value={regionA}
            onChange={(e) => setRegionA(e.target.value as Region)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {optionsA.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wv-b" className="block text-xs text-gray-500 mb-1">
            Region B
          </label>
          <select
            id="wv-b"
            value={regionB}
            onChange={(e) => setRegionB(e.target.value as Region)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {optionsB.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left font-medium px-3 py-2">Zeitraum</th>
              <th className="text-right font-medium px-3 py-2">A</th>
              <th className="text-right font-medium px-3 py-2">B</th>
              <th className="text-right font-medium px-3 py-2">A − B</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.label} className="bg-white">
                <td className="px-3 py-2 text-gray-800">{row.label}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.a}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.b}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${row.diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {row.diff.toFixed(0)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  Keine Daten verfügbar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
