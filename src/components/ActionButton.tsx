import React from "react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  loading?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function ActionButton({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}: ActionButtonProps) {
  const baseStyle =
    "min-h-9 px-4.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-indigo-650 hover:bg-indigo-700 text-white border border-indigo-500/10 shadow-sm",
    secondary: "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/10",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/10 shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/10 shadow-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : null}
      {children}
    </button>
  );
}
