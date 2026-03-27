"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ShieldAlert, Users, Activity, Lock, Unlock, UserCheck, Shield, MonitorSmartphone, MapPin, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ users: 0, alerts: 0, locked: 0 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, alertsRes, timelineRes, logsRes] = await Promise.all([
          api.get("/users"),
          api.get("/admin/alerts"),
          api.get("/admin/timeline"),
          api.get("/admin/logs")
        ]);
        
        const users = usersRes.data;
        const alerts = alertsRes.data;
        
        setStats({
          users: users.length,
          alerts: alerts.filter((a: any) => !a.resolved).length,
          locked: users.filter((u: any) => !u.is_active).length,
        });
        
        // Extract Mugshots
        setAlertsList(alerts.filter((a: any) => a.capture_image && !a.resolved));

        // Parse real backend timeline data
        const timelineData = new Map();
        for(let i=11; i>=0; i--) {
          const d = new Date(); 
          d.setHours(d.getHours() - i);
          timelineData.set(d.getHours(), { time: `${String(d.getHours()).padStart(2, '0')}:00`, events: 0, threats: 0 });
        }
        
        timelineRes.data.logs.forEach((r: any) => {
          const h = new Date(r.time).getHours();
          if (timelineData.has(h)) timelineData.get(h).events += parseInt(r.count);
        });
        
        timelineRes.data.alerts.forEach((r: any) => {
          const h = new Date(r.time).getHours();
          if (timelineData.has(h)) timelineData.get(h).threats += parseInt(r.count);
        });

        setChartData(Array.from(timelineData.values()));
        setLiveLogs(logsRes.data);

      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="font-medium animate-pulse">Initializing Zero-Trust Visualizations...</span>
    </div>
  );

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const childVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const getBaselineStatus = (alert: any) => {
    const severity = String(alert?.severity || "").toUpperCase();
    if (severity === "HIGH") return { label: "Critical Deviation", className: "bg-red-500/15 text-red-400 border-red-500/30" };
    if (severity === "MEDIUM") return { label: "Deviating", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    return { label: "Baseline OK", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  };

  const getLatestLogForAlert = (alert: any) => {
    if (!alert) return null;
    const byEmail = liveLogs.find((l: any) => l.email && alert.email && l.email === alert.email);
    return byEmail || liveLogs[0] || null;
  };

  const getUserRiskTimeline = (alert: any, max = 8) => {
    if (!alert?.email) return [];
    return liveLogs.filter((l: any) => l.email === alert.email).slice(0, max);
  };

  const handleQuarantine = async (alert: any) => {
    try {
      if (!alert?.user_id) return;
      await api.post(`/admin/lock/${alert.user_id}`);
    } catch (err) {
      console.error("Failed to lock user", err);
    }
  };

  const handleUnlock = async (alert: any) => {
    try {
      if (!alert?.user_id) return;
      await api.post(`/admin/unlock/${alert.user_id}`);
    } catch (err) {
      console.error("Failed to unlock user", err);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      
      <div className="flex items-center justify-between">
        <motion.h1 variants={childVariants} className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
          Platform Overview
        </motion.h1>
        <motion.div variants={childVariants} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <span className="text-emerald-400 text-sm font-semibold tracking-wide">AI Engine Online</span>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <motion.div variants={childVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group cursor-pointer transition-all duration-300">
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Monitored Users</p>
              <h3 className="text-4xl font-bold text-white tracking-tight">{stats.users}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={childVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-900 border border-orange-500/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(249,115,22,0.1)] relative overflow-hidden group cursor-pointer transition-all duration-300">
          <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500/20 transition-colors shadow-[inset_0_0_20px_rgba(249,115,22,0.2)]">
              <ShieldAlert className="w-7 h-7 text-orange-400" />
            </div>
            <div>
              <p className="text-orange-400/80 text-sm font-medium uppercase tracking-wider mb-1">Active Anomalies</p>
              <h3 className="text-4xl font-bold text-white tracking-tight">{stats.alerts}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={childVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group cursor-pointer transition-all duration-300">
          <div className="absolute -inset-1 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors">
              <Activity className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Locked Accounts</p>
              <h3 className="text-4xl font-bold text-red-500 tracking-tight">{stats.locked}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={childVariants} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <h2 className="text-xl font-bold text-white mb-6 tracking-wide flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" /> Live Threat Trajectory
        </h2>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} 
                itemStyle={{ fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
              <Area type="monotone" dataKey="threats" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorThreats)" activeDot={{ r: 8, strokeWidth: 0, fill: '#f97316', className: 'animate-pulse' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Endpoint Telemetry Log Feed */}
        <motion.div variants={childVariants} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <h2 className="text-xl font-bold text-white mb-6 tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Live Endpoint Telemetry
          </h2>
          <div className="h-64 overflow-y-auto space-y-3 pr-2 telemetry-scroll">
            {liveLogs.map((log: any, i: number) => (
              <div key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center gap-3 w-1/3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse shrink-0" />
                    <span className="text-blue-400 font-mono font-bold truncate">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-6 text-slate-400 font-mono text-xs w-2/3 justify-end">
                    <span className="truncate max-w-[150px]">{log.email}</span>
                    <span className="px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">{log.ip_address}</span>
                    <span className="text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
              </div>
            ))}
            {liveLogs.length === 0 && (
              <div className="text-slate-500 text-center py-10 font-mono text-sm">Waiting for incoming telemetry events...</div>
            )}
          </div>
        </motion.div>

        {/* Covert Security Camera Feed */}
        <motion.div variants={childVariants} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <h2 className="text-xl font-bold text-white mb-6 tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Active Intruder Imagery
          </h2>
          <div className="grid grid-cols-2 gap-4 h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {alertsList.map((alert: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveIncident(alert);
                  }}
                  className="bg-slate-950 rounded-xl border border-red-500/30 overflow-hidden relative group h-32 shadow-inner text-left"
                >
                  <img src={alert.capture_image} alt="Intruder" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-950 flex flex-col justify-end to-transparent p-2 pt-8">
                      <p className="text-red-400 font-mono text-[11px] font-bold truncate drop-shadow-md">{alert.email}</p>
                      <p className="text-slate-300 font-mono text-[9px] drop-shadow-md">{new Date(alert.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className={`absolute top-2 left-2 px-2 py-1 text-[9px] uppercase font-bold border rounded-md ${getBaselineStatus(alert).className}`}>
                    {getBaselineStatus(alert).label}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse" />
                </button>
            ))}
            {alertsList.length === 0 && (
                <div className="col-span-2 flex items-center justify-center text-slate-600 text-center py-10 font-mono text-sm border-2 border-dashed border-slate-800 rounded-xl">
                  No visual threat imagery confirmed...
                </div>
            )}
          </div>
        </motion.div>
      </div>

      {activeIncident && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setActiveIncident(null);
            }}
          />
          <div className="ml-auto h-full w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl relative z-10 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Incident Response</p>
                <h3 className="text-xl font-bold text-white truncate">{activeIncident.email}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveIncident(null);
                }}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="rounded-2xl overflow-hidden border border-red-500/30">
                <img src={activeIncident.capture_image} alt="Intruder" className="w-full object-cover" />
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs uppercase">Baseline</span>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold border rounded-md ${getBaselineStatus(activeIncident).className}`}>
                    {getBaselineStatus(activeIncident).label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Shield className="w-4 h-4 text-orange-400" />
                  Severity: {String(activeIncident.severity || "UNKNOWN").toUpperCase()}
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Captured: {new Date(activeIncident.created_at).toLocaleString()}
                </div>
              </div>

              {(() => {
                const log = getLatestLogForAlert(activeIncident);
                return (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Device Fingerprint</p>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <MonitorSmartphone className="w-4 h-4 text-emerald-400" />
                      {log?.user_agent || "Unknown device"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      {log?.ip_address || "Unknown IP"}
                    </div>
                  </div>
                );
              })()}

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs uppercase text-slate-500 font-semibold">Risk Timeline</p>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1 telemetry-scroll">
                  {getUserRiskTimeline(activeIncident).map((log: any, idx: number) => (
                    <div key={`${log.id || log.created_at}-${idx}`} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
                      <span className="font-mono truncate max-w-[180px]">{log.action}</span>
                      <span className="text-slate-500 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  {getUserRiskTimeline(activeIncident).length === 0 && (
                    <div className="text-slate-500 text-xs font-mono">No recent events for this user.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuarantine(activeIncident)}
                  className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                >
                  <Lock className="w-4 h-4" /> Quarantine
                </button>
                <button
                  onClick={() => handleUnlock(activeIncident)}
                  className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                  <Unlock className="w-4 h-4" /> Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
