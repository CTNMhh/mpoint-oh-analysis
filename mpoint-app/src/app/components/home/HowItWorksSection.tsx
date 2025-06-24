import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            So einfach funktioniert&apos;s
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            In nur drei Schritten zu wertvollen Geschäftskontakten
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"></div>
          {/* Step 1 */}
          <div className="text-center relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 relative z-10">
              1
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Profil erstellen</h3>
            <p className="text-gray-600">
              Registrieren Sie sich kostenlos und erstellen Sie Ihr aussagekräftiges Unternehmensprofil mit allen wichtigen Informationen.
            </p>
          </div>
          {/* Step 2 */}
          <div className="text-center relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 relative z-10">
              2
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Partner entdecken</h3>
            <p className="text-gray-600">
              Nutzen Sie unsere KI-gestützten Matching-Funktionen oder suchen Sie gezielt nach passenden Geschäftspartnern.
            </p>
          </div>
          {/* Step 3 */}
          <div className="text-center relative">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 relative z-10">
              3
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Vernetzen & Wachsen</h3>
            <p className="text-gray-600">
              Knüpfen Sie wertvolle Kontakte, tauschen Sie sich aus und lassen Sie Ihr Business-Netzwerk wachsen.
            </p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105">
            Jetzt kostenlos starten <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}