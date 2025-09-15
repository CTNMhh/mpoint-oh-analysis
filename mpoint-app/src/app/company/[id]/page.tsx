import React from "react";
import Link from "next/link";
import {
  Building2, MapPin, Users, Calendar, Globe, TrendingUp, Award, Target,
  AlertCircle, Search, MessageSquare, ArrowLeft, ExternalLink, Briefcase,
  CheckCircle, Phone, Mail, User, Sparkles, Shield, Clock,
  Euro, Activity, Zap, Star, BadgeCheck,
  Info, BarChart3, Video, CalendarCheck, Share2, Bookmark,
  Trophy, Rocket, Settings, Package, Flag, Hash, Cpu,
  Home, Timer, UserPlus, ShieldCheck, FileCheck,
  AlertTriangle, Gift, Lightbulb, GraduationCap, MapPinned,
  Wallet, TrendingDown, Leaf, Layers
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      // Alle Basis-Felder
      id: true,
      name: true,
      legalForm: true,
      foundedYear: true,
      registrationNumber: true,
      digitalizationLevel: true,
      itBudgetPercent: true,
      employeeCount: true,
      employeeRange: true,
      annualRevenue: true,
      revenueRange: true,
      street: true,
      zipCode: true,
      district: true,
      primaryNaceCode: true,
      logoUrl: true,
      websiteUrl: true,
      managingDirector: true,
      contactEmail: true,
      contactPhone: true,
      customerType: true,
      customerCount: true,
      exportQuota: true,
      marketReach: true,
      seasonality: true,
      leadershipStructure: true,
      decisionSpeed: true,
      decisionMakers: true,
      growthPhase: true,
      growthRate: true,
      sustainabilityFocus: true,
      branchDescription: true,
      companyDescription: true,
      matchingScore: true,
      profileCompleteness: true,
      lastMatchingUpdate: true,
      createdAt: true,
      updatedAt: true,

      // Relations
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },

      // Arrays
      locationAdvantages: true,
      industryTags: true,
      secondaryNaceCodes: true,
      expansionPlans: true,
      certifications: true,
      complianceNeeds: true,
      qualityStandards: true,
      painPoints: true,
      searchingFor: true,
      offeringTo: true,
    },
  });

  if (!company) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Unternehmen nicht gefunden.</p>
          <Link
            href="/Matches/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e60000] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Suche
          </Link>
        </div>
      </main>
    );
  }

  // Labels für Enums
  const employeeRangeLabels: Record<string, string> = {
    SOLO: "Einzelunternehmer",
    MICRO: "2-9 Mitarbeiter",
    SMALL: "10-49 Mitarbeiter",
    MEDIUM: "50-249 Mitarbeiter",
    LARGE: "250+ Mitarbeiter",
  };

  const revenueRangeLabels: Record<string, string> = {
    MICRO: "< 100k EUR",
    SMALL: "100k - 1M EUR",
    MEDIUM: "1M - 10M EUR",
    LARGE: "10M - 50M EUR",
    ENTERPRISE: "> 50M EUR"
  };

  const customerCountLabels: Record<string, string> = {
    VERY_SMALL: "< 10 Kunden",
    SMALL: "10-50 Kunden",
    MEDIUM: "50-250 Kunden",
    LARGE: "250-1000 Kunden",
    VERY_LARGE: "> 1000 Kunden"
  };

  const marketReachLabels: Record<string, string> = {
    LOCAL: "Lokal",
    REGIONAL: "Regional",
    NATIONAL: "National",
    EUROPE: "Europa",
    GLOBAL: "Global"
  };

  const seasonalityLabels: Record<string, string> = {
    NONE: "Keine",
    LOW: "Gering",
    MODERATE: "Mittel",
    HIGH: "Hoch",
    EXTREME: "Extrem"
  };

  const leadershipLabels: Record<string, string> = {
    OWNER_LED: "Inhabergeführt",
    MANAGEMENT_LED: "Managementgeführt",
    BOARD_LED: "Vorstandsgeführt",
    FAMILY_BUSINESS: "Familienunternehmen"
  };

  const decisionSpeedLabels: Record<string, string> = {
    VERY_SLOW: "Sehr langsam",
    SLOW: "Langsam",
    MODERATE: "Moderat",
    FAST: "Schnell",
    VERY_FAST: "Sehr schnell"
  };

  const growthPhaseLabels: Record<string, string> = {
    STARTUP: "Startup",
    SCALING: "Skalierung",
    ESTABLISHED: "Etabliert",
    MATURE: "Reif",
    TRANSFORMATION: "Transformation",
    RESTRUCTURING: "Restrukturierung"
  };

  const expansionTypeLabels: Record<string, string> = {
    NEW_LOCATIONS: "Neue Standorte",
    NEW_PRODUCTS: "Neue Produkte",
    NEW_MARKETS: "Neue Märkte",
    DIGITALIZATION: "Digitalisierung",
    ACQUISITIONS: "Akquisitionen",
    INTERNATIONAL: "Internationalisierung",
    // Weitere Enum-Werte hier ergänzen
  };

  const districtLabels: Record<string, string> = {
    MITTE: "Hamburg-Mitte",
    ALTONA: "Altona",
    EIMSBUETTEL: "Eimsbüttel",
    NORD: "Hamburg-Nord",
    WANDSBEK: "Wandsbek",
    BERGEDORF: "Bergedorf",
    HARBURG: "Harburg",
    HAFENCITY: "HafenCity",
    SPEICHERSTADT: "Speicherstadt",
    UMLAND_NORD: "Umland Nord",
    UMLAND_SUED: "Umland Süd",
  };

  function getDistrictLabel(code?: string | null) {
    if (!code) return "Hamburg";
    return districtLabels[code] || code;
  }

  // Helper Funktionen
  const companyAge = new Date().getFullYear() - company.foundedYear;
  const formatRevenue = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M EUR`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k EUR`;
    return `${amount.toFixed(0)} EUR`;
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r mt-20 from-[#e60000] to-[#c01a1f] text-white">
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-20 w-20 bg-white rounded-xl p-2 object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  <div className="flex flex-wrap gap-3 text-sm mb-3">
                    {company.legalForm && <span className="px-2 py-1 bg-white/20 rounded">{company.legalForm}</span>}
                    <span>
                      <MapPin className="w-3 h-3 inline" /> {getDistrictLabel(company.district)}
                    </span>
                    <span><Calendar className="w-3 h-3 inline" /> Seit {company.foundedYear}</span>
                    <span><Users className="w-3 h-3 inline" /> {company.employeeCount} Mitarbeiter</span>
                  </div>
                  {company.managingDirector && (
                    <div className="mb-3 text-sm opacity-90">
                      <User className="w-3 h-3 inline mr-1" />
                      Geschäftsführung: {company.managingDirector}
                    </div>
                  )}

                  {/* Kontaktdaten direkt im Header */}
                  <div className="flex flex-wrap gap-4 pt-3 border-t border-white/20">
                    {company.websiteUrl && (
                      <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-white/90 hover:text-white transition-colors">
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {company.contactEmail && (
                      <a href={`mailto:${company.contactEmail}`}
                        className="flex items-center gap-1 text-white/90 hover:text-white transition-colors">
                        <Mail className="w-4 h-4" />
                        <span>{company.contactEmail}</span>
                      </a>
                    )}
                    {company.contactPhone && (
                      <a href={`tel:${company.contactPhone}`}
                        className="flex items-center gap-1 text-white/90 hover:text-white transition-colors">
                        <Phone className="w-4 h-4" />
                        <span>{company.contactPhone}</span>
                      </a>
                    )}
                    {company.street && (
                      <span className="flex items-center gap-1 text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span>{company.street}{company.zipCode ? `, ${company.zipCode}` : ''}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons rechts */}
            <div className="lg:w-64 flex flex-col gap-3">
              {company.user?.id && (
                <Link
                  href={`/chat/${company.user.id}`}
                  className="block w-full bg-white text-[#e60000] px-4 py-3 rounded-lg text-center font-semibold hover:bg-gray-100 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 inline mr-2" />
                  Kontakt aufnehmen
                </Link>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            {company.companyDescription && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#e60000]" />
                  Über uns
                </h2>
                <p className="text-gray-700 whitespace-pre-line">{company.companyDescription}</p>
              </div>
            )}

            {/* Business Model */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#e60000]" />
                Geschäftsmodell
              </h2>

              {company.branchDescription && (
                <p className="text-gray-700 mb-4">{company.branchDescription}</p>
              )}

              {(() => {
                const metrics = [
                  {
                    key: 'revenue',
                    label: 'Umsatz',
                    value: revenueRangeLabels[company.revenueRange] ||
                      (company.annualRevenue != null ? formatRevenue(company.annualRevenue) : null)
                  },
                  {
                    key: 'employees',
                    label: 'Mitarbeiter',
                    value: employeeRangeLabels[company.employeeRange]
                  },
                  {
                    key: 'customerType',
                    label: 'Kundentyp',
                    value: company.customerType || null
                  },
                  {
                    key: 'customerCount',
                    label: 'Kundenzahl',
                    value: customerCountLabels[company.customerCount]
                  },
                  {
                    key: 'marketReach',
                    label: 'Marktreichweite',
                    value: marketReachLabels[company.marketReach]
                  },
                  {
                    key: 'growthPhase',
                    label: 'Wachstumsphase',
                    value: growthPhaseLabels[company.growthPhase]
                  },
                  {
                    key: 'leadership',
                    label: 'Führung',
                    value: leadershipLabels[company.leadershipStructure]
                  },
                  {
                    key: 'decisionSpeed',
                    label: 'Entscheidung',
                    value: decisionSpeedLabels[company.decisionSpeed]
                  }
                ].filter(m => m.value !== null && m.value !== undefined && m.value !== '');

                if (!metrics.length) return null;

                return (
                  <div className="grid grid-cols-2 gap-3">
                    {metrics.map(m => (
                      <div key={m.key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                        <div className="font-semibold">{m.value}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Industry Tags */}
              {company.industryTags && company.industryTags.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Branchen-Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {company.industryTags.map((tag) => (
                      <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        #{tag.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{company.digitalizationLevel}/10</div>
                <div className="text-xs text-gray-500">Digitalisierung</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{company.growthRate > 0 ? '+' : ''}{company.growthRate}%</div>
                <div className="text-xs text-gray-500">Wachstum</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{company.exportQuota}%</div>
                <div className="text-xs text-gray-500">Export</div>
              </div>
            </div>

            {/* Needs & Offers */}
            {(company.painPoints?.length ||
              company.searchingFor?.length ||
              company.offeringTo?.length) > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#e60000]" />
                  Bedarf & Angebot
                </h2>

                {company.painPoints?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Herausforderungen
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.painPoints.map(point => (
                        <span
                          key={point.id}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            point.priority && point.priority >= 8
                              ? 'bg-red-100 text-red-700'
                              : point.priority && point.priority >= 5
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {point.point}
                          {point.priority && (
                            <span className="ml-1 text-xs">(P{point.priority})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.searchingFor?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      Wir suchen
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.searchingFor.map(item => (
                        <span
                          key={item.id}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                        >
                          {item.item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.offeringTo?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-600" />
                      Wir bieten
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.offeringTo.map(offer => (
                        <span
                          key={offer.id}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm"
                        >
                          {offer.offer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location Advantages */}
            {company.locationAdvantages && company.locationAdvantages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e60000]" />
                  Standortvorteile
                </h2>
                <div className="space-y-2">
                  {company.locationAdvantages.map((adv) => (
                    <div key={adv.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <MapPinned className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{adv.advantage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expansion Plans */}
            {company.expansionPlans && company.expansionPlans.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-[#e60000]" />
                  Expansionspläne
                </h2>
                <div className="space-y-2">
                  {company.expansionPlans.map(plan => (
                    <div key={plan.id} className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-gray-900">
                        {expansionTypeLabels[plan.type] || plan.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Certificates */}
            {company.certifications && company.certifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Zertifizierungen
                </h3>
                <div className="space-y-2">
                  {company.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Standards */}
            {company.qualityStandards && company.qualityStandards.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Qualitätsstandards
                </h3>
                <div className="flex flex-wrap gap-2">
                  {company.qualityStandards.map((standard) => (
                    <span key={standard.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      {standard.standard}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance */}
            {company.complianceNeeds && company.complianceNeeds.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Compliance
                </h3>
                <div className="space-y-2">
                  {company.complianceNeeds.map((need) => (
                    <div key={need.id} className={`p-2 rounded-lg text-sm ${need.priority && need.priority >= 8 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                      {need.need}
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-3">Unternehmensdaten</h3>
              <div className="space-y-2 text-sm">
                {company.registrationNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">HRB-Nr:</span>
                    <span className="font-medium">{company.registrationNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Gründung:</span>
                  <span className="font-medium">{company.foundedYear}</span>
                </div>
                {company.primaryNaceCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">NACE:</span>
                    <span className="font-medium">{company.primaryNaceCode}</span>
                  </div>
                )}
                {company.itBudgetPercent != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">IT-Budget:</span>
                    <span className="font-medium">{company.itBudgetPercent}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Saisonalität:</span>
                  <span className="font-medium">{seasonalityLabels[company.seasonality]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entscheider:</span>
                  <span className="font-medium">{company.decisionMakers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nachhaltigkeit:</span>
                  <span className="font-medium">{company.sustainabilityFocus}/10</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <div>Erstellt: {formatDate(company.createdAt)}</div>
                <div>Aktualisiert: {formatDate(company.updatedAt)}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}