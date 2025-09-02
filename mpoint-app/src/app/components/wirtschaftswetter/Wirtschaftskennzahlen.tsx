"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type KennzahlItem = {
  label: string;
  unit?: string; // e.g. "%"; empty or undefined means plain number
  showPlusForPositive?: boolean; // default false; if true and value > 0, prefix with "+"
  nullWert?: number; // baseline for the series (e.g., 0 for %, 100 for indices)
  values: number[]; // last 5 values (first one is shown as the current)
};

function formatValue(n: number, unit?: string, showPlusForPositive?: boolean) {
  const withSign = showPlusForPositive && n > 0 ? `+${n}` : `${n}`;
  // Replace dot with comma for German-style numbers if it has decimals
  const localized = withSign.replace(".", ",");
  return unit ? `${localized}${unit}` : localized;
}

function IndicatorCard({ item }: { item: KennzahlItem }) {
  const vals = Array.isArray(item.values) ? item.values.slice(0, 5) : [];
  const current = vals[0] ?? 0;
  const last = vals[vals.length - 1] ?? current;
  const trend: "up" | "down" = current >= last ? "up" : "down";

  // Build simple sparkline polyline points within 80x24 viewBox
  const dotRadius = 4; // keep in sync with circle.r
  const width = 80;
  const height = 24;
  const paddingX = dotRadius + 1; // ensure dot is fully visible on the left
  const paddingY = Math.max(2, dotRadius); // ensure dot isn't clipped top/bottom
  const count = Math.max(vals.length, 2);
  const baseline = typeof item.nullWert === "number" ? item.nullWert : 0;
  const minV = Math.min(...vals, baseline);
  const maxV = Math.max(...vals, baseline);
  const range = maxV - minV || 1;
  const stepX = (width - paddingX * 2) / (count - 1);
  const points = vals.map((v, i) => {
    const x = paddingX + i * stepX;
    const norm = (v - minV) / range; // 0..1
    const y = paddingY + (1 - norm) * (height - paddingY * 2);
    return `${x},${y}`;
  }).join(" ");
  // Current value dot coordinates (first point)
  const xCurrent = paddingX;
  const normCurrent = (current - minV) / range;
  const yCurrent = paddingY + (1 - normCurrent) * (height - paddingY * 2);
  // Baseline Y position
  const normBase = (baseline - minV) / range;
  const yBase = paddingY + (1 - normBase) * (height - paddingY * 2);

  return (
    <div className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between h-32 hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600">{item.label}</span>
        {trend === "up" ? (
          <ArrowUpRight className="w-4 h-4 text-green-600" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-600" />
        )}
      </div>
      <div className="font-bold text-gray-900 text-xl">
        {formatValue(current, item.unit, item.showPlusForPositive)}
      </div>
      <div className="mt-2">
        <svg className="block" width="100%" height="24" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMid meet" fill="none">
          {/* Baseline */}
          <line x1={paddingX} y1={yBase} x2={width - paddingX} y2={yBase} stroke="#e5e7eb" strokeDasharray="2 2" strokeWidth="1" />
          <polyline points={points} stroke={trend === "up" ? "green" : "red"} strokeWidth="2" fill="none" />
          <circle cx={xCurrent} cy={yCurrent} r={dotRadius} fill={trend === "up" ? "green" : "red"} stroke="white" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

export default function Wirtschaftskennzahlen({ items }: { items: KennzahlItem[] }) {
  return (
    <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wirtschaftskennzahlen</h3>
      <div className="flex flex-wrap gap-3 lg:gap-4">
        {items.map((it) => (
          <div key={it.label} className="flex-1 min-w-[100px]">
            <IndicatorCard item={it} />
          </div>
        ))}
      </div>
    </section>
  );
}
