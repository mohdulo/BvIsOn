import React, { createContext, useContext, useState, ReactNode } from "react";

export type CountryCode = "usa" | "fr" | "ch";

interface User {
  country: CountryCode;
}

interface AuthContextValue {
  user: User;
  /** pratique pour tester : changer de pays à chaud */
  switchCountry: (c: CountryCode) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 🔴 à brancher plus tard sur ton vrai login
  const [user, setUser] = useState<User>({ country: "usa" });

  const switchCountry = (c: CountryCode) => setUser({ country: c });

  return (
    <AuthContext.Provider value={{ user, switchCountry }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
