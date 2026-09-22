import React, { useState } from "react";
import { QrCode, X } from "lucide-react";
import { Asset } from "../types";
import ScannerViewportHUD from "./scanner/ScannerViewportHUD";
import ScannerExtractedSpecs from "./scanner/ScannerExtractedSpecs";
import { apiFetch } from "../lib/api";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onQuickIssue: (assetId: string) => void;
  onQuickReturn: (assetId: string, condition: string) => void;
}

export default function QRScannerModal({
  isOpen,
  onClose,
  assets,
  onQuickIssue,
  onQuickReturn,
}: QRScannerModalProps) {
  const [selectedTag, setSelectedTag] = useState("");
  const [typedTag, setTypedTag] = useState("");
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCondition, setScannedCondition] = useState("Good");

  if (!isOpen) return null;

  // Handles lookup call to /api/qr/:assetId
  const handleLookup = async (tagOrId: string) => {
    if (!tagOrId) return;
    setIsScanning(true);
    setErrorMsg("");
    setScannedResult(null);

    // If tag, resolve to id. If id, pass through.
    const asset = assets.find(a => a.assetTag === tagOrId || a.id === tagOrId);
    if (!asset) {
        setErrorMsg("Asset not found");
        setIsScanning(false);
        return;
    }
    const assetId = asset.id;

    // Simulate 1s camera scan delay with neat glowing beam
    setTimeout(async () => {
      try {
        const response = await apiFetch(`/api/qr/scan/${assetId}`);
        if (!response.ok) {
          throw new Error("Asset tag code is not registered at IIUI Store Database.");
        }
        const data = await response.json();
        setScannedResult(data);
        setIsScanning(false);
      } catch (err: any) {
        setErrorMsg(err.message || "An error occurred lookup up the asset tag.");
        setIsScanning(false);
      }
    }, 1000);
  };

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = typedTag.trim().toUpperCase();
    if (cleanTag) {
      handleLookup(cleanTag);
    }
  };

  const selectAssetFromDropdown = (tag: string) => {
    setSelectedTag(tag);
    handleLookup(tag);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060814]/98 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-y-auto select-none animate-fade-in gap-6">
      {/* BACKGROUND SCI-FI VECTOR LINES */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-indigo-500/10 rounded-full animate-[spin_120s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-indigo-500/15 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* TOP HEADER RAIL PANEL */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600/10 border border-indigo-500/25 rounded-lg flex items-center justify-center text-indigo-400">
            <QrCode className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-bold px-2 py-0.5 rounded tracking-widest uppercase">
              Secure Sandbox Scanner
            </span>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              IIUI Optical QR Code & RFID Inventory Target Decoder
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg bg-white/5 border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <X className="h-4 w-4" />
          Exit Scanner
        </button>
      </header>

      {/* CENTER WORKSPACE PANELS SPLIT GRID */}
      <div className="relative z-10 max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 items-stretch">
        <ScannerViewportHUD
          assets={assets}
          isScanning={isScanning}
          selectedTag={selectedTag}
          typedTag={typedTag}
          onTypedTagChange={setTypedTag}
          onManualScan={handleManualScan}
          onSelectAssetFromDropdown={selectAssetFromDropdown}
          scannedResult={scannedResult}
        />

        <ScannerExtractedSpecs
          isScanning={isScanning}
          errorMsg={errorMsg}
          scannedResult={scannedResult}
          scannedCondition={scannedCondition}
          onScannedConditionChange={setScannedCondition}
          onQuickReturn={onQuickReturn}
          onQuickIssue={onQuickIssue}
          onClose={onClose}
          onLookupRefetch={handleLookup}
        />
      </div>

      {/* FOOTER SYSTEM DIAGNOSTICS */}
      <footer className="relative z-10 border-t border-white/5 pt-3.5 text-center text-[10px] text-slate-500 tracking-wider">
        DIAGNOSTICS: CAMERA=OK • LASER=READY • RFID=ONLINE • MEMORY_LEDGER=SYNCED
      </footer>
    </div>
  );
}
