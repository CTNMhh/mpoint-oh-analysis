"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BasicInfoTab from "./BasicInfoTab";
import BusinessModelTab from "./BusinessModelTab";
import GrowthTab from "./GrowthTab";
import MatchingTab from "./MatchingTab";
import {
  Briefcase, Calendar, CircleUserRound, ChevronRight, Building2,
  Users,
  TrendingUp,
  Target,
  Save,
  ArrowLeft,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import ProfilePage from "../profile/page";
import ProfileTab from "./ProfileTab";

import BookedEventsTab from "./BookedEventsTab";

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

  logoUrl?: string;
  websiteUrl?: string;
  managingDirector?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [activeSubTab, setActiveSubTab] = useState("basic");
  const allowedTabs = ["profile", "company", "booked-events"];
  const allowedSubTabs = ["basic", "business", "growth", "matching"];
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
    offeringTo: [],

    logoUrl: "",
    websiteUrl: "",
    managingDirector: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [progressBarKey, setProgressBarKey] = useState(0);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    anrede: "",
    titel: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  // Profile-Status
  useEffect(() => {
    if (activeTab !== "profile") return;
    setProfileLoading(true);
    setProfileMessage(null);

    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();

        if (!res.ok) {
          setProfileMessage({ type: "error", text: data.error || "Fehler beim Abrufen der Benutzerdaten." });
          setProfileLoading(false);
          return;
        }

        setProfile({
          username: data.username || "",
          email: data.email || "",
          anrede: data.anrede || "",
          titel: data.titel || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          password: "",
        });
      } catch (err) {
        setProfileMessage({ type: "error", text: "Serverfehler. Bitte versuchen Sie es später erneut." });
      } finally {
        setProfileLoading(false);
      }
    }

    fetchUser();
  }, [activeTab]);

  // Beim ersten Render Tab/SubTab aus URL oder localStorage wiederherstellen
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let storedTab = localStorage.getItem("companyActiveTab") || params.get("tab") || "profile";
    if (!allowedTabs.includes(storedTab)) storedTab = "profile";
    setActiveTab(storedTab);
    if (storedTab === "company") {
      let storedSub =
        localStorage.getItem("companyActiveSubTab") ||
        params.get("sub") ||
        "basic";
      if (!allowedSubTabs.includes(storedSub)) storedSub = "basic";
      setActiveSubTab(storedSub);
    }
  }, []);

  // Änderungen persistieren & URL aktualisieren
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!allowedTabs.includes(activeTab)) return;
    localStorage.setItem("companyActiveTab", activeTab);
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (activeTab === "company" && allowedSubTabs.includes(activeSubTab)) {
      localStorage.setItem("companyActiveSubTab", activeSubTab);
      params.set("sub", activeSubTab);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [activeTab, activeSubTab]);

  const handleMainTabClick = (tabId: string, firstSub?: string) => {
    setActiveTab(tabId);
    if (tabId === "company" && firstSub) setActiveSubTab(firstSub);
  };
  const handleSubTabClick = (subId: string) => setActiveSubTab(subId);

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

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setProfileMessage(null);

    if (activeTab === "profile") {
      // Profil speichern
      try {
        const res = await fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        const data = await res.json();
        if (!res.ok) {
          setProfileMessage({ type: "error", text: data.error || "Fehler beim Aktualisieren der Benutzerdaten." });
          setSaving(false);
          return;
        }
        setProfileMessage({ type: "success", text: data.message || "Profil erfolgreich aktualisiert!" });

        // Passwort-Feld zurücksetzen
        setProfile(prev => ({ ...prev, password: "" }));

        // Optional: Header-Benutzerdaten aktualisieren
        if (typeof window !== "undefined" && (window as any).refreshHeaderUser) {
          (window as any).refreshHeaderUser();
        }
      } catch (err) {
        setProfileMessage({ type: "error", text: "Serverfehler. Bitte versuchen Sie es später erneut." });
      } finally {
        setSaving(false);
      }
      return;
    }

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
      logoUrl: company.logoUrl || "",
      websiteUrl: company.websiteUrl || "",
      managingDirector: company.managingDirector || "",
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
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
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeCompanyData)
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Unternehmensprofil erfolgreich gespeichert!" });
        setProgressBarKey(prev => prev + 1);
      } else {
        const err = await res.json();
        throw new Error(err?.error || "Fehler beim Speichern");
      }
    } catch (error) {
      console.error("Fehler:", error);
      setMessage({ type: "error", text: "Fehler beim Speichern des Unternehmensprofils" });
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
    {
      id: "profile",
      label: "Persönliches Profil",
      icon: CircleUserRound
    },
    {
      id: "company",
      label: "Unternehmen",
      icon: Briefcase,
      subTabs: [
        { id: "basic", label: "Grunddaten", icon: Building2 },
        { id: "business", label: "Geschäftsmodell", icon: Target },
        { id: "growth", label: "Wachstum", icon: TrendingUp },
        { id: "matching", label: "Matching", icon: Users },
      ]
    },
    {
      id: "booked-events",
      label: "Gebuchte Events",
      icon: Calendar
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
              <p className="text-gray-600 mt-1">
                Vervollständigen Sie Ihr Profil für bessere Matches
              </p>
            </div>
          </div>
          <ProgressBar key={progressBarKey} />
        </div>

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
                    onClick={() => handleMainTabClick(tab.id, tab.subTabs?.[0]?.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap rounded-lg focus:outline-none
                      ${
                        activeTab === tab.id
                          ? "bg-[rgb(228,25,31)] text-white shadow-sm"
                          : "text-gray-600 hover:text-[rgb(228,25,31)]"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.subTabs && <ChevronRight className="w-3 h-3 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'company' && (
            <div className="bg-white rounded-lg shadow-sm px-8 py-4 -mt-4">
              <div className="flex gap-4 pt-4">
                {tabs.find(t => t.id === 'company')?.subTabs?.map((subTab) => {
                  const SubIcon = subTab.icon;
                  return (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => handleSubTabClick(subTab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeSubTab === subTab.id
                          ? 'bg-[rgb(228,25,31)] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <SubIcon className="w-4 h-4" />
                      {subTab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {activeTab === "profile" && (
              profileLoading ? (
                <div className="text-center py-8">Lädt...</div>
              ) : (
                <ProfileTab
                  profile={profile}
                  onChange={handleProfileChange}
                  error={profileMessage?.type === "error" ? profileMessage.text : undefined}
                  successMessage={profileMessage?.type === "success" ? profileMessage.text : undefined}
                />
              )
            )}

            {activeTab === "company" && (
              <>
                {activeSubTab === "basic" && (
                  <BasicInfoTab
                    company={company}
                    onChange={handleInputChange}
                    onArrayAdd={handleArrayAdd}
                    onArrayRemove={handleArrayRemove}
                  />
                )}

                {activeSubTab === "business" && (
                  <BusinessModelTab
                    company={company}
                    onChange={handleInputChange}
                    onArrayAdd={handleArrayAdd}
                    onArrayRemove={handleArrayRemove}
                  />
                )}

                {activeSubTab === "growth" && (
                  <GrowthTab
                    company={company}
                    onChange={handleInputChange}
                    onArrayAdd={handleArrayAdd}
                    onArrayRemove={handleArrayRemove}
                  />
                )}

                {activeSubTab === "matching" && (
                  <MatchingTab
                    company={company}
                    onChange={handleInputChange}
                    onArrayAdd={handleArrayAdd}
                    onArrayRemove={handleArrayRemove}
                  />
                )}
              </>
            )}

            {activeTab === "booked-events" && session?.user?.id && (
              <BookedEventsTab userId={session.user.id} />
            )}
            {activeTab === "booked-events" && !session?.user?.id && (
              <div className="py-8 text-center text-gray-500">Benutzerdaten werden geladen...</div>
            )}
          </div>

          {/* Action Buttons */}
          {activeTab !== "booked-events" && (
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
          )}
        </form>

      </div>
    </main>
  );
}


