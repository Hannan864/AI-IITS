import React from "react";
import { Check, X } from "lucide-react";
import { NDCRequest, Asset } from "../../types";

interface NdcClearancesTabProps {
  ndcRequests: NDCRequest[];
  assets: Asset[];
  onApproveNDC: (requestId: string, status: "Approved" | "Rejected") => Promise<boolean>;
}

export default function NdcClearancesTab({
  ndcRequests,
  assets,
  onApproveNDC,
}: NdcClearancesTabProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-gray-900">No Dues Certificate (NDC) Clearance Requests Registry</h3>
        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full animate-pulse">
          {ndcRequests.filter((r) => r.status === "Pending").length} Pending Audits
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Faculty Detail</th>
              <th className="px-4 py-3">Academic Department</th>
              <th className="px-4 py-3">Date Requested</th>
              <th className="px-4 py-3">Remarks & Justification</th>
              <th className="px-4 py-3 text-center">Outstanding Assets Holding</th>
              <th className="px-4 py-3">Clearance State</th>
              <th className="px-4 py-3 text-right">Appraisal Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {ndcRequests.map((req) => {
              return (
                <tr key={req.id} className="hover:bg-slate-50/30">
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900">{req.userName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{req.userEmail}</div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-500">{req.department}</td>
                  <td className="px-4 py-4 font-mono text-gray-600">{req.requestDate}</td>
                  <td className="px-4 py-4 max-w-xs text-gray-600 italic">"{req.remarks}"</td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold bg-amber-50 text-amber-805 border border-amber-200/50 px-2 py-0.5 rounded">
                      Verification Required
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        req.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {req.status === "Pending" ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onApproveNDC(req.id, "Approved")}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2.5 text-[11px] font-bold flex items-center gap-0.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => onApproveNDC(req.id, "Rejected")}
                          className="rounded-lg bg-red-600 hover:bg-red-700 text-white py-1 px-2.5 text-[11px] font-bold flex items-center gap-0.5 shadow-sm transition-all cursor-pointer"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-gray-400">Signed: {req.approvedBy}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {ndcRequests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 font-medium">
                  No clearance requests recorded in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
