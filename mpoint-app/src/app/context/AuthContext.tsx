"use client";

import { createContext, useContext, useState } from "react";

type User = {
  firstName: string;
  lastName: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void; // Hinzugefügt
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {}, // Default-Implementierung
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);