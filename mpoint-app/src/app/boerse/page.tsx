"use client";

import { Suspense } from "react";
import MarketplaceDummy from "../marketplace/page";

export default function BoersePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Lädt...</div>}>
      <MarketplaceDummy />
    </Suspense>
  );
}