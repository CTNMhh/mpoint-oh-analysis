import React, { useState } from 'react';
import { Users, MessageCircle, Calendar, MapPin, Star } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useGroups } from "./GroupContext";

function GroupListItem({ group, setActiveGroup }: { group: any, setActiveGroup?: (group: any) => void }) {
  const DESCRIPTION_MAX_LENGTH = 120;
  const [open, setOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const { data: session } = useSession();
  const { refreshGroups } = useGroups();

  const shortText = group.description?.slice(0, DESCRIPTION_MAX_LENGTH);

  // Prüfen, ob User bereits Mitglied oder Anfrage gestellt hat
  const isMemberOrRequested = group.members.some(
    m =>
      m.userId === session?.user?.id &&
      (m.status === "ACTIVE" || m.status === "REQUEST")
  );

  // Anfrage senden
  const handleRequest = async () => {
    await fetch(`/api/groups/${group.id}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user?.id }),
    });
    setRequestSent(true);
    refreshGroups();
  };

  return (
    <li className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#e60000]/20 hover:scale-[1.02]">
      {/* Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e60000] to-[#c01a1f]"></div>
      
      <div className="p-6">
        {/* Header - Icon und Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {group.avatarUrl ? (
              <img 
                src={group.avatarUrl} 
                alt="Gruppen-Avatar" 
                className="w-16 h-16 rounded-xl object-cover border-3 border-[#e60000]/20 shadow-lg group-hover:border-[#e60000]/40 transition-colors" 
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Users className="w-8 h-8 text-gray-400 group-hover:text-[#e60000] transition-colors" />
              </div>
            )}
            {/* Online/Activity Indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <button
              className="text-gray-900 hover:text-[#e60000] font-bold text-xl mb-2 text-left transition-colors duration-200 group-hover:text-[#e60000] line-clamp-2 w-full"
              onClick={() => setActiveGroup && setActiveGroup(group)}
            >
              {group.name}
            </button>
            
            {/* Meta Information */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{group.members?.length || 0} Mitglieder</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>Aktiv heute</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Erstellt {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Beschreibung */}
        {group.description && (
          <div className="mb-4">
            <p className="text-gray-600 leading-relaxed">
              {group.description.length > DESCRIPTION_MAX_LENGTH ? (
                <>
                  {shortText}
                  {!open && (
                    <>
                      ...{" "}
                      <button
                        className="inline-flex items-center text-sm font-medium text-[#e60000] hover:text-[#c01a1f] transition-colors"
                        onClick={() => setOpen(true)}
                      >
                        Mehr anzeigen
                      </button>
                    </>
                  )}
                  {open && (
                    <span>
                      {group.description.slice(DESCRIPTION_MAX_LENGTH)}
                      {" "}
                      <button
                        className="inline-flex items-center text-sm font-medium text-[#e60000] hover:text-[#c01a1f] transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Weniger anzeigen
                      </button>
                    </span>
                  )}
                </>
              ) : (
                group.description
              )}
            </p>
          </div>
        )}

        {/* Tags/Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["Business", "Hamburg", "Networking"].map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-[#e60000]/10 hover:text-[#e60000] transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Join Button */}
          <div className="flex items-center gap-3">
            {!isMemberOrRequested ? (
              <button
                className={`
                  px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg
                  ${requestSent 
                    ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                    : 'bg-gradient-to-r from-[#e60000] to-[#c01a1f] text-white hover:from-[#c01a1f] hover:to-[#a01216] hover:scale-105 active:scale-95'
                  }
                `}
                onClick={handleRequest}
                disabled={requestSent}
              >
                {requestSent ? "✓ Anfrage gesendet" : "Gruppe beitreten"}
              </button>
            ) : (
              <div className="px-6 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold">
                ✓ Bereits Mitglied
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Subtle Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#e60000]/0 via-[#e60000]/0 to-[#e60000]/0 group-hover:from-[#e60000]/5 group-hover:via-transparent group-hover:to-[#e60000]/5 transition-all duration-300 pointer-events-none"></div>
    </li>
  );
}

export default GroupListItem;