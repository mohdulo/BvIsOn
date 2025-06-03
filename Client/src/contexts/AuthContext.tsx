import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../api/index";

export type CountryCode = "usa" | "fr" | "ch";

interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface User extends AuthenticatedUser {
  country: CountryCode;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchCountry: (country: CountryCode) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("auth_token"),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    console.log("🔍 Checking stored token:", token ? "Found" : "Not found");

    if (token) {
      const savedCountry = localStorage.getItem("selected_country") as CountryCode || "usa";

      // ⚠️ Ce bloc ne vérifie pas encore le token côté serveur
      setState({
        user: {
          id: 1,
          username: "admin",
          email: "admin@covid-app.com",
          role: "admin",
          is_active: true,
          created_at: new Date().toISOString(),
          country: savedCountry,
        },
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log("🔑 Attempting login...");
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { access_token, user: authenticatedUser } = response.data;
      console.log("✅ Login successful, storing token");

      const savedCountry = localStorage.getItem("selected_country") as CountryCode || "usa";

      localStorage.setItem("auth_token", access_token);

      setState({
        user: {
          ...authenticatedUser,
          country: savedCountry,
        },
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("selected_country");
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const switchCountry = (country: CountryCode) => {
    console.log("🌍 Switching country to:", country);
    localStorage.setItem("selected_country", country);

    setState((prev) => {
      if (!prev.user) return prev;

      return {
        ...prev,
        user: {
          ...prev.user,
          country,
        },
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        switchCountry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
