"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { getScoreBand } from "@/utils/scoreDescriptors";

export default function Wirtschaftsmeter({
    score,
    description = "Multifaktorielle Analyse der Wirtschaftslage",
    lastUpdate,
}: {
    score: number; // 0 - 100
    description?: string;
    lastUpdate?: string;
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        // animate to target score on mount/score change
        const start = performance.now();
        const duration = 700; // ms
        const from = displayValue;
        const to = Math.max(0, Math.min(100, Math.round(score)));

        let raf: number;
        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const current = Math.round(from + (to - from) * p);
            setDisplayValue(current);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [score]);

    return (
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
                Wirtschaftsstimmung
                <Activity className="w-5 h-5 text-orange-500" />
            </h3>
            <div className="flex flex-col items-center rounded-lg bg-white hover:bg-gray-50 border border-gray-200 p-3 hover:shadow-md">
                <p className="text-sm text-gray-500 mb-6">{description}</p>

                <div className="relative">
                    <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
                        {/* Background arc */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="20"
                            strokeLinecap="round"
                        />
                        {/* Value arc */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#e60000"
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeDasharray={`${displayValue * 2.51} 251`}
                            className="transition-all duration-300 ease-out"
                        />
                        {/* Center text */}
                        <text x="100" y="90" textAnchor="middle" className="fill-gray-900 text-3xl font-bold">
                            {displayValue}
                        </text>
                    </svg>
                </div>

                {(() => {
                    const band = getScoreBand(displayValue);
                    return (
                        <div
                            className={`mt-4 inline-block px-4 py-2 rounded-lg font-medium ${band.badgeClasses}`}
                        >
                            {band.name}
                        </div>
                    );
                })()}

                {/*
        <div className="flex justify-between text-xs text-gray-500 mt-4 px-4">
          <span>Pessimistisch</span>
          <span>Neutral</span>
          <span>Optimistisch</span>
        </div>
        */}

                {lastUpdate && (
                    <p className="text-sm text-gray-500 mt-4">Letztes Update: {lastUpdate}</p>
                )}
            </div>
        </div>
    );
}
