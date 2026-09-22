import React from "react";
import { Package, CheckCircle, ArrowRightLeft, ShieldAlert } from "lucide-react";
import GlassCard from "../GlassCard";
import { Asset } from "../../types";

interface ManagerKPICardsProps {
  assets: Asset[];
}

export default function ManagerKPICards({ assets }: ManagerKPICardsProps) {
  const totalAssets = assets.length;
  const availableStock = assets.filter((a) => a.status === "Available").length;
  const issuedAssets = assets.filter((a) => a.status === "Issued").length;
  const damagedItems = assets.filter((a) => {
    return a.status === "Damaged" || a.condition === "Damaged" || a.condition === "Repairing";
  }).length;

  const cards = [
    {
      title: "Total Tracked Fleet Assets",
      value: totalAssets,
      desc: "Active university register tags",
      color: "text-indigo-400",
      icon: Package,
      trend: "Official Register"
    },
    {
      title: "Total Available Stock",
      value: availableStock,
      desc: "Cleared warehouse hardware",
      color: "text-emerald-400",
      icon: CheckCircle,
      trend: `${((availableStock / (totalAssets || 1)) * 100).toFixed(0)}% Ready`
    },
    {
      title: "Issued Assets Active",
      value: issuedAssets,
      desc: "Under Faculty possession holds",
      color: "text-blue-400",
      icon: ArrowRightLeft,
      trend: `${issuedAssets} Active Liabilities`
    },
    {
      title: "Damaged / Repairing Units",
      value: damagedItems,
      desc: "Service block logs & damage locks",
      color: "text-rose-400",
      icon: ShieldAlert,
      trend: "Service Restructurings"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <GlassCard key={idx} className="p-4 border-l-2 border-l-indigo-500/40 relative overflow-hidden bg-slate-905/40 hover:scale-[1.01] transition-transform">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
                <p className="text-2xl font-black font-mono tracking-tight text-white">{kpi.value}</p>
              </div>
              <div className="p-2 bg-white/[0.03] border border-white/5 rounded-lg text-slate-300">
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] border-t border-white/5 pt-2">
              <span className={`font-mono text-xs font-semibold ${kpi.color}`}>{kpi.trend}</span>
              <span className="text-slate-500 font-bold uppercase">{kpi.desc}</span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
