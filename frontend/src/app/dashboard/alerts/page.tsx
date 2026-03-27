"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ShieldAlert, AlertCircle, Clock, Activity, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get("/admin/alerts");
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === "ACTIVE" && a.resolved) return false;
    if (statusFilter === "RESOLVED" && !a.resolved) return false;
    if (search && !a.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 tracking-tight flex items-center gap-4">
          <ShieldAlert className="w-10 h-10 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
          Security Alerts
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by user email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm w-full font-medium"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm appearance-none cursor-pointer font-medium"
            >
              <option value="ALL">All Alerts</option>
              <option value="ACTIVE">Active Quarantine</option>
              <option value="RESOLVED">Resolved Threats</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredAlerts.map((alert, i) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-3xl border flex items-start gap-6 transition-all duration-300 relative overflow-hidden group ${
              !alert.resolved 
                ? 'bg-orange-500/5 border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.25)]' 
                : 'bg-slate-900 border-slate-800 opacity-70'
            }`}
          >
            {!alert.resolved && <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
            
            <div className={`p-4 rounded-2xl relative z-10 shadow-lg ${!alert.resolved ? 'bg-orange-500/20 text-orange-500 ring-2 ring-orange-500/30' : 'bg-slate-800 text-slate-500'}`}>
              <AlertCircle className={`w-8 h-8 ${!alert.resolved ? 'animate-pulse' : ''}`} />
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-2xl font-black tracking-tight ${!alert.resolved ? 'text-orange-400' : 'text-slate-400'}`}>
                  HIGH Severity Anomaly Caught
                </h3>
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800 shadow-inner">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
              
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                The machine learning profile detected highly anomalous behavior from <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shadow-sm mx-1">{alert.email}</span>. Immediate zero-trust lockout execution was triggered to quarantine the risk.
              </p>

              {alert.reasons && (
                <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 shadow-inner">
                  <div className="text-slate-400 mb-3 font-semibold text-sm tracking-widest uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" /> Isolation Forest Vectors:
                  </div>
                  <ul className="space-y-2">
                    {JSON.parse(alert.reasons).map((reason: string, idx: number) => (
                      <li key={idx} className="text-red-400/90 font-mono text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {filteredAlerts.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-16 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5" />
            <ShieldAlert className="w-16 h-16 text-emerald-500/50 mx-auto mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-emerald-400 relative z-10 tracking-tight">Perimeter Secure</h3>
            <p className="text-slate-400 mt-2 relative z-10 text-lg">No alerts match your current search filters.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
