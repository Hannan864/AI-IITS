import { useState } from "react";
import { apiFetch } from "../lib/api";

export function useSystemSnapshot() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/api/snapshot");
      if (!response.ok) throw new Error("Failed to fetch system snapshot");
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchSnapshot, loading, error };
}
