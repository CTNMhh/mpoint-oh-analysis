"use client";

import React from "react";
import { getScoreBand } from "@/utils/scoreDescriptors";

function HistoricalValue({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    const band = getScoreBand(value);
    return (
        <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md">
            <span className="text-gray-600">{label}</span>
            <div className="flex items-center justify-between gap-3 w-[180px]">
                <span className={`text-sm ${band.textClasses}`}>{band.name}</span>
                <span className={`inline-block px-3 py-1 rounded-lg font-bold ${band.badgeClasses}`}>
                    {value}
                </span>
            </div>
        </div>
    );
}

export default function Rueckblick({
    items,
}: {
    items: Array<{ label: string; value: number }>;
}) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Historische Werte</h3>

            <div className="space-y-4 mb-6">
                {items.map((it) => (
                    <HistoricalValue key={it.label} label={it.label} value={it.value} />
                ))}
            </div>
        </div>
    );
}
