import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { Asset, Supplier, NDCRequest, SmartAlert, AssetIssuance, Notification, User } from "../types";

export function useAssets(userId?: string) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ndcRequests, setNdcRequests] = useState<NDCRequest[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [issuances, setIssuances] = useState<AssetIssuance[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGlobalData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchSafe = async (url: string, fallback: any = []) => {
        try {
          const res = await apiFetch(url);
          if (res.ok) {
            return await res.json();
          }
          console.warn(`[loadGlobalData] API returned ${res.status} for ${url}`);
        } catch (e) {
          console.warn(`[loadGlobalData] Network error for ${url}:`, e);
        }
        return fallback;
      };

      const [ast, sup, ndc, alr, iss, dep, usr] = await Promise.all([
        fetchSafe("/api/assets", []),
        fetchSafe("/api/suppliers", []),
        fetchSafe("/api/ndc/status", []),
        fetchSafe("/api/alerts", []),
        fetchSafe("/api/issue/history", []),
        fetchSafe("/api/departments", []),
        fetchSafe("/api/users", []),
      ]);

      setAssets(ast);
      setSuppliers(sup);
      setNdcRequests(ndc);
      setAlerts(alr);
      setIssuances(iss);
      setDepartments(dep);
      setUsers(usr);
    } catch (err) {
      console.error("Failed to load global data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      const res = await apiFetch(`/api/notifications/${uid}`);
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadGlobalData();
    }
  }, [userId, loadGlobalData]);

  useEffect(() => {
    if (userId) {
      loadNotifications(userId);
    }
  }, [userId, loadNotifications]);

  const addAsset = async (payload: Partial<Asset>) => {
    try {
      const res = await apiFetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Add Asset response status:", res.status);
      if (!res.ok) {
        let errorMsg = "Failed to add asset";
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          const rawText = await res.text();
          if (res.status === 403 || res.status === 401) {
            errorMsg = "Your session expired or is unauthorized. Please sign in again.";
          } else if (rawText) {
            errorMsg = rawText;
          }
        }
        console.error("Failed to add asset:", errorMsg);
        alert(`Failed to add asset: ${errorMsg}`);
        return false;
      }
      await loadGlobalData();
      return true;
    } catch (err: any) {
      console.error("Add asset error:", err);
      alert(`Network error adding asset: ${err.message || err}`);
      return false;
    }
  };

  const deleteAsset = async (id: string) => {
    const res = await apiFetch(`/api/assets/${id}`, { method: "DELETE" });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const updateAsset = async (id: string, payload: Partial<Asset>) => {
    const res = await apiFetch(`/api/assets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const issueAsset = async (assetId: string, facultyId: string, returnDate: string, issuedBy: string) => {
    const res = await apiFetch("/api/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId,
        userId: facultyId,
        issuedDate: new Date().toISOString().split("T")[0],
        returnDate,
        issuedBy,
      }),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const returnAsset = async (assetId: string, condition: string) => {
    const res = await apiFetch("/api/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId,
        actualReturnDate: new Date().toISOString().split("T")[0],
        condition,
      }),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const approveNDC = async (requestId: string, status: "Approved" | "Rejected", approvedBy: string) => {
    const res = await apiFetch("/api/ndc/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status, approvedBy }),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const requestNDC = async (uid: string, remarks: string) => {
    const res = await apiFetch("/api/ndc/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, remarks }),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const transmitNotification = async (uid: string, title: string, message: string) => {
    const res = await apiFetch("/api/alerts/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, title, message }),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const markNotificationRead = async (id: string) => {
    const res = await apiFetch(`/api/notifications/read/${id}`, { method: "POST" });
    if (res.ok && userId) {
      await loadNotifications(userId);
    }
    return res.ok;
  };

  const addUser = async (payload: Partial<User>) => {
    const res = await apiFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const updateUser = async (id: string, payload: Partial<User>) => {
    const res = await apiFetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const deleteUser = async (id: string) => {
    const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) await loadGlobalData();
    return res.ok;
  };

  const refreshAll = useCallback(() => {
    loadGlobalData();
    if (userId) loadNotifications(userId);
  }, [loadGlobalData, loadNotifications, userId]);

  return {
    assets,
    suppliers,
    ndcRequests,
    alerts,
    issuances,
    departments,
    notifications,
    loading,
    refreshAll,
    addAsset,
    deleteAsset,
    updateAsset,
    issueAsset,
    returnAsset,
    approveNDC,
    requestNDC,
    transmitNotification,
    markNotificationRead,
    users,
    addUser,
    updateUser,
    deleteUser,
  };
}
