"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewMarketplaceEntryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "Anfrage",
    title: "",
    category: "",
    shortDescription: "",
    longDescription: "",
    location: "",
    deadline: "",
    skills: "",
    priceFrom: "",
    priceTo: "",
    priceMode: "fixed", // fixed | ab | range | perHour | perWeek | perMonth | onRequest
  anonym: false,
  });

  // Preisformatierung analog zum Frontend
  function priceDataToString(price: any): string {
    if (!price) return "-";
    if (price.onRequest) return "Auf Anfrage";
    if (price.from == null && price.to == null) return "-";
    let out = "";
    if (price.ab) out += "ab ";
    if (price.from != null) out += Number(price.from).toLocaleString("de-DE") + "€";
    if (price.to != null) out += ` - ${Number(price.to).toLocaleString("de-DE")}€`;
    if (price.perHour) out += "/Std";
    if (price.perDay) out += "/Tag";
    if (price.perWeek) out += "/Woche";
    if (price.perMonth) out += "/Monat";
    return out.trim();
  }

  const buildPriceFromForm = () => {
    const mode = form.priceMode;
    const price: any = {};
    if (mode === "onRequest") price.onRequest = true;
    if (mode === "ab") price.ab = true;
    if (mode === "perHour") price.perHour = true;
    if (mode === "perWeek") price.perWeek = true;
    if (mode === "perMonth") price.perMonth = true;
    if (["fixed", "ab", "perHour", "perWeek", "perMonth"].includes(mode)) {
      price.from = form.priceFrom ? Number(form.priceFrom) : undefined;
    }
    if (mode === "range") {
      price.from = form.priceFrom ? Number(form.priceFrom) : undefined;
      price.to = form.priceTo ? Number(form.priceTo) : undefined;
    }
    return price;
  };

  const pricePreview = useMemo(() => priceDataToString(buildPriceFromForm()), [form.priceMode, form.priceFrom, form.priceTo]);

  // Eigene Company laden
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [myCompany, setMyCompany] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setCompanyLoading(true);
        const res = await fetch("/api/company");
        const data = await res.json();
        if (!active) return;
        if (data && !data.error) {
          setMyCompany(data);
          // Nur Anzeige; Speicherung erfolgt über User-Verknüpfung
        } else {
          setMyCompany(null);
        }
      } catch (e: any) {
        setCompanyError(e.message || "Fehler beim Laden des Unternehmens");
      } finally {
        setCompanyLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!session?.user?.id) throw new Error("Bitte anmelden.");
  // Optionaler Check kann entfallen – Anzeige basiert auf User->Company
  const price = buildPriceFromForm();

      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          category: form.category.toUpperCase(),
          title: form.title,
          shortDescription: form.shortDescription,
          longDescription: form.longDescription,
          price: Object.keys(price).length ? price : null,
          type: form.type,
          anonym: !!form.anonym,
          location: form.location,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
          skills: form.skills,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Fehler beim Speichern");
      }
      router.push("/boerse");
    } catch (e: any) {
      setError(e.message || "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Neuen Eintrag erstellen</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            {["Anfrage", "Angebot"].map((t) => (
              <label
                key={t}
                className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${
                  form.type === t
                    ? t === "Anfrage"
                      ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
             >
                <input type="radio" className="hidden" name="type" checked={form.type===t} onChange={()=>setForm(f=>({...f,type:t as "Anfrage"|"Angebot"}))} />
                {t}
              </label>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input className="w-full border border-gray-300 rounded-xl px-3 py-2" required value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select className="w-full border border-gray-300 rounded-xl px-3 py-2" required value={form.category} onChange={(e)=>setForm(f=>({...f,category:e.target.value}))}>
              <option value="">Bitte wählen</option>
              <option value="DIENSTLEISTUNG">Dienstleistung</option>
              <option value="PRODUKT">Produkt</option>
              <option value="DIGITALISIERUNG">Digitalisierung</option>
              <option value="NACHHALTIGKEIT">Nachhaltigkeit</option>
              <option value="MANAGEMENT">Management</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kurzbeschreibung</label>
            <input className="w-full border border-gray-300 rounded-xl px-3 py-2" required value={form.shortDescription} onChange={(e)=>setForm(f=>({...f,shortDescription:e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea className="w-full border border-gray-300 rounded-xl px-3 py-2" rows={6} required value={form.longDescription} onChange={(e)=>setForm(f=>({...f,longDescription:e.target.value}))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Modus Auswahl */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Modus</label>
              <select className="w-full border border-gray-300 rounded-xl px-3 py-2" value={form.priceMode} onChange={(e)=>setForm(f=>({...f,priceMode:e.target.value}))}>
                <option value="fixed">Festpreis</option>
                <option value="ab">ab</option>
                <option value="range">von-bis</option>
                <option value="perHour">pro Stunde</option>
                <option value="perWeek">pro Woche</option>
                <option value="perMonth">pro Monat</option>
                <option value="onRequest">Auf Anfrage</option>
              </select>
            </div>
            {/* Preisfelder je nach Modus */}
            {form.priceMode !== 'onRequest' && (
              <>
                {(form.priceMode === 'fixed' || form.priceMode === 'ab' || form.priceMode === 'perHour' || form.priceMode === 'perWeek' || form.priceMode === 'perMonth') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preis</label>
                    <div className="flex items-center gap-2">
                      <input
                        className="w-full border border-gray-300 rounded-xl px-3 py-2"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={form.priceFrom}
                        onChange={(e)=>setForm(f=>({...f,priceFrom:e.target.value}))}
                      />
                      <span className="text-gray-600">€</span>
                    </div>
                  </div>
                )}
                {form.priceMode === 'range' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preis von</label>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-full border border-gray-300 rounded-xl px-3 py-2"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={form.priceFrom}
                          onChange={(e)=>setForm(f=>({...f,priceFrom:e.target.value}))}
                        />
                        <span className="text-gray-600">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preis bis</label>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-full border border-gray-300 rounded-xl px-3 py-2"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={form.priceTo}
                          onChange={(e)=>setForm(f=>({...f,priceTo:e.target.value}))}
                        />
                        <span className="text-gray-600">€</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          {/* Preisvorschau */}
          <div className="text-xs text-gray-600">Preisvorschau: <span className="font-medium">{pricePreview}</span></div>
          {/* Anbieter-Optionen */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Anbieter</h3>
            {myCompany?.id ? (
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Wird veröffentlicht als: <span className="font-medium">{myCompany?.name}</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300" checked={form.anonym} onChange={(e)=>setForm(f=>({...f, anonym: e.target.checked}))} />
                  <span>Anonym veröffentlichen</span>
                </label>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-gray-300" checked={form.anonym} onChange={(e)=>setForm(f=>({...f, anonym: e.target.checked}))} />
                <span>Anonym veröffentlichen</span>
              </label>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
              <input className="w-full border border-gray-300 rounded-xl px-3 py-2" value={form.location} onChange={(e)=>setForm(f=>({...f,location:e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input className="w-full border border-gray-300 rounded-xl px-3 py-2" type="date" value={form.deadline} onChange={(e)=>setForm(f=>({...f,deadline:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input className="w-full border border-gray-300 rounded-xl px-3 py-2" value={form.skills} onChange={(e)=>setForm(f=>({...f,skills:e.target.value}))} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50" onClick={()=>router.back()}>Abbrechen</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#e60000] text-white hover:bg-[#c01a1f]" disabled={loading}>{loading?"Speichert…":"Veröffentlichen"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
