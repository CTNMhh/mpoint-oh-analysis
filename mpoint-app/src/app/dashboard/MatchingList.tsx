import React, { useEffect, useState } from "react";
import { Users, MapPin, TrendingUp, Briefcase, Target, Handshake, Award, Calendar, ChevronRight, Star, Building2, Globe } from "lucide-react";

type MatchingData = {
  company: {
    id: string;
    name: string;
    legalForm?: string;
    district?: string;
    employeeRange?: string;
    customerType?: string;
    marketReach?: string;
    growthPhase?: string;
    digitalizationLevel?: number;
    sustainabilityFocus?: number;
    description?: string;
    branchDescription?: string;
    industryTags?: string[];
    searchingFor?: { category: string; details?: string }[];
    offeringTo?: { category: string; details?: string }[];
    certifications?: string[];
    painPoints?: string[];
    user?: {
      firstName: string;
      lastName: string;
      titel?: string;
    };
  };
  matching: {
    score: number;
    percentage: number;
    type: string;
    reasons: string[];
    commonInterests: string[];
    potentialSynergies: string[];
    lastActivedays: number;
    isRecentlyActive: boolean;
  };
};

type Meta = {
  totalCandidates: number;
  matchesReturned: number;
  timestamp: string;
};

const matchTypeColors = {
  SUPPLIER_CUSTOMER: "bg-blue-100 text-blue-800",
  PARTNERSHIP: "bg-green-100 text-green-800",
  SERVICE_PROVIDER: "bg-purple-100 text-purple-800",
  COLLABORATION: "bg-orange-100 text-orange-800",
  KNOWLEDGE_EXCHANGE: "bg-teal-100 text-teal-800",
  NETWORKING: "bg-gray-100 text-gray-800",
};

const matchTypeLabels = {
  SUPPLIER_CUSTOMER: "Lieferant-Kunde",
  PARTNERSHIP: "Partnerschaft",
  SERVICE_PROVIDER: "Dienstleister",
  COLLABORATION: "Zusammenarbeit",
  KNOWLEDGE_EXCHANGE: "Wissensaustausch",
  NETWORKING: "Networking",
};

const employeeRangeLabels = {
  SOLO: "1 Mitarbeiter",
  MICRO: "2-9 Mitarbeiter",
  SMALL: "10-49 Mitarbeiter",
  MEDIUM: "50-249 Mitarbeiter",
  LARGE: "250+ Mitarbeiter",
};

const growthPhaseLabels = {
  STARTUP: "Startup (<2 Jahre)",
  GROWTH: "Wachstum (2-5 Jahre)",
  SCALING: "Skalierung (5-10 Jahre)",
  ESTABLISHED: "Etabliert (10-20 Jahre)",
  MATURE: "Reif (>20 Jahre)",
  TRANSFORMATION: "Transformation",
};

export default function MatchingList({ companyId: propCompanyId, limit = 15 }: { companyId?: string; limit?: number }) {
  const [matches, setMatches] = useState<MatchingData[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [companyId, setCompanyId] = useState<string | undefined>(propCompanyId);


  useEffect(() => {
    if (!propCompanyId) {
      async function fetchCompany() {
        try {
          const res = await fetch("/api/company");
          if (res.ok) {
            const data = await res.json();
            console.log("Company datayyy:", data);
            if (data?.id) setCompanyId(data.id);
          }
        } catch (e) {
          console.error("Fehler beim Laden der companyId:", e);
        }
      }
      fetchCompany();
    }
  }, [propCompanyId]);


  useEffect(() => {
    async function fetchMatches() {
      if (!companyId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/matching?companyId=${companyId}&limit=${limit}&excludeExisting=true`);
        const data = await res.json();

        if (data.success) {
          setMatches(data.matches || []);
          setMeta(data.meta || null);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
      setLoading(false);
    }

    if (companyId) fetchMatches();
  }, [companyId, limit]);


  const filteredMatches = filter === "all"
    ? matches
    : matches.filter(m => m.matching.type === filter);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🔥";
    if (score >= 60) return "💎";
    if (score >= 40) return "✨";
    return "👍";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Suche passende Unternehmen...</p>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Keine passenden Unternehmen gefunden.</p>
        <p className="text-sm text-gray-400 mt-2">Vervollständigen Sie Ihr Profil für bessere Matches!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-0">
      {/* Header mit Statistiken */}
      <div className="bg-gradient-to-r from-[rgb(228,25,31)] to-red-700 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Ihre Top-Matches</h2>
        {meta && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{meta.totalCandidates} Unternehmen analysiert</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>{meta.matchesReturned} Top-Matches gefunden</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all"
              ? "bg-[rgb(228,25,31)] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          Alle ({matches.length})
        </button>
        {Object.entries(matchTypeLabels).map(([key, label]) => {
          const count = matches.filter(m => m.matching.type === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === key
                  ? "bg-[rgb(228,25,31)] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Match Liste */}
      <div className="space-y-4">
        {filteredMatches.map((match) => (
          <div
            key={match.company.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Hauptbereich */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Unternehmensinformationen */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {match.company.name}
                        </h3>
                        {match.company.legalForm && (
                          <span className="text-sm text-gray-500">{match.company.legalForm}</span>
                        )}
                        {match.matching.isRecentlyActive && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Aktiv
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        {match.company.district && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{match.company.district}</span>
                          </div>
                        )}
                        {match.company.employeeRange && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{employeeRangeLabels[match.company.employeeRange as keyof typeof employeeRangeLabels]}</span>
                          </div>
                        )}
                        {match.company.growthPhase && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{growthPhaseLabels[match.company.growthPhase as keyof typeof growthPhaseLabels]}</span>
                          </div>
                        )}
                      </div>

                      {/* Branchen Tags */}
                      {match.company.industryTags && match.company.industryTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {match.company.industryTags.slice(0, 5).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {match.company.industryTags.length > 5 && (
                            <span className="px-2 py-1 text-gray-500 text-xs">
                              +{match.company.industryTags.length - 5} weitere
                            </span>
                          )}
                        </div>
                      )}

                      {/* Match Informationen */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${matchTypeColors[match.matching.type as keyof typeof matchTypeColors] || matchTypeColors.NETWORKING}`}>
                            <Handshake className="w-3 h-3 mr-1" />
                            {matchTypeLabels[match.matching.type as keyof typeof matchTypeLabels] || match.matching.type}
                          </span>
                          <span className={`text-2xl font-bold ${getScoreColor(match.matching.score)}`}>
                            {match.matching.percentage}%
                          </span>
                          <span className="text-2xl">{getScoreEmoji(match.matching.score)}</span>
                        </div>

                        {/* Top Match Gründe */}
                        {match.matching.reasons.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Warum dieses Match?</p>
                            <ul className="space-y-1">
                              {match.matching.reasons.slice(0, expandedMatch === match.company.id ? undefined : 2).map((reason, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 lg:ml-4">
                  <button className="bg-[rgb(228,25,31)] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
                    <Handshake className="w-4 h-4" />
                    Vernetzen
                  </button>
                  <button
                    onClick={() => setExpandedMatch(expandedMatch === match.company.id ? null : match.company.id)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                  >
                    Details
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedMatch === match.company.id ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Erweiterte Details */}
            {expandedMatch === match.company.id && (
              <div className="border-t bg-gray-50 p-6 space-y-4">
                {/* Beschreibung */}
                {match.company.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Über das Unternehmen</h4>
                    <p className="text-sm text-gray-700">{match.company.description}</p>
                  </div>
                )}

                {/* Gemeinsame Interessen */}
                {match.matching.commonInterests.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Gemeinsame Interessen
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {match.matching.commonInterests.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potentielle Synergien */}
                {match.matching.potentialSynergies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Potentielle Synergien
                    </h4>
                    <ul className="space-y-1">
                      {match.matching.potentialSynergies.map((synergy, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">★</span>
                          <span>{synergy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Was sie suchen / anbieten */}
                <div className="grid md:grid-cols-2 gap-4">
                  {match.company.searchingFor && match.company.searchingFor.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Sie suchen:</h4>
                      <ul className="space-y-1">
                        {match.company.searchingFor.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700">
                            • {item.category}
                            {item.details && <span className="text-gray-500"> - {item.details}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {match.company.offeringTo && match.company.offeringTo.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Sie bieten:</h4>
                      <ul className="space-y-1">
                        {match.company.offeringTo.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700">
                            • {item.category}
                            {item.details && <span className="text-gray-500"> - {item.details}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Zusätzliche Infos */}
                <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-600">
                  {match.company.certifications && match.company.certifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{match.company.certifications.length} Zertifizierungen</span>
                    </div>
                  )}
                  {match.company.digitalizationLevel && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Digitalisierung: {match.company.digitalizationLevel}/10</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {match.matching.lastActivedays === 0
                        ? "Heute aktiv"
                        : `Vor ${match.matching.lastActivedays} Tag${match.matching.lastActivedays === 1 ? "" : "en"} aktiv`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}