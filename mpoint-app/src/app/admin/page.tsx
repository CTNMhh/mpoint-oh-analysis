"use client";

export default function AdminStartPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Admin Startseite
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Willkommen im Adminbereich! Hier kannst du Admins, Events und Nutzer verwalten.
        </p>
        {/* Admin-Komponenten */}
      </div>
    </main>
  );
}