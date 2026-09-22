import React from "react";

interface StatusBadgeProps {
  status: string;
  onClick?: () => void;
  title?: string;
  className?: string;
}

export default function StatusBadge({ status, onClick, title, className = "" }: StatusBadgeProps) {
  const getBadgeStyles = (val: string) => {
    const s = val?.toLowerCase() || "";
    if (s === "available" || s === "healthy" || s === "approved") {
      return {
        bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
        label: val && val.toLowerCase() === "approved" ? "Approved" : "Available",
      };
    }
    if (s === "issued" || s === "active" || s === "permanent") {
      return {
        bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20",
        label: val && val.toLowerCase() === "active" ? "Active" : "Issued",
      };
    }
    if (s === "warning" || s === "fair" || s === "pending") {
      return {
        bg: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20",
        label: val && val.toLowerCase() === "pending" ? "Pending" : "Warning",
      };
    }
    if (s === "damaged" || s === "expired" || s === "critical" || s === "high" || s === "rejected" || s === "overdue") {
      return {
        bg: "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20",
        label: val && (val.toLowerCase() === "damaged" || val.toLowerCase() === "overdue") ? val : "High Risk",
      };
    }
    // Default fallback
    return {
      bg: "bg-slate-500/10 border-slate-500/20 text-slate-300 hover:bg-slate-500/20",
      label: val,
    };
  };

  const { bg, label } = getBadgeStyles(status);

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        title={title || `Click to inspect details for status ${label}`}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border select-none cursor-pointer hover:scale-105 active:scale-95 transition-all ${bg} ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
        {label}
      </button>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border select-none ${bg} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
      {label}
    </span>
  );
}
