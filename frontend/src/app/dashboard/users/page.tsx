"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Lock, Unlock, ShieldAlert, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, SUSPENDED

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleLock = async (userId: string, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await api.post(`/admin/lock/${userId}`);
      } else {
        await api.post(`/admin/unlock/${userId}`);
      }
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle lock", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter === "ACTIVE" && !u.is_active) return false;
    if (statusFilter === "SUSPENDED" && u.is_active) return false;
    if (search && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
          Users Directory
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users by email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm w-full sm:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Users</option>
              <option value="SUSPENDED">Suspended Users</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-800/50 text-slate-300 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-8 py-5">Account</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">Zero-Trust Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredUsers.map((user, i) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1 + i * 0.05 }}
                key={user.id} 
                className="hover:bg-slate-800/40 transition-colors group"
              >
                <td className="px-8 py-5 font-medium text-white flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ${!user.is_active ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500/20' : 'bg-slate-800 text-slate-300'}`}>
                    {user.email.substring(0,2).toUpperCase()}
                  </div>
                  {user.email}
                </td>
                <td className="px-8 py-5">
                  <span className="bg-slate-800 text-slate-300 py-1.5 px-4 rounded-full text-xs font-medium border border-slate-700 shadow-sm">
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                  {user.is_active ? (
                    <span className="flex items-center text-emerald-400 gap-2 font-medium bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                      Safe / Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-500 gap-2 font-medium bg-red-500/10 w-fit px-3 py-1 rounded-full border border-red-500/20">
                      <ShieldAlert className="w-4 h-4" />
                      Suspended
                    </span>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleLock(user.id, user.is_active)}
                    className={`flex items-center gap-2 ml-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                      user.is_active 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                    }`}
                  >
                    {user.is_active ? <><Lock className="w-4 h-4" /> Lock Account</> : <><Unlock className="w-4 h-4" /> Restore Access</>}
                  </motion.button>
                </td>
              </motion.tr>
            ))}
            {filteredUsers.length === 0 && (
               <tr>
                <td colSpan={4} className="px-8 py-10 text-center text-slate-500">
                  <div className="bg-slate-900 p-6 rounded-xl inline-block border border-slate-800 mx-auto">
                    No users matching those filters found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
