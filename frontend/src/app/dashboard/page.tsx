"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ShieldAlert, Users, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ users: 0, alerts: 0, locked: 0 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, alertsRes, timelineRes] = await Promise.all([
          api.get("/users"),
          api.get("/admin/alerts"),
          api.get("/admin/timeline")
        ]);
        
        const users = usersRes.data;
        const alerts = alertsRes.data;
        
        setStats({
          users: users.length,
          alerts: alerts.filter((a: any) => !a.resolved).length,
          locked: users.filter((u: any) => !u.is_active).length,
        });

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
    </motion.div>
  );
}
