import React, { useState, useEffect } from "react";
import { 
  Link2, 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  X, 
  Tag, 
  Layers, 
  Check, 
  QrCode 
} from "lucide-react";
import ActionButton from "../../components/ActionButton";
import { apiFetch } from "../../lib/api";
import InlineAssetFields from "../../components/qr/InlineAssetFields";
import AssetBindingFeedback, { BindingRecord } from "../../components/qr/AssetBindingFeedback";

interface AssetBindingCenterPageProps {
  assets: any[];
  refreshAll: () => void;
}

export default function AssetBindingCenterPage({ assets = [], refreshAll }: AssetBindingCenterPageProps) {
  const [availableQRs, setAvailableQRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Binding selection states
  const [selectedQRId, setSelectedQRId] = useState("");
  const [bindingMode, setBindingMode] = useState<"existing" | "create">("existing");
  const [selectedAssetId, setSelectedAssetId] = useState("");

  // Create Inline New Asset State
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("Laptop");
  const [serialNumber, setSerialNumber] = useState("");
  const [condition, setCondition] = useState("New");
  const [department, setDepartment] = useState("Administration");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().substring(0, 10));

  const [btnLoading, setBtnLoading] = useState(false);
  const [recentBinding, setRecentBinding] = useState<BindingRecord | null>(null);
  const [bindingHistory, setBindingHistory] = useState<BindingRecord[]>([]);
  const [successBanner, setSuccessBanner] = useState<BindingRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUnboundQRs = async () => {
    setLoading(true);
    try {
      // Custom endpoint which gets all codes with linkedAssetId IS NULL and status not 'bound'
      const res = await apiFetch("/api/qr-registry/available");
      if (res.ok) {
        const data = await res.json();
        setAvailableQRs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnboundQRs();
  }, []);

  // Filter assets that don't have associated asset tags or bound QR codes
  const unboundAssets = assets.filter(
    (asset) => !asset.assetTag || asset.assetTag.includes("TEMP-") || asset.status === "Retired"
  );

  const handleResetForNext = () => {
    setSelectedQRId("");
    setSelectedAssetId("");
    setAssetName("");
    setSerialNumber("");
    setSuccessBanner(null);
    setErrorMessage(null);
  };

  const handleExecuteBinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedQRId) {
      setErrorMessage("Please select or scan an available QR code tag to bind.");
      return;
    }

    setBtnLoading(true);
    try {
      let finalAssetId = selectedAssetId;
      let boundAssetName = "";
      let boundCategory = assetCategory;
      let boundSerial = serialNumber;
      let boundDept = department;

      // If binding type is "CREATE NEW INLINE ASSET RECORD"
      if (bindingMode === "create") {
        if (!assetName || !serialNumber) {
          setErrorMessage("Please fill in all requested fields (Asset Name & Serial Number) for the inline asset.");
          setBtnLoading(false);
          return;
        }

        // 1. Provision new asset on server
        const assetRes = await apiFetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetName,
            category: assetCategory,
            serialNumber,
            purchaseDate,
            condition,
            department,
            status: "Available"
          }),
        });

        if (assetRes.ok) {
          const newAsset = await assetRes.json();
          finalAssetId = newAsset.id;
          boundAssetName = assetName;
        } else {
          const err = await assetRes.json();
          throw new Error(err.error || "Failed to provision asset record.");
        }
      } else {
        const foundAsset = assets.find(a => a.id === finalAssetId);
        if (foundAsset) {
          boundAssetName = foundAsset.assetName;
          boundCategory = foundAsset.category || "General";
          boundSerial = foundAsset.serialNumber || "";
          boundDept = foundAsset.department || "Academic";
        }
      }

      if (!finalAssetId) {
        setErrorMessage("Please select a target asset from the dropdown or switch to 'Create Asset Inline'.");
        setBtnLoading(false);
        return;
      }

      // 2. Map (bind) the QR to this target Asset ID
      const bindRes = await apiFetch("/api/qr-registry/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedQRId,
          assetId: finalAssetId
        }),
      });

      if (bindRes.ok) {
        const record: BindingRecord = {
          qrId: selectedQRId,
          assetId: finalAssetId,
          assetName: boundAssetName || "Institution Asset",
          category: boundCategory,
          serialNumber: boundSerial,
          department: boundDept,
          timestamp: new Date().toLocaleTimeString()
        };

        setRecentBinding(record);
        setBindingHistory((prev) => [record, ...prev]);
        setSuccessBanner(record);
        
        // Reset inputs for clean UX
        setSelectedQRId("");
        setSelectedAssetId("");
        setAssetName("");
        setSerialNumber("");

        await fetchUnboundQRs();
        refreshAll();
      } else {
        const err = await bindRes.json();
        setErrorMessage(`Binding process halted: ${err.error || "Check asset state."}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Conflict detected: ${err.message || "Relational verification error."}`);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-1">
      {/* Top Banner Alert when binding succeeds */}
      {successBanner && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl p-4.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  🎉 Asset Bound Successfully!
                </span>
                <span className="text-[10px] text-slate-400 font-mono">at {successBanner.timestamp}</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                QR Tag <span className="text-amber-300 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-amber-500/30">{successBanner.qrId}</span> is now linked to <span className="text-emerald-200 font-bold">{successBanner.assetName}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-300">
                {successBanner.serialNumber && (
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-white/10 font-mono">
                    S/N: {successBanner.serialNumber}
                  </span>
                )}
                {successBanner.department && (
                  <span className="bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-medium">
                    {successBanner.department}
                  </span>
                )}
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> Committed to central inventory ledger
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleResetForNext}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <span>+ Bind Another Asset</span>
            </button>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              title="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step-by-Step Binding Form */}
        <div className="lg:col-span-7 bg-[#0b1227] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Link2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">ASSET BINDING DESK</h3>
                <p className="text-[10px] text-slate-400">Associating verified QR barcodes with physical inventory items</p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchUnboundQRs}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Refresh available QR codes"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>

          <form onSubmit={handleExecuteBinding} className="space-y-4">
            {/* Step 1: Select QR */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[9px] font-bold">1</span>
                  <span>SELECT UNBOUND QR CODE</span>
                </label>
                <span className="font-mono text-indigo-400 text-[9px] font-bold">
                  ({availableQRs.length} Available in Stock)
                </span>
              </div>

              <select
                value={selectedQRId}
                onChange={(e) => setSelectedQRId(e.target.value)}
                className="w-full h-10 bg-slate-900 border border-white/15 rounded-xl text-xs font-mono font-bold text-slate-100 px-3 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">-- Choose preprinted unlinked barcode tag --</option>
                {availableQRs.map((qr) => (
                  <option key={qr.id} value={qr.id}>
                    {qr.id} ({qr.department} · {qr.category})
                  </option>
                ))}
              </select>

              {/* Quick-select pill suggestions */}
              {availableQRs.length > 0 && !selectedQRId && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[9.5px] text-slate-500">Quick Pick:</span>
                  {availableQRs.slice(0, 3).map((qr) => (
                    <button
                      key={qr.id}
                      type="button"
                      onClick={() => setSelectedQRId(qr.id)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-indigo-200 border border-white/10 font-mono text-[9.5px] transition-all cursor-pointer"
                    >
                      {qr.id}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Select Binding Mode */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="h-4 w-4 rounded bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[9px] font-bold">2</span>
                <span>CHOOSE TARGET MAPPING SOURCE</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setBindingMode("existing")}
                  className={`h-8.5 text-[11px] uppercase font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bindingMode === "existing"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Existing Asset in DB</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBindingMode("create")}
                  className={`h-8.5 text-[11px] uppercase font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bindingMode === "create"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Create Asset Inline</span>
                </button>
              </div>
            </div>

            {/* Step 3: Render Condition-based subform selection */}
            {bindingMode === "existing" ? (
              <div className="bg-slate-900/60 border border-white/10 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] uppercase tracking-widest text-slate-400 font-extrabold block">
                    STEP 3: CHOOSE PHYSICAL ASSET REGISTERED IN DB
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    ({unboundAssets.length} Unbound Assets)
                  </span>
                </div>
                
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-white/15 rounded-xl text-xs font-bold text-slate-100 px-3 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">-- Select target hardware device --</option>
                  {unboundAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetName} [S/N: {asset.serialNumber}] ({asset.department})
                    </option>
                  ))}
                  {/* Also list already tagged assets in case manager wants to overwrite */}
                  {assets.filter(a => !unboundAssets.includes(a)).map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetName} [Currently Tagged: {asset.assetTag}] ({asset.department})
                    </option>
                  ))}
                </select>

                {unboundAssets.length === 0 && (
                  <div className="text-[10px] text-amber-400 flex items-center gap-1.5 mt-1 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>No unlinked assets exist. Switch to "Create Asset Inline" to register a new item!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[9.5px] uppercase tracking-widest text-slate-400 font-extrabold block">
                  STEP 3: REGISTER NEW ASSET DETAILS
                </span>
                <InlineAssetFields
                  assetName={assetName}
                  setAssetName={setAssetName}
                  assetCategory={assetCategory}
                  setAssetCategory={setAssetCategory}
                  serialNumber={serialNumber}
                  setSerialNumber={setSerialNumber}
                  department={department}
                  setDepartment={setDepartment}
                  condition={condition}
                  setCondition={setCondition}
                />
              </div>
            )}

            {/* Security Lock Note */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
              <Lock className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  ADMIN RELATIONAL ASSIGNMENT POLICY
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">
                  Upon submission, the correlation is permanently committed in the registry and searchable across all scanners.
                </span>
              </div>
            </div>

            <ActionButton
              type="submit"
              variant="primary"
              loading={btnLoading}
              disabled={!selectedQRId}
              className="w-full h-11 flex items-center justify-center gap-2 font-black cursor-pointer text-xs uppercase rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>{btnLoading ? "Committing Secure Link..." : "Establish Secure Relational Bind"}</span>
            </ActionButton>
          </form>
        </div>

        {/* Audit feedback pane */}
        <div className="lg:col-span-5 space-y-4">
          <AssetBindingFeedback 
            recentBinding={recentBinding} 
            bindingHistory={bindingHistory}
            onBindAnother={handleResetForNext}
          />
        </div>
      </div>
    </div>
  );
}

