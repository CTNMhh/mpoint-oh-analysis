import React, { useState, useEffect, useRef } from "react";
import { Users, Search, ArrowRight, Building2 } from "lucide-react";
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
    const [sortOption, setSortOption] = useState<"relevance" | "name" | "employees" | "district">("relevance");
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Mapping für Mitarbeiterbereich Reihenfolge
    const employeeOrder: Record<string, number> = {
        SOLO: 0,
        MICRO: 1,
        SMALL: 2,
        MEDIUM: 3,
        LARGE: 4
    };

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

    // Sortierung anwenden wenn companies oder sortOption sich ändern
    useEffect(() => {
        if (!companies.length) return;
        setCompanies(prev => {
            const arr = [...prev];
            switch (sortOption) {
                case "name":
                    arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                    break;
                case "employees":
                    arr.sort(
                        (a, b) =>
                            (employeeOrder[a.employeeRange] ?? 999) -
                            (employeeOrder[b.employeeRange] ?? 999)
                    );
                    break;
                case "district":
                    arr.sort((a, b) => (a.district || "").localeCompare(b.district || ""));
                    break;
                case "relevance":
                default:
                    // Keine Sortierung (Server-/Match-Reihenfolge beibehalten)
                    break;
            }
            return arr;
        });
    }, [sortOption, companies.length]);

    useEffect(() => {
        if (query.length >= 2 && companies.length) setOpen(true);
        else setOpen(false);
        setHighlightIndex(-1);
    }, [companies, query]);

    // Close on outside click
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
        }
        window.addEventListener("mousedown", onClick);
        return () => window.removeEventListener("mousedown", onClick);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex(i => Math.min(companies.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex(i => Math.max(0, i - 1));
        } else if (e.key === "Enter") {
            if (highlightIndex >= 0 && companies[highlightIndex]) {
                const id = companies[highlightIndex].id;
                window.location.href = `/company/${id}`;
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-end md:justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        Unternehmen
                        <Users className="w-5 h-5 text-[#e60000]" />
                      </h2>
                      <Link
                        href="/companys"
                        className="inline-flex items-center gap-1 text-[rgb(228,25,31)] text-sm font-medium hover:underline whitespace-nowrap"
                      >
                        Alle Unternehmen anzeigen
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="relative flex-1" ref={dropdownRef}>
                        <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2 border border-gray-200">
                            <Search className="w-5 h-5 text-gray-400 mr-2" />
                            <input
                                type="text"
                                ref={inputRef}
                                onFocus={() => { if (companies.length) setOpen(true); }}
                                onKeyDown={handleKeyDown}
                                className="flex-1 outline-none bg-transparent text-gray-900"
                                placeholder="Firmenname, Branche, Ort..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>
                        {open && (
                            <div className="absolute z-30 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto animate-fade">
                                {loading && (
                                    <div className="px-4 py-6 text-sm text-gray-500">Suche...</div>
                                )}
                                {!loading && companies.length === 0 && query.length >= 2 && (
                                    <div className="px-4 py-6 text-sm text-gray-500">Keine Treffer</div>
                                )}
                                {!loading && companies.map((c, i) => {
                                    const active = i === highlightIndex;
                                    return (
                                        <button
                                            type="button"
                                            key={c.id}
                                            onMouseEnter={() => setHighlightIndex(i)}
                                            onMouseLeave={() => setHighlightIndex(-1)}
                                            onClick={() => { window.location.href = `/company/${c.id}`; }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                                                active ? "bg-red-50" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {c.logoUrl ? (
                                                    <img
                                                        src={c.logoUrl}
                                                        alt={c.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                                    />
                                                ) : (
                                                    <Building2 className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <span className="font-medium text-sm text-gray-900 truncate">
                                                {c.name || "Unbenannt"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

           
            </div>
        </section>
    );
}