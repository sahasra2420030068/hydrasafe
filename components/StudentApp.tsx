
import { 
  Shield, MapPin, Settings, AlertTriangle, Phone, Activity, Heart, 
  EyeOff, Navigation, Camera, LayoutGrid, Users, ChevronRight, 
  Search, Radio, Compass, MessageCircle, ExternalLink, X, Scan, 
  Loader2, Zap, User, Bell, Clock, Info
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { SOSAlert, AlertStatus, EmergencyType, GeoLocation } from '../types';
import { SAFE_ZONES, CAMPUS_FEEDS, HELPLINES } from '../constants';
import { getSafetyGuidance, identifyLocationFromImage } from '../services/geminiService';

interface StudentAppProps {
  onSOS: (alert: SOSAlert) => void;
  isAlerting: boolean;
  setIsAlerting: (val: boolean) => void;
}

const StudentApp: React.FC<StudentAppProps> = ({ onSOS, isAlerting, setIsAlerting }) => {
  const [activeTab, setActiveTab] = useState<'sos' | 'webview' | 'zones' | 'helpline'>('sos');
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [sosProgress, setSosProgress] = useState(0);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>(EmergencyType.SECURITY);
  const [silentMode, setSilentMode] = useState(false);
  const [safetyTips, setSafetyTips] = useState<string>("");
  const [loadingTips, setLoadingTips] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [aiLocationResult, setAiLocationResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setLocation({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy 
        }),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setAiLocationResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const captureAndIdentify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessingImage(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      const result = await identifyLocationFromImage(base64Data, "KLH University Bachupally");
      setAiLocationResult(result);
    }
    setIsProcessingImage(false);
  };

  const startSOSLongPress = () => {
    setSosProgress(0);
    timerRef.current = setInterval(() => {
      setSosProgress((prev) => {
        if (prev >= 100) {
          triggerSOS();
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const cancelSOSLongPress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (sosProgress < 100) setSosProgress(0);
  };

  const triggerSOS = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const alert: SOSAlert = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: 'Rahul Sharma',
      studentId: 'CS2024-042',
      type: emergencyType,
      location: location || { lat: 17.5365, lng: 78.3756 },
      timestamp: new Date().toISOString(),
      status: AlertStatus.ACTIVE,
      silentMode: silentMode
    };

    onSOS(alert);
    setLoadingTips(true);
    const tips = await getSafetyGuidance(emergencyType, "KLH University Bachupally");
    setSafetyTips(tips || "");
    setLoadingTips(false);
  };

  const renderSOSView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Visual Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-slate-800 flex items-center justify-between">
         <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
               <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
               <h3 className="font-black text-slate-100 tracking-tight">PROTECT MODE</h3>
               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Bachupally Network Active</p>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentTime}</p>
            <div className="flex items-center space-x-1">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase">Secure</span>
            </div>
         </div>
      </div>

      {/* SOS Center */}
      <div className="flex flex-col items-center justify-center py-6 relative">
        <div className="relative group">
          <div 
            className={`w-72 h-72 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 
              ${isAlerting ? 'sos-pulse bg-red-600 scale-105' : 'bg-gradient-to-br from-red-500 to-rose-600 cursor-pointer shadow-2xl shadow-red-900/50 active:scale-95'}`}
            onMouseDown={startSOSLongPress}
            onMouseUp={cancelSOSLongPress}
            onTouchStart={startSOSLongPress}
            onTouchEnd={cancelSOSLongPress}
          >
            {/* Liquid Fill Visual */}
            {sosProgress > 0 && sosProgress < 100 && (
              <div 
                className="absolute inset-0 rounded-full bg-white/20 transition-all duration-150" 
                style={{ clipPath: `inset(${100 - sosProgress}% 0 0 0)` }}
              ></div>
            )}
            
            {sosProgress > 0 && sosProgress < 100 && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="144" cy="144" r="136" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <circle cx="144" cy="144" r="136" fill="transparent" stroke="white" strokeWidth="12" strokeDasharray={854} strokeDashoffset={854 - (854 * sosProgress) / 100} strokeLinecap="round" className="transition-all duration-150" />
              </svg>
            )}

            <div className="text-center text-white relative z-20">
              <h3 className="text-6xl font-black tracking-tighter drop-shadow-lg">SOS</h3>
              <div className="h-0.5 w-12 bg-white/40 mx-auto my-3 rounded-full"></div>
              <p className="text-[10px] font-black tracking-[0.2em] opacity-90">
                {isAlerting ? 'BROADCASTING...' : (sosProgress > 0 ? 'HOLD TIGHT' : 'HOLD TO ALERT')}
              </p>
            </div>
          </div>
          
          {/* Ambient Glows */}
          <div className={`absolute -inset-10 rounded-full blur-3xl opacity-20 -z-10 transition-colors duration-500 ${isAlerting ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 group-hover:bg-red-600'}`}></div>
          <div className="absolute -inset-16 rounded-full border-2 border-indigo-500/20 -z-20 animate-[spin_20s_linear_infinite]"></div>
        </div>
      </div>

      {/* Emergency Config Cards */}
      {!isAlerting && (
        <div className="grid grid-cols-2 gap-4">
           {/* Visual Locate Toggle */}
           <button 
              onClick={startCamera}
              className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col space-y-3 active:scale-95 transition-all group"
           >
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <Scan className="w-5 h-5" />
              </div>
              <div className="text-left">
                 <h4 className="font-black text-xs text-slate-100 uppercase tracking-wide">Visual Locate</h4>
                 <p className="text-[9px] text-slate-500 font-bold">Landmark ID</p>
              </div>
           </button>

           {/* Silent Mode Toggle */}
           <button 
              onClick={() => setSilentMode(!silentMode)}
              className={`p-5 rounded-[2rem] border shadow-xl flex flex-col space-y-3 active:scale-95 transition-all ${
                silentMode ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-900/50 border-slate-800'
              }`}
           >
              <div className={`p-3 rounded-2xl w-fit ${
                silentMode ? 'bg-indigo-500 text-white' : 'bg-rose-500/10 text-rose-500'
              }`}>
                 {silentMode ? <EyeOff className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </div>
              <div className="text-left">
                 <h4 className={`font-black text-xs uppercase tracking-wide ${silentMode ? 'text-indigo-400' : 'text-slate-100'}`}>
                    {silentMode ? 'Stealth ON' : 'Stealth OFF'}
                 </h4>
                 <p className="text-[9px] text-slate-500 font-bold">Silent Tracking</p>
              </div>
           </button>
        </div>
      )}

      {/* Category Picker */}
      {!isAlerting && (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-6 border border-slate-800 shadow-xl">
           <div className="flex justify-between items-center mb-5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Emergency Type</h4>
              <Info className="w-3.5 h-3.5 text-slate-600" />
           </div>
           <div className="grid grid-cols-4 gap-3">
              {[
                { type: EmergencyType.SECURITY, icon: Shield, color: 'indigo' },
                { type: EmergencyType.MEDICAL, icon: Heart, color: 'rose' },
                { type: EmergencyType.HARASSMENT, icon: Zap, color: 'amber' },
                { type: EmergencyType.UNSAFE, icon: AlertTriangle, color: 'orange' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setEmergencyType(item.type)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border ${
                    emergencyType === item.type 
                      ? `border-${item.color}-500 bg-${item.color}-500/10 scale-105 shadow-lg` 
                      : 'border-transparent hover:bg-slate-800'
                  }`}
                >
                  <item.icon className={`w-6 h-6 mb-2 ${emergencyType === item.type ? `text-${item.color}-400` : 'text-slate-600'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-tighter text-center ${emergencyType === item.type ? 'text-slate-100' : 'text-slate-500'}`}>
                    {item.type.split(' ')[0]}
                  </span>
                </button>
              ))}
           </div>
        </div>
      )}

      {/* AI Guidance in Active Mode */}
      {isAlerting && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-500 rounded-xl">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Bachupally AI Response</h4>
          </div>
          {loadingTips ? (
            <div className="space-y-3">
              <div className="h-3 bg-white/10 rounded-full animate-pulse w-full"></div>
              <div className="h-3 bg-white/10 rounded-full animate-pulse w-5/6"></div>
              <div className="h-3 bg-white/10 rounded-full animate-pulse w-4/6"></div>
            </div>
          ) : (
            <div className="text-indigo-100/80 text-xs leading-relaxed font-medium space-y-4">
              {safetyTips.split('\n').map((tip, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0">{i+1}</span>
                  <p>{tip.replace(/^\d+\.\s*/, '')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderWebView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="px-1 flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-100 tracking-tighter">Live Surveillance</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>4 Active Bachupally Feeds</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {CAMPUS_FEEDS.map(feed => (
          <div key={feed.id} className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 group">
             <div className="relative aspect-[16/10] overflow-hidden">
                <img src={feed.image} alt={feed.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                
                {/* Visual Artifacts */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                  <div className="bg-red-600 px-3 py-1 rounded-full text-[9px] font-black text-white shadow-lg animate-pulse">REC</div>
                  <div className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest">{feed.id}</div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                   <div className="space-y-1">
                     <h4 className="text-xl font-black text-white tracking-tight leading-none">{feed.name}</h4>
                     <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.1em]">{feed.status}</p>
                   </div>
                   <div className="flex flex-col items-end">
                     <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1 rounded-full text-[9px] font-black text-green-400 mb-1">98% SECURE</div>
                     <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{currentTime}</p>
                   </div>
                </div>
             </div>
             <div className="p-6 flex justify-between items-center">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                       <User className="w-4 h-4 text-slate-600" />
                     </div>
                   ))}
                   <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400">+12</div>
                </div>
                <div className="flex items-center space-x-3">
                   <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700">
                      <Users className="w-3.5 h-3.5" />
                      <span>Log</span>
                   </button>
                   <button 
                      onClick={() => setActiveTab('zones')}
                      className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-900/40 active:scale-95 transition-all"
                   >
                      <MapPin className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderZonesView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="px-1 flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-100 tracking-tighter">Safety Radar</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bachupally Emergency Points</p>
        </div>
        <div className="bg-indigo-500/10 px-4 py-1 rounded-full border border-indigo-500/20 text-[10px] font-black text-indigo-400">NEARBY: 4</div>
      </div>

      {/* Radar Visual */}
      <div className="bg-slate-900 aspect-[1/1.1] rounded-[3.5rem] shadow-2xl relative overflow-hidden flex items-center justify-center border-8 border-slate-800 group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
        
        {/* Radar Rings */}
        {[80, 60, 40, 20].map((size, idx) => (
          <div key={idx} className="absolute border border-indigo-500/5 rounded-full" style={{ width: `${size}%`, height: `${size}%` }}></div>
        ))}
        
        {/* Sweep */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 animate-[spin_5s_linear_infinite] origin-center"></div>

        <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center relative z-20 shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
           <Zap className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>

        {SAFE_ZONES.map((zone, i) => (
          <div 
            key={zone.id} 
            onClick={() => setHighlightedZone(zone.id)}
            className={`absolute transition-all duration-500 hover:scale-125 cursor-pointer z-30 ${highlightedZone === zone.id ? 'scale-125 z-40' : ''}`}
            style={{ 
              top: `${20 + (i % 2) * 45}%`, 
              left: `${15 + i * 22}%` 
            }}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-slate-950 shadow-2xl transition-all ${
              highlightedZone === zone.id ? 'ring-8 ring-indigo-500/20 scale-110' : ''
            } ${
              zone.type === 'Security' ? 'bg-indigo-600' : zone.type === 'Medical' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              {zone.type === 'Security' ? <Shield className="w-6 h-6 text-white" /> : <MapPin className="w-6 h-6 text-white" />}
            </div>
          </div>
        ))}
      </div>

      {/* Zone Detail Cards */}
      <div className="space-y-4">
        {SAFE_ZONES.map(zone => (
          <div 
            key={zone.id} 
            className={`bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border transition-all flex items-center justify-between group ${
              highlightedZone === zone.id ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-indigo-900/40' : 'border-slate-800'
            }`}
            onClick={() => setHighlightedZone(zone.id)}
          >
            <div className="flex items-center space-x-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                 zone.type === 'Security' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {zone.type === 'Security' ? <Shield className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
              </div>
              <div>
                <h4 className="font-black text-slate-100 text-sm tracking-tight">{zone.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{Math.floor(Math.random() * 500) + 100}m • 2 MIN</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => { e.stopPropagation(); openInGoogleMaps(zone.location.lat, zone.location.lng); }}
                className="p-3.5 bg-slate-800 text-slate-400 rounded-2xl border border-slate-700 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHelplineView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="px-1 space-y-1">
        <h2 className="text-3xl font-black text-slate-100 tracking-tighter">Emergency Hub</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Bachupally Helplines</p>
      </div>

      {/* Global Search */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Search for a department..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold shadow-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600 text-slate-100"
        />
      </div>

      {/* Category Sections */}
      <div className="space-y-10">
        {HELPLINES.map((category, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center space-x-3 px-1">
               <span className="text-xl">{category.icon}</span>
               <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">{category.category}</h3>
               <div className="flex-1 h-px bg-slate-800 ml-4"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {category.items.map((item, i) => (
                <a 
                  key={i} 
                  href={`tel:${item.phone}`}
                  className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-slate-800 flex items-center justify-between active:scale-[0.98] transition-all group hover:border-indigo-500/30"
                >
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-slate-800 group-hover:bg-indigo-500/10 rounded-2xl flex items-center justify-center font-black text-slate-500 group-hover:text-indigo-400 transition-colors">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-100 text-sm tracking-tight">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Card */}
      <div className="bg-indigo-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/50 group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="relative z-10 space-y-5">
           <div className="flex justify-between items-center">
              <div className="p-3 bg-white/20 rounded-2xl">
                 <Radio className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.2em] border border-white/20 px-3 py-1 rounded-full">Secure Link Active</span>
           </div>
           <div>
              <h4 className="text-2xl font-black tracking-tight">Anonymous Report</h4>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed mt-2">Submit high-priority safety intelligence to campus security without revealing your identity.</p>
           </div>
           <button className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-transform">
              Initiate Secure Drop
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto w-full flex flex-col h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-100">
      {/* Dynamic Header */}
      {!isAlerting && (
        <header className="p-6 pb-2 flex justify-between items-center bg-transparent sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" alt="User" />
            </div>
            <div>
              <h1 className="font-black text-slate-100 text-sm tracking-tight">Rahul Sharma</h1>
              <div className="flex items-center space-x-1">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">KLH-BACHUPALLY</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button className="p-3 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 text-slate-500 hover:text-indigo-400 transition-colors">
               <Bell className="w-5 h-5" />
             </button>
             <button className="p-3 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 text-slate-500 hover:text-indigo-400 transition-colors">
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 pt-2 overflow-y-auto scrollbar-hide pb-32">
        {activeTab === 'sos' && renderSOSView()}
        {activeTab === 'webview' && renderWebView()}
        {activeTab === 'zones' && renderZonesView()}
        {activeTab === 'helpline' && renderHelplineView()}
      </div>

      {/* Modern Floating Bottom Nav */}
      {!isAlerting && (
        <div className="fixed bottom-8 left-6 right-6 z-40">
           <nav className="bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-3 shadow-2xl flex items-center justify-between border border-white/5">
              <button 
                onClick={() => setActiveTab('sos')}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 transition-all rounded-3xl ${activeTab === 'sos' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Zap className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-widest">Safe</span>
              </button>
              <button 
                onClick={() => setActiveTab('webview')}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 transition-all rounded-3xl ${activeTab === 'webview' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-widest">Live</span>
              </button>
              <button 
                onClick={() => setActiveTab('zones')}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 transition-all rounded-3xl ${activeTab === 'zones' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <MapPin className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-widest">Hubs</span>
              </button>
              <button 
                onClick={() => setActiveTab('helpline')}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 transition-all rounded-3xl ${activeTab === 'helpline' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Phone className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-widest">Help</span>
              </button>
           </nav>
        </div>
      )}

      {/* Visual Locate / Camera Modal */}
      {isCameraOpen && (
        <div className="absolute inset-0 z-[60] bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-300">
           <div className="p-8 flex justify-between items-center bg-slate-950/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                 </div>
                 <h2 className="text-white font-black text-lg tracking-tight uppercase italic">Visual Locate</h2>
              </div>
              <button 
                onClick={stopCamera}
                className="p-3 bg-white/10 hover:bg-red-500 rounded-2xl text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
           </div>
           
           <div className="flex-1 relative flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scan Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div className="w-64 h-64 border-2 border-indigo-500/50 rounded-[3rem] relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl"></div>
                    
                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-[scan_2s_linear_infinite]"></div>
                 </div>
              </div>
              
              {isProcessingImage && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <Loader2 className="w-20 h-20 text-indigo-500 animate-spin" />
                    <Zap className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black uppercase tracking-[0.3em] text-sm mb-2">Analyzing Vectors</p>
                    <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">KLH Bachupally Geospatial Engine</p>
                  </div>
                </div>
              )}
           </div>

           {/* Results Layer */}
           {aiLocationResult && (
             <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
                <div className="bg-slate-900 p-8 rounded-[3rem] animate-in slide-in-from-bottom duration-500 shadow-2xl space-y-6 border border-slate-800">
                   <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                         <MapPin className="w-5 h-5" />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Identified</h4>
                   </div>
                   <p className="text-lg font-black text-slate-100 leading-tight">{aiLocationResult}</p>
                   <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          const landmark = aiLocationResult.split('.')[0].replace('Landmark:', '').trim();
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(landmark + " KLH University Bachupally")}`, '_blank');
                        }}
                        className="flex-1 bg-indigo-600 text-white py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-900/40 active:scale-95 transition-all"
                      >
                        Navigate
                      </button>
                      <button 
                        onClick={stopCamera}
                        className="flex-1 bg-slate-800 text-slate-400 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Dismiss
                      </button>
                   </div>
                </div>
             </div>
           )}

           {!aiLocationResult && !isProcessingImage && (
             <div className="p-8 pb-12 bg-slate-950 space-y-6">
                <button 
                  onClick={captureAndIdentify}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-indigo-900/40 flex items-center justify-center space-x-4 active:scale-95 transition-transform"
                >
                  <Scan className="w-6 h-6" />
                  <span>IDENTIFY LOCATION</span>
                </button>
                <div className="flex items-center justify-center space-x-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                   <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Instant ID</span>
                   </div>
                   <div className="flex items-center space-x-2">
                      <Activity className="w-3.5 h-3.5" />
                      <span>98% Accuracy</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* SOS Active Modal */}
      {isAlerting && (
        <div className="absolute inset-0 z-50 bg-red-600 text-white flex flex-col overflow-y-auto animate-in fade-in duration-500">
          {/* Header */}
          <div className="p-8 flex justify-between items-center border-b border-white/10 bg-red-700/50 backdrop-blur-md sticky top-0 z-10">
             <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-white" />
                <h2 className="text-xl font-black tracking-tight italic">ALERT BROADCASTING</h2>
             </div>
             <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black">ENCRYPTED</span>
             </div>
          </div>

          <div className="flex-1 p-8 space-y-8 pb-32">
             {/* Center Visual */}
             <div className="flex flex-col items-center py-10 space-y-6">
                <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center animate-ping relative">
                  <AlertTriangle className="w-20 h-20 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Emergency Category</p>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">{emergencyType}</h3>
                </div>
             </div>

             {/* Status Cards */}
             <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Response Status</p>
                      <h4 className="text-sm font-black">KLH Bachupally Dispatched</h4>
                    </div>
                  </div>
                  <div className="bg-white text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">ETA 2:14</div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-[2.5rem] border border-white/10 flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                     <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Dispatcher Note</p>
                    <h4 className="text-sm font-bold">Stay in location. Rescue team moving.</h4>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-[2.5rem] border border-white/10 flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                     <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">GPS Coordinates</p>
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-mono">{location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</h4>
                       <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded">±{location?.accuracy?.toFixed(0)}m</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Action Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-red-700 to-transparent">
             <button 
              onClick={() => setIsAlerting(false)}
              className="w-full bg-white text-red-600 py-6 rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 transition-transform"
            >
              I AM SAFE NOW
            </button>
            <p className="text-center text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mt-4">Only end if security is on-site</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default StudentApp;
