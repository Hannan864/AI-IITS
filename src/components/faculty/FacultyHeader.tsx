import React from "react";
import { GraduationCap } from "lucide-react";
import { User, AssetIssuance, NDCRequest } from "../../types";

interface FacultyHeaderProps {
  currentUser: User;
  issuances: AssetIssuance[];
  ndcRequests: NDCRequest[];
}

export default function FacultyHeader({ currentUser, issuances, ndcRequests }: FacultyHeaderProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const myActiveIssuances = issuances.filter(
    (i) => i.userId === currentUser.id && i.actualReturnDate === null
  );

  const getDaysRemaining = (returnDate: string) => {
    const deadline = new Date(returnDate);
    const today = new Date(todayStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  let overdueCount = 0;
  let nearDueCount = 0;

  myActiveIssuances.forEach((iss) => {
    const days = getDaysRemaining(iss.returnDate);
    if (days < 0) {
      overdueCount++;
    } else if (days <= 15) {
      nearDueCount++;
    }
  });

  const hasOverdue = overdueCount > 0;
  const isNearDeadline = nearDueCount > 0;

  let complianceStatusBadge = {
    text: "Fully Compliant",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
  if (hasOverdue) {
    complianceStatusBadge = {
      text: "Account Restricted",
      color: "text-rose-450 bg-rose-500/15 border-rose-500/30 animate-pulse",
    };
  } else if (isNearDeadline) {
    complianceStatusBadge = {
      text: "Action Caution Active",
      color: "text-amber-450 bg-amber-500/15 border-amber-500/30 animate-pulse",
    };
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4.5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <GraduationCap className="h-5.5 w-5.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
            Faculty Compliance & NDC Intelligence Portal
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Custody Control and Exit Certificate Ledger • Department of {currentUser.department}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded border tracking-wider select-none ${complianceStatusBadge.color}`}>
          ● {complianceStatusBadge.text}
        </span>
        {currentUser.facultyType === "Visiting" && currentUser.contractEndDate && (
          <span className="text-[9.5px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/15 uppercase font-mono tracking-wide">
            Expires: {currentUser.contractEndDate}
          </span>
        )}
      </div>
    </div>
  );
}
