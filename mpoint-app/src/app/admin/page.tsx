"use client";

import AdminNotificationsWidget from "./notifications/AdminNotificationsWidget";

export default function AdminStartPage() {
  return (
    <main className="min-h-screen mt-20 bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Admin Startseite
          </h1>
          <p className="text-gray-600">
            Willkommen im Adminbereich! Überblick über aktuelle Systemereignisse.
          </p>
        </div>
        <AdminNotificationsWidget />
      </div>
    </main>
  );
}