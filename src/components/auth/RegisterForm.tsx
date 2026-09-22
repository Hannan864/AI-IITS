import React, { useState, useMemo } from "react";
import { User, Mail, Lock, Landmark, Calendar } from "lucide-react";
import { DEPARTMENTS } from "../../data/mockData";
import { RegistrationSchema, RegistrationData, checkPasswordStrength } from "../../lib/validation";
import { z } from "zod";

interface RegisterFormProps {
  onRegisterSubmit: (
    name: string,
    email: string,
    password: string,
    role: "Admin" | "Store Manager" | "Faculty" | "Visiting Faculty",
    department: string,
    facultyType: "Permanent" | "Visiting" | "N/A",
    contractEndDate: string | null
  ) => Promise<boolean>;
  authLoading: boolean;
  onSuccess: () => void;
}

export default function RegisterForm({
  onRegisterSubmit,
  authLoading,
  onSuccess,
}: RegisterFormProps) {
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"Admin" | "Store Manager" | "Faculty">("Faculty");
  const [regDept, setRegDept] = useState("Computer Science");
  const [regFacultyType, setRegFacultyType] = useState<"Permanent" | "Visiting">("Permanent");
  const [regEndDate, setRegEndDate] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = useMemo(() => checkPasswordStrength(regPassword), [regPassword]);

  const handleRegisterSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fType = regRole === "Faculty" ? regFacultyType : "N/A";
    const cDate = regRole === "Faculty" && regFacultyType === "Visiting" ? regEndDate || null : null;
    const mappedRole = regRole === "Faculty" && regFacultyType === "Visiting" ? ("Visiting Faculty" as const) : regRole;

    const data: RegistrationData = {
      name: regName,
      email: regEmail,
      password: regPassword,
      role: mappedRole,
      department: regDept,
      facultyType: fType,
      contractEndDate: cDate,
    };

    const result = RegistrationSchema.safeParse(data);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    const ok = await onRegisterSubmit(regName, regEmail, regPassword, mappedRole, regDept, fType, cDate);
    if (ok) {
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleRegisterSubmitForm} className="p-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <label className="block text-[9px] font-bold text-slate-400 uppercase">Full Name</label>
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className={`w-full pl-8 pr-2.5 py-1.5 bg-slate-950/50 border ${errors.name ? 'border-rose-500' : 'border-white/10'} rounded-lg text-xs text-white placeholder-slate-605 outline-none`}
            />
          </div>
          {errors.name && <p className="text-[9px] text-rose-500">{errors.name}</p>}
        </div>

        <div className="space-y-0.5">
          <label className="block text-[9px] font-bold text-slate-400 uppercase">IIUI Email</label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="email"
              placeholder="name@iiui.edu"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className={`w-full pl-8 pr-2.5 py-1.5 bg-slate-950/50 border ${errors.email ? 'border-rose-500' : 'border-white/10'} rounded-lg text-xs text-white placeholder-slate-605 outline-none`}
            />
          </div>
          {errors.email && <p className="text-[9px] text-rose-500">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-0.5">
        <label className="block text-[9px] font-bold text-slate-400 uppercase">Password</label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="password"
            placeholder="••••••••••••"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            className={`w-full pl-8 pr-2.5 py-1.5 bg-slate-950/50 border ${errors.password ? 'border-rose-500' : 'border-white/10'} rounded-lg text-xs text-white placeholder-slate-605 outline-none`}
          />
        </div>
        {/* Password Strength Indicator */}
        {regPassword && (
          <div className="space-y-1 mt-1">
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: `${passwordStrength.percent}%` }} />
            </div>
            <p className={`text-[9px] font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>
              Strength: {passwordStrength.strength}
            </p>
          </div>
        )}
        {errors.password && <p className="text-[9px] text-rose-500">{errors.password}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-[9px] font-bold text-slate-400 uppercase">Identity Role</label>
        <div className="grid grid-cols-1 gap-1.5 text-[10.5px]">
          {[
            { id: "Faculty", label: "🎓 Academic Faculty Member" },
            { id: "Store Manager", label: "🏢 Store / Inventory Manager" },
            { id: "Admin", label: "🛡️ System Administrator" },
          ].map((r) => {
            const isSelected = regRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegRole(r.id as any)}
                className={`w-full text-left p-1.5 px-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                  isSelected ? "bg-slate-950 border-indigo-500" : "bg-slate-950/20 border-white/5 opacity-80"
                }`}
              >
                <span>{r.label}</span>
                {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-550" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-0.5">
        <label className="block text-[9px] font-bold text-slate-400 uppercase">Department</label>
        <div className="relative">
          <Landmark className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <select
            value={regDept}
            onChange={(e) => setRegDept(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 text-slate-100 border border-white/10 rounded-lg text-xs outline-none"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
            <option value="Administration">Administration Sector</option>
          </select>
        </div>
      </div>

      {regRole === "Faculty" && (
        <div className="p-2.5 bg-indigo-950/15 border border-indigo-550/10 rounded-xl space-y-2">
          <div className="space-y-0.5">
            <span className="block text-[9px] font-bold text-indigo-300 uppercase">Employment Type</span>
            <div className="flex gap-4 text-xs mt-0.5 font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  checked={regFacultyType === "Permanent"}
                  onChange={() => setRegFacultyType("Permanent")}
                  className="accent-indigo-500 text-xs"
                />
                <span>Permanent</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  checked={regFacultyType === "Visiting"}
                  onChange={() => setRegFacultyType("Visiting")}
                  className="accent-indigo-500 text-xs"
                />
                <span className="text-amber-400">Visiting</span>
              </label>
            </div>
          </div>

          {regFacultyType === "Visiting" && (
            <div className="space-y-0.5 animate-fade-in text-[10.5px]">
              <label className="block text-[8.5px] font-bold text-amber-300 uppercase flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Contract End Date
              </label>
              <input
                type="date"
                required
                value={regEndDate}
                onChange={(e) => setRegEndDate(e.target.value)}
                className="w-full bg-slate-950 px-2 py-1 border border-white/10 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={authLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-805/50 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer shadow-indigo-600/10 shadow-lg"
      >
        {authLoading ? "Submitting..." : "Register Account"}
      </button>
    </form>
  );
}
