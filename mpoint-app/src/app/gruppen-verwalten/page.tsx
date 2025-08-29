"use client";
import { GroupProvider, GroupList } from "@/context/GroupContext";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function GruppenVerwaltenPage() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated" || session?.user?.role !== "ENTERPRISE") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Kein Zugriff</h2>
          <p className="mb-6 text-gray-600">
            Diese Seite ist nur für ENTERPRISE-User verfügbar.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </main>
    );
  }

  return (
    <GroupProvider>
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#e60000]">Gruppen verwalten</h1>
            <Link
              href="/gruppen-verwalten/new"
              className="px-6 py-3 bg-[#e60000] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Gruppe anlegen
            </Link>
          </div>
          <GroupList session={session} />
          {/* Detailansicht: /gruppen-verwalten/[id] */}
          {/* Editieren: /gruppen-verwalten/[id]/edit */}
        </div>
      </main>
    </GroupProvider>
  );
}