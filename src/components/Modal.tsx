import React, { useEffect } from "react";
import { X } from "lucide-react";
import ActionButton from "./ActionButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footerActions }: ModalProps) {
  // Listen for Escape hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Clicking the backdrop exits the modal */}
      <div
        className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      {/* Frame Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col max-h-[85vh]">
        
        {/* Header Block */}
        <header className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight uppercase tracking-wider">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin text-xs text-slate-300 space-y-4">
          {children}
        </div>

        {/* Optional Action Controls Footer */}
        {footerActions && (
          <footer className="px-6 py-4 border-t border-white/5 bg-slate-950/40 flex items-center justify-end gap-2.5">
            {footerActions}
          </footer>
        )}
      </div>
    </div>
  );
}
