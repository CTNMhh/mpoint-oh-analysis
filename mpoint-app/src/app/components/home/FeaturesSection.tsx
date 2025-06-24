import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
  Target,
  Zap,
  Shield,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Alles was Sie für erfolgreiches Networking brauchen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Moderne Tools und Features für effiziente Geschäftsanbahnung
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">KI-gestütztes Matching</h3>
            <p className="text-gray-600 mb-4">
              Unser Algorithmus analysiert Ihre Geschäftsziele und findet die perfekten Partner für Sie.
            </p>
            <Link href="/features/ai-matching" className="text-indigo-600 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              Mehr erfahren <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Speed-Dating</h3>
            <p className="text-gray-600 mb-4">
              Treffen Sie in kurzer Zeit viele potenzielle Geschäftspartner bei unseren Events.
            </p>
            <Link href="/features/speed-dating" className="text-indigo-600 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              Mehr erfahren <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Event-Management</h3>
            <p className="text-gray-600 mb-4">
              Organisieren Sie eigene Events oder nehmen Sie an exklusiven Networking-Events teil.
            </p>
            <Link href="/features/events" className="text-indigo-600 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              Mehr erfahren <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Zielgruppen-Filter</h3>
            <p className="text-gray-600 mb-4">
              Filtern Sie nach Branche, Unternehmensgröße, Standort und vielen weiteren Kriterien.
            </p>
            <Link href="/features/filters" className="text-indigo-600 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              Mehr erfahren <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Echtzeit-Chat</h3>
            <p className="text-gray-600 mb-4">
              Kommunizieren Sie direkt mit Ihren Matches über unsere sichere Chat-Funktion.
            </p>
            <Link href="/features/chat" className="text-indigo-600 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              Mehr erfahren <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Datenschutz garantiert</h3>
            <p className="text-gray-600 mb-4">
              Ihre Unternehmensdaten sind bei uns sicher. DSGVO-konform und verschlüsselt.
            </p>
            <Link href="/features/privacy" className="text-indigo-600 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              Mehr erfahren <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}