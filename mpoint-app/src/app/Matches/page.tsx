"use client";
import MatchingList from "../dashboard/MatchingList";

export default function MatchesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 pt-30">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Unternehmens-Matches
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Hier finden Sie Ihre besten Matches basierend auf Ihrem Profil, Ihren Interessen und Angeboten.
        </p>
        <MatchingList limit={30} />
      </div>
    </main>
  );
}