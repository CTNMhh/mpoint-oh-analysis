import React, { useState, useEffect } from "react";
import { Users, MapPin, TrendingUp, Handshake, ChevronRight, Briefcase, Target, Award, Calendar, Globe, Search, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

function ConnectButton({
    userId,
    companyId,
    partnerCompanyId,
    receiverUserId,
}: {
    userId: string;
    companyId: string;
    partnerCompanyId: string;
    receiverUserId?: string;

}) {
    const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

    const handleConnect = async () => {
        setStatus("loading");
        try {
            const res = await fetch("/api/matching/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    companyId,
                    partnerCompanyId,
                    receiverUserId,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.matchId) throw new Error();
            const res2 = await fetch("/api/matching/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchId: data.matchId, userId }),
            });
            if (res2.ok) {
                setStatus("success");
                window.dispatchEvent(new Event("matching-requests-updated"));
            } else setStatus("error");
        } catch {
            setStatus("error");
        }
    };

    return (
        <button
            onClick={handleConnect}
            disabled={status === "loading" || status === "success"}
            className="bg-[rgb(228,25,31)] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
        >
            <Handshake className="w-4 h-4" />
            {status === "success"
                ? "Anfrage gesendet"
                : status === "loading"
                    ? "Sende..."
                    : "Vernetzen"}
        </button>
    );
}

export default function CompanySearch() {
    const { data: session } = useSession();
    const [query, setQuery] = useState("");
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    // Hole companyId für eingeloggten User
    useEffect(() => {
        if (session?.user?.id) {
            fetch(`/api/company?userId=${session.user.id}`)
                .then(res => res.json())
                .then(data => {
                    // Falls API ein Array liefert, nimm das erste Element
                    if (Array.isArray(data) && data.length > 0) setCompanyId(data[0].id);
                    // Falls API ein Objekt liefert
                    else if (data?.id) setCompanyId(data.id);
                });
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (query.length < 2) {
            setCompanies([]);
            return;
        }
        setLoading(true);
        fetch(`/api/company?search=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                let arr = Array.isArray(data) ? data : (data && typeof data === "object" ? [data] : []);
                // Eigenes Unternehmen rausfiltern
                if (companyId) {
                    arr = arr.filter(c => c.id !== companyId);
                }
                setCompanies(arr);
            })
            .finally(() => setLoading(false));
    }, [query, companyId]);

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Unternehmen</h2>
                <Users className="w-5 h-5 text-[#e60000]" />
            </div>
            <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    className="flex-1 outline-none bg-transparent text-gray-900"
                    placeholder="Firmenname, Branche, Ort..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>
            <div className="mt-6 text-center">
                <Link
                    href="/Matches"
                    className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all"
                >
                    Alle Unternehmen anzeigen <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Suche Unternehmen...</p>
                    </div>
                </div>
            )}
            {!loading && !companies.length && query.length > 1 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Keine Unternehmen gefunden.</p>
                </div>
            )}
            <div className="space-y-4">
                {companies.map(company => (
                    <div key={company.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                {/* Unternehmensinfos */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                                                {company.legalForm && (
                                                    <span className="text-sm text-gray-500">{company.legalForm}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                                {company.district && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{company.district}</span>
                                                    </div>
                                                )}
                                                {company.employeeRange && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        <span>{employeeRangeLabels[company.employeeRange as keyof typeof employeeRangeLabels]}</span>
                                                    </div>
                                                )}
                                                {company.growthPhase && (
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        <span>{growthPhaseLabels[company.growthPhase as keyof typeof growthPhaseLabels]}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Branchen Tags */}
                                            {company.industryTags && company.industryTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {company.industryTags.slice(0, 5).map((tag: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {company.industryTags.length > 5 && (
                                                        <span className="px-2 py-1 text-gray-500 text-xs">
                                                            +{company.industryTags.length - 5} weitere
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {/* Score & Networking */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Handshake className="w-4 h-4" />
                                                    Networking
                                                </span>
                                                {/* Beispielwert, ersetze mit echtem Score falls vorhanden */}
                                                <span className={`text-2xl font-bold ${getScoreColor(25)}`}>25%</span>
                                                <span className="text-2xl">{getScoreEmoji(25)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 lg:ml-4">
                                    <ConnectButton
                                        userId={session?.user?.id}
                                        companyId={companyId}
                                        partnerCompanyId={company.id}
                                        receiverUserId={company.user?.id}
                                    />
                                    <button
                                        onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}
                                        className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                                    >
                                        Details
                                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedId === company.id ? "rotate-90" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Erweiterte Details */}
                        {expandedId === company.id && (
                            <div className="border-t bg-gray-50 p-6 space-y-4">
                                {/* Beschreibung */}
                                {company.description && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Über das Unternehmen</h4>
                                        <p className="text-sm text-gray-700">{company.description}</p>
                                    </div>
                                )}
                                {/* Branchen Tags */}
                                {company.industryTags && company.industryTags.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Branchen</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {company.industryTags.map((tag: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Sie suchen / bieten */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {company.searchingFor && company.searchingFor.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Sie suchen:</h4>
                                            <ul className="space-y-1">
                                                {company.searchingFor.map((item: any, idx: number) => (
                                                    <li key={idx} className="text-sm text-gray-700">
                                                        • {item.category}
                                                        {item.details && <span className="text-gray-500"> - {item.details}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {company.offeringTo && company.offeringTo.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Sie bieten:</h4>
                                            <ul className="space-y-1">
                                                {company.offeringTo.map((item: any, idx: number) => (
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
                                    {company.certifications && company.certifications.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4" />
                                            <span>{company.certifications.length} Zertifizierungen</span>
                                        </div>
                                    )}
                                    {company.digitalizationLevel && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            <span>Digitalisierung: {company.digitalizationLevel}/10</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Profil aktualisiert</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}