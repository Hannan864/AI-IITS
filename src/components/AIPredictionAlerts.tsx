import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  ShieldCheck
} from "lucide-react";
import { SmartAlert } from "../types";
import FlightRiskList from "./alerts/FlightRiskList";
import RecoveryWorkspace from "./alerts/RecoveryWorkspace";

interface AIPredictionAlertsProps {
  alerts: SmartAlert[];
  onTransmitNotification: (userId: string, title: string, message: string) => Promise<boolean>;
  onRefreshAlerts: () => void;
}

export default function AIPredictionAlerts({ 
  alerts, 
  onTransmitNotification, 
  onRefreshAlerts 
}: AIPredictionAlertsProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  useEffect(() => {
    if (alerts.length > 0 && !selectedAlertId) {
      setSelectedAlertId(alerts[0].id);
    }
  }, [alerts, selectedAlertId]);

  const activeAlert = alerts.find(a => a.id === selectedAlertId) || null;

  return (
    <div className="space-y-6">
      {/* Description Card — AI/Smart Tech Vibe */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Ambient indicator accent */}
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
              <BrainCircuit className="h-3.5 w-3.5 animate-pulse" />
              Smart Clearance Prediction Engine (15-Day Predictive Clearance)
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Contract Expirations & Asset Clearance Risk Matrix</h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Deterministic rule models tracking visiting appointment deadlines against outstanding inventory holdings. Automatically identifies impending No Dues Certificate (NDC) locking states.
            </p>
          </div>
          <button 
            onClick={onRefreshAlerts} 
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold leading-none shadow-md h-fit self-end md:self-center transition-all border border-indigo-500/30 font-sans cursor-pointer animate-fade-in"
          >
            Review Risk State
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 backdrop-blur-md p-12 text-center">
          <ShieldCheck className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">All Clearance Safe</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No visiting or permanent faculty members currently have contracts expiring (within 15 days) while holding unreturned university equipment assets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* RISK LIST - LEFT (lg:col-span-5) */}
          <FlightRiskList
            alerts={alerts}
            selectedAlertId={selectedAlertId}
            onSelectAlertId={setSelectedAlertId}
          />

          {/* RECOVERY WORKSPACE - RIGHT (lg:col-span-7) */}
          <RecoveryWorkspace
            activeAlert={activeAlert}
            onTransmitNotification={onTransmitNotification}
          />

        </div>
      )}
    </div>
  );
}
