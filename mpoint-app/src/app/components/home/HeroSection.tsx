import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Building2, TrendingUp, Handshake, Globe } from "lucide-react";

export default function HeroSection() {
  return (
   <section className="relative min-h-[80vh] flex items-center pt-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "4s" }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Neu: KI-gestütztes Matching</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Business-Kontakte die
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> wirklich passen</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Entdecken Sie die perfekten Geschäftspartner in der Metropolregion Hamburg.
                Mit intelligenten Matching-Algorithmen verbinden wir Unternehmen, die wirklich zueinander passen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  Kostenlos starten <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/demo" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 transition-all duration-300">
                  Demo ansehen
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">10.000+</span> Unternehmer vernetzen sich bereits
                </p>
              </div>
            </div>
            {/* Right content - Interactive illustration */}
            <div className="relative">
              <div className="relative w-full h-[400px]">
                {/* Connection lines animation */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <line x1="100" y1="100" x2="300" y2="150" stroke="url(#gradient1)" strokeWidth="2" opacity="0.3" className="animate-pulse" />
                  <line x1="150" y1="200" x2="250" y2="100" stroke="url(#gradient1)" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: "1s" }} />
                  <line x1="200" y1="300" x2="300" y2="250" stroke="url(#gradient1)" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: "2s" }} />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Company cards */}
                <div className="absolute top-20 left-10 bg-white rounded-xl shadow-xl p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">TechStart GmbH</p>
                      <p className="text-sm text-gray-600">Software • Hamburg</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-40 right-10 bg-white rounded-xl shadow-xl p-4 animate-float" style={{ animationDelay: "2s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Marketing Pro</p>
                      <p className="text-sm text-gray-600">Marketing • Altona</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-20 left-20 bg-white rounded-xl shadow-xl p-4 animate-float" style={{ animationDelay: "4s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Global Trade</p>
                      <p className="text-sm text-gray-600">Import/Export • Hafen</p>
                    </div>
                  </div>
                </div>
                {/* Match notification */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-6 shadow-2xl animate-bounce">
                  <Handshake className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}