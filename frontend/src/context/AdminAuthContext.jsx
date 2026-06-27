import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAdminSession, loginAdmin } from "../services/api";

const AdminAuthContext = createContext(null);
const ADMIN_TOKEN_KEY = "della-admin-token";

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(ADMIN_TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsCheckingSession(false);
      return;
    }

    let isActive = true;

    async function validateSession() {
      setIsCheckingSession(true);

      try {
        const session = await getAdminSession(token);

        if (isActive) {
          setUser(session.user);
        }
      } catch {
        if (isActive) {
          window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsCheckingSession(false);
        }
      }
    }

    validateSession();

    return () => {
      isActive = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isCheckingSession,
      login: async (credentials) => {
        const session = await loginAdmin(credentials);
        window.localStorage.setItem(ADMIN_TOKEN_KEY, session.token);
        setToken(session.token);
        setUser(session.user);
      },
      logout: () => {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [isCheckingSession, token, user],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}
