import React, { useState, useEffect } from "react";
import { Briefcase, ArrowRight, FileText, Package, Users, AlertCircle } from "lucide-react";
import Link from "next/link";

// Kategorie-Farben Mapping (wie in Marktplatz)
const categoryColorClasses: Record<string, string> = {
  "DIENSTLEISTUNG": "bg-blue-50 text-blue-700",
  "PRODUKT": "bg-violet-50 text-violet-700",
  "DIGITALISIERUNG": "bg-green-50 text-green-700",
  "NACHHALTIGKEIT": "bg-green-50 text-green-700",
  "MANAGEMENT": "bg-blue-50 text-blue-700",
};

// Typ-Farben Mapping für Anfrage/Angebot
const typeColors: Record<string, string> = {
  "Anfrage": "bg-yellow-50 text-yellow-700",
  "Angebot": "bg-blue-50 text-blue-700",
};

// Hilfsfunktion für Preisformatierung (wie in Marktplatz)
function renderPrice(price: any): string {
  if (!price) return "-";
  if (price.onRequest) return "Auf Anfrage";
  let out = "";
  if (price.ab) out += "ab ";
  if (price.from != null) out += price.from.toLocaleString("de-DE") + "€";
  if (price.to != null) out += ` - ${price.to.toLocaleString("de-DE")}€`;
  if (price.perHour) out += "/Std";
  if (price.perDay) out += "/Tag";
  if (price.perWeek) out += "/Woche";
  if (price.perMonth) out += "/Monat";
  return out.trim();
}

function ProjectCard({ id, type, title, description, category, entryType, price, urgent, isNew }: {
  id: string | number;
  type: string;
  title: string;
  description: string;
  category?: string;
  entryType?: string;
  price?: any;
  urgent?: boolean;
  isNew?: boolean;
}) {
  const getTypeIcon = () => {
    switch(type) {
      case 'Dienstleistung':
      case 'DIENSTLEISTUNG': return <FileText className="w-4 h-4" />;
      case 'Produkt':
      case 'PRODUKT': return <Package className="w-4 h-4" />;
      case 'Kooperation': return <Users className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  // Kategorie-Farbe
  const catClass = category ? categoryColorClasses[category.toUpperCase()] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";
  // Typ-Farbe
  const typeClass = entryType ? typeColors[entryType] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";

  return (
    <Link href={`/boerse/${id}`} className="border border-gray-200 rounded-xl bg-gray-50 p-4 hover:shadow-md transition-all group cursor-pointer block">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-gray-500">{getTypeIcon()}</div>
          {category && (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${catClass}`}>{category}</span>
          )}
          {entryType && (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeClass}`}>{entryType}</span>
          )}
        </div>
        {urgent && (
          <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Dringend
          </span>
        )}
        {isNew && (
          <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
            Neu
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#e60000] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="w-full text-right text-sm font-semibold text-gray-700 mt-2">
        {renderPrice(price)}
      </div>
    </Link>
  );
}

function TabButton({ active, children, onClick }: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-[#e60000] text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

const MarketplaceSection: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch("/api/marketplace");
        const data = await res.json();
        setEntries(data);
      } catch {
        // Fehlerhandling
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  // Zeige nur die ersten 3 Einträge
  const showEntries = entries.slice(0, 3);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Börse</h2>
        <Briefcase className="w-6 h-6 text-[#e60000]" />
      </div>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-gray-400 text-sm">Lädt...</div>
        ) : showEntries.length === 0 ? (
          <div className="text-gray-500">Keine Projekte gefunden.</div>
        ) : (
          showEntries.map((entry: any) => (
            <ProjectCard
              key={entry.id}
              id={entry.id}
              type={entry.category || "Projekt"}
              title={entry.title}
              description={entry.shortDescription}
              category={entry.category}
              entryType={entry.type}
              price={entry.price}
              urgent={entry.urgent}
              isNew={entry.isNew}
            />
          ))
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <Link href="/boerse" className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all">
          Alle Projekte anzeigen <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default MarketplaceSection;