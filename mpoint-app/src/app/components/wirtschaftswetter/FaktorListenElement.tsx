"use client";

import React from "react";
import FaktorenListenElementGraph from "./FaktorenListenElementGraph";
import { useTemplate } from "./TemplateContext";
import { getScoreBand } from "@/utils/scoreDescriptors";

// Toggle to show/hide the "Wecker" (bell) button next to the + button
const SHOW_WECKER_BUTTON = true;

export type Faktor = {
  id: string;
  name: string;
  beschreibung: string;
  quelle: string;
  kategorie?: string;
  werte?: number[]; // raw values for graphs etc.
  scores?: number[]; // normalized 0-100 values for comparisons (e.g. WetterVergleich)
};

type Props = {
  faktor: Faktor;
};

export default function FaktorListenElement({ faktor }: Props) {
  const { addFactor, hasFactor, isReadonly, getFactorValues } = useTemplate();
  // Dummy values for the graph; if faktor.werte provided, use them, else generate consistent dummy
  const values = React.useMemo(() => {
    if (faktor.werte && faktor.werte.length > 0) return faktor.werte;
    // deterministic pseudo-random based on id to keep stable between renders
    const seed = Array.from(faktor.id).reduce((a, c) => a + c.charCodeAt(0), 0);
    const n = 12;
    const arr: number[] = [];
    let val = seed % 100;
    for (let i = 0; i < n; i++) {
      val = (val * 9301 + 49297) % 233280; // LCG
      arr.push(50 + Math.round(((val / 233280) - 0.5) * 60));
    }
    return arr;
  }, [faktor.id, faktor.werte]);

  const labels = React.useMemo(() =>
    ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  []);

  // Scores (0-100): current and average, color-coded like Wirtschaftsmeter
  const { latest: scoreLatest, avg: scoreAvg } = React.useMemo(() => getFactorValues(faktor.name), [faktor.name, getFactorValues]);
  const bandLatest = getScoreBand(scoreLatest);
  const bandAvg = getScoreBand(scoreAvg);

  // Wecker: local temp storage per factor (dummy simulation)
  const weckerKey = React.useMemo(() => `ww:wecker:${faktor.id}`, [faktor.id]);
  type Wecker = { aktuell: number | null; trend: number | null };
  const [wecker, setWecker] = React.useState<Wecker | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(weckerKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<Wecker>;
      const a = typeof parsed.aktuell === "number" ? parsed.aktuell : null;
      const t = typeof parsed.trend === "number" ? parsed.trend : null;
      if (a === null && t === null) return null;
      return { aktuell: a, trend: t };
    } catch {
      return null;
    }
  });
  const [isWeckerOpen, setIsWeckerOpen] = React.useState(false);
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const [aktuellInput, setAktuellInput] = React.useState<string>("");
  const [trendInput, setTrendInput] = React.useState<string>("");
  const incStr = (s: string) => String(clamp(((parseInt(s || "0", 10) || 0) + 1)));
  const decStr = (s: string) => String(clamp(((parseInt(s || "0", 10) || 0) - 1)));

  const openWeckerEditor = () => {
    // prime inputs from saved values, else empty to allow null
    setAktuellInput(
      wecker?.aktuell !== undefined && wecker?.aktuell !== null
        ? String(wecker.aktuell)
        : ""
    );
    setTrendInput(
      wecker?.trend !== undefined && wecker?.trend !== null
        ? String(wecker.trend)
        : ""
    );
    setIsWeckerOpen(true);
  };
  const closeWeckerEditor = () => setIsWeckerOpen(false);
  const saveWecker = () => {
    const a = aktuellInput === "" ? null : clamp(parseInt(aktuellInput, 10));
    const t = trendInput === "" ? null : clamp(parseInt(trendInput, 10));
    const next: Wecker | null = a === null && t === null ? null : { aktuell: a, trend: t };
    setWecker(next);
    try {
      if (next) {
        window.localStorage.setItem(weckerKey, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(weckerKey);
      }
    } catch {}
    setIsWeckerOpen(false);
  };
  const deleteWecker = () => {
    setWecker(null);
    try {
      window.localStorage.removeItem(weckerKey);
    } catch {}
    setAktuellInput("");
    setTrendInput("");
    setIsWeckerOpen(false);
  };

  return (
    <article className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 transition">
      {/* Header row: name on the left, scores on the right */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900 truncate">{faktor.name}</h3>
        <div className="flex flex-wrap items-start justify-end gap-2">
          <div className="rounded-md border border-gray-200 bg-white px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium">Wetterscore</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${bandLatest.badgeClasses}`}>
                Aktuell:
                <strong className="tabular-nums">{scoreLatest}</strong>
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${bandAvg.badgeClasses}`}>
                Trend:
                <strong className="tabular-nums">{scoreAvg}</strong>
              </span>
              {SHOW_WECKER_BUTTON && (
                <button
                  type="button"
                  aria-label="Wecker"
                  onClick={(e) => {
                    e.stopPropagation();
                    isWeckerOpen ? closeWeckerEditor() : openWeckerEditor();
                  }}
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-50 ${(wecker && (wecker.aktuell !== null || wecker.trend !== null)) ? "text-[rgb(228,25,31)]" : "text-gray-700"}`}
                  title={(wecker && (wecker.aktuell !== null || wecker.trend !== null)) ? "Wecker aktiv" : "Wecker einstellen"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                    <path
                      fill="currentColor"
                      d="M12 2a6 6 0 0 0-6 6v3.586l-1.707 1.707A1 1 0 0 0 5 15h14a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z"
                    />
                  </svg>
                </button>
              )}
            </div>
            {isWeckerOpen && (
              <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                {/* Zeile 1: Aktuell */}
                <div className="flex items-center gap-3">
                  <label className="w-16 text-xs text-gray-600">Aktuell</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Aktuell minus"
                      onClick={() => setAktuellInput((v) => decStr(v))}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[rgb(228,25,31)] text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31)] hover:text-white text-sm"
                    >
                      –
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={aktuellInput}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setAktuellInput(raw);
                      }}
                      onBlur={() => setAktuellInput((v) => (v === "" ? "" : String(clamp(parseInt(v, 10)))))}
                      className="w-16 h-8 px-2 text-sm border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    />
                    <button
                      type="button"
                      aria-label="Aktuell plus"
                      onClick={() => setAktuellInput((v) => incStr(v))}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[rgb(228,25,31)] text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31)] hover:text-white text-sm"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      aria-label="Aktuell leeren"
                      onClick={() => setAktuellInput("")}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[rgb(228,25,31)] text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31)] hover:text-white text-sm"
                      title="Leeren"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Zeile 2: Trend */}
                <div className="flex items-center gap-3">
                  <label className="w-16 text-xs text-gray-600">Trend</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Trend minus"
                      onClick={() => setTrendInput((v) => decStr(v))}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[rgb(228,25,31)] text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31)] hover:text-white text-sm"
                    >
                      –
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={trendInput}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setTrendInput(raw);
                      }}
                      onBlur={() => setTrendInput((v) => (v === "" ? "" : String(clamp(parseInt(v, 10)))))}
                      className="w-16 h-8 px-2 text-sm border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    />
                    <button
                      type="button"
                      aria-label="Trend plus"
                      onClick={() => setTrendInput((v) => incStr(v))}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[rgb(228,25,31)] text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31)] hover:text-white text-sm"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      aria-label="Trend leeren"
                      onClick={() => setTrendInput("")}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[rgb(228,25,31)] text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31)] hover:text-white text-sm"
                      title="Leeren"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Zeile 3: Aktionen */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={saveWecker}
                    className="h-8 px-3 rounded-md text-white bg-[rgb(228,25,31)] hover:opacity-90 text-xs font-medium"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAktuellInput(""); setTrendInput(""); }}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[rgb(228,25,31)] text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31)] hover:text-white text-sm"
                    title="Beide Felder leeren"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
          {(() => {
            const canAdd = !isReadonly && !hasFactor(faktor.name);
            return (
              <button
                type="button"
                onClick={() => { if (canAdd) addFactor(faktor.name); }}
                aria-label="Faktor hinzufügen"
                disabled={!canAdd}
                className={
                  `inline-flex items-center justify-center w-9 h-9 rounded-md text-sm leading-none self-start ` +
                  (canAdd
                    ? `bg-[rgb(228,25,31)] text-white hover:opacity-90 cursor-pointer`
                    : `bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed`)
                }
                title={canAdd ? "Zum Template hinzufügen" : (isReadonly ? "Nur Lesen" : "Bereits im Template")}
              >
                +
              </button>
            );
          })()}
        </div>
      </div>

      {/* Content row: description/meta on the left, graph on the right */}
      <div className="mt-2 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 line-clamp-2">{faktor.beschreibung}</p>
          <div className="mt-2 text-xs text-gray-500">
            Quelle: <span className="font-medium text-gray-700">{faktor.quelle}</span>
            {faktor.kategorie ? (
              <>
                {" "}• Kategorie: <span className="text-gray-700">{faktor.kategorie}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="sm:w-80 w-full">
          <FaktorenListenElementGraph values={values} labels={labels} />
        </div>
      </div>
  {/* add button moved to header; no footer controls */}
    </article>
  );
}
