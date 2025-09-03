import React from "react";
import Link from "next/link";
import { Building2, MapPin, Users, Calendar, Globe, TrendingUp, Award, Target, AlertCircle, Search, MessageSquare, ArrowLeft, ExternalLink, Briefcase, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      legalForm: true,
      district: true,
      foundedYear: true,
      primaryNaceCode: true,
      employeeRange: true,
      customerType: true,
      marketReach: true,
      branchDescription: true,
      companyDescription: true,
      painPoints: true,
      searchingFor: true,
      certifications: true,
      exportQuota: true,
      growthPhase: true,
      user: { select: { id: true } },
    },
  });

  // Tags normalisieren (Strings oder Objekte mit point/priority)
  const mapToTags = (list: any[] | null | undefined) =>
    (Array.isArray(list) ? list : [])
      .map((item, idx) => {
        if (typeof item === "string") {
          return { key: item, label: item, priority: null as number | null };
        }
        if (item && typeof item === "object") {
          const label =
            item.point ?? item.label ?? item.name ?? item.value ?? `Eintrag ${idx + 1}`;
          const priority =
            typeof item.priority === "number" ? item.priority : null;
          return {
            key: String(item.id ?? label ?? idx) + "-" + idx,
            label: String(label),
            priority,
          };
        }
        return { key: String(idx), label: String(item), priority: null };
      })
      .sort((a, b) => (b.priority ?? -1) - (a.priority ?? -1));

  const painPointsNorm = mapToTags(company?.painPoints);
  const searchingForNorm = mapToTags(company?.searchingFor);
  const certificationsNorm = mapToTags(company?.certifications);

  const priorityClasses = (p: number | null) => {
    if (p == null) return "bg-gray-50 text-gray-700 border border-gray-200";
    if (p >= 8) return "bg-red-50 text-red-700 border border-red-200";
    if (p >= 5) return "bg-orange-50 text-orange-700 border border-orange-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  const growthPhaseLabels: Record<string, string> = {
    STARTUP: "Startup",
    SCALING: "Skalierung",
    ESTABLISHED: "Etabliert",
    MATURE: "Reif",
    TRANSFORMATION: "Transformation",
  };

  const marketReachLabels: Record<string, string> = {
    GLOBAL: "Global",
    EUROPE: "Europa",
    NATIONAL: "National",
    REGIONAL: "Regional",
    LOCAL: "Lokal",
  };

  const employeeRangeLabels: Record<string, string> = {
    SOLO: "1 Person",
    MICRO: "2-9 Mitarbeiter",
    SMALL: "10-49 Mitarbeiter",
    MEDIUM: "50-249 Mitarbeiter",
    LARGE: "250+ Mitarbeiter",
  };

  if (!company) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Unternehmen nicht gefunden.</p>
          <Link 
            href="/netzwerk" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e60000] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Netzwerk
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#e60000] to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 pt-40 pb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm mt-1">
                    {company.legalForm && (
                      <span className="px-2 py-0.5 bg-white/10 rounded-full">
                        {company.legalForm}
                      </span>
                    )}
                    {company.district && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {company.district}
                      </span>
                    )}
                    {company.foundedYear && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Gegründet {company.foundedYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {company.user?.id && (
                <Link
                  href={`/chat/${company.user.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#e60000] rounded-xl font-medium hover:bg-gray-100 transition-all hover:scale-105"
                >
                  <MessageSquare className="w-4 h-4" />
                  Kontakt aufnehmen
                </Link>
              )}
              <Link 
                href="/Matches/search" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur text-white rounded-xl font-medium hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-10 py-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {company.employeeRange && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mitarbeiter</p>
                  <p className="font-semibold text-sm">{employeeRangeLabels[company.employeeRange] || company.employeeRange}</p>
                </div>
              </div>
            </div>
          )}
          
          {company.marketReach && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reichweite</p>
                  <p className="font-semibold text-sm">{marketReachLabels[company.marketReach] || company.marketReach}</p>
                </div>
              </div>
            </div>
          )}
          
          {company.growthPhase && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phase</p>
                  <p className="font-semibold text-sm">{growthPhaseLabels[company.growthPhase] || company.growthPhase}</p>
                </div>
              </div>
            </div>
          )}
          
          {company.customerType && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kundentyp</p>
                  <p className="font-semibold text-sm">{company.customerType}</p>
                </div>
              </div>
            </div>
          )}
          
          {company.exportQuota != null && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Export</p>
                  <p className="font-semibold text-sm">{company.exportQuota}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unternehmensbeschreibung */}
            {company.companyDescription && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#e60000]" />
                  <h2 className="text-lg font-semibold">Über uns</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {company.companyDescription}
                </p>
              </div>
            )}

            {/* Branche & Markt */}
            {company.branchDescription && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-[#e60000]" />
                  <h2 className="text-lg font-semibold">Branche & Markt</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {company.branchDescription}
                </p>
                {company.primaryNaceCode && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-500">NACE-Code:</span>
                    <span className="font-medium text-gray-900">{company.primaryNaceCode}</span>
                  </div>
                )}
              </div>
            )}

            {/* Herausforderungen & Suche */}
            {(painPointsNorm.length > 0 || searchingForNorm.length > 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#e60000]" />
                  <h2 className="text-lg font-semibold">Fokus & Bedarf</h2>
                </div>
                
                <div className="space-y-6">
                  {painPointsNorm.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <h3 className="font-medium text-gray-800">Aktuelle Herausforderungen</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {painPointsNorm.map(t => (
                          <span
                            key={t.key}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${priorityClasses(t.priority)}`}
                            title={t.priority != null ? `Priorität: ${t.priority}/10` : ""}
                          >
                            {t.priority != null && t.priority >= 8 && (
                              <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
                            )}
                            {t.label}
                            {t.priority != null && (
                              <span className="text-xs opacity-70 font-bold">
                                P{t.priority}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchingForNorm.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-4 h-4 text-blue-600" />
                        <h3 className="font-medium text-gray-800">Wir suchen</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchingForNorm.map(t => (
                          <span
                            key={t.key}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:scale-105 transition-all"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Zertifizierungen */}
            {certificationsNorm.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-[#e60000]" />
                  <h2 className="text-lg font-semibold">Zertifizierungen</h2>
                </div>
                <div className="space-y-2">
                  {certificationsNorm.map(c => (
                    <div
                      key={c.key}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:scale-105 transition-all"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-800">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Aktionen</h3>
              <div className="space-y-3">
                {company.user?.id && (
                  <Link
                    href={`/chat/${company.user.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e60000] text-white rounded-xl font-medium hover:bg-red-700 transition-all hover:scale-105"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Nachricht senden
                  </Link>
                )}
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all">
                  <Users className="w-4 h-4" />
                  Als Kontakt speichern
                </button>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}