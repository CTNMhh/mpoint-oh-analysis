"use client";

import React, { useState } from "react";
import { ArrowRight, BarChart3 } from "lucide-react";
import Wirtschaftsmeter from "./Wirtschaftsmeter";
import Rueckblick from "./Rueckblick";
import NextUpdate from "./NextUpdate";
import Wirtschaftskennzahlen from "./Wirtschaftskennzahlen";
import data from "./wirtschaftswetter.data.json";

// HistoricalValue moved into Rueckblick component

// IndicatorCard moved into Wirtschaftskennzahlen component

export default function Wirtschaftswetter() {
    // derive type from JSON at build-time; still have local variables, but values come from JSON
    const regions = data.regions as readonly string[];
    type Region = (typeof regions)[number];

    // Values sourced from JSON
    const scores = data.scores as Record<Region, number>;
    const rueckblickValues = data.rueckblickValues as Record<Region, Array<{ label: string; value: number }>>;
    const lastUpdateRaw = (data.lastUpdate || {}) as Record<Region, number | string | undefined>;
    const nextUpdateRaw = (data.nextUpdate || {}) as Record<Region, number | undefined>;
    const indexFactors = (data.indexFactors || {}) as Record<Region, string[] | undefined>;
    const wirtschaftskennzahlenItems = (data.wirtschaftskennzahlen || []) as Array<{
        label: string;
        unit?: string;
        showPlusForPositive?: boolean;
        nullWert?: number;
        values: number[];
    }>;

    const formatLastUpdate = (value?: number | string): string | undefined => {
        if (value == null) return undefined;
        if (typeof value === "number") {
            try {
                const d = new Date(value);
                if (isNaN(d.getTime())) return undefined;
                return new Intl.DateTimeFormat("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }).format(d);
            } catch {
                return undefined;
            }
        }
        // fallback for legacy string values
        return value;
    };

    const initialRegion = ((): Region => {
        const candidate = (data as any).initRegion as Region | undefined;
        if (candidate && (regions as readonly string[]).includes(candidate)) {
            return candidate as Region;
        }
        return (regions[0] as Region) ?? ("Deutschland" as Region);
    })();
    const [region, setRegion] = useState<Region>(initialRegion);

    return (
        <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-semibold text-gray-900">Wirtschaftswetter für</h2>
                    <div>
                        <label htmlFor="wirtschaftsmeter-region" className="sr-only">
                            Region wählen
                        </label>
                        <select
                            id="wirtschaftsmeter-region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value as Region)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e60000]"
                        >
                            {regions.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <BarChart3 className="w-6 h-6 text-[#e60000]" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Region selector moved into title */}

                {/* Barometer */}
                <div>
                    <Wirtschaftsmeter
                        score={scores[region]}
                        lastUpdate={formatLastUpdate(lastUpdateRaw[region])}
                    />
                </div>

                {/* Rückblick */}
                <div>
                    <Rueckblick items={rueckblickValues[region]} />
                </div>

                {/* Next Update */}
                <div>
                    <NextUpdate targetTimestamp={nextUpdateRaw[region]} factors={indexFactors[region]} />
                </div>
            </div>
            <div className="grid lg:grid-cols-3 mt-2.5">
                {/* Wirtschaftskennzahlen: full-width row below */}
                <div className="lg:col-span-3">
                    <Wirtschaftskennzahlen items={wirtschaftskennzahlenItems} />
                </div>
            </div>

            <div className="mt-8 text-center">
                <a
                    href="/wirtschaftsanalyse"
                    className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all"
                >
                    Detaillierte Wirtschaftsanalyse <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </section>
    );
}
