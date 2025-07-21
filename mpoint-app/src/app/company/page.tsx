"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BasicInfoTab from "./BasicInfoTab";
import BusinessModelTab from "./BusinessModelTab";
import GrowthTab from "./GrowthTab";
import MatchingTab from "./MatchingTab";
import {
  Building2,
  Users,
  TrendingUp,
  Target,
  Save,
  ArrowLeft,
} from "lucide-react";
import ProgressBar from "./ProgressBar";

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
  digitalizationLevel: number;
  itBudgetPercent: number | null;

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
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(null);
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
    digitalizationLevel: 1,
    itBudgetPercent: null,

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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [progressBarKey, setProgressBarKey] = useState(0);
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

  // Unternehmen des Users laden
  useEffect(() => {
    async function fetchCompanies() {
      if (status !== "authenticated") return;
      setLoading(true);
      try {
        const res = await fetch("/api/company?mine=true");
        if (res.ok) {
          const data = await res.json();
          setCompanies(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        setCompanies([]);
        console.error("Fehler beim Laden der Unternehmen:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [status, showForm]);

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
    setMessage(null);

    // Relations immer als Array mitschicken
    const safeCompanyData = {
      ...company,
      district: company.district ? company.district : null,
      locationAdvantages: company.locationAdvantages || [],
      industryTags: company.industryTags || [],
      secondaryNaceCodes: company.secondaryNaceCodes || [],
      expansionPlans: company.expansionPlans || [],
      certifications: company.certifications || [],
      complianceNeeds: company.complianceNeeds || [],
      qualityStandards: company.qualityStandards || [],
      painPoints: company.painPoints || [],
      searchingFor: company.searchingFor || [],
      offeringTo: company.offeringTo || [],
    };

    try {
      let res;
      if (editingCompany && editingCompany.id) {
        res = await fetch(`/api/company/${editingCompany.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(safeCompanyData)
        });
      } else {
        res = await fetch("/api/company", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(safeCompanyData)
        });
      }

      if (res.ok) {
        setMessage({ type: "success", text: "Unternehmensprofil erfolgreich gespeichert!" });
        setProgressBarKey(prev => prev + 1);
        setShowForm(false);
        setEditingCompany(null);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Fehler beim Speichern" }); // <-- Hier wird die API-Fehlermeldung angezeigt!
      }
    } catch (error) {
      setMessage({ type: "error", text: "Fehler beim Speichern des Unternehmensprofils" });
    } finally {
      setSaving(false);
    }
  };

  // Neues Unternehmen anlegen
  function handleNewCompany() {
    setCompany({
      // Leere Felder für neues Unternehmen
      name: "",
      legalForm: "",
      foundedYear: new Date().getFullYear(),
      registrationNumber: "",
      employeeCount: 1,
      employeeRange: "SOLO",
      annualRevenue: 0,
      revenueRange: "MICRO",
      street: "",
      zipCode: "",
      district: "",
      locationAdvantages: [],
      primaryNaceCode: "",
      secondaryNaceCodes: [],
      industryTags: [],
      branchDescription: "",
      customerType: "B2B",
      customerCount: "VERY_SMALL",
      exportQuota: 0,
      marketReach: "LOCAL",
      seasonality: "NONE",
      leadershipStructure: "OWNER_LED",
      decisionSpeed: "MODERATE",
      decisionMakers: 1,
      growthPhase: "ESTABLISHED",
      growthRate: 0,
      expansionPlans: [],
      sustainabilityFocus: 5,
      digitalizationLevel: 1,
      itBudgetPercent: null,
      certifications: [],
      complianceNeeds: [],
      qualityStandards: [],
      painPoints: [],
      currentChallenges: [],
      searchingFor: [],
      offeringTo: []
    });
    setEditingCompany(null);
    setShowForm(true);
  }

  // Unternehmen bearbeiten
  function handleEditCompany(companyData: CompanyData) {
    setCompany(companyData);
    setEditingCompany(companyData);
    setShowForm(true);
  }

  // Formular-Abbruch
  function handleCancel() {
    setShowForm(false);
    setEditingCompany(null);
  }

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
        <h1 className="text-3xl font-bold mb-8">Meine Unternehmen</h1>
        {/* Unternehmen-Liste */}
        <div className="mb-8">
          {companies.length === 0 ? (
            <p className="text-gray-600">Du hast noch kein Unternehmen angelegt.</p>
          ) : (
            <ul className="space-y-4">
              {companies.map((company) => (
                <li key={company.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{company.name}</div>
                    <div className="text-gray-500">{company.legalForm}</div>
                  </div>
                  <button
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    onClick={() => handleEditCompany(company)}
                  >
                    Bearbeiten
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Button für neues Unternehmen */}
        <button
          className="mb-8 px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-medium hover:bg-red-700"
          onClick={handleNewCompany}
        >
          Neues Unternehmen anlegen
        </button>
        {/* Formular für neues/bestehendes Unternehmen */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold mb-4">
              {editingCompany ? "Unternehmen bearbeiten" : "Neues Unternehmen anlegen"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Meldung anzeigen */}
              {message && (
                <div
                  className={`rounded-lg px-4 py-3 mb-4 text-sm font-medium ${message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                  {message.text}
                </div>
              )}

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
                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
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
                  onClick={handleCancel}
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
        )}
      </div>
    </main>
  );
}


