import { useState, useEffect } from "react";
import { User } from "../types";
import { apiFetch } from "../lib/api";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      const token = localStorage.getItem("authToken");
      if (saved && token) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore JSON parse error
    }
    return null;
  });

  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem("authToken") || "";
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Verify and refresh session on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      apiFetch("/api/auth/me")
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              localStorage.setItem("currentUser", JSON.stringify(data.user));
            }
          } else {
            // Token expired or invalid
            localStorage.removeItem("authToken");
            localStorage.removeItem("currentUser");
            setCurrentUser(null);
            setAuthToken("");
          }
        })
        .catch((err) => {
          console.warn("[useAuth] Session check failed:", err);
        });
    }
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setCurrentUser(null);
      setAuthToken("");
      setAuthError("Your session expired or was rejected. Please sign in again.");
    };
    window.addEventListener("auth_session_expired", handleExpired);
    return () => window.removeEventListener("auth_session_expired", handleExpired);
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setAuthError("");
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Invalid credentials. Please verify your email and password.");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setAuthToken(data.token);
      return true;
    } catch (err: any) {
      setAuthError(err.message || "Login failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    role: "Admin" | "Store Manager" | "Faculty" | "Visiting Faculty",
    department: string,
    facultyType: "Permanent" | "Visiting" | "N/A",
    contractEndDate: string | null
  ): Promise<boolean> => {
    setLoading(true);
    setAuthError("");
    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, department, facultyType, contractEndDate }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "User registration failed.");
      }

      const data = await response.json();
      const tokenToUse = data.token || `srv-sec-token-${data.user.id}-${Date.now()}`;
      localStorage.setItem("authToken", tokenToUse);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setAuthToken(tokenToUse);
      return true;
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setAuthToken("");
    setAuthError("");
  };

  return {
    currentUser,
    authToken,
    loading,
    authError,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}
