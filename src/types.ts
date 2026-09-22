export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "Admin" | "Store Manager" | "Faculty" | "Visiting Faculty";
  department: string;
  facultyType: "Permanent" | "Visiting" | "N/A";
  contractEndDate: string | null;
  createdAt: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  assetName: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  condition: "New" | "Good" | "Fair" | "Damaged" | "Repairing";
  status: "Available" | "Issued" | "Damaged" | "Retired";
  department: string;
  qrCode: string;
  createdAt: string;
}

export interface AssetIssuance {
  id: string;
  assetId: string;
  userId: string;
  issuedDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  status: "Active" | "Returned" | "Overdue" | "Damaged";
  issuedBy: string;
  // Enriched fields from GET api/issue/history
  assetName?: string;
  assetTag?: string;
  userName?: string;
  userEmail?: string;
  department?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NDCRequest {
  id: string;
  userId: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks: string;
  approvedBy: string | null;
  // Enriched fields
  userName?: string;
  userEmail?: string;
  department?: string;
  facultyType?: string;
}

export interface SmartAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  facultyType: string;
  contractEndDate: string;
  daysRemaining: number;
  outstandingCount: number;
  outstandingAssets: Array<{
    id: string;
    assetId: string;
    assetName: string;
    assetTag: string;
    issuedDate: string;
    returnDate: string;
  }>;
  status: "Expired" | "Critical" | "Warning";
  riskLevel: "High" | "Medium";
  recommendation: string;
}

export interface AssetLifecycleRecord {
  id: string;
  assetName: string;
  category: string;
  assetTag: string;
  buyPrice: number;
  yearsElapsed: string;
  currentSimValue: number;
  totalIncidents: number;
  demandsReplacement: boolean;
  depreciationPercent: number;
  usageHistoryCount: number;
  history: AssetIssuance[];
}
