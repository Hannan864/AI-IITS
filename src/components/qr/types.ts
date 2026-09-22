export interface QRRegistryEntry {
  id: string; // assetTag
  department: string;
  year: string;
  sequence: number;
  qrPayload: string;
  qrImage: string;
  generatedBy: string;
  createdAt: string;
  linkedAssetId: string | null;
  status: string; // 'generated' | 'printed' | 'bound' | 'issued' | 'returned'
}
