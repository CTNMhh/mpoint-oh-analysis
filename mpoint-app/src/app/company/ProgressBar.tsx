import React, { useEffect, useState } from "react";

interface ProgressBarProps {
  bgClassName?: string; // z.B. "bg-white", "bg-blue-50"
  showSuggestions?: boolean;
}

export default function ProgressBar({
  bgClassName = "bg-white",
  showSuggestions = true,
}: ProgressBarProps) {
  const [completion, setCompletion] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletion() {
      try {
        const res = await fetch("/api/company/completion");
        if (res.ok) {
          const data = await res.json();
          setCompletion(data.currentCompletion ?? 0);
          setSuggestions(data.suggestions ?? []);
        }
      } catch (e) {
        setCompletion(null);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCompletion();
  }, []);

  if (loading) {
    return (
      <div className={`${bgClassName} border border-gray-200 rounded-lg p-4 hover:shadow-md mb-4`}>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2"></div>
      </div>
    );
  }

  return (
    <div className={`${bgClassName} border border-gray-200 rounded-lg p-4 hover:shadow-md mb-4`}>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">Profil-Vollständigkeit</span>
        <span className="font-medium text-[rgb(228,25,31)]">
          {completion !== null ? `${completion}%` : "…"}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-[rgb(228,25,31)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${completion ?? 0}%` }}
        ></div>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <b>Verbesserungsvorschläge:</b>
          <ul className="list-disc ml-5 mt-1">
            {suggestions.map((s, i) => (
              <li key={i}>{s.title || s.field || JSON.stringify(s)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}