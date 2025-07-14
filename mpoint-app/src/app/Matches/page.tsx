"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MatchingList from "../dashboard/MatchingList";

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect wenn nicht eingeloggt
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Anmeldung erforderlich
          </h2>
          <p className="mb-6 text-gray-600">
            Bitte loggen Sie sich ein, um Ihre Unternehmens-Matches zu sehen.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Zum Login
          </a>
        </div>
      </main>
    );
  }

  // Ladeindikator während Auth-Check
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-30 bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Unternehmens-Matches
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Hier finden Sie Ihre besten Matches basierend auf Ihrem Profil, Ihren
          Interessen und Angeboten.
        </p>
        <MatchingList limit={30} />
      </div>
    </main>
  );
}