
import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, Radio, Lock } from 'lucide-react';

const BOOT_MESSAGES = [
  "Initializing Bachupally Safety Node...",
  "Establishing Secure Handshake...",
  "Syncing KLH Surveillance Mesh...",
  "Loading Tactical Map Overlays...",
  "Authenticating Guard Terminals...",
  "System HyderSafe: ONLINE"
];

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const msgTimer = setInterval(() => {
      setMsgIdx(prev => (prev < BOOT_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full">
        {/* Animated Logo Container */}
        <div className="relative mb-12">
          <div className="absolute -inset-4 bg-indigo-600 rounded-[2rem] blur-xl opacity-20 animate-pulse"></div>
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-900/50 border border-indigo-400/30 relative">
            <ShieldAlert className="w-12 h-12 text-white" />
            
            {/* Orbital Rings */}
            <div className="absolute -inset-3 border border-indigo-500/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute -inset-6 border border-indigo-500/10 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mb-16 space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">HyderSafe</h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Campus Security Protocol</p>
        </div>

        {/* Boot Logs */}
        <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-indigo-400">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">{BOOT_MESSAGES[msgIdx]}</span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <div className="flex items-center space-x-1.5">
               <Lock className="w-3 h-3" />
               <span>SSL: AES-256</span>
            </div>
            <div className="flex items-center space-x-1.5">
               <Radio className="w-3 h-3 animate-ping" />
               <span>KLH-U Mesh</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
           <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Bachupally Operational HQ</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
