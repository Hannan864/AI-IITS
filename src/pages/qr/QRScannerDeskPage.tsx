import React, { useState, useEffect } from "react";
import { RefreshCw, Disc, SearchCode, History, Camera, Play, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import ActionButton from "../../components/ActionButton";
import { apiFetch } from "../../lib/api";
import TelemetryDisplayPanel from "../../components/qr/TelemetryDisplayPanel";
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerDeskPageProps {
  assets: any[];
  refreshAll: () => void;
}

export default function QRScannerDeskPage({ assets = [], refreshAll }: QRScannerDeskPageProps) {
  const [registry, setRegistry] = useState<any[]>([]);
  const [scansList, setScansList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Scanner Input State
  const [inputTag, setInputTag] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const regRes = await apiFetch("/api/qr-registry");
      const scanRes = await apiFetch("/api/qr-registry/scan-logs");
      
      if (regRes.ok) {
        const data = await regRes.json();
        setRegistry(data);
      }
      if (scanRes.ok) {
        const data = await scanRes.json();
        setScansList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScan = async (devices: { rawValue: string }[]) => {
    if (devices.length > 0) {
      const tagToScan = devices[0].rawValue;
      if (scannerActive) return;
      handleSimulateScan(tagToScan);
    }
  };

  const handleSimulateScan = async (tagToScan: string) => {
    if (!tagToScan) {
      alert("Please specify or select a QR tag identifier to scan.");
      return;
    }

    setScannerActive(true);
    // Simulate scanner speed delay
    setTimeout(async () => {
      try {
        const res = await apiFetch("/api/qr-registry/log-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: tagToScan,
            scanType: "desk_lookup",
            result: "Scan terminal matched successfully"
          })
        });

        if (res.ok) {
          const data = await res.json();
          // Match asset details
          const bAsset = assets.find(a => a.assetTag === tagToScan || a.id === data.record.linkedAssetId);
          setScanResult({
            record: data.record,
            asset: bAsset || null
          });
          await fetchData();
          refreshAll();
        } else {
          const err = await res.json();
          alert(`Scan failed: ${err.error || "Undeclared tag barcode."}`);
          setScanResult(null);
        }
      } catch (err) {
        console.error(err);
        alert("Communications error parsing scanner response.");
      } finally {
        setScannerActive(false);
      }
    }, 1200);
  };

  // Find current holder details if issued
  const getHolderInfo = (assetId: string) => {
    return null; // Can be resolved if there is a matching issuance
  };

  const findAssetDetails = (qrCodeId: string) => {
    const bAsset = assets.find(a => a.assetTag === qrCodeId);
    if (bAsset) return bAsset;
    const qrReg = registry.find(r => r.id === qrCodeId);
    if (qrReg && qrReg.linkedAssetId) {
      return assets.find(a => a.id === qrReg.linkedAssetId) || null;
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-1">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Virtual Scanner Machine and Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-2">
              <Camera className="h-4 w-4 text-indigo-400" /> Physical Camera Scanner
            </h3>

            <div className="w-full flex justify-center bg-black/60 rounded-xl overflow-hidden border border-white/10">
               <div className="w-full max-w-sm">
                 <Scanner onScan={handleScan} />
               </div>
            </div>

            {scannerActive && <p className="text-[10px] text-center font-bold text-indigo-400 animate-pulse mt-2">PROCESSING SCAN...</p>}

            <div className="space-y-3 pt-2">
              <div className="relative">
                <span className="text-[8.5px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  OR Manual Barcode Keyboard Entry
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. IIUI-CS-LAPTOP-2026-000001"
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                    className="flex-1 h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-mono px-3 text-slate-200 outline-none focus:border-indigo-500"
                  />
                  <ActionButton
                    type="button"
                    variant="secondary"
                    loading={scannerActive}
                    disabled={!inputTag}
                    onClick={() => handleSimulateScan(inputTag)}
                    className="h-9 px-4 flex items-center justify-center gap-1.5 font-bold hover:bg-indigo-650 hover:text-white shrink-0"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Manual Input
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>

          <TelemetryDisplayPanel scanResult={scanResult} />
        </div>

        {/* Dynamic Scan Result Output Panel */}
        <div className="lg:col-span-5 bg-[#0b1227] border border-white/5 rounded-2xl p-5 shadow-xl min-h-[500px]">
           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-200 mb-4 flex items-center gap-2 pb-2 border-b border-white/5">
              <History className="h-4 w-4 text-indigo-400" /> Recent Scans Registry
            </h4>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {scansList.map((l, idx) => {
                const asset = findAssetDetails(l.qrCodeId);
                const isExpanded = expandedScanId === l.id;
                
                return (
                  <div key={l.id || idx} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden transition-all">
                    <div 
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                      onClick={() => setExpandedScanId(isExpanded ? null : l.id)}
                    >
                      <div className="flex flex-col gap-1">
                         <span className="font-mono text-[11px] font-bold text-indigo-300">{l.qrCodeId}</span>
                         <span className="text-[9px] text-slate-500 uppercase">{new Date(l.createdAt || Date.now()).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         {asset ? (
                           <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                         ) : (
                           <XCircle className="h-3.5 w-3.5 text-rose-500" />
                         )}
                         {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-3 border-t border-white/5 bg-black/40 text-[10px] space-y-2 text-slate-300">
                         {asset ? (
                           <>
                             <div className="grid grid-cols-2 gap-2">
                               <div>
                                 <span className="block text-slate-500 uppercase tracking-wider text-[8px] mb-0.5">Device Name</span>
                                 <span className="font-bold">{asset.assetName}</span>
                               </div>
                               <div>
                                 <span className="block text-slate-500 uppercase tracking-wider text-[8px] mb-0.5">Category</span>
                                 <span>{asset.category}</span>
                               </div>
                               <div>
                                 <span className="block text-slate-500 uppercase tracking-wider text-[8px] mb-0.5">Status</span>
                                 <span className="uppercase text-emerald-400 font-bold">{asset.status}</span>
                               </div>
                               <div>
                                 <span className="block text-slate-500 uppercase tracking-wider text-[8px] mb-0.5">Department</span>
                                 <span>{asset.department}</span>
                               </div>
                             </div>
                             <div className="pt-1 mt-1 border-t border-white/5">
                               <span className="block text-slate-500 uppercase tracking-wider text-[8px] mb-0.5">QR Tag</span>
                               <span className="font-mono text-indigo-300">{asset.assetTag || 'Unbound'}</span>
                             </div>
                           </>
                         ) : (
                           <div className="text-rose-400 text-center py-2 italic flex flex-col items-center">
                             <XCircle className="h-6 w-6 mb-1 opacity-50" />
                             No asset bound to this tag.
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
              {scansList.length === 0 && (
                <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/20 text-slate-500">
                   <History className="h-8 w-8 mb-2 opacity-20" />
                   <p className="text-[10px] uppercase font-bold tracking-widest">No scans recorded</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
