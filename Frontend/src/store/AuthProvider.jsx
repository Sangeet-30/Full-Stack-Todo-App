import { useState, useEffect, useCallback } from "react";
import { getMe, login as loginApi, logout as logoutApi, register as registerApi } from "../services/authService";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Restore session on initial load
  useEffect(() => {
    let ignore = false;

    const restoreSession = async () => {
      try {
        const data = await getMe();
        if (!ignore && data && data.user && data.user.id) {
          setUser(data.user);
        } else if (!ignore) {
          setUser(null);
        }
      } catch (err) {
        // If 401 or any error, session is unauthenticated; clear user state
        if (!ignore) {
          setUser(null);
          if (err.status !== 401) {
            console.warn("Session check notice:", err.message);
          }
        }
      } finally {
        if (!ignore) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email, password) => {
    setAuthError(null);

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password.trim()
    ) {
      setAuthError("Email and password are required.");
      setUser(null);
      return false;
    }

    try {
      const trimmedEmail = email.trim();
      const data = await loginApi(trimmedEmail, password);
      if (data && data.user && data.user.id) {
        setUser(data.user);
        return true;
      }
      setUser(null);
      return false;
    } catch (err) {
      setUser(null);
      setAuthError(err.message || "Failed to log in.");
      return false;
    }
  };

  const register = async (name, email, password, passwordConfirmation) => {
    setAuthError(null);
    try {
      const data = await registerApi(name, email, password, passwordConfirmation);
      // Registration must never authenticate the session; user must log in
      setUser(null);
      return data || true;
    } catch (err) {
      setUser(null);
      setAuthError(err.message || "Registration failed.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("Logout error:", err.message);
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        authError,
        clearAuthError,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

