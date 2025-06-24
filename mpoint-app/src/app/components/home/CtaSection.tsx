import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Bereit für bessere Geschäftskontakte?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Werden Sie Teil des größten B2B-Netzwerks in Hamburg und entdecken Sie neue Möglichkeiten für Ihr Unternehmen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Kostenlos registrieren <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300">
              Kontakt aufnehmen
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Keine Kreditkarte erforderlich</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Jederzeit kündbar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>DSGVO-konform</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}