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

// Resolve factor score series (0-100) from JSON; fallback to normalized werte or neutral 50
function getFactorScoreSeries(factorName: string): number[] {
  const faktoren = ((data as any).faktoren ?? []) as Array<{
    name?: string;
    scores?: number[];
    werte?: number[];
  }>;
  const f = faktoren.find((x) => x?.name === factorName);
  if (f?.scores && f.scores.length > 0) return f.scores.map((n) => clamp01(n));
  if (f?.werte && f.werte.length > 0) {
    const min = Math.min(...f.werte);
    const max = Math.max(...f.werte);
    const range = max - min;
    if (range === 0) return new Array(f.werte.length).fill(50);
    return f.werte.map((v) => clamp01(((v - min) / range) * 100));
  }
  // default: neutral baseline
  return new Array(12).fill(50);
}

function clamp01(n: number): number {
  if (!isFinite(n)) return 0;
  const r = Math.round(n);
  return Math.max(0, Math.min(100, r));
}

function factorValueFromMode(_templateName: string, factorName: string, mode: "latest" | "avg"): number {
  const series = getFactorScoreSeries(factorName);
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
  const [name, setName] = React.useState<string>(selected === TEMPLATE_NEW ? "" : selected);
  const [rows, setRows] = React.useState<Row[]>(() => (indexFactors[selected] ?? []).map((n) => ({ name: n, weight: 1, mode: "latest" })));

  const isReadonly = selected !== TEMPLATE_NEW;

  React.useEffect(() => {
    if (selected === TEMPLATE_NEW) {
      // For a new template, reset name and start with an empty factor list
      setName("");
      setRows([]);
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
      const series = getFactorScoreSeries(factorName);
      const latest = series[series.length - 1] ?? 0;
      const avg = Math.round(series.reduce((a, v) => a + v, 0) / (series.length || 1));
      return { latest, avg };
    },
    []
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
