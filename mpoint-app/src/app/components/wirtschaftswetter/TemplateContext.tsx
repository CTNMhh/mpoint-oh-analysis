"use client";

import React from "react";
import data from "./wirtschaftswetter.data.json";

export const TEMPLATE_NEW = "__new__";

export type Row = { name: string; weight: number; mode: "latest" | "avg" };

export type TemplateContextType = {
  templates: string[];
  selected: string;
  setSelected: (s: string) => void;
  name: string;
  setName: (n: string) => void;
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  isReadonly: boolean;
  addFactor: (name: string) => void;
  hasFactor: (name: string) => boolean;
  removeRow: (idx: number) => void;
  updateWeight: (idx: number, w: number) => void;
  updateMode: (idx: number, mode: "latest" | "avg") => void;
  getFactorValues: (factorName: string) => { latest: number; avg: number };
  score: number;
};

const TemplateContext = React.createContext<TemplateContextType | null>(null);

// Generate a stable synthetic series per (template, factor)
function factorSeries(templateName: string, factorName: string, points = 12): number[] {
  const seedStr = `${templateName}:${factorName}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const arr: number[] = [];
  let val = seed % 1000;
  for (let i = 0; i < points; i++) {
    val = (val * 9301 + 49297) % 233280;
    const norm = val / 233280;
    arr.push(Math.round(20 + norm * 70));
  }
  return arr;
}

function factorValueFromMode(templateName: string, factorName: string, mode: "latest" | "avg"): number {
  const series = factorSeries(templateName, factorName);
  if (mode === "avg") {
    const sum = series.reduce((a, v) => a + v, 0);
    return Math.round(sum / (series.length || 1));
  }
  return series[series.length - 1] ?? 0;
}

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const indexFactors = (data.indexFactors ?? {}) as Record<string, string[] | undefined>;
  const templates = Object.keys(indexFactors);
  const initialTemplate = (data as any).initRegion as string | undefined;

  const [selected, setSelected] = React.useState<string>(
    initialTemplate && templates.includes(initialTemplate) ? initialTemplate : (templates[0] ?? TEMPLATE_NEW)
  );
  const [name, setName] = React.useState<string>(selected === TEMPLATE_NEW ? "Neues Template" : selected);
  const [rows, setRows] = React.useState<Row[]>(() => (indexFactors[selected] ?? []).map((n) => ({ name: n, weight: 1, mode: "latest" })));

  const isReadonly = selected !== TEMPLATE_NEW;

  React.useEffect(() => {
    if (selected === TEMPLATE_NEW) {
      setName((prev) => (prev && prev !== "" && prev !== selected ? prev : "Neues Template"));
      // keep rows as-is when switching to new
    } else {
      setName(selected);
  setRows((indexFactors[selected] ?? []).map((n) => ({ name: n, weight: 1, mode: "latest" })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const hasFactor = React.useCallback((fname: string) => rows.some((r) => r.name === fname), [rows]);

  const addFactor = React.useCallback((fname: string) => {
  setRows((prev) => (prev.some((r) => r.name === fname) ? prev : [...prev, { name: fname, weight: 1, mode: "latest" }]));
  }, []);

  const removeRow = React.useCallback((idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateWeight = React.useCallback((idx: number, w: number) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, weight: w } : r)));
  }, []);

  const updateMode = React.useCallback((idx: number, mode: "latest" | "avg") => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, mode } : r)));
  }, []);

  const score = React.useMemo(() => {
    const sumW = rows.reduce((a, r) => a + (isFinite(r.weight) ? Math.max(0, r.weight) : 0), 0);
    if (!sumW) return 0;
    const seedName = isReadonly ? selected : (name || "Neues Template");
    const sum = rows.reduce((a, r) => {
      const val = factorValueFromMode(seedName, r.name, r.mode);
      return a + val * (isFinite(r.weight) ? Math.max(0, r.weight) : 0);
    }, 0);
    return Math.round(sum / sumW);
  }, [rows, selected, isReadonly, name]);

  const getFactorValues = React.useCallback(
    (factorName: string): { latest: number; avg: number } => {
      const seedName = isReadonly ? selected : (name || "Neues Template");
      const series = factorSeries(seedName, factorName);
      const latest = series[series.length - 1] ?? 0;
      const avg = Math.round(series.reduce((a, v) => a + v, 0) / (series.length || 1));
      return { latest, avg };
    },
    [isReadonly, selected, name]
  );

  const value: TemplateContextType = {
    templates,
    selected,
    setSelected,
    name,
    setName,
    rows,
    setRows,
    isReadonly,
    addFactor,
    hasFactor,
    removeRow,
    updateWeight,
  updateMode,
  getFactorValues,
    score,
  };

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

export function useTemplate() {
  const ctx = React.useContext(TemplateContext);
  if (!ctx) throw new Error("useTemplate must be used within TemplateProvider");
  return ctx;
}
