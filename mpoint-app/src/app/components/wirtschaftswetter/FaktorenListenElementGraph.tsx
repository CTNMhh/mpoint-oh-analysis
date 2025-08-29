"use client";

import React from "react";

export type FaktorenListenElementGraphProps = {
  values: number[];
  labels?: string[]; // x-axis labels, same length as values (optional)
  color?: string;
  height?: number; // in px for the SVG viewBox height
};

export default function FaktorenListenElementGraph({
  values,
  labels,
  color = "#2563eb",
  height = 140,
}: FaktorenListenElementGraphProps) {
  const width = 360; // internal viewBox width; scales to container width
  const pad = { top: 12, right: 12, bottom: 28, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  if (!values || values.length === 0) {
    return (
      <div className="h-32 w-full bg-gray-50 rounded-md flex items-center justify-center text-sm text-gray-400">
        Kein Verlauf
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad.left + (i * innerW) / (values.length - 1 || 1);
    const y = pad.top + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });

  const poly = points.map((p) => `${p.x},${p.y}`).join(" ");

  const yTicks = [min, min + range / 2, max];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      <rect x={0} y={0} width={width} height={height} fill="white" rx={8} />

      {/* Gridlines */}
      {yTicks.map((t, idx) => {
        const y = pad.top + innerH - ((t - min) / range) * innerH;
        return (
          <g key={idx}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={pad.left - 6} y={y} textAnchor="end" dominantBaseline="central" fontSize={10} fill="#6b7280">
              {Math.round(t)}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} stroke="#d1d5db" />
      <line x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} stroke="#d1d5db" />

      {/* Line */}
      <polyline fill="none" stroke={color} strokeWidth={2.5} points={poly} />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
      ))}

      {/* X labels */}
      {labels && labels.length === values.length && (
        <g>
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {labels[i]}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
