"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  TrendingUp, 
  Target, 
  Award, 
  Save,
  ArrowLeft,
  ChevronDown,
  Plus,
  X
} from "lucide-react"; 

interface CompanyData {
  // Allow dynamic string keys for flexible field access
  [key: string]: any;

  // Basis-Informationen
  name: string;
  legalForm: string;
  foundedYear: number;
  registrationNumber: string;
  
  // Größenklasse
  employeeCount: number;
  employeeRange: string;
  annualRevenue: number;
  revenueRange: string;
  
  // Lokation
  street: string;
  zipCode: string;
  district: string;
  locationAdvantages: string[];
  
  // Branchen
  primaryNaceCode: string;
  secondaryNaceCodes: string[];
  industryTags: string[];
  branchDescription: string;
  
  // Geschäftsmodell
  customerType: string;
  customerCount: string;
  exportQuota: number;
  marketReach: string;
  seasonality: string;
  
  // Führung
  leadershipStructure: string;
  decisionSpeed: string;
  decisionMakers: number;
  
  // Wachstum
  growthPhase: string;
  growthRate: number;
  expansionPlans: string[];
  sustainabilityFocus: number;
  
  // Compliance
  certifications: string[];
  complianceNeeds: string[];
  qualityStandards: string[];
  
  // Matching
  painPoints: string[];
  currentChallenges: string[];
  searchingFor: string[];
  offeringTo: string[];
}

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [company, setCompany] = useState<CompanyData>({
    // Basis-Informationen
    name: "",
    legalForm: "",
    foundedYear: new Date().getFullYear(),
    registrationNumber: "",
    
    // Größenklasse
    employeeCount: 1,
    employeeRange: "SOLO",
    annualRevenue: 0,
    revenueRange: "MICRO",
    
    // Lokation
    street: "",
    zipCode: "",
    district: "",
    locationAdvantages: [],
    
    // Branchen
    primaryNaceCode: "",
    secondaryNaceCodes: [],
    industryTags: [],
    branchDescription: "",
    
    // Geschäftsmodell
    customerType: "B2B",
    customerCount: "VERY_SMALL",
    exportQuota: 0,
    marketReach: "LOCAL",
    seasonality: "NONE",
    
    // Führung
    leadershipStructure: "OWNER_LED",
    decisionSpeed: "MODERATE",
    decisionMakers: 1,
    
    // Wachstum
    growthPhase: "ESTABLISHED",
    growthRate: 0,
    expansionPlans: [],
    sustainabilityFocus: 5,
    
    // Compliance
    certifications: [],
    complianceNeeds: [],
    qualityStandards: [],
    
    // Matching
    painPoints: [],
    currentChallenges: [],
    searchingFor: [],
    offeringTo: []
  });
  const [completion, setCompletion] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Redirect wenn nicht eingeloggt
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Unternehmensdaten laden
  useEffect(() => {
    async function fetchCompany() {
      if (status !== "authenticated") return;
      
      try {
        const res = await fetch("/api/company");
        
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setCompany(prev => ({ ...prev, ...data }));
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden der Unternehmensdaten:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [status]);

  // Profil-Vollständigkeit laden
  useEffect(() => {
    async function fetchCompletion() {
      try {
        const res = await fetch("/api/company/completion");
        if (res.ok) {
          const data = await res.json();
          console.log("Profil-Vollständigkeit:", data);
          setCompletion(data.currentCompletion ?? 0);
          setSuggestions(data.suggestions ?? []);
        }
      } catch (e) {
        setCompletion(null);
        setSuggestions([]);
      }
    }
    if (status === "authenticated") fetchCompletion();
  }, [status, saving]);

  const handleInputChange = (field: string, value: any) => {
    setCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayAdd = (field: string, value: string) => {
    if (value.trim()) {
      setCompany(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: string, index: number) => {
    setCompany(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Nur erlaubte Felder senden
    const {
      employeeRange,
      revenueRange,
      currentChallenges,
      ...companyData
    } = company;

    // Relations immer als Array mitschicken
    const safeCompanyData = {
      ...companyData,
      locationAdvantages: company.locationAdvantages || [],
      industryTags: company.industryTags || [],
      secondaryNaceCodes: company.secondaryNaceCodes || [],
      expansionPlans: company.expansionPlans || [],
      certifications: company.certifications || [],
      complianceNeeds: company.complianceNeeds || [],
      qualityStandards: company.qualityStandards || [],
      painPoints: company.painPoints || [],
      searchingFor: company.searchingFor || [],
      offeringTo: company.offeringTo || [],    };

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeCompanyData)
      });

      if (res.ok) {
        alert("Unternehmensprofil erfolgreich gespeichert!");
      } else {
        const err = await res.json();
        throw new Error(err?.error || "Fehler beim Speichern");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Speichern des Unternehmensprofils");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const tabs = [
    { id: "basic", label: "Grunddaten", icon: Building2 },
    { id: "business", label: "Geschäftsmodell", icon: Target },
    { id: "growth", label: "Wachstum", icon: TrendingUp },
    { id: "matching", label: "Matching", icon: Users }
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Unternehmensprofil</h1>
              <p className="text-gray-600 mt-1">
                Vervollständigen Sie Ihr Unternehmensprofil für bessere Matches
              </p>
            </div>
          </div>

          {/* Progress Bar */}
{/* Progress Bar */}
<div className="bg-white rounded-lg p-4 shadow-sm mb-4">
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-gray-600">Profil-Vollständigkeit</span>
    <span className="font-medium text-[rgb(228,25,31)]">
      {completion !== null ? `${completion}%` : "…"}
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
    <div
      className="bg-[rgb(228,25,31)] h-2 rounded-full transition-all duration-300"
      style={{ width: `${completion ?? 0}%` }}
    ></div>
  </div>
  {suggestions.length > 0 && (
    <div className="mt-2 text-xs text-gray-600">
      <b>Verbesserungsvorschläge:</b>
      <ul className="list-disc ml-5 mt-1">
        {suggestions.map((s, i) => (
          <li key={i}>{s.title || s.field || JSON.stringify(s)}</li>
        ))}
      </ul>
    </div>
  )}
</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-[rgb(228,25,31)] border-b-2 border-[rgb(228,25,31)]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {activeTab === "basic" && (
              <BasicInfoTab 
                company={company} 
                onChange={handleInputChange}
                onArrayAdd={handleArrayAdd}
                onArrayRemove={handleArrayRemove}
              />
            )}
            
            {activeTab === "business" && (
              <BusinessModelTab 
                company={company} 
                onChange={handleInputChange}
                onArrayAdd={handleArrayAdd}
                onArrayRemove={handleArrayRemove}
              />
            )}
            
            {activeTab === "growth" && (
              <GrowthTab 
                company={company} 
                onChange={handleInputChange}
                onArrayAdd={handleArrayAdd}
                onArrayRemove={handleArrayRemove}
              />
            )}
            
            {activeTab === "matching" && (
              <MatchingTab 
                company={company} 
                onChange={handleInputChange}
                onArrayAdd={handleArrayAdd}
                onArrayRemove={handleArrayRemove}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Speichern
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}

// Komponenten für die einzelnen Tabs
function BasicInfoTab({ company, onChange, onArrayAdd, onArrayRemove }: any) {
  const [newLocationAdvantage, setNewLocationAdvantage] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Grunddaten</h2>
        
        {/* Unternehmensname und Rechtsform */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unternehmensname *
            </label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechtsform
            </label>
            <select
              value={company.legalForm}
              onChange={(e) => onChange("legalForm", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="">Bitte wählen</option>
              <option value="GmbH">GmbH</option>
              <option value="UG">UG (haftungsbeschränkt)</option>
              <option value="AG">AG</option>
              <option value="KG">KG</option>
              <option value="OHG">OHG</option>
              <option value="Einzelunternehmen">Einzelunternehmen</option>
              <option value="GbR">GbR</option>
              <option value="eG">eG</option>
            </select>
          </div>
        </div>

        {/* Gründungsjahr und Handelsregisternummer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gründungsjahr *
            </label>
            <input
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={company.foundedYear}
              onChange={(e) => onChange("foundedYear", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handelsregisternummer
            </label>
            <input
              type="text"
              value={company.registrationNumber}
              onChange={(e) => onChange("registrationNumber", e.target.value)}
              placeholder="z.B. HRB 123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Mitarbeiteranzahl und Umsatz */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anzahl Mitarbeiter *
            </label>
            <input
              type="number"
              min="1"
              value={company.employeeCount}
              onChange={(e) => onChange("employeeCount", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jahresumsatz (€)
            </label>
            <input
              type="number"
              min="0"
              value={company.annualRevenue}
              onChange={(e) => onChange("annualRevenue", parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Straße und Hausnummer
            </label>
            <input
              type="text"
              value={company.street}
              onChange={(e) => onChange("street", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PLZ
            </label>
            <input
              type="text"
              value={company.zipCode}
              onChange={(e) => onChange("zipCode", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Hamburg Bezirk */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hamburg Bezirk
          </label>
          <select
            value={company.district}
            onChange={(e) => onChange("district", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
          >
            <option value="">Bitte wählen</option>
            <option value="MITTE">Hamburg-Mitte</option>
            <option value="ALTONA">Altona</option>
            <option value="EIMSBUETTEL">Eimsbüttel</option>
            <option value="NORD">Hamburg-Nord</option>
            <option value="WANDSBEK">Wandsbek</option>
            <option value="BERGEDORF">Bergedorf</option>
            <option value="HARBURG">Harburg</option>
            <option value="HAFENCITY">HafenCity</option>
            <option value="SPEICHERSTADT">Speicherstadt</option>
            <option value="UMLAND_NORD">Umland Nord</option>
            <option value="UMLAND_SUED">Umland Süd</option>
          </select>
        </div>

        {/* Standortvorteile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Standortvorteile
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newLocationAdvantage}
              onChange={(e) => setNewLocationAdvantage(e.target.value)}
              placeholder="z.B. Hafennähe, Autobahnanbindung"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("locationAdvantages", newLocationAdvantage);
                  setNewLocationAdvantage("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("locationAdvantages", newLocationAdvantage);
                setNewLocationAdvantage("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.locationAdvantages.map((advantage: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {advantage}
                <button
                  type="button"
                  onClick={() => onArrayRemove("locationAdvantages", index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessModelTab({ company, onChange, onArrayAdd, onArrayRemove }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Geschäftsmodell</h2>
        
        {/* Kundentyp und Marktreichweite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kundentyp *
            </label>
            <select
              value={company.customerType}
              onChange={(e) => onChange("customerType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            >
              <option value="B2B">B2B (Business to Business)</option>
              <option value="B2C">B2C (Business to Consumer)</option>
              <option value="B2B2C">B2B2C (Business to Business to Consumer)</option>
              <option value="B2G">B2G (Business to Government)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marktreichweite
            </label>
            <select
              value={company.marketReach}
              onChange={(e) => onChange("marketReach", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="LOCAL">Lokal (Hamburg)</option>
              <option value="REGIONAL">Regional (Norddeutschland)</option>
              <option value="NATIONAL">National (Deutschland)</option>
              <option value="EU">Europa</option>
              <option value="GLOBAL">Global</option>
            </select>
          </div>
        </div>

        {/* Exportquote und Saisonalität */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exportquote (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={company.exportQuota}
              onChange={(e) => onChange("exportQuota", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saisonalität
            </label>
            <select
              value={company.seasonality}
              onChange={(e) => onChange("seasonality", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="NONE">Keine</option>
              <option value="LOW">Gering</option>
              <option value="MEDIUM">Mittel</option>
              <option value="HIGH">Hoch</option>
              <option value="EXTREME">Extrem</option>
            </select>
          </div>
        </div>

        {/* Branchenbeschreibung */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branchenbeschreibung
          </label>
          <textarea
            value={company.branchDescription}
            onChange={(e) => onChange("branchDescription", e.target.value)}
            rows={4}
            placeholder="Beschreiben Sie Ihre Branche und Ihr Geschäftsfeld..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

function GrowthTab({ company, onChange, onArrayAdd, onArrayRemove }: any) {
  const [newExpansionPlan, setNewExpansionPlan] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Wachstum & Strategie</h2>
        
        {/* Wachstumsphase und Wachstumsrate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wachstumsphase
            </label>
            <select
              value={company.growthPhase}
              onChange={(e) => onChange("growthPhase", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="STARTUP">Startup (&lt; 2 Jahre)</option>
              <option value="GROWTH">Wachstum (2-5 Jahre)</option>
              <option value="SCALING">Skalierung (5-10 Jahre)</option>
              <option value="ESTABLISHED">Etabliert (10-20 Jahre)</option>
              <option value="MATURE">Reif (&gt; 20 Jahre)</option>
              <option value="TRANSFORMATION">Transformation</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jährliche Wachstumsrate (%)
            </label>
            <input
              type="number"
              min="-100"
              max="1000"
              step="0.1"
              value={company.growthRate}
              onChange={(e) => onChange("growthRate", parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Führungsstruktur und Entscheidungsgeschwindigkeit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Führungsstruktur
            </label>
            <select
              value={company.leadershipStructure}
              onChange={(e) => onChange("leadershipStructure", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="OWNER_LED">Inhabergeführt</option>
              <option value="FAMILY_BUSINESS">Familienunternehmen</option>
              <option value="PROFESSIONAL_MANAGEMENT">Fremdgeschäftsführung</option>
              <option value="PARTNERSHIP">Partnerschaft/Sozietät</option>
              <option value="COOPERATIVE">Genossenschaft</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entscheidungsgeschwindigkeit
            </label>
            <select
              value={company.decisionSpeed}
              onChange={(e) => onChange("decisionSpeed", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="VERY_FAST">Sehr schnell (1-3 Tage)</option>
              <option value="FAST">Schnell (4-7 Tage)</option>
              <option value="MODERATE">Moderat (1-2 Wochen)</option>
              <option value="SLOW">Langsam (3-4 Wochen)</option>
              <option value="VERY_SLOW">Sehr langsam (&gt; 4 Wochen)</option>
            </select>
          </div>
        </div>

        {/* Anzahl Entscheidungsträger */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anzahl Entscheidungsträger
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={company.decisionMakers}
            onChange={(e) => onChange("decisionMakers", parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
          />
        </div>

        {/* Nachhaltigkeitsfokus */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nachhaltigkeitsfokus (1-10)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={company.sustainabilityFocus}
              onChange={(e) => onChange("sustainabilityFocus", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Gering</span>
              <span className="font-medium text-[rgb(228,25,31)]">{company.sustainabilityFocus}/10</span>
              <span>Sehr hoch</span>
            </div>
          </div>
        </div>

        {/* Expansionspläne */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expansionspläne
          </label>
          <div className="flex gap-2 mb-3">
            <select
              value={newExpansionPlan}
              onChange={(e) => setNewExpansionPlan(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="">Plan wählen</option>
              <option value="NEW_LOCATIONS">Neue Standorte</option>
              <option value="NEW_PRODUCTS">Neue Produkte</option>
              <option value="NEW_MARKETS">Neue Märkte</option>
              <option value="DIGITALIZATION">Digitalisierung</option>
              <option value="ACQUISITIONS">Akquisitionen</option>
              <option value="INTERNATIONAL">Internationalisierung</option>
            </select>
            <button
              type="button"
              onClick={() => {
                if (newExpansionPlan) {
                  onArrayAdd("expansionPlans", newExpansionPlan);
                  setNewExpansionPlan("");
                }
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.expansionPlans.map((plan: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {plan === "NEW_LOCATIONS" && "Neue Standorte"}
                {plan === "NEW_PRODUCTS" && "Neue Produkte"}
                {plan === "NEW_MARKETS" && "Neue Märkte"}
                {plan === "DIGITALIZATION" && "Digitalisierung"}
                {plan === "ACQUISITIONS" && "Akquisitionen"}
                {plan === "INTERNATIONAL" && "Internationalisierung"}
                <button
                  type="button"
                  onClick={() => onArrayRemove("expansionPlans", index)}
                  className="text-green-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchingTab({ company, onChange, onArrayAdd, onArrayRemove }: any) {
  const [newPainPoint, setNewPainPoint] = useState("");
  const [newSearching, setNewSearching] = useState("");
  const [newOffering, setNewOffering] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Matching-Präferenzen</h2>
        
        {/* Pain Points */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aktuelle Herausforderungen
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newPainPoint}
              onChange={(e) => setNewPainPoint(e.target.value)}
              placeholder="z.B. Fachkräftemangel, Digitalisierung"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("painPoints", newPainPoint);
                  setNewPainPoint("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("painPoints", newPainPoint);
                setNewPainPoint("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.painPoints.map((point: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
              >
                {point}
                <button
                  type="button"
                  onClick={() => onArrayRemove("painPoints", index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Was wird gesucht */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Was wird gesucht
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSearching}
              onChange={(e) => setNewSearching(e.target.value)}
              placeholder="z.B. IT-Dienstleister, Lieferanten, Kooperationspartner"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("searchingFor", newSearching);
                  setNewSearching("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("searchingFor", newSearching);
                setNewSearching("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.searchingFor.map((item: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onArrayRemove("searchingFor", index)}
                  className="text-blue-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Was wird angeboten */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Was wird angeboten
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newOffering}
              onChange={(e) => setNewOffering(e.target.value)}
              placeholder="z.B. Beratung, Produkte, Services"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("offeringTo", newOffering);
                  setNewOffering("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("offeringTo", newOffering);
                setNewOffering("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.offeringTo.map((item: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onArrayRemove("offeringTo", index)}
                  className="text-green-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}