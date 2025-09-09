"use client";

import React, { useState } from "react";
import { Moon, Bell, Lock, Loader2, Construction } from "lucide-react";

export default function SettingsPage() {
  const [darkMode] = useState(false);
  const [emailNotif] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero (analog Support) */}
      <section className="relative mt-20 overflow-hidden min-h-[33vh] flex">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e60000] via-[#cc0000] to-[#990000]" />
        <div className="relative max-w-5xl mx-auto px-4 flex flex-col justify-center min-h-[33vh] py-12 lg:py-16 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mb-6 mx-auto">
            <Construction className="w-10 h-10" />
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Einstellungen</h1>
          <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-6">
            Seite in Bearbeitung – hier kannst du später Dinge wie Dark Mode,
            Benachrichtigungen & Sicherheit personalisieren.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl pt-10 mx-auto px-4 pb-24 -mt-4 space-y-12">
        {/* Geplante Bereiche */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Geplante Bereiche</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Moon className="w-6 h-6 text-white" />,
                title: "Dark Mode",
                desc: "Theme-Umschalten (bald)",
                color: "bg-gray-900",
              },
              {
                icon: <Bell className="w-6 h-6 text-white" />,
                title: "Benachrichtigungen",
                desc: "Feinsteuerung aller Mails",
                color: "bg-blue-500",
              },
              {
                icon: <Lock className="w-6 h-6 text-white" />,
                title: "Sicherheit",
                desc: "Datenschutz & Zugriff",
                color: "bg-green-600",
              },
            ].map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center`}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{b.title}</h3>
                  <p className="text-xs text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vorschau (inaktiv) */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-8">
            <h3 className="font-bold text-gray-900 text-lg tracking-wide flex items-center gap-3">
              <span className="w-3 h-8 bg-[#e60000] rounded-full inline-block" />
              Vorschau Interaktive Elemente (inaktiv)
            </h3>

            <div className="space-y-6 max-w-xl">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shadow-md">
                    <Moon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dark Mode</p>
                    <p className="text-xs text-gray-500">Design-Anpassung (in Planung)</p>
                  </div>
                </div>
                <div
                  className={`relative inline-flex h-7 w-14 items-center rounded-full cursor-not-allowed ${
                    darkMode ? "bg-gray-800" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                      darkMode ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </div>
              </div>

              {/* Email Toggle */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#e60000] flex items-center justify-center shadow-md">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">E-Mail Benachrichtigungen</p>
                    <p className="text-xs text-gray-500">Match-, Netzwerk- & Systeminfos (in Planung)</p>
                  </div>
                </div>
                <div
                  className={`relative inline-flex h-7 w-14 items-center rounded-full cursor-not-allowed ${
                    emailNotif ? "bg-[#e60000]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                      emailNotif ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl">
              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                In Entwicklung
              </div>
              <p className="text-xs text-blue-600">
                Personalisierungen werden bald freigeschaltet.
              </p>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-r from-gray-900 to-gray-800 text-center">
            <p className="text-gray-300 text-sm">
              Feedback? <span className="font-medium text-white">info@mpoint.biz</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">GEMEINSAM GEHT&apos;S BESSER!</p>
          </div>
        </div>
      </div>
    </main>
  );
}