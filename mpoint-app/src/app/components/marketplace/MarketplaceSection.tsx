import React, { useState } from "react";
import { Briefcase, Plus, FileText, Package, Users, AlertCircle } from "lucide-react";

function ProjectCard({ type, title, description, urgent, isNew }: {
  type: string;
  title: string;
  description: string;
  urgent?: boolean;
  isNew?: boolean;
}) {
  const getTypeIcon = () => {
    switch(type) {
      case 'Dienstleistung': return <FileText className="w-4 h-4" />;
      case 'Produkt': return <Package className="w-4 h-4" />;
      case 'Kooperation': return <Users className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:bg-gray-50 p-4 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-gray-500">{getTypeIcon()}</div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{type}</span>
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

      <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
        Ansehen
      </button>
    </div>
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
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
  const [activeTab, setActiveTab] = useState<"search" | "offer" | "mine">("search");

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Börse
        </h3>
        <Briefcase className="w-6 h-6 text-[#e60000]" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <TabButton active={activeTab === "search"} onClick={() => setActiveTab("search")}>
          Projekte suchen
        </TabButton>
        <TabButton active={activeTab === "offer"} onClick={() => setActiveTab("offer")}>
          Anbieten
        </TabButton>
        <TabButton active={activeTab === "mine"} onClick={() => setActiveTab("mine")}>
          Meine
        </TabButton>
      </div>

      {/* Projects List */}
      <div className="space-y-3 mb-4">
        <ProjectCard
          type="Dienstleistung"
          title="Website-Relaunch gesucht"
          description="Wir suchen ein Team für Webentwicklung & Design"
          urgent
        />
        <ProjectCard
          type="Produkt"
          title="Büromöbel – Großabnahme"
          description="Preiswerte Büromöbel für Startups – jetzt anbieten"
        />
      </div>

      <button className="w-full bg-[#e60000] text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer">
        <Plus className="w-5 h-5" />
        Eigenes Projekt einstellen
      </button>
    </section>
  );
};

export default MarketplaceSection;