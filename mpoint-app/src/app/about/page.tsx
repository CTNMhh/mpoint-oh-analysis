'use client';

import React, { useState } from 'react';
import { Building2, Users, Target, Sparkles, TrendingUp, Award, Heart, Globe, Zap, ArrowRight, CheckCircle, Star, Handshake, Network, Calendar, Map, Quote } from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const stats = [
    { value: "2.500+", label: "Aktive Unternehmen", icon: Building2 },
    { value: "15.000+", label: "Erfolgreiche Matches", icon: Handshake },
    { value: "98%", label: "Zufriedenheit", icon: Heart },
    { value: "50+", label: "Events pro Jahr", icon: Calendar },
  ];

  const timeline = [
    { year: 2020, title: "Gründung", description: "Start als Netzwerk für Hamburger Unternehmer" },
    { year: 2021, title: "Erste KI-Integration", description: "Intelligentes Matching-System eingeführt" },
    { year: 2023, title: "Expansion", description: "Ausweitung auf die gesamte Metropolregion" },
    { year: 2024, title: "M-POINT 2.0", description: "Führende B2B-Vernetzungsplattform in Norddeutschland" },
    { year: 2025, title: "M-POINT 3.0", description: "Launch der revolutionären Business-Matching-Plattform" },
  ];

  const values = [
    {
      icon: Users,
      title: "Gemeinsam stärker",
      description: "Wir glauben an die Kraft der Vernetzung und gemeinsamen Erfolg"
    },
    {
      icon: Zap,
      title: "Innovation first",
      description: "KI-gestützte Technologie für perfekte Business-Matches"
    },
    {
      icon: Target,
      title: "Fokus auf Erfolg",
      description: "Jede Verbindung soll einen echten Mehrwert schaffen"
    },
    {
      icon: Heart,
      title: "Vertrauen & Qualität",
      description: "Verifizierte Unternehmen für seriöse Geschäftsbeziehungen"
    }
  ];

  const team = [
    { name: "Dr. Thomas Schmidt", role: "Gründer & CEO", image: "TS" },
    { name: "Julia Weber", role: "CTO", image: "JW" },
    { name: "Michael Klein", role: "Head of Business", image: "MK" },
    { name: "Anna Müller", role: "Head of Community", image: "AM" },
  ];

  // Encodiertes SVG Pattern (alle inneren Quotes in einfache ' und über URL-Encode %3C %3E etc)
  const heroPattern =
    'absolute inset-0 opacity-20 bg-[url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]';

  return (
    <div className="min-h-screen bg-gradient-to-b mt-20 from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[33vh] flex items-center bg-gradient-to-br from-[#e60000] via-[#cc0000] to-[#990000] text-white">
        <div className={heroPattern}></div>
        <div className="relative max-w-7xl mx-auto px-4 w-full py-12 lg:py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mb-6">
              <span className="text-4xl font-bold">M</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">
              M-POINT
            </h1>
            <p className="text-xl lg:text-2xl mb-3 text-white/90">
              Network for Actives
            </p>
            <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Die revolutionäre Business-Matching-Plattform für die Metropolregion Hamburg. 
              Wir verbinden Unternehmen mit KI-gestützter Präzision für nachhaltigen Geschäftserfolg.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">GEMEINSAM GEHT'S BESSER!</span>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
      
      </section>

      {/* Stats Section */}
      <section className="pt-20  relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-xl flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission/Vision/Story Tabs */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Unsere Geschichte</h2>
            <p className="text-xl text-gray-600">Von der Idee zur führenden B2B-Plattform</p>
          </div>
          
          <div className="flex justify-center gap-2 mb-12">
            {['mission', 'vision', 'story'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#e60000] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab === 'mission' ? 'Mission' : tab === 'vision' ? 'Vision' : 'Unsere Story'}
              </button>
            ))}
          </div>
          
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            {activeTab === 'mission' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Unsere Mission</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Wir revolutionieren die Art, wie Unternehmen in der Metropolregion Hamburg 
                  miteinander in Kontakt treten. Durch intelligente KI-gestützte Matching-Algorithmen 
                  schaffen wir bedeutungsvolle Geschäftsverbindungen, die echten Mehrwert generieren.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Präzises Matching</h4>
                      <p className="text-sm text-gray-600 mt-1">KI findet die perfekten Geschäftspartner</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Echte Verbindungen</h4>
                      <p className="text-sm text-gray-600 mt-1">Qualität vor Quantität bei jedem Match</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Regionaler Fokus</h4>
                      <p className="text-sm text-gray-600 mt-1">Stärkung der lokalen Wirtschaft</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'vision' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Unsere Vision</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Bis 2030 wollen wir die führende B2B-Vernetzungsplattform in ganz Deutschland sein. 
                  Ein Ökosystem, in dem jedes Unternehmen den perfekten Partner für Wachstum und 
                  Innovation findet - powered by KI und menschlicher Expertise.
                </p>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mt-8">
                  <Quote className="w-8 h-8 text-[#e60000] mb-4" />
                  <p className="text-xl font-medium text-gray-800 italic">
                    "Stellen Sie sich eine Welt vor, in der jede Geschäftsidee den perfekten Partner findet. 
                    Das ist unsere Vision für M-POINT."
                  </p>
                  <p className="text-sm text-gray-600 mt-3">- Dr. Thomas Schmidt, Gründer</p>
                </div>
              </div>
            )}
            
            {activeTab === 'story' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-2xl flex items-center justify-center mb-6">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Wie alles begann</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  2020 in Hamburg: Mitten in der Pandemie erkannten wir, dass Unternehmen mehr denn je 
                  effiziente Wege brauchen, um die richtigen Geschäftspartner zu finden. Was als kleines 
                  Netzwerk-Event startete, wurde zur revolutionären Plattform mit über 2.500 aktiven Unternehmen.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Heute kombiniert M-POINT das Beste aus beiden Welten: Die Präzision künstlicher Intelligenz 
                  mit der Wärme persönlicher Begegnungen bei unseren regelmäßigen Events.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Unsere Meilensteine</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-[#e60000] to-[#cc0000]"></div>
            {timeline.map((item, index) => (
              <div key={index} className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-1/2"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-white border-4 border-[#e60000] rounded-full flex items-center justify-center font-bold text-[#e60000]">
                    {item.year}
                  </div>
                </div>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8 text-right'}`}>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Unsere Werte</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Unser Team</h2>
          <p className="text-xl text-center text-gray-600 mb-12">Die Menschen hinter M-POINT</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-full flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 transition-transform">
                    {member.image}
                  </div>
                  <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#e60000] to-[#cc0000] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Werden Sie Teil des Netzwerks</h2>
          <p className="text-xl mb-8 text-white/90">
            Schließen Sie sich über 2.500 erfolgreichen Unternehmen an und 
            entdecken Sie die Kraft intelligenter Geschäftsverbindungen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#e60000] rounded-xl font-bold hover:scale-105 transition-transform">
              Jetzt kostenlos starten
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
              Demo vereinbaren
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Map className="w-8 h-8 mx-auto mb-3 text-[#e60000]" />
              <h3 className="font-semibold mb-2">Hauptsitz</h3>
              <p className="text-gray-400">Hamburg, Deutschland</p>
            </div>
            <div>
              <Globe className="w-8 h-8 mx-auto mb-3 text-[#e60000]" />
              <h3 className="font-semibold mb-2">Reichweite</h3>
              <p className="text-gray-400">Metropolregion Hamburg</p>
            </div>
            <div>
              <Award className="w-8 h-8 mx-auto mb-3 text-[#e60000]" />
              <h3 className="font-semibold mb-2">Auszeichnungen</h3>
              <p className="text-gray-400">Digital Innovation Award 2024</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}