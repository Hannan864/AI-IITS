import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { PieChart as PieIcon, BarChart3, Server, TrendingUp } from "lucide-react";

interface ReportingChartsRowProps {
  statusData: { name: string; value: number; color: string }[];
  departmentUsageData: any[];
  categoryChartData: { name: string; value: number }[];
  monthlyTrendData: { month: string; issuances: number }[];
}

const COLORS_PALETTE = ["#4F46E5", "#06B6D4", "#F59E0B", "#EC4899", "#8B5CF6", "#10B981"];

export default function ReportingChartsRow({
  statusData,
  departmentUsageData,
  categoryChartData,
  monthlyTrendData,
}: ReportingChartsRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-gray-900">
      {/* Status Distribution (Pie Chart) */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2 font-sans">
          <PieIcon className="h-4 w-4 text-indigo-500" />
          Asset Status Allocation Profile
        </h3>
        <div className="h-64 mt-4 flex items-center justify-center font-mono text-[11px]">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Units`, "Quantity"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-400 font-sans">No assets registered to display metrics.</div>
          )}
        </div>
      </div>

      {/* Department Usage (Grouped Bar Chart) */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2 font-sans">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          Departmental Asset Volume
        </h3>
        <div className="h-64 mt-4 font-mono text-[11px]">
          {departmentUsageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Issued" fill="#3B82F6" stackId="a" name="Issued" />
                <Bar dataKey="Available" fill="#10B981" stackId="a" name="Available" />
                <Bar dataKey="Damaged" fill="#EF4444" stackId="a" name="Damaged" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400 font-sans">
              No departmental usage metrics configured.
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown (Bar) */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-55 pb-3 flex items-center gap-2 font-sans">
          <Server className="h-4 w-4 text-indigo-500" />
          Category Distribution Count
        </h3>
        <div className="h-64 mt-4 font-mono text-[11px]">
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 15, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400 font-sans">
              No categorical assets registered.
            </div>
          )}
        </div>
      </div>

      {/* Activity Trend (Line Chart) */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2 font-sans">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
          Monthly Inventory Handover Flow
        </h3>
        <div className="h-64 mt-4 font-mono text-[11px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="issuances"
                stroke="#4F46E5"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
                name="Issuances"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
