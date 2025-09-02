import React, { createContext, useContext, useEffect, useState } from "react";

type Invitation = {
  id: string;
  type: "group" | "event" | "contact";
  title: string;
  description?: string;
  inviter?: { firstName?: string; lastName?: string };
};

type InvitationContextType = {
  invitations: Invitation[];
  loading: boolean;
  refreshInvitations: () => void;
  acceptInvitation: (inv: Invitation) => Promise<void>;
  declineInvitation: (inv: Invitation) => Promise<void>;
};

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export function InvitationProvider({ children }: { children: React.ReactNode }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshInvitations = async () => {
    setLoading(true);
    const res = await fetch("/api/groups/invitations");
    if (res.ok) {
      const data = await res.json();
      // Typ für jede Einladung ergänzen
      const invitations = data.map((inv: any) => ({
        ...inv,
        type: inv.group ? "group" : inv.event ? "event" : inv.contact ? "contact" : "group",
      }));
      setInvitations(invitations);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshInvitations();
  }, []);

  const acceptInvitation = async (inv: Invitation) => {
    if (inv.type === "group") {
      await fetch(`/api/groups/invitations/${inv.id}/accept`, { method: "POST" });
    }
    // ...weitere Typen
    setInvitations(prev => prev.filter(i => i.id !== inv.id));
  };

  const declineInvitation = async (inv: Invitation) => {
    if (inv.type === "group") {
      await fetch(`/api/groups/invitations/${inv.id}/decline`, { method: "POST" });
    }
    // ...weitere Typen
    setInvitations(prev => prev.filter(i => i.id !== inv.id));
  };

  return (
    <InvitationContext.Provider
      value={{ invitations, loading, refreshInvitations, acceptInvitation, declineInvitation }}
    >
      {children}
    </InvitationContext.Provider>
  );
}

export function useInvitations() {
  const ctx = useContext(InvitationContext);
  if (!ctx) throw new Error("useInvitations must be used within an InvitationProvider");
  return ctx;
}