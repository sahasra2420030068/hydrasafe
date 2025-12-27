
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bell, Search, Map as MapIcon, Users, Settings, Filter, 
  CheckCircle, Clock, AlertCircle, TrendingUp, Radio, 
  Download, ShieldAlert, Zap, Battery, MapPin, ChevronRight,
  ExternalLink, Navigation, Info, UserCheck, X, ShieldCheck,
  Camera, MessageSquare, Phone, Send, Loader2, Shield, LogOut
} from 'lucide-react';
import { SOSAlert, AlertStatus, EmergencyType, Guard } from '../types';
import { HEATMAP_DATA, SAFE_ZONES, GUARDS, HOURLY_DATA } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, PieChart, Pie
} from 'recharts';

interface SecurityDashboardProps {
  alerts: SOSAlert[];
  onUpdateStatus: (id: string, status: AlertStatus) => void;
  onAssignGuard: (alertId: string, guardId: string) => void;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ alerts, onUpdateStatus, onAssignGuard }) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'history' | 'analytics' | 'guards'>('monitor');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(alerts.find(a => a.status !== AlertStatus.RESOLVED)?.id || null);
  const [historySearch, setHistorySearch] = useState('');
  const [showAssignOverlay, setShowAssignOverlay] = useState(false);
  
  // New States for enabled buttons
  const [commsGuard, setCommsGuard] = useState<Guard | null>(null);
  const [patrolStatus, setPatrolStatus] = useState<string | null>(null);
  const [isPatrolling, setIsPatrolling] = useState(false);

  const selectedAlert = useMemo(() => 
    alerts.find(a => a.id === selectedAlertId) || null,
  [alerts, selectedAlertId]);

  const stats = useMemo(() => ({
    active: alerts.filter(a => a.status !== AlertStatus.RESOLVED).length,
    resolvedToday: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
    avgResponse: '4m 12s'
  }), [alerts]);

  const filteredHistory = useMemo(() => {
    return alerts.filter(a => 
      a.studentName.toLowerCase().includes(historySearch.toLowerCase()) ||
      a.type.toLowerCase().includes(historySearch.toLowerCase())
    );
  }, [alerts, historySearch]);

  const pieData = useMemo(() => {
    const types = Object.values(EmergencyType);
    return types.map(t => ({
      name: t,
      value: alerts.filter(a => a.type === t).length || Math.floor(Math.random() * 5) + 1
    }));
  }, [alerts]);

  const getMockAddress = (lat: number, lng: number) => {
    if (lat > 17.5365) return "Near Academic Block A, KLH University Bachupally";
    if (lat < 17.5360) return "Beside Girls Hostel Area, KLH Bachupally";
    return "Main Library Walkway, Central Campus, KLH Bachupally";
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const getAssignedGuard = (guardId?: string): Guard | undefined => {
    return GUARDS.find(g => g.id === guardId);
  };

  const handleForcePatrol = () => {
    setIsPatrolling(true);
    setPatrolStatus("TRANSMITTING PATROL VECTORS...");
    setTimeout(() => {
      setPatrolStatus("ALL KLH UNITS ACKNOWLEDGED. SECTOR SWEEP INITIATED.");
      setTimeout(() => {
        setPatrolStatus(null);
        setIsPatrolling(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Nav */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-900/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase italic">HYDERSAFE</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'monitor', icon: MapIcon, label: 'Live Monitor' },
            { id: 'history', icon: Clock, label: 'Incident History' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
            { id: 'guards', icon: Users, label: 'Guard Patrols' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-400/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bachupally HQ</p>
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-green-400">KLH-SEC-1 TERMINAL ACTIVE</span>
           </div>
        </div>
      </aside>

      {/* Main Board */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 px-8 flex items-center justify-between z-10">
           <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 w-96">
             <Search className="w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search Bachupally incidents..." 
               className="bg-transparent border-none outline-none text-sm px-3 w-full text-slate-200 placeholder:text-slate-600" 
             />
           </div>
           
           <div className="flex items-center space-x-6">
              <div className="relative cursor-pointer hover:bg-slate-800 p-2 rounded-full transition-colors">
                <Bell className="w-6 h-6 text-slate-400" />
                {stats.active > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[8px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
                    {stats.active}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 border-l border-slate-800 pl-6">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-100">Commander Raghav</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Bachupally Lead</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                  CR
                </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {activeTab === 'monitor' && (
            <div className="flex h-full">
              {/* Strategic Map Placeholder */}
              <div className="flex-1 bg-slate-950 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px]"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <div className="text-center opacity-10 grayscale hover:grayscale-0 transition-all duration-700">
                      <MapIcon className="w-48 h-48 mx-auto mb-6 text-indigo-500" />
                      <p className="text-4xl font-black text-indigo-400 tracking-[0.2em]">KLH BACHUPALLY</p>
                    </div>
                 </div>

                 {/* Active SOS Markers */}
                 {alerts.filter(a => a.status !== AlertStatus.RESOLVED).map(alert => (
                   <div key={alert.id} className="absolute" style={{ top: '45%', left: '55%' }}>
                      <div className={`w-20 h-20 rounded-full animate-ping absolute -inset-6 ${alert.status === AlertStatus.DISPATCHED ? 'bg-indigo-600/30' : 'bg-red-600/30'}`}></div>
                      <div 
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-2xl z-10 relative cursor-pointer transition-all ${
                          alert.status === AlertStatus.DISPATCHED ? 'bg-indigo-600 scale-110' : 'bg-red-600 scale-125'
                        }`} 
                        onClick={() => setSelectedAlertId(alert.id)}
                      >
                        <AlertCircle className="w-7 h-7 text-white" />
                      </div>
                   </div>
                 ))}

                 {/* Legend */}
                 <div className="absolute bottom-8 left-8 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-3 shadow-2xl">
                    <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">New Alert</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,1)]"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Security Dispatched</span>
                    </div>
                 </div>
              </div>

              {/* Monitor Control SidePanel */}
              <div className="w-[440px] bg-slate-950 border-l border-slate-800 flex flex-col relative shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
                  <h3 className="font-black flex items-center space-x-2 text-slate-100 uppercase tracking-widest text-xs">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    <span>Live KLH Incident Feed</span>
                  </h3>
                  <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 font-black text-[9px] uppercase tracking-tighter">
                    {stats.active} Emergency
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {alerts.filter(a => a.status !== AlertStatus.RESOLVED).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                       <ShieldCheck className="w-16 h-16 mb-4 text-green-400" />
                       <p className="text-sm font-black uppercase tracking-widest">KLH SECURE</p>
                       <p className="text-[10px] font-bold mt-1">Zero pending alerts</p>
                    </div>
                  ) : alerts.filter(a => a.status !== AlertStatus.RESOLVED).map(alert => (
                    <div 
                      key={alert.id}
                      onClick={() => { setSelectedAlertId(alert.id); setShowAssignOverlay(false); }}
                      className={`group p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${
                        selectedAlert?.id === alert.id 
                          ? 'bg-indigo-600/10 border-indigo-600 shadow-2xl translate-x-[-4px]' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {alert.status === AlertStatus.ACTIVE && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-2xl ${alert.status === AlertStatus.ACTIVE ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-slate-100 tracking-tight">{alert.studentName}</h4>
                            <p className="text-[10px] text-slate-500 font-bold tracking-widest">#{alert.studentId}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-600 bg-slate-800 px-2 py-1 rounded">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-5">
                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                           alert.type === EmergencyType.MEDICAL ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {alert.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                           alert.status === AlertStatus.ACTIVE ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {alert.status}
                        </span>
                      </div>

                      {selectedAlert?.id === alert.id && (
                        <div className="space-y-4 border-t border-slate-800/50 pt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="bg-slate-950/50 rounded-2xl p-4 space-y-4 border border-slate-800">
                             <div className="flex items-start space-x-3">
                                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Incident Vicinity</p>
                                   <p className="text-xs font-bold text-slate-200">{getMockAddress(alert.location.lat, alert.location.lng)}</p>
                                </div>
                             </div>
                             {alert.assignedGuardId && (
                               <div className="flex items-center space-x-3 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                                 <UserCheck className="w-4 h-4 text-indigo-400" />
                                 <div className="flex-1">
                                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Bachupally Responder</p>
                                   <p className="text-sm font-black text-white">{getAssignedGuard(alert.assignedGuardId)?.name}</p>
                                 </div>
                                 <Radio className="w-4 h-4 text-indigo-500 animate-pulse" />
                               </div>
                             )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <button 
                               onClick={(e) => { e.stopPropagation(); openInGoogleMaps(alert.location.lat, alert.location.lng); }}
                               className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all border border-slate-700"
                             >
                               <ExternalLink className="w-3.5 h-3.5" />
                               <span>CAMPUS MAP</span>
                             </button>
                             {!alert.assignedGuardId ? (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setShowAssignOverlay(true); }}
                                 className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-900/40 border border-indigo-500"
                               >
                                 <Users className="w-3.5 h-3.5" />
                                 <span>ASSIGN GUARD</span>
                               </button>
                             ) : (
                               <button 
                                 className="bg-slate-800/50 text-slate-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border border-slate-700 cursor-not-allowed"
                               >
                                 <CheckCircle className="w-3.5 h-3.5" />
                                 <span>DISPATCHED</span>
                               </button>
                             )}
                             <button 
                               onClick={(e) => { e.stopPropagation(); onUpdateStatus(alert.id, AlertStatus.RESOLVED); }}
                               className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-900/20 border border-green-500"
                             >
                               MARK AS RESOLVED
                             </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Assignment Modal Overlay */}
                {showAssignOverlay && selectedAlert && (
                  <div className="absolute inset-0 z-20 bg-slate-950/98 p-8 animate-in slide-in-from-right duration-300 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-8">
                      <div className="space-y-1">
                        <h4 className="font-black text-xl text-white tracking-tight flex items-center space-x-2">
                          <Users className="w-6 h-6 text-indigo-400" />
                          <span>ASSIGN DISPATCH</span>
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select KLH responder for {selectedAlert.studentName}</p>
                      </div>
                      <button onClick={() => setShowAssignOverlay(false)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto max-h-[80%] pr-2 scrollbar-hide">
                      {GUARDS.map(guard => (
                        <div 
                          key={guard.id}
                          onClick={() => {
                            onAssignGuard(selectedAlert.id, guard.id);
                            setShowAssignOverlay(false);
                          }}
                          className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] ${
                            guard.status === 'Patrolling' 
                              ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/5' 
                              : 'bg-slate-900/20 border-slate-900 opacity-40 pointer-events-none'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center font-black text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                              {guard.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-100">{guard.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{guard.zone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em]">{guard.status}</div>
                             <div className="flex items-center space-x-1.5 justify-end mt-2">
                               <span className="text-[10px] font-black text-slate-600">{guard.battery}%</span>
                               <Battery className={`w-3.5 h-3.5 ${guard.battery < 50 ? 'text-red-500' : 'text-slate-700'}`} />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guards' && (
            <div className="h-full p-8 space-y-8 overflow-y-auto scrollbar-hide relative">
              {/* Force Patrol Toast/Notification */}
              {patrolStatus && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl border-2 border-indigo-400 flex items-center space-x-4 animate-in slide-in-from-top duration-300">
                  {isPatrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                  <span className="font-black text-xs uppercase tracking-[0.1em]">{patrolStatus}</span>
                </div>
              )}

              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Bachupally Active Patrols</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Personnel Monitoring & Sector Deployment</p>
                </div>
                <div className="flex space-x-3">
                   <button 
                    onClick={handleForcePatrol}
                    disabled={isPatrolling}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 border border-indigo-500 active:scale-95 disabled:opacity-50"
                   >
                     {isPatrolling ? 'TRANSMITTING...' : 'Force Sector Patrol'}
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {GUARDS.map(guard => (
                  <div key={guard.id} className="bg-slate-800/30 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col group hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300">
                    <div className="p-7 space-y-7">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-indigo-400 group-hover:scale-110 transition-transform">
                            {guard.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-100 tracking-tight">{guard.name}</h4>
                            <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">{guard.id}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                          guard.status === 'Responding' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {guard.status}
                        </div>
                      </div>

                      <div className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Zone</span>
                          <span className="text-xs font-bold text-slate-300">{guard.zone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Terminal Power</span>
                          <div className="flex items-center space-x-2">
                             <span className={`text-xs font-black ${guard.battery < 50 ? 'text-red-400' : 'text-green-400'}`}>{guard.battery}%</span>
                             <Battery className={`w-3.5 h-3.5 ${guard.battery < 50 ? 'text-red-400' : 'text-green-400'}`} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>LIVE SYNC: {guard.lastSync}</span>
                        </span>
                        <MapPin className="w-4 h-4 text-indigo-500" />
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setCommsGuard(guard)}
                      className="w-full bg-slate-800/80 hover:bg-indigo-600 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all text-slate-400 hover:text-white border-t border-slate-700 active:scale-[0.98]"
                    >
                      Open Direct Comms
                    </button>
                  </div>
                ))}
              </div>

              {/* Comms Modal */}
              {commsGuard && (
                <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                   <div className="w-full max-w-lg bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
                      <div className="p-8 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                         <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-900/40">
                               {commsGuard.name.charAt(0)}
                            </div>
                            <div>
                               <h3 className="text-xl font-black tracking-tight">{commsGuard.name}</h3>
                               <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Bachupally Link Secure</span>
                               </div>
                            </div>
                         </div>
                         <button 
                          onClick={() => setCommsGuard(null)}
                          className="p-3 bg-slate-800 rounded-full hover:bg-red-500 transition-colors text-slate-400 hover:text-white"
                         >
                            <X className="w-6 h-6" />
                         </button>
                      </div>

                      <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]">
                         <div className="flex justify-center">
                            <span className="text-[10px] font-black text-slate-600 bg-slate-800/50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-700/50">Tactical Channel Encrypted (KLH-AUTH)</span>
                         </div>

                         <div className="flex flex-col items-start space-y-2">
                            <div className="bg-slate-800 p-4 rounded-3xl rounded-tl-none max-w-[80%] border border-slate-700 shadow-sm">
                               <p className="text-sm font-medium text-slate-200">Guard {commsGuard.id} reporting from KLH Bachupally sector. Currently positioned at {commsGuard.zone}. All quiet on this patrol.</p>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 ml-2 uppercase">Guard {commsGuard.id} • 14:02</span>
                         </div>

                         <div className="flex flex-col items-end space-y-2">
                            <div className="bg-indigo-600 p-4 rounded-3xl rounded-tr-none max-w-[80%] shadow-lg shadow-indigo-900/20 border border-indigo-500">
                               <p className="text-sm font-black text-white tracking-tight">Understood. Increase patrol frequency around Engineering Block A. High risk window approaching.</p>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 mr-2 uppercase">KLH HQ • JUST NOW</span>
                         </div>

                         <div className="flex justify-center py-4">
                            <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-500/5 px-4 py-2 rounded-2xl border border-indigo-500/10">
                               <Loader2 className="w-3 h-3 animate-spin" />
                               <span className="text-[9px] font-black uppercase tracking-widest">{commsGuard.name} is typing...</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 bg-slate-950/50 border-t border-slate-800 space-y-6">
                         <div className="flex items-center space-x-4 bg-slate-900 border border-slate-700 rounded-3xl p-2 pl-6 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                            <input 
                              type="text" 
                              placeholder="Type Bachupally instruction..." 
                              className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-slate-600"
                            />
                            <button className="bg-indigo-600 p-3 rounded-2xl text-white hover:bg-indigo-500 transition-colors">
                               <Send className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                              <button className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors">
                                 <Phone className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Secure Call</span>
                              </button>
                              <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-400 transition-colors">
                                 <Radio className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">KLH Radio</span>
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => setCommsGuard(null)}
                              className="w-full flex items-center justify-center space-x-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-4 rounded-2xl border border-red-500/20 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-900/10 active:scale-95"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Terminate Secure Session</span>
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="h-full p-8 space-y-6 overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Bachupally Archives</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Audit log of KLH Bachupally security incidents</p>
                </div>
                <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-700">
                  <Download className="w-4 h-4" />
                  <span>Download Audit Log</span>
                </button>
              </div>

              <div className="bg-slate-800/30 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search KLH history by name, ID or incident type..." 
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                    />
                  </div>
                  <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-900/30 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-8 py-5">Ref ID</th>
                      <th className="px-8 py-5">Reporter</th>
                      <th className="px-8 py-5">Responder</th>
                      <th className="px-8 py-5">Category</th>
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5">Final Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredHistory.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-5 text-xs font-mono text-slate-500 uppercase">#{alert.id}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-white border border-slate-700">{alert.studentName.charAt(0)}</div>
                            <div>
                                <div className="text-xs font-black text-slate-200">{alert.studentName}</div>
                                <div className="text-[10px] font-bold text-slate-500">ID: {alert.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {alert.assignedGuardId ? (
                            <div className="flex items-center space-x-2 text-indigo-400">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{getAssignedGuard(alert.assignedGuardId)?.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Self-Resolved</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">{alert.type}</span>
                        </td>
                        <td className="px-8 py-5 text-xs text-slate-400 font-bold">
                          {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-3">
                             <div className={`w-2 h-2 rounded-full ${alert.status === AlertStatus.RESOLVED ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                             <span className="text-[10px] font-black uppercase tracking-widest">{alert.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="h-full p-8 space-y-8 overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">KLH Risk Analytics</h2>
                <div className="bg-slate-800 p-1.5 rounded-2xl flex border border-slate-700 shadow-xl">
                  {['24H', '7D', '30D'].map(range => (
                    <button key={range} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${range === '24H' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: 'Total Deployments', value: alerts.length + 142, icon: AlertCircle, color: 'indigo', trend: '+12%' },
                  { label: 'Mean Response Time', value: '3m 52s', icon: Clock, color: 'green', trend: '-22%' },
                  { label: 'Visual Locate Hits', value: '48', icon: Camera, color: 'amber', trend: '+10%' },
                  { label: 'Dispatch Accuracy', value: '98.4%', icon: Zap, color: 'rose', trend: 'Stable' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-800/40 border border-slate-800 p-7 rounded-[2rem] space-y-5 group hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-center">
                      <div className={`p-3 bg-${s.color}-500/10 text-${s.color}-400 rounded-2xl border border-${s.color}-500/20`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${s.trend.startsWith('+') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {s.trend}
                      </span>
                    </div>
                    <div>
                      <p className="text-4xl font-black text-white tracking-tighter">{s.value}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 pb-8">
                <div className="col-span-2 bg-slate-800/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-xl text-white uppercase italic">Bachupally Risk Density</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Incident frequency mapped against campus clock</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={HOURLY_DATA}>
                        <defs>
                          <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="hour" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
                          cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                        />
                        <Area type="monotone" dataKey="incidents" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorInc)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-8">
                  <h3 className="font-black text-xl text-white uppercase italic text-center">KLH Emergency Load</h3>
                  <div className="h-72 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={10}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'][i % 5] }}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SecurityDashboard;
