import React, { useState } from "react";
import { Users, Search, Filter, ShieldAlert, Calendar, CheckCircle, HelpCircle } from "lucide-react";
import { User, AssetIssuance } from "../../types";
import GlassCard from "../GlassCard";

interface FacultyCompliancePanelProps {
  users: User[];
  issuances: AssetIssuance[];
}

export default function FacultyCompliancePanel({ users, issuances }: FacultyCompliancePanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [riskSort, setRiskSort] = useState(false);

  // Filter to academic faculty only
  const facultyUsers = users.filter((u) => u.role === "Faculty" || u.role === "Visiting Faculty");

  // Get departments
  const departments = Array.from(new Set(facultyUsers.map((u) => u.department).filter(Boolean)));

  // Compute stats per user
  const enrichedFaculty = facultyUsers.map((user) => {
    const activeHolds = issuances.filter((iss) => iss.userId === user.id && iss.actualReturnDate === null);
    const outstandingCount = activeHolds.length;

    // Determine Contract Days Remaining
    let daysRemaining: number | null = null;
    let riskStatus: "SAFE" | "WARNING" | "CRITICAL" = "SAFE";

    if (user.role === "Visiting Faculty" && user.contractEndDate) {
      const expiry = new Date(user.contractEndDate);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 7 && outstandingCount > 0) {
        riskStatus = "CRITICAL";
      } else if (daysRemaining <= 15) {
        riskStatus = "WARNING";
      }
    }

    return {
      ...user,
      outstandingCount,
      daysRemaining,
      riskStatus,
    };
  });

  // Apply filters
  const filteredFaculty = enrichedFaculty
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === "all" || user.department === deptFilter;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      if (riskSort) {
        // Critical first, then Warning, then Safe
        const score = { CRITICAL: 3, WARNING: 2, SAFE: 1 };
        return score[b.riskStatus] - score[a.riskStatus];
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-4">
      {/* Header and Filter Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-indigo-400" />
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Faculty Accounts & Borrowed Items</h2>
            <p className="text-[10.5px] text-slate-400 font-medium">View all faculty members, contract end dates, and borrowed items</p>
          </div>
        </div>

        {/* Filters HUD */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search faculty name / email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium outline-none"
            >
              <option value="all">All Sectors</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>

            <button
              onClick={() => setRiskSort(!riskSort)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                riskSort
                  ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  : "bg-slate-950/50 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {riskSort ? "Sorted by Risk" : "Standard Sorting"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaculty.map((user) => (
          <GlassCard key={user.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-200 text-xs">{user.name}</h3>
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded uppercase font-bold bg-white/5 text-slate-400 border border-white/5">
                    {user.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{user.email}</p>
                <p className="text-[10px] text-indigo-400 font-semibold mt-1.5">{user.department}</p>
              </div>

              {/* Dynamic Risk flag Indicator */}
              <div className="flex flex-col items-end">
                {user.riskStatus === "CRITICAL" && (
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 animate-pulse">
                    CRITICAL RISK
                  </span>
                )}
                {user.riskStatus === "WARNING" && (
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    WARNING PERIOD
                  </span>
                )}
                {user.riskStatus === "SAFE" && (
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                    SECURED CLEARANCE
                  </span>
                )}
              </div>
            </div>

            {/* Middle telemetry metrics section */}
            <div className="grid grid-cols-2 gap-3 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl text-xs">
              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Active Inventory Holds</span>
                <span className={`text-xs font-black block mt-1 ${user.outstandingCount > 0 ? "text-indigo-400" : "text-slate-400"}`}>
                  {user.outstandingCount} Equipment(s)
                </span>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Academic Contract Expiry</span>
                <span className="text-[11px] font-mono font-medium block mt-1 text-slate-300">
                  {user.role === "Visiting Faculty" && user.contractEndDate ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500 inline" />
                      {user.contractEndDate}
                      <span className="text-[9.5px] font-bold text-slate-400">
                        ({user.daysRemaining !== null ? `${user.daysRemaining}d` : "Expired"})
                      </span>
                    </span>
                  ) : (
                    "Tenured Permanent"
                  )}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}

        {filteredFaculty.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 text-xs py-10 font-bold uppercase tracking-wider">
            No academic matching members found
          </div>
        )}
      </div>
    </div>
  );
}
