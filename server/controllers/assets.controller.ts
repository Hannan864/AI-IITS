import { AssetService } from "../services/asset.service";
import { logForensicEvent } from "../utils";
import { db } from "../db";

let io: any;
export function setIoAssets(ioInstance: any) { io = ioInstance; }

export const AssetsController = {
  list: (req: any, res: any) => res.json(AssetService.listAll()),
  
  create: async (req: any, res: any) => {
    console.log("[Controller] Create asset called:", req.body);
    try {
      const creator = req.user ? req.user.email : "system-auto@iiui.edu";
      const asset = await AssetService.create(req.body, creator);
      logForensicEvent(creator, req.user ? req.user.role : "Store Manager", "Registered Asset", "assets", "INFO", `Asset ${asset.assetTag} created`);
      io.emit("state_update", { event: "asset_added" });
      res.status(201).json({ asset });
    } catch (error: any) {
      console.error("[Controller] Create asset failed:", error);
      res.status(500).json({ error: error.message || "Failed to create asset" });
    }
  },
  
  update: (req: any, res: any) => {
    const creator = req.user ? req.user.email : "system-auto@iiui.edu";
    const asset = AssetService.update(req.params.id, req.body);
    logForensicEvent(creator, req.user ? req.user.role : "Store Manager", "Updated Asset", "assets", "INFO", `Asset ${asset.assetTag} updated`);
    io.emit("state_update", { event: "asset_updated" });
    res.json({ asset });
  },
  
  delete: (req: any, res: any) => {
    AssetService.delete(req.params.id);
    io.emit("state_update", { event: "asset_deleted" });
    res.json({ message: "Asset deleted" });
  },
  
  scan: (req: any, res: any) => {
    const tag = req.params.tag;
    const asset = AssetService.findAssetByTag(tag);
    if (!asset) {
      return res.status(404).json({ found: false, error: "ASSET_NOT_FOUND" });
    }
    res.json({ found: true, asset });
  },

  scanByAssetId: (req: any, res: any) => {
    const assetId = req.params.assetId;
    const asset = AssetService.findAssetByAssetId(assetId);
    if (!asset) {
      return res.status(404).json({ found: false, error: "ASSET_NOT_FOUND" });
    }
    res.json({ found: true, asset });
  },

  qrImage: (req: any, res: any) => {
    const assetId = req.params.assetId;
    const asset = AssetService.findAssetByAssetId(assetId);
    if (asset && asset.qrImage) {
      return res.json({ found: true, assetId, assetTag: asset.assetTag, qrImage: asset.qrImage });
    }
    // Also try checking registry
    const qrReg = db.prepare("SELECT * FROM qr_registry WHERE id = ? OR linkedAssetId = ?").get(assetId, assetId) as any;
    if (qrReg) {
      return res.json({ found: true, assetId: qrReg.linkedAssetId, assetTag: qrReg.id, qrImage: qrReg.qrImage });
    }
    res.status(404).json({ found: false, error: "QR_IMAGE_NOT_FOUND" });
  },

  scanPost: (req: any, res: any) => {
    const { assetId, assetTag } = req.body;
    // Scan expects either high-grade UUID verification or fallback tag
    const identifier = assetId || assetTag;
    if (!identifier) {
      return res.status(400).json({ found: false, error: "INVALID_SCAN_PAYLOAD" });
    }
    
    let asset = null;
    if (assetId) {
      asset = AssetService.findAssetByAssetId(assetId);
    } else {
      asset = AssetService.findAssetByTag(assetTag);
    }

    if (!asset) {
      return res.status(404).json({ found: false, error: "ASSET_NOT_FOUND" });
    }

    res.json({
      found: true,
      asset: {
        id: asset.id,
        assetTag: asset.assetTag,
        assetName: asset.assetName,
        status: asset.status,
        department: asset.department,
        condition: asset.condition,
        category: asset.category,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        qrPayload: asset.qrPayload,
        qrImage: asset.qrImage
      }
    });
  }
};
