"use client";

import React, { useEffect, useState } from "react";

export default function NextUpdate({ targetTimestamp, factors }: { targetTimestamp?: number; factors?: string[] }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Fallback: wenn kein Ziel angegeben, nächster Tag 08:00
      let target = targetTimestamp ?? (() => {
        const t = new Date(now);
        t.setDate(t.getDate() + 1);
        t.setHours(8, 0, 0, 0);
        return t.getTime();
      })();
      // Wenn Ziel in der Vergangenheit liegt, setze auf nächsten Tag 08:00
      if (target <= now.getTime()) {
        const t = new Date(now);
        t.setDate(t.getDate() + 1);
        t.setHours(8, 0, 0, 0);
        target = t.getTime();
      }

      const diff = target - now.getTime();
      const msPerSec = 1000;
      const msPerMin = 60 * msPerSec;
      const msPerHour = 60 * msPerMin;
      const hours = Math.floor(diff / msPerHour);
      const minutes = Math.floor((diff % msPerHour) / msPerMin);
      const seconds = Math.floor((diff % msPerMin) / msPerSec);

      const pad = (n: number) => n.toString().padStart(2, "0");
      setCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Nächstes Update</h3>
      <div className="flex flex-col items-center rounded-lg bg-white hover:bg-gray-50 border border-gray-200 p-3 mb-4 hover:shadow-md h-[46px] justify-center">
        <div className="text-3xl font-bold text-[#e60000] font-mono leading-none text-center">{countdown}</div>
      </div>
      <div className="flex flex-col items-start rounded-lg bg-white hover:bg-gray-50 border border-gray-200 p-3 hover:shadow-md">
        <h4 className="font-medium text-gray-600 mb-3 text-center self-center">Faktoren im Index</h4>
        <ul className="space-y-2 text-sm text-gray-600 ml-3">
          {(factors && factors.length > 0 ? factors : [
            "BIP-Entwicklung",
            "Geschäftsklimaindex",
            "Exportzahlen",
            "Arbeitsmarktdaten",
            "Inflationsrate",
            "Investitionsvolumen",
          ]).map((label) => (
            <li key={label} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
