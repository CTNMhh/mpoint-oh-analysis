import React from "react";
import { BarChart3 } from "lucide-react";
import FaktorenListe from "@/app/components/wirtschaftswetter/FaktorenListe";
import WetterVergleich from "@/app/components/wirtschaftswetter/WetterVergleich";
import TemplateEditor from "@/app/components/wirtschaftswetter/TemplateEditor";
import { TemplateProvider } from "@/app/components/wirtschaftswetter/TemplateContext";

export const metadata = {
  title: "Wirtschaftsanalyse | Wirtschaftswetter",
};

export default function WirtschaftsanalysePage() {
  return (
    <main className="min-h-screen pt-30 bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[rgb(228,25,31)]" />
            Detaillierte Wirtschaftsanalyse
          </h1>
          <p className="mt-2 text-gray-600">
            Entdecke alle Einflussfaktoren hinter dem Wirtschaftswetter: filtern, suchen und vergleichen – übersichtlich und fokussiert.
          </p>
        </div>
        <TemplateProvider>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-4">
              <FaktorenListe />
            </section>
            <aside className="lg:col-span-1 space-y-4">
              <WetterVergleich />
              <TemplateEditor />
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900">Hinweis</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Diese Seite zeigt eine Liste möglicher Einflussfaktoren mit Suche, Filter und Paginierung. Der Inhalt der Faktoren ist aktuell ein Dummy und wird später mit echten Daten ergänzt.
                </p>
              </div>
            </aside>
          </div>
        </TemplateProvider>
      </div>
    </main>
  );
}
