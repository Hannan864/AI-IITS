import React, { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { User } from "../../types";

interface UserAdmissionsTabProps {
  users: User[];
  departments: string[];
  onAddUser: (user: Partial<User>) => Promise<boolean>;
  onDeleteUser?: (id: string) => Promise<boolean>;
}

const QUICK_LOGIN_EMAILS = [
  "admin@iiui.edu",
  "manager@iiui.edu",
  "dr.tariq@iiui.edu",
  "prof.sohail@iiui.edu"
];

export default function UserAdmissionsTab({
  users,
  departments,
  onAddUser,
  onDeleteUser,
}: UserAdmissionsTabProps) {
  // User input states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<any>("Faculty");
  const [newUserDept, setNewUserDept] = useState("Computer Science");
  const [newUserFacultyType, setNewUserFacultyType] = useState<any>("Permanent");
  const [newUserContractEnd, setNewUserContractEnd] = useState("");
  const [userMsg, setUserMsg] = useState("");

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const payload = {
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
      facultyType: newUserRole.includes("Faculty") ? newUserFacultyType : "N/A",
      contractEndDate: newUserRole === "Visiting Faculty" ? newUserContractEnd : null,
    };

    const success = await onAddUser(payload);
    if (success) {
      setUserMsg("User registered successfully!");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserContractEnd("");
      setTimeout(() => setUserMsg(""), 3000);
    } else {
      setUserMsg("Failed to register. User email might be pre-registered.");
      setTimeout(() => setUserMsg(""), 3000);
    }
  };

  const filteredUsers = users.filter((usr) => {
    const matchesSearch =
      usr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || usr.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!onDeleteUser) return;
    if (window.confirm(`Are you sure you want to delete the user account for ${name}?`)) {
      const ok = await onDeleteUser(id);
      if (ok) {
        setUserMsg(`Account ${name} removed successfully.`);
        setTimeout(() => setUserMsg(""), 3000);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* New Admission Form Left */}
      <div className="lg:col-span-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs h-fit">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
          Register New Academic Staff
        </h3>
        <form onSubmit={handleRegisterUser} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Muhammad Yasir"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-950 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Official Email</label>
            <input
              type="email"
              required
              placeholder="yasir@iiui.edu"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-950 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">System Role</label>
              <select
                value={newUserRole}
                onChange={(e) => {
                  setNewUserRole(e.target.value);
                  if (e.target.value === "Store Manager") setNewUserDept("CS & SE Store");
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-2.5 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-950 font-bold bg-white"
              >
                <option value="Admin">Admin</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Faculty">Permanent Faculty</option>
                <option value="Visiting Faculty">Visiting Faculty</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Department</label>
              <select
                value={newUserDept}
                onChange={(e) => setNewUserDept(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-2.5 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-950 font-bold bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="CS & SE Store">CS & SE Store</option>
              </select>
            </div>
          </div>

          {newUserRole.includes("Faculty") && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Faculty Designation</label>
              <select
                value={newUserFacultyType}
                onChange={(e) => setNewUserFacultyType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 text-gray-950 font-bold bg-white"
              >
                <option value="Permanent">Permanent Grade</option>
                <option value="Visiting">Visiting / Contract basis</option>
              </select>
            </div>
          )}

          {newUserRole === "Visiting Faculty" && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200/50">
              <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wide">Contract End Date</label>
              <input
                type="date"
                required
                value={newUserContractEnd}
                onChange={(e) => setNewUserContractEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 py-1.5 px-3 text-xs focus:ring-2 focus:ring-indigo-505 bg-white text-gray-900 font-bold"
              />
              <span className="text-[9px] text-amber-700/80 mt-1 block">Critical for the smart clearing predictability metrics.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Register Staff Member
          </button>
          {userMsg && (
            <p className="text-xs text-center text-emerald-600 font-bold bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
              {userMsg}
            </p>
          )}
        </form>
      </div>

      {/* Users Ledger Table Right */}
      <div className="lg:col-span-8 rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
            Registered Core Staff Directory ({users.length})
          </h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-505 text-gray-950 font-medium"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-2 py-1 bg-white text-xs text-gray-700 focus:ring-1 focus:ring-indigo-505 font-bold"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Store Manager">Store Manager</option>
              <option value="Faculty">Faculty</option>
              <option value="Visiting Faculty">Visiting Faculty</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Staff Bio</th>
                <th className="px-4 py-3">Account Type</th>
                <th className="px-4 py-3">Access Level</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Tenure Status</th>
                <th className="px-4 py-3">Expiry Calendar</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredUsers.map((usr) => {
                const isQuickLogin = QUICK_LOGIN_EMAILS.includes(usr.email.toLowerCase());
                return (
                  <tr key={usr.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{usr.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{usr.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {isQuickLogin ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          ⚡ Quick Login
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          👤 Manual User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          usr.role === "Admin"
                            ? "bg-purple-100 text-purple-800"
                            : usr.role === "Store Manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-600">{usr.department}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold">{usr.facultyType}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {usr.contractEndDate ? (
                        <span className="font-mono text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          {usr.contractEndDate}
                        </span>
                      ) : (
                        <span className="text-gray-400">Continuous Tenure</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isQuickLogin ? (
                        <span className="text-[10px] text-gray-400 font-semibold italic">System Quick Login</span>
                      ) : (
                        onDeleteUser && (
                          <button
                            type="button"
                            onClick={() => handleDelete(usr.id, usr.name)}
                            className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-md font-bold transition-colors cursor-pointer text-[11px]"
                          >
                            Delete Account
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No matches found. Check spellings or create a new user card.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
