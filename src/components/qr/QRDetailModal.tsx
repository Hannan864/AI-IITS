import React from "react";
import { X, Layers, Tag, Calendar, User, Download } from "lucide-react";
import { QRCodeEntry } from "../../pages/qr/QRRegistryPage";

interface QRDetailModalProps {
  selectedQR: QRCodeEntry | null;
  onClose: () => void;
  assets: any[];
}

export default function QRDetailModal({
  selectedQR,
  onClose,
  assets,
}: QRDetailModalProps) {
  if (!selectedQR) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#020512]/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0a1021]/95 border border-white/10 rounded-2xl max-w-xl w-full h-[220px] overflow-hidden shadow-2xl relative flex flex-row gap-5 p-4 text-xs animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-7 w-7 bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-full flex items-center justify-center text-slate-450 hover:text-white cursor-pointer z-20 transition-all"
          aria-label="Dismiss details"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left side: QR Code Area */}
        <div className="flex flex-col items-center justify-center bg-white p-2.5 rounded-xl shrink-0 w-[140px] h-[140px] my-auto border border-white/10 shadow-lg select-none">
          <img
            src={selectedQR.qrImage}
            alt="Institutional Barcode"
            className="w-[100px] h-[100px] object-contain mb-1"
            referrerPolicy="no-referrer"
          />
          <span className="text-[8px] text-black font-bold tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
            {selectedQR.id}
          </span>
        </div>

        {/* Right side: Scrollable Info & Action Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-sans text-left self-stretch flex flex-col justify-between py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="space-y-3 pb-2">
            <div className="flex items-start justify-between gap-2.5 pr-6">
              <div>
                <h4 className="font-mono font-black text-white text-xs select-all tracking-tight leading-tight break-all">
                  {selectedQR.id}
                </h4>
                <span className="text-[9px] bg-indigo-500/15 text-indigo-305 border border-indigo-500/25 px-2 py-0.5 rounded font-black uppercase inline-block mt-1">
                  State: {selectedQR.status.toUpperCase()}
                </span>
              </div>
              {/* Hot Download Action */}
              <button
                type="button"
                onClick={() => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.onload = () => {
                    // Make canvas taller to fit text
                    canvas.width = img.width;
                    canvas.height = img.height + 40;
                    
                    // White background
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw QR
                    ctx.drawImage(img, 0, 0);
                    
                    // Draw text
                    ctx.fillStyle = "#000000";
                    ctx.font = "bold 14px monospace";
                    ctx.textAlign = "center";
                    ctx.fillText(selectedQR.id, canvas.width / 2, img.height + 25);
                    
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png");
                    link.download = `IIUI_QR_${selectedQR.id}.png`;
                    link.click();
                  };
                  img.src = selectedQR.qrImage;
                }}
                className="h-6.5 px-2 bg-indigo-500 hover:bg-indigo-455 active:bg-indigo-600 text-white text-[9.5px] font-extrabold uppercase tracking-widest rounded flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-md"
                title="Instantly download QR code image with tag"
              >
                <Download className="h-3 w-3" /> Download
              </button>
            </div>

            {/* Specs parameter lists */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1 leading-none">
                  <Layers className="h-2.5 w-2.5 text-slate-400" /> Sector
                </span>
                <p className="font-bold text-white truncate">{selectedQR.department}</p>
              </div>

              <div className="bg-black/30 p-2 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1 leading-none">
                  <Tag className="h-2.5 w-2.5 text-indigo-400" /> Category
                </span>
                <p className="font-bold text-white truncate">{selectedQR.category}</p>
              </div>

              <div className="bg-black/30 p-2 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-505 font-extrabold flex items-center gap-1 leading-none">
                  <Calendar className="h-2.5 w-2.5 text-emerald-400" /> Year
                </span>
                <p className="font-bold text-white truncate">{selectedQR.year} (S {selectedQR.sequence})</p>
              </div>

              <div className="bg-black/30 p-2 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1 leading-none">
                  <User className="h-2.5 w-2.5 text-sky-400" /> Built By
                </span>
                <p className="font-bold text-white truncate font-mono text-[9px]" title={selectedQR.generatedBy}>
                  {selectedQR.generatedBy}
                </p>
              </div>
            </div>

            {/* Bound asset details container */}
            <div className="bg-[#0f1936] border border-indigo-500/15 rounded-xl p-3 space-y-2">
              <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-indigo-400 block leading-none">
                🛡 Associated Real Asset Mapping
              </span>
              {(() => {
                const boundAsset = assets.find((a) => a.id === selectedQR.linkedAssetId || a.assetTag === selectedQR.id);
                if (boundAsset) {
                  return (
                    <div className="text-[11px] space-y-1">
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="text-white font-bold truncate">{boundAsset.assetName}</span>
                        <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold shrink-0">
                          {boundAsset.condition}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[9px] gap-2.5">
                        <span className="truncate">S/N: {boundAsset.serialNumber}</span>
                        <span className="shrink-0">{boundAsset.status}</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <p className="text-[10px] text-slate-450 italic leading-snug">
                      This pre-printed token has not been physically attached to any university hardware record yet. Open standard assignment desk to mapping.
                    </p>
                  );
                }
              })()}
            </div>

            {/* Payload verification */}
            <div className="bg-black/45 p-2.5 rounded-lg border border-white/5 space-y-0.5 font-mono text-[9px]">
              <span className="font-sans font-bold text-slate-500 uppercase block text-[8px] tracking-wider leading-none">Payload Content String:</span>
              <p className="text-slate-400 break-all select-all leading-normal">{selectedQR.qrPayload}</p>
            </div>
          </div>

          {/* Utility Download actions */}
          <div className="flex gap-2.5 pt-2 border-t border-white/5 mt-auto">
            <button
              type="button"
              onClick={() => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height + 40;
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                  
                  ctx.fillStyle = "#000000";
                  ctx.font = "bold 14px monospace";
                  ctx.textAlign = "center";
                  ctx.fillText(selectedQR.id, canvas.width / 2, img.height + 25);
                  
                  const link = document.createElement("a");
                  link.href = canvas.toDataURL("image/png");
                  link.download = `IIUI_QR_${selectedQR.id}.png`;
                  link.click();
                };
                img.src = selectedQR.qrImage;
              }}
              className="flex-1 h-8.5 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <Download className="h-3.5 w-3.5" /> Download PNG Label
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8.5 px-3.5 bg-white/5 hover:bg-white/10 active:bg-white/20 text-slate-350 hover:text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-lg cursor-pointer transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
