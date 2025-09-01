"use client";
import { Users, UserPlus, Hash, Calendar, Building2, Network } from "lucide-react";
import React from "react";

export type NetworkStat = {
  label: string;
  count: number;
  icon: React.ReactNode;
  href?: string;          // optional Link
  onClick?: () => void;   // oder Click-Handler
};

function SidebarStat({ label, count, icon, href, onClick }: NetworkStat) {
  const Wrapper: any = href ? "a" : onClick ? "button" : "div";
  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-lg transition-colors
        ${href || onClick ? "hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e60000]/30" : ""}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{count}</span>
    </Wrapper>
  );
}

export default function NetworkSidebar({
  stats,
  title = "Ihr Netzwerk"
}: {
  stats?: NetworkStat[];
  title?: string;
}) {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <Network className="w-6 h-6 text-[#e60000]" />
        </div>
        <div className="space-y-3">
          {(stats || defaultStats).map(s => (
            <SidebarStat key={s.label} {...s} />
          ))}
        </div>
      </div>
    </aside>
  );
}

const defaultStats: NetworkStat[] = [
  { label: "M-POINT Kontakte", count: 256, icon: <Users className="w-5 h-5 text-[#e60000]" />, href: "/network/contacts" },
  { label: "Gruppen", count: 12, icon: <Hash className="w-5 h-5 text-blue-500" />, href: "/groups" },
  { label: "Events", count: 8, icon: <Calendar className="w-5 h-5 text-green-500" />, href: "/events" },
];