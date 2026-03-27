import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function getInitialUser() {
  const raw = localStorage.getItem("senews_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(localStorage.getItem("senews_token"));

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login: (payload) => {
        localStorage.setItem("senews_token", payload.token);
        localStorage.setItem("senews_user", JSON.stringify(payload.user));
        setToken(payload.token);
        setUser(payload.user);
      },
      logout: () => {
        localStorage.removeItem("senews_token");
        localStorage.removeItem("senews_user");
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
