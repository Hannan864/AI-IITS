import React, { useState } from "react";
import { Truck, Store, MapPin, Plus } from "lucide-react";
import { Supplier } from "../../types";

interface SupplierLedgerTabProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Partial<Supplier>) => Promise<boolean>;
}

export default function SupplierLedgerTab({
  suppliers,
  onAddSupplier,
}: SupplierLedgerTabProps) {
  // Supplier input states
  const [supName, setSupName] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supAddress, setSupAddress] = useState("");
  const [supMsg, setSupMsg] = useState("");

  const handleRegisterSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;

    const success = await onAddSupplier({
      name: supName,
      email: supEmail,
      phone: supPhone,
      address: supAddress,
    });

    if (success) {
      setSupMsg("Supplier added successfully!");
      setSupName("");
      setSupEmail("");
      setSupPhone("");
      setSupAddress("");
      setTimeout(() => setSupMsg(""), 3000);
    } else {
      setSupMsg("Failed to register supplier.");
      setTimeout(() => setSupMsg(""), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Supplier Register Form left */}
      <div className="lg:col-span-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs h-fit">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="h-4.5 w-4.5 text-indigo-600" />
          Onboard Hardware Vendor
        </h3>
        <form onSubmit={handleRegisterSupplier} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Vendor Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dell authorized Pakistan"
              value={supName}
              onChange={(e) => setSupName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Official Email</label>
            <input
              type="email"
              placeholder="wholesale@dell.com"
              value={supEmail}
              onChange={(e) => setSupEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Inquiry Phone</label>
            <input
              type="text"
              placeholder="+92-51-1234567"
              value={supPhone}
              onChange={(e) => setSupPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Corporate Address</label>
            <textarea
              placeholder="Rawalpindi Commercial Corridor"
              rows={2}
              value={supAddress}
              onChange={(e) => setSupAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-900 font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Truck className="h-4 w-4" />
            Add Vendor Profile
          </button>
          {supMsg && (
            <p className="text-xs text-center text-emerald-600 font-bold bg-emerald-55 py-1.5 rounded-lg border border-emerald-100">
              {supMsg}
            </p>
          )}
        </form>
      </div>

      {/* Suppliers Table Right */}
      <div className="lg:col-span-8 rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">
          Contracted University Suppliers List
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="rounded-xl border border-gray-100 bg-slate-50/50 p-4 space-y-3 shadow-xs hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{sup.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">ID: {sup.id}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-gray-600 border-t border-gray-200/50 pt-2.5">
                <p className="flex items-center gap-1">
                  <span className="font-bold text-gray-400">Email:</span> {sup.email || "N/A"}
                </p>
                <p className="flex items-center gap-1">
                  <span className="font-bold text-gray-400">Phone:</span> {sup.phone || "N/A"}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-red-500 shrink-0" /> {sup.address || "No office recorded"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
