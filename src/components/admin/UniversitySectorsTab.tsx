import React from "react";
import { Building2 } from "lucide-react";

interface UniversitySectorsTabProps {
  departments: string[];
}

export default function UniversitySectorsTab({
  departments,
}: UniversitySectorsTabProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-1.5">
        <Building2 className="h-4.5 w-4.5 text-indigo-600" />
        University Sectors & Registered Academic Divisions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {departments.map((dept, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-100 hover:border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/50 p-4 transition-all text-center space-y-2"
          >
            <span className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-indigo-100 text-indigo-600 font-bold border border-white text-xs">
              0{idx + 1}
            </span>
            <p className="text-xs font-bold text-gray-800 line-clamp-1">{dept}</p>
            <span className="text-[10px] text-gray-400 font-semibold uppercase block">Active Zone</span>
          </div>
        ))}
      </div>
    </div>
  );
}
