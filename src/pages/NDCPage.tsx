import React, { useState } from "react";
import { FolderLock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import ActionButton from "../components/ActionButton";
import { NDCRequest, AssetIssuance } from "../types";

interface NDCPageProps {
  ndcRequests: NDCRequest[];
  issuances: AssetIssuance[];
  onApprove: (requestId: string, status: "Approved" | "Rejected", approvedBy: string) => Promise<boolean>;
  currentUser: { name: string };
}

export default function NDCPage({ ndcRequests, issuances, onApprove, currentUser }: NDCPageProps) {
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleAction = async (id: string, status: "Approved" | "Rejected") => {
    setLoading(true);
    setActionMessage(null);
    const ok = await onApprove(id, status, currentUser.name);
    if (ok) {
      setActionMessage(`Clearance request successfully updated to ${status}. Notification dispatched.`);
      setTimeout(() => setActionMessage(null), 5000);
    }
    setLoading(false);
  };

  const activeIssues = issuances.filter((i) => i.actualReturnDate === null);

  const columns = [
    {
      header: "Faculty Member",
      accessor: (req: NDCRequest) => (
        <div>
          <p className="font-bold text-slate-100 text-xs">{req.userName}</p>
          <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">{req.userEmail}</span>
        </div>
      ),
    },
    {
      header: "Department",
      accessor: (req: NDCRequest) => (
        <div>
          <p className="font-medium text-slate-300">{req.department}</p>
          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">{req.facultyType}</span>
        </div>
      ),
    },
    {
      header: "Submission Remarks",
      accessor: (req: NDCRequest) => (
        <p className="text-[10.5px] text-slate-400 leading-normal max-w-xs">{req.remarks || "No remarks entered."}</p>
      ),
    },
    {
      header: "Asset Holds",
      accessor: (req: NDCRequest) => {
        // Find if this specific user holds active devices
        const holds = activeIssues.filter((i) => i.userId === req.userId);
        return holds.length > 0 ? (
          <span className="text-[10px] font-bold text-rose-405 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 w-fit">
            <AlertTriangle className="h-3.5 w-3.5" /> Hold Count: {holds.length}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-emerald-405 bg-emerald-505/10 border border-emerald-505/20 px-2 py-0.5 rounded flex items-center gap-1.5 w-fit">
            ✓ Ready to clear
          </span>
        );
      },
    },
    {
      header: "NDC Status",
      accessor: (req: NDCRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Verify & Stamp",
      accessor: (req: NDCRequest) => {
        const holds = activeIssues.filter((i) => i.userId === req.userId);
        if (req.status !== "Pending") {
          return (
            <span className="text-[10px] font-mono text-slate-500 block uppercase font-black">
              Stamped ({req.status})
            </span>
          );
        }
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAction(req.id, "Approved")}
              disabled={holds.length > 0 || loading}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase rounded transition-all cursor-pointer flex items-center gap-1"
              title={holds.length > 0 ? "Resolve assets first" : "Clear employee liabilities"}
            >
              <CheckCircle className="h-3 w-3" /> Approve
            </button>
            <button
              onClick={() => handleAction(req.id, "Rejected")}
              disabled={loading}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase rounded transition-all cursor-pointer flex items-center gap-1"
            >
              <XCircle className="h-3 w-3" /> Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {actionMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white font-bold text-sm">×</button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <FolderLock className="h-4.5 w-4.5 text-indigo-400" /> University No Dues Certificate Clearance Desk
        </h3>
        <p className="text-xs text-slate-400">Review outstanding hardware holds, verify returned serial markers, and stamp certificates.</p>
      </div>

      <GlassCard>
        <DataTable
          data={ndcRequests}
          columns={columns}
          searchPlaceholder="Search request by academic email or name..."
          searchFilter={(item, query) => {
            const q = query.toLowerCase();
            return (
              (item.userName || "").toLowerCase().includes(q) ||
              (item.userEmail || "").toLowerCase().includes(q) ||
              (item.department || "").toLowerCase().includes(q)
            );
          }}
          pageSize={5}
        />
      </GlassCard>
    </div>
  );
}
