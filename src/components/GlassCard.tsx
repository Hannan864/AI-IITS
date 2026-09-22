import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  key?: React.Key;
  id?: string;
}

export default function GlassCard({ children, hoverable = false, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-card bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-5 shadow-xl transition-all duration-300 ${
        hoverable ? "hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-indigo-505/5 hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
