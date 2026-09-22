import React, { useState } from "react";
import { 
  Laptop, 
  QrCode, 
  Send,
  RotateCcw
} from "lucide-react";
import { Asset, User, AssetIssuance } from "../types";
import HardwareCatalogTab from "./manager/HardwareCatalogTab";
import AssignAssetTab from "./manager/AssignAssetTab";
import ReceiveHandbackTab from "./manager/ReceiveHandbackTab";

interface ManagerPanelProps {
  assets: Asset[];
  users: User[];
  issuances: AssetIssuance[];
  departments: string[];
  onAddAsset: (asset: Partial<Asset>) => Promise<boolean>;
  onIssueAsset: (assetId: string, userId: string, returnDate: string) => Promise<boolean>;
  onReturnAsset: (assetId: string, condition: string) => Promise<boolean>;
  onUpdateAssetStatus: (assetId: string, status: string, condition: string) => Promise<boolean>;
  onOpenScanner: () => void;
}

export default function ManagerPanel({
  assets,
  users,
  issuances,
  departments,
  onAddAsset,
  onIssueAsset,
  onReturnAsset,
  onUpdateAssetStatus,
  onOpenScanner
}: ManagerPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"inventory" | "issue" | "returns">("inventory");
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const facultyUsers = users.filter((usr) => usr.role.includes("Faculty"));
  const availableAssets = assets.filter((ast) => ast.status === "Available");
  const activeIssuances = issuances.filter((i) => i.actualReturnDate === null);

  const handleSelectAssetForIssuance = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveSubTab("issue");
  };

  return (
    <div className="space-y-6">
      {/* Sub menu tabs */}
      <div className="flex border border-white/10 bg-white/5 backdrop-blur-md p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === "inventory"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Laptop className="h-4 w-4" />
          Hardware Catalog ({assets.length})
        </button>
        <button
          onClick={() => setActiveSubTab("issue")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === "issue"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Send className="h-4 w-4" />
          Assign & Hand-out Asset
        </button>
        <button
          onClick={() => setActiveSubTab("returns")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === "returns"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Receive & Return Hand-back ({activeIssuances.length})
        </button>
      </div>

      {/* QUICK FLOATING ACTIONS QR PANEL */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-505/10">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Universal QR Handheld Terminal Scanner</h4>
            <p className="text-[10px] text-indigo-300">
              Scan QR codes to automatically decode Owner details, specifications, and return logs.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenScanner}
          className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/20 font-bold px-4 py-2 text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all outline-none shrink-0 cursor-pointer"
        >
          <QrCode className="h-4 w-4" />
          Open Virtual Scanner
        </button>
      </div>

      {/* SUB-TABS CONTENT */}
      {activeSubTab === "inventory" && (
        <HardwareCatalogTab
          assets={assets}
          departments={departments}
          onAddAsset={onAddAsset}
          onUpdateAssetStatus={onUpdateAssetStatus}
          onSelectAssetForIssuance={handleSelectAssetForIssuance}
        />
      )}

      {activeSubTab === "issue" && (
        <AssignAssetTab
          availableAssets={availableAssets}
          facultyUsers={facultyUsers}
          selectedAssetId={selectedAssetId}
          onSelectAssetId={setSelectedAssetId}
          onIssueAsset={onIssueAsset}
        />
      )}

      {activeSubTab === "returns" && (
        <ReceiveHandbackTab
          activeIssuances={activeIssuances}
          assets={assets}
          users={users}
          onReturnAsset={onReturnAsset}
        />
      )}
    </div>
  );
}
