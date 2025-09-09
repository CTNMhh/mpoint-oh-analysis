"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, TrendingUp, Users, Target, Heart, Star, 
  ArrowRight, CheckCircle, Zap, Trophy, Handshake,
  ChevronRight, Mail, Phone, Building2, Sparkles
} from 'lucide-react';

export default function SupporterPage() {
  const [activeTab, setActiveTab] = useState('was');
  const [counters, setCounters] = useState({
    current: 0,
    goal2025: 0,
    goal2026: 0,
    goal2027: 0
  });

  // Animierte Counter
  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      
      const targets = {
        current: 4000,
        goal2025: 10000,
        goal2026: 25000,
        goal2027: 100000
      };

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounters({
          current: Math.floor(targets.current * progress),
          goal2025: Math.floor(targets.goal2025 * progress),
          goal2026: Math.floor(targets.goal2026 * progress),
          goal2027: Math.floor(targets.goal2027 * progress)
        });

        if (step >= steps) clearInterval(timer);
      }, interval);
    };

    animateCounters();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-DE');
  };

  // Hintergrund-Pattern (Quotes encodet, damit JSX nicht bricht)
  const heroPattern =
    "absolute inset-0 opacity-30 bg-[url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")]";

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[33vh] flex">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e60000] via-[#cc0000] to-[#990000]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 flex flex-col justify-center min-h-[33vh] py-12 lg:py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mb-6">
              <span className="text-4xl font-bold">M</span>
            </div>
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-medium mb-4">
              M-POINT SUPPORTER
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 animate-fade-in">
              Werde Teil unserer<br />Erfolgsgeschichte
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-6">
              "Werde M-POINT SUPPORTER und gestalte die Zukunft der 
              unternehmerischen Vernetzung aktiv mit!"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#e60000] rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                Jetzt Supporter werden
                <Rocket className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center gap-2 px-7 py-3 bg-white/10 backdrop-blur text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
                Mehr erfahren
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Was ist ein Supporter Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              SUPPORTER beim M-POINT Unternehmernetzwerk!
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e60000] to-[#cc0000] mx-auto"></div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-2 mb-12">
            {[
              { id: 'was', label: 'Was ist das?', icon: Target },
              { id: 'warum', label: 'Warum?', icon: Heart },
              { id: 'wie', label: 'Wie werde ich?', icon: Handshake }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#e60000] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            {activeTab === 'was' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Was ist ein M-POINT Supporter?</h3>
                </div>
                <div className="space-y-4 text-lg text-gray-700">
                  <p className="leading-relaxed">
                    Ein M-POINT Supporter ist ein M-POINT Mitglied, das unsere Vision teilt und aktiv unterstützt.
                  </p>
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-l-4 border-[#e60000]">
                    <p className="font-semibold text-[#e60000] mb-2">GEMEINSAM GEHT'S BESSER!</p>
                    <p>
                      Unter diesem Motto arbeiten wir gemeinsam an einer faireren und wirtschaftlich 
                      gesünderen Unternehmerschaft der Zukunft.
                    </p>
                  </div>
                  <p className="leading-relaxed">
                    Bei M-POINT setzen wir auf Kooperation statt Konfrontation in der Businesswelt. 
                    Als M-POINT Supporter stehst du hinter dieser Entwicklung und hilfst uns, sie zu realisieren.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'warum' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-2xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Warum ist es gut, ein M-POINT Supporter zu sein?</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: TrendingUp,
                      title: "Positive Entwicklung",
                      text: "Dein Engagement trägt zur positiven Entwicklung und zum Erfolg unseres Netzwerks bei."
                    },
                    {
                      icon: Users,
                      title: "Gemeinschaft stärken",
                      text: "Du stärkst die unternehmerische Gemeinschaft und schaffst neue Möglichkeiten für alle M-POINT Mitglieder."
                    },
                    {
                      icon: Sparkles,
                      title: "Nachhaltigkeit fördern",
                      text: "Sei Teil einer Bewegung, die nachhaltiges und verantwortungsbewusstes Unternehmertum fördert."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-[#e60000]/10 rounded-xl flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-[#e60000]" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wie' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-2xl flex items-center justify-center">
                    <Handshake className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Wie wird man M-POINT Supporter?</h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-xl text-gray-700 mb-8">
                    Kontaktiere uns für weitere Informationen und starte Dein Engagement als M-POINT Supporter!
                  </p>
                  <a 
                    href="mailto:info@mpoint.biz"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#e60000] to-[#cc0000] text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-xl"
                  >
                    <Mail className="w-6 h-6" />
                    info@mpoint.biz
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wachstumsziele Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Unsere Wachstumsziele</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mit Deiner Unterstützung wollen wir wachsen und unseren Spirit in der Unternehmerschaft verbreiten.
            </p>
          </div>

          {/* Zielgruppe Info */}
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Wo wollen wir mit Deinem Support hin?</h3>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <p>Allein in der Metropolregion Hamburg gibt es etwa <span className="font-bold text-[#e60000]">350.000</span> Solo-Selbständige, Kleinunternehmer und kleine Mittelständler – unsere Zielgruppe.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <p>Deutschlandweit warten <span className="font-bold text-[#e60000]">4,5 Millionen</span> Kleinbetriebe darauf, Teil unseres Netzwerks zu werden.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#e60000] to-[#cc0000] rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                  <Building2 className="w-12 h-12 text-[#e60000] mb-4" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">4,5 Mio.</div>
                  <div className="text-gray-600">Potenzielle Mitglieder deutschlandweit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wachstums Timeline */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { year: 2024, count: counters.current, label: "Stand 2024", color: "from-gray-500 to-gray-600" },
              { year: 2025, count: counters.goal2025, label: "Ziel 2025", color: "from-blue-500 to-blue-600" },
              { year: 2026, count: counters.goal2026, label: "Ziel 2026", color: "from-purple-500 to-purple-600" },
              { year: 2027, count: counters.goal2027, label: "Ziel 2027", color: "from-[#e60000] to-[#cc0000]" }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color} rounded-t-2xl`}></div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-2">{item.label}</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatNumber(item.count)}
                    </div>
                    <div className="text-sm text-gray-600">Mitglieder</div>
                  </div>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Wachstumsperspektive Details */}
          <div className="bg-gradient-to-r from-[#e60000] to-[#cc0000] rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Wie ist die Wachstumsperspektive durch Deinen Support?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  year: "2024",
                  text: "Mit Deinem Support wollen wir von derzeit ca. 3.000 Mitgliedern auf ca. 4.000 Mitglieder bis zum Jahresende 2024 wachsen."
                },
                {
                  year: "2025",
                  text: "Bis Ende 2025 wollen wir den ersten großen Meilenstein von 10.000 Mitgliedern erreichen."
                },
                {
                  year: "2026",
                  text: "Bis Ende 2026 streben wir mehr als 25.000 Mitglieder an."
                },
                {
                  year: "2027",
                  text: "Mit Deinem Support wollen bis zum Jahresende 2027 erstmals mehr als 100.000 Mitglieder bei M-POINT zählen."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-8 h-8" />
                    <span className="text-2xl font-bold">{item.year}</span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 shadow-xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#e60000] to-[#cc0000] rounded-full mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                M-POINT wächst mit Deiner Unterstützung!
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                Gemeinsam machen wir M-POINT zum führenden Unternehmernetzwerk in Deutschland.
              </p>
              <div className="bg-[#e60000]/5 rounded-2xl p-8 max-w-2xl mx-auto">
                <p className="text-2xl font-bold text-[#e60000] mb-4">
                  GEMEINSAM GEHT'S BESSER!
                </p>
                <p className="text-gray-700">
                  Werde Supporter und führe mit uns das M-POINT Netzwerk an die Spitze!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-[#e60000] to-[#cc0000] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Bereit, Geschichte zu schreiben?</h2>
          <p className="text-xl mb-8 text-white/90">
            Werde jetzt M-POINT Supporter und gestalte die Zukunft der 
            unternehmerischen Vernetzung aktiv mit!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@mpoint.biz"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#e60000] rounded-xl font-bold hover:scale-105 transition-transform shadow-xl"
            >
              <Mail className="w-5 h-5" />
              info@mpoint.biz
            </a>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
              <Phone className="w-5 h-5" />
              Rückruf anfordern
            </button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Building2 className="w-8 h-8 mx-auto mb-3 text-[#e60000]" />
              <h3 className="font-semibold mb-2">Netzwerk</h3>
              <p className="text-gray-400">3.000+ aktive Mitglieder</p>
            </div>
            <div>
              <Users className="w-8 h-8 mx-auto mb-3 text-[#e60000]" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-gray-400">Metropolregion Hamburg</p>
            </div>
            <div>
              <Star className="w-8 h-8 mx-auto mb-3 text-[#e60000]" />
              <h3 className="font-semibold mb-2">Vision</h3>
              <p className="text-gray-400">100.000+ Mitglieder bis 2027</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}