"use client";
import React, { useState } from "react";
import { Search, Filter, Users, Briefcase, MessageSquare, Building2, MapPin, Clock, ArrowRight, Plus, CheckCircle, AlertCircle, TrendingUp, Star, Send, Package, FileText, Menu, X } from "lucide-react";
import MatchingList from "../../dashboard/MatchingList";
import MarketplaceSection from "../../components/marketplace/MarketplaceSection";
import OutgoingRequests from "../../components/matche/MatchingRequests";
import IncomingRequests from "../../components/matche/MatchingRequestsReceived";

export default function MatchingMarketplacePage() {
 

  return (
    <div className="bg-gray-50 mt-20 min-h-screen">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Matches */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Matches */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#e60000]" />
                  Ihre Top-Matches
                </h2>
                <span className="text-sm text-gray-500">KI-basierte Empfehlungen</span>
              </div>
              
                  <MatchingList limit={3} />
                  <div className="mt-4 text-right">
  <a
    href="/Matches"
    className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:underline"
  >
    Alle Matches anzeigen <ArrowRight className="w-4 h-4" />
  </a>
</div>
          
            </section>

            {/* All Members */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  Mitglieder & Unternehmen finden
                </h2>
                <button className="text-sm text-[#e60000] font-medium hover:underline">
                  Alle anzeigen
                </button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <MemberCard 
                  category="Wissenstransfer"
                  company="frauenschmidt AG"
                  location="München"
                  size="11-20 Mitarbeiter"
                  matchPercentage={74}
                  tags={["Nachhaltigkeit", "Innovation"]}
                  matchId="1"
                  userId="currentUser"
                />
                <MemberCard 
                  category="Networking"
                  company="bauer.tech"
                  location="Frankfurt"
                  size="21-50 Mitarbeiter"
                  matchPercentage={68}
                  tags={["Digitalisierung", "KI"]}
                  matchId="2"
                  userId="currentUser"
                />
                <MemberCard 
                  category="Produktion"
                  company="weber industries"
                  location="Stuttgart"
                  size="50+ Mitarbeiter"
                  matchPercentage={65}
                  tags={["Industrie 4.0", "Export"]}
                  matchId="3"
                  userId="currentUser"
                />
                <MemberCard 
                  category="E-Commerce"
                  company="digital.shop24"
                  location="Köln"
                  size="10-20 Mitarbeiter"
                  matchPercentage={62}
                  tags={["Online-Handel", "B2C"]}
                  matchId="4"
                  userId="currentUser"
                />
              </div>
            </section>
          </div>

          {/* Right Column - Communication & Marketplace */}
          <aside className="space-y-8">
              <IncomingRequests />

                 <OutgoingRequests />


            {/* Marketplace */}
           <MarketplaceSection />

            {/* Stats Widget */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ihre Aktivität</h3>
              <div className="space-y-3">
                <StatItem icon={<TrendingUp className="w-4 h-4" />} label="Match-Rate" value="73%" trend="+5%" />
                <StatItem icon={<Users className="w-4 h-4" />} label="Neue Kontakte" value="12" subtext="diese Woche" />
                <StatItem icon={<Briefcase className="w-4 h-4" />} label="Aktive Projekte" value="3" />
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#e60000] text-white px-3 py-1.5 rounded-lg font-bold">M</span>
                <span className="font-semibold">M-POINT</span>
                <span className="text-gray-500">Business Matching 3.0</span>
              </div>
              <p className="text-gray-400 text-sm">
                Das moderne Unternehmensnetzwerk für die Metropolregion Hamburg. 
                Vernetzen Sie sich mit über 350.000 Unternehmen.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plattform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Unternehmen entdecken</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Matches</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gruppen</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentoring</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <address className="text-sm text-gray-400 not-italic">
                M-POINT GmbH<br />
                Große Elbstraße 47<br />
                22767 Hamburg<br />
                <br />
                +49 (40) 123 456 78<br />
                <a href="mailto:info@mpoint.biz" className="hover:text-white transition-colors">info@mpoint.biz</a>
              </address>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <span className="text-gray-500">© 2025 M-POINT GmbH. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-white transition-colors">AGB</a>
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component Definitions
function MatchCard({ category, company, location, size, matchPercentage, isPremium }: {
  category: string;
  company: string;
  location: string;
  size: string;
  matchPercentage: number;
  isPremium?: boolean;
}) {
  return (
    <div className="min-w-[280px] bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-md transition-all hover:scale-[1.02] group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{category}</span>
        {isPremium && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Premium
          </span>
        )}
      </div>
      
      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#e60000] transition-colors">{company}</h3>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <MapPin className="w-3 h-3" />
        <span>{location}</span>
        <span>•</span>
        <span>{size}</span>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-[#e60000] rounded-full transition-all duration-500"
            style={{ width: `${matchPercentage}%` }}
          />
        </div>
        <span className="font-bold text-[#e60000]">{matchPercentage}%</span>
      </div>
      
      <button className="w-full bg-[#e60000] text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors">
        Vernetzen
      </button>
    </div>
  );
}

function MemberCard({ category, company, location, size, matchPercentage, tags, matchId, userId }: {
  category: string;
  company: string;
  location: string;
  size: string;
  matchPercentage: number;
  tags: string[];
  matchId: string; // <- Match-ID aus den Daten
  userId: string;  // <- Aktueller User
}) {
  const [status, setStatus] = React.useState<"idle"|"loading"|"success"|"error">("idle");

  const handleConnect = async () => {
    setStatus("loading");
    const res = await fetch("/api/matching/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, userId }),
    });
    if (res.ok) setStatus("success");
    else setStatus("error");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{category}</span>
        <Building2 className="w-4 h-4 text-gray-400" />
      </div>
      
      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#e60000] transition-colors">{company}</h3>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <MapPin className="w-3 h-3" />
        <span>{location}</span>
        <span>•</span>
        <span>{size}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[#e60000] font-bold">{matchPercentage}% Match</span>
        <button
          onClick={handleConnect}
          disabled={status === "loading" || status === "success"}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          {status === "success" ? "Anfrage gesendet" : "Match-Anfrage"}
        </button>
      </div>
    </div>
  );
}

function CommunicationItem({ company, status, lastMessage, hasUnread }: {
  company: string;
  status: 'open' | 'active' | 'pending';
  lastMessage: string;
  hasUnread?: boolean;
}) {
  const getStatusColor = () => {
    switch(status) {
      case 'open': return 'text-orange-600 bg-orange-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'open': return 'offen';
      case 'active': return 'laufend';
      case 'pending': return 'ausstehend';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-gray-500" />
          </div>
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#e60000] rounded-full"></div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 group-hover:text-[#e60000] transition-colors">
              {company}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Clock className="w-3 h-3" />
            <span>Letzte Nachricht: {lastMessage}</span>
          </div>
        </div>
      </div>
      <button className="opacity-0 group-hover:opacity-100 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all">
        Öffnen
      </button>
    </div>
  );
}



function StatItem({ icon, label, value, trend, subtext }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  subtext?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
          {icon}
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900">
          {value}
          {trend && (
            <span className="ml-1 text-xs text-green-600 font-normal">{trend}</span>
          )}
        </div>
        {subtext && (
          <div className="text-xs text-gray-500">{subtext}</div>
        )}
      </div>
    </div>
  );
}