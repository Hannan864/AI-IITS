import React from "react";
import { Building, LineChart } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import GlassCard from "../GlassCard";
import { Asset } from "../../types";

interface ManagerKPIChartsProps {
  assets: Asset[];
}

export default function ManagerKPICharts({ assets }: ManagerKPIChartsProps) {
  const departmentsList = [
    "Computer Science",
    "Electronic Engineering",
    "Mechanical Engineering",
    "Mathematics & Statistics",
    "Administration"
  ];

  // Process category chart data
  const categoriesMap: { [key: string]: number } = {};
  assets.forEach((a) => {
    categoriesMap[a.category] = (categoriesMap[a.category] || 0) + 1;
  });
  const chartData = Object.keys(categoriesMap).map((cat) => ({
    name: cat,
    "Hardware Units": categoriesMap[cat],
  }));

  const totalAssets = assets.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Department stock distribution matrix */}
      <div className="lg:col-span-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
          <Building className="h-3.5 w-3.5 text-indigo-400" /> Department Stock Allocations
        </h4>
        <GlassCard className="p-4 space-y-3 bg-slate-950/20">
          <p className="text-[10px] text-slate-400 leading-normal mb-1">
            Active ledger status counts aggregated by campus department offices.
          </p>
          <div className="space-y-3.5 font-sans">
            {departmentsList.map((dept) => {
              const deptQty = assets.filter((a) => a.department === dept).length;
              const deptIssued = assets.filter((a) => a.department === dept && a.status === "Issued").length;
              const pct = totalAssets > 0 ? (deptQty / totalAssets) * 100 : 0;
              return (
                <div key={dept} className="space-y-1 block">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300 truncate tracking-tight">{dept}</span>
                    <span className="font-mono text-indigo-300 shrink-0">
                      {deptQty} tags <span className="text-slate-500 text-[10px] font-normal">({deptIssued} issued)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Categories Spread Charts */}
      <div className="lg:col-span-7 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 leading-none">
          <LineChart className="h-3.5 w-3.5 text-emerald-400" /> Category Inventory Spread (Units)
        </h4>
        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="h-44 mt-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    itemStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="Hardware Units" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs text-center">
                Awaiting database registers...
              </div>
            )}
          </div>
          <div className="flex gap-4 text-[10px] mt-4 border-t border-white/5 pt-3 text-slate-400 justify-around shrink-0 select-none">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-550" /> Computing Devices
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Projectors / AV
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> General Lab Gears
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
