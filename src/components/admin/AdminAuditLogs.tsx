import React, { useState } from "react";
import { Activity, Search, Filter, History, Calendar, PackageCheck, Send, CheckSquare, XSquare } from "lucide-react";
import { Asset, AssetIssuance, NDCRequest, User } from "../../types";
import GlassCard from "../GlassCard";

interface AdminAuditLogsProps {
  assets: Asset[];
  issuances: AssetIssuance[];
  ndcRequests: NDCRequest[];
  users: User[];
}

export default function AdminAuditLogs({ assets, issuances, ndcRequests, users }: AdminAuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [logFilter, setLogFilter] = useState<"all" | "issuance" | "return" | "ndc">("all");

  // Aggregate and sort events dynamically to form an immutable audit ledger
  const auditEvents: Array<{
    id: string;
    date: string;
    action: string;
    details: string;
    badge: string;
    type: "issuance" | "return" | "ndc";
  }> = [];

  // 1. Gather Asset Checkout Events
  issuances.forEach((iss) => {
    auditEvents.push({
      id: `evt-iss-${iss.id}`,
      date: iss.issuedDate,
      action: "Asset Allocation Issued",
      details: `${iss.userName || "Academic Candidate"} was assigned "${iss.assetName || "Device"}" (${iss.assetTag}) - Expected back on ${iss.returnDate}. Signed by ${iss.issuedBy || "Store Admin"}.`,
      badge: "Allocation Active",
      type: "issuance",
    });

    if (iss.actualReturnDate) {
      auditEvents.push({
        id: `evt-ret-${iss.id}`,
        date: iss.actualReturnDate,
        action: "Asset Return Check-in",
        details: `Custody returned for "${iss.assetName || "Device"}" (${iss.assetTag}) from target Faculty Portfolio. Checked in status: ${iss.status || "Returned"}.`,
        badge: "Check-in Logged",
        type: "return",
      });
    }
  });

  // 2. Gather NDC Clearance Audit Decisions
  ndcRequests.forEach((req) => {
    if (req.status !== "Pending") {
      auditEvents.push({
        id: `evt-ndc-${req.id}`,
        date: req.requestDate,
        action: `NDC Clearance Desk Resolution: ${req.status.toUpperCase()}`,
        details: `Governance board resolved clearance ID ${req.id} for "${req.userName || "Academic Candidate"}". Decided Authority note: "${req.approvedBy || "Verified logs checked"}"`,
        badge: `NDC ${req.status}`,
        type: "ndc",
      });
    }
  });

  // Sort by date (descending)
  const sortedEvents = auditEvents.sort((a, b) => b.date.localeCompare(a.date));

  // Filter events
  const filteredEvents = sortedEvents.filter((evt) => {
    const matchesSearch =
      evt.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.badge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = logFilter === "all" || evt.type === logFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top filter console */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-2.5 items-center">
          <History className="h-5 w-5 text-indigo-400 animate-pulse" />
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Activity & System Audit Logs</h2>
            <p className="text-[10.5px] text-slate-400 font-medium">Verify system transactions, asset issuances, logins, and clearance actions</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-52">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search activity logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value as any)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-350 outline-none font-medium"
          >
            <option value="all">Display All Operations</option>
            <option value="issuance">Checkout Clearances</option>
            <option value="return">Check-in Receipts</option>
            <option value="ndc">NDC Board Decisions</option>
          </select>
        </div>
      </div>

      {/* Forensic stream listing */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
            🖨️ SYSTEM TRANSACTION TAPE
          </span>
          <span className="text-[9.5px] font-mono text-indigo-400 font-bold">
            Total logged logs: {filteredEvents.length} transactions
          </span>
        </div>

        <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="p-4.5 hover:bg-white/[0.01] duration-150 flex flex-col md:flex-row gap-4 justify-between items-start">
              <div className="space-y-1.5 flex-1 select-all">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[10px] font-mono font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" /> [{evt.date}]
                  </span>
                  <span className="text-white text-xs font-extrabold">{evt.action}</span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">{evt.details}</p>
              </div>

              <div className="shrink-0">
                <span className={`text-[8.5px] font-mono font-bold px-2 py-1 rounded border ${
                  evt.type === "issuance"
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    : evt.type === "return"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/15"
                }`}>
                  {evt.badge}
                </span>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center text-slate-500 text-xs py-14 font-mono font-bold tracking-widest uppercase">
              // NO LOGGED EVENTS DETECTED IN SELECTED STREAM
            </div>
          )}
        </div>
      </GlassCard>

    </div>
  );
}
