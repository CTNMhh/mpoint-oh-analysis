export type ScoreBand = {
  name: "Negativ" | "Neutral" | "Positiv";
  range: [number, number]; // inclusive
  badgeClasses: string; // Tailwind classes for the badge background/text
  textClasses: string; // Tailwind classes for plain text usage
};

export const SCORE_BANDS: ScoreBand[] = [
  {
    name: "Negativ",
    range: [0, 35],
    badgeClasses: "bg-red-100 text-red-800",
    textClasses: "text-red-600",
  },
  {
    name: "Neutral",
    range: [36, 64],
    badgeClasses: "bg-gray-200 text-gray-700",
    textClasses: "text-gray-600",
  },
  {
    name: "Positiv",
    range: [65, 100],
    badgeClasses: "bg-green-100 text-green-800",
    textClasses: "text-green-600",
  },
];

export function getScoreBand(score: number): ScoreBand {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  for (const band of SCORE_BANDS) {
    const [min, max] = band.range;
    if (s >= min && s <= max) return band;
  }
  // Fallback shouldn't happen due to clamping, but return Neutral
  return SCORE_BANDS[1];
}
