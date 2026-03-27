import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function getInitialUser() {
  const raw = localStorage.getItem("wikierp_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(localStorage.getItem("wikierp_token"));

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login: (payload) => {
        localStorage.setItem("wikierp_token", payload.token);
        localStorage.setItem("wikierp_user", JSON.stringify(payload.user));
        setToken(payload.token);
        setUser(payload.user);
      },
      logout: () => {
        localStorage.removeItem("wikierp_token");
        localStorage.removeItem("wikierp_user");
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
