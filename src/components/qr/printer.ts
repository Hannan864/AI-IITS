import { QRRegistryEntry } from "./types";

export const triggerPrintGrid = (
  registry: QRRegistryEntry[],
  selectedQRs: string[],
  printLayoutPaper: "A4_Label_Small" | "A4_Label_Large"
) => {
  const subset = registry.filter((r) => selectedQRs.includes(r.id));
  const itemsToPrint = subset.length > 0 ? subset : registry.slice(0, 12);

  if (itemsToPrint.length === 0) {
    alert("No pre-generated QR tags available in the inventory print queue.");
    return;
  }

  const cols = printLayoutPaper === "A4_Label_Small" ? 4 : 3;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>IIUI QR Sheet - Preprinted Alignment</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; background-color: white; }
            @page { size: A4 portrait; margin: 10mm; }
          }
          body { font-family: 'Courier New', monospace; padding: 15px; background: #fafafa; color: #111; }
          .alignment-grid {
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            gap: 12px;
            max-width: 1000px;
            margin: 0 auto;
          }
          .sticker-label {
            border: 1.5px dashed #444;
            padding: 10px;
            text-align: center;
            font-size: 11px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border-radius: 4px;
            break-inside: avoid;
          }
          .sticker-header {
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            border-bottom: 1px double #888;
            padding-bottom: 4px;
            margin-bottom: 6px;
          }
          .sticker-qr {
            width: 110px;
            height: 110px;
            margin: 4px auto;
          }
          .sticker-tag {
            font-size: 10px;
            font-weight: bold;
            margin-top: 4px;
          }
          .sticker-footer {
            font-size: 7px;
            color: #555;
            margin-top: 3px;
          }
          .btn-dock {
            max-width: 1000px;
            margin: 0 auto 15px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 8px;
            display: flex;
            gap: 10px;
          }
          .btn-dock button {
            padding: 6px 14px;
            font-family: sans-serif;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="btn-dock" id="noprint">
          <button onclick="window.print()">🔥 Trigger Hardware Print</button>
          <button onclick="window.close()">Close Label Window</button>
          <span style="font-size:11px; align-self:center; color:#666;">This sheet has been pre-configured for standard dynamic physical alignment card print sheets.</span>
        </div>
        <div class="alignment-grid">
          ${itemsToPrint
            .map(
              (qr) => `
            <div class="sticker-label">
              <div class="sticker-header">⚡ IIUI INTRA-CAMPUS HARDWARE LABELS ⚡</div>
              <img class="sticker-qr" src="${qr.qrImage}" />
              <div class="sticker-tag">${qr.id}</div>
              <div class="sticker-footer">STATUS: ${qr.status.toUpperCase()} | ASSIGNED: ${qr.linkedAssetId ? "YES" : "NO"}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};
