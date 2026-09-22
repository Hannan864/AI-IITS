import React, { useState } from "react";
import { Camera, RefreshCw, Link as LinkIcon, CheckCircle, CheckCircle2, AlertCircle, X, Check } from "lucide-react";
import ActionButton from "../ActionButton";
import { QRRegistryEntry } from "./types";
import { apiFetch } from "../../lib/api";
import RegisteredBindingTable from "./RegisteredBindingTable";
import BindingDeskAssetFields from "./BindingDeskAssetFields";

interface QRBindingDeskProps {
  assets: any[];
  registry: QRRegistryEntry[];
  fetchRegistry: () => Promise<void>;
  refreshAll: () => void;
  scannedQRId: string;
  setScannedQRId: React.Dispatch<React.SetStateAction<string>>;
  onRevoke: (tag: string) => Promise<void>;
}

export default function QRBindingDesk({
  assets,
  registry,
  fetchRegistry,
  refreshAll,
  scannedQRId,
  setScannedQRId,
  onRevoke,
}: QRBindingDeskProps) {
  const [simulatedScannerActive, setSimulatedScannerActive] = useState(false);
  const [isBindingAction, setIsBindingAction] = useState(false);
  const [binderType, setBinderType] = useState<"existing" | "new">("existing");
  const [targetAssetId, setTargetAssetId] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ tag: string; assetName: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newAssetForm, setNewAssetForm] = useState({
    name: "",
    category: "Computing",
    serial: "",
    department: "Computer Science",
    condition: "New",
  });

  const triggerSimulateScan = (tag: string) => {
    setSimulatedScannerActive(true);
    setTimeout(() => {
      setSimulatedScannerActive(false);
      setScannedQRId(tag);
      const match = registry.find((x) => x.id === tag);
      if (match?.linkedAssetId) {
        setErrorMessage(`Note: Tag ${tag} was already bound to an existing asset.`);
      }
    }, 1200);
  };

  const handleBindQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!scannedQRId) {
      setErrorMessage("Please scan or specify a pre-generated QR code tag.");
      return;
    }

    setIsBindingAction(true);
    try {
      let finalAssetId = targetAssetId;
      let assetDisplayName = "";

      if (binderType === "new") {
        if (!newAssetForm.name || !newAssetForm.serial) {
          setErrorMessage("Please provide asset name and serial number.");
          setIsBindingAction(false);
          return;
        }

        const response = await apiFetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetName: newAssetForm.name,
            category: newAssetForm.category,
            serialNumber: newAssetForm.serial,
            purchaseDate: new Date().toISOString().split("T")[0],
            condition: newAssetForm.condition,
            department: newAssetForm.department,
            assetTag: scannedQRId,
          }),
        });
        if (response.ok) {
          const created = await response.json();
          finalAssetId = created.id;
          assetDisplayName = newAssetForm.name;
        } else {
          const err = await response.json();
          throw new Error(`Failed to create asset: ${err.error || "Check inputs."}`);
        }
      } else {
        const found = assets.find((a) => a.id === targetAssetId);
        if (found) assetDisplayName = found.assetName;
      }

      if (!finalAssetId) {
        throw new Error("Target asset must be defined before mapping.");
      }

      const res = await apiFetch("/api/qr-registry/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: scannedQRId, assetId: finalAssetId }),
      });

      if (res.ok) {
        setSuccessInfo({ tag: scannedQRId, assetName: assetDisplayName || "Equipment Unit" });
        setScannedQRId("");
        setTargetAssetId("");
        setNewAssetForm({
          name: "",
          category: "Computing",
          serial: "",
          department: "Computer Science",
          condition: "New",
        });
        await fetchRegistry();
        refreshAll();
      } else {
        const err = await res.json();
        setErrorMessage(`Binding Error: ${err.error}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during secure mapping.");
    } finally {
      setIsBindingAction(false);
    }
  };

  const unassignedQRs = registry.filter((r) => !r.linkedAssetId);

  return (
    <div className="space-y-4 w-full">
      {/* Success banner */}
      {successInfo && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3.5 flex items-center justify-between text-emerald-200 text-xs shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>
              Successfully bound QR Tag <strong className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">{successInfo.tag}</strong> with asset <strong>{successInfo.assetName}</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessInfo(null)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-3.5 flex items-center justify-between text-rose-200 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 text-rose-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column: Scanner Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Physical Scan Integration</h3>
                <p className="text-[10px] text-slate-400">Verifying alignment stickers via optical reader emulation</p>
              </div>
            </div>

            <div className="relative bg-black rounded-xl overflow-hidden border border-white/5 aspect-video flex flex-col items-center justify-center text-center p-4">
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_12px_#3b82f6] animate-bounce"></div>

              {simulatedScannerActive ? (
                <div className="space-y-2.5 z-10">
                  <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
                  <span className="text-xs font-mono text-indigo-400 animate-pulse font-bold block">
                    DECODING SECURE INTEGRATION DATA...
                  </span>
                </div>
              ) : scannedQRId ? (
                <div className="space-y-2 z-10 p-5 bg-black/75 rounded-xl border border-indigo-500/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle className="h-3 w-3" /> STICKER DECODED
                  </span>
                  <p className="font-mono text-white text-xs font-black select-all">
                    {scannedQRId}
                  </p>
                  <button
                    onClick={() => setScannedQRId("")}
                    className="text-[9px] uppercase font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Reset Simulator
                  </button>
                </div>
              ) : (
                <div className="space-y-3 z-10 text-center text-slate-400">
                  <Camera className="h-8 w-8 mx-auto text-slate-600 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-slate-300">Scanner Standby State</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 max-w-xs mx-auto">
                      Press one of the "Scan Test" flags on the print queue or select manual binding options.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleBindQR} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Scanned QR sticker code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIUI-CS-2026-000001"
                    value={scannedQRId}
                    onChange={(e) => setScannedQRId(e.target.value.toUpperCase())}
                    className="flex-1 h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-mono font-bold text-slate-200 px-3 outline-none focus:border-indigo-500"
                  />
                  <select
                    onChange={(e) => setScannedQRId(e.target.value)}
                    value={scannedQRId}
                    className="max-w-[140px] h-9 bg-[#111625] border border-white/10 rounded-lg text-[9px] font-bold text-slate-350 px-2"
                  >
                    <option value="">Quick Select...</option>
                    {unassignedQRs.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-black/20 p-1 rounded-lg border border-white/5 flex">
                <button
                  type="button"
                  onClick={() => setBinderType("existing")}
                  className={`flex-1 h-7 text-[10px] uppercase font-bold rounded-md cursor-pointer ${
                    binderType === "existing"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bind to Existing Asset
                </button>
                <button
                  type="button"
                  onClick={() => setBinderType("new")}
                  className={`flex-1 h-7 text-[10px] uppercase font-bold rounded-md cursor-pointer ${
                    binderType === "new"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  New Asset Creation
                </button>
              </div>

              {binderType === "existing" ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Target Hardware Record
                  </label>
                  <select
                    required
                    value={targetAssetId}
                    onChange={(e) => setTargetAssetId(e.target.value)}
                    className="w-full h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Asset record --</option>
                    {assets
                      .filter((a) => !a.assetTag || a.assetTag.startsWith("TEMP"))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.assetName} (SN: {a.serialNumber}) - {a.department}
                        </option>
                      ))}
                  </select>
                  <p className="text-[9px] text-slate-500 mt-1">
                    Only assets that are currently unlinked are displayed here.
                  </p>
                </div>
              ) : (
                <BindingDeskAssetFields
                  newAssetForm={newAssetForm}
                  setNewAssetForm={setNewAssetForm}
                />
              )}

              <ActionButton
                type="submit"
                variant="primary"
                loading={isBindingAction}
                className="w-full flex items-center justify-center gap-1.5 font-bold cursor-pointer"
              >
                <LinkIcon className="h-4 w-4" /> Finalize Sticker Binding Process
              </ActionButton>
            </form>
          </div>
        </div>

        {/* Right Column: registered linkages audit log table */}
        <div className="lg:col-span-7 space-y-6">
          <RegisteredBindingTable
            registry={registry}
            assets={assets}
            onRevoke={onRevoke}
          />
        </div>
      </div>
    </div>
  );
}

