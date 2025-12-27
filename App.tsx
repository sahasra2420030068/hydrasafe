
import React, { useState, useEffect, useCallback } from 'react';
import { set,get,ref, onValue } from "firebase/database";
import { db } from "./firebase";

import StudentApp from './components/StudentApp';
import SecurityDashboard from './components/SecurityDashboard';
import SplashScreen from './components/SplashScreen';
import { SOSAlert, AlertStatus, EmergencyType } from './types';

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [view, setView] = useState<'student' | 'security'>('student');
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isAlerting, setIsAlerting] = useState(false);

  // Mock initial alerts
  useEffect(() => {
  const testRef = ref(db, "firebase_test");

  set(testRef, {
    status: "connected",
    time: Date.now(),
  }).then(() => {
    console.log("✅ Firebase WRITE success");
  }).catch((err) => {
    console.error("❌ Firebase WRITE failed", err);
  });

  get(testRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("✅ Firebase READ success:", snapshot.val());
      } else {
        console.log("❌ No data found in Firebase");
      }
    })
    .catch((err) => {
      console.error("❌ Firebase READ failed", err);
    });
}, []);



  const handleSOS = useCallback((alert: SOSAlert) => {
    const newAlerts = [alert, ...alerts];
    setAlerts(newAlerts);
    localStorage.setItem('hyder_safe_alerts', JSON.stringify(newAlerts));
    setIsAlerting(true);
  }, [alerts]);

  const updateAlertStatus = (id: string, status: AlertStatus) => {
    const newAlerts = alerts.map(a => a.id === id ? { ...a, status } : a);
    setAlerts(newAlerts);
    localStorage.setItem('hyder_safe_alerts', JSON.stringify(newAlerts));
  };

  const handleAssignGuard = (alertId: string, guardId: string) => {
    const newAlerts = alerts.map(a => 
      a.id === alertId 
        ? { ...a, status: AlertStatus.DISPATCHED, assignedGuardId: guardId } 
        : a
    );
    setAlerts(newAlerts);
    localStorage.setItem('hyder_safe_alerts', JSON.stringify(newAlerts));
  };

  if (isBooting) {
    return <SplashScreen onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 animate-in fade-in duration-700`}>
      {/* Role Switcher */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2 bg-slate-900/50 backdrop-blur shadow-2xl p-1 rounded-full border border-slate-800">
        <button 
          onClick={() => setView('student')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'student' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:bg-slate-800'}`}
        >
          Student
        </button>
        <button 
          onClick={() => setView('security')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:bg-slate-800'}`}
        >
          Security
        </button>
      </div>

      <main className="flex-1 flex flex-col">
        {view === 'student' ? (
          <StudentApp onSOS={handleSOS} isAlerting={isAlerting} setIsAlerting={setIsAlerting} />
        ) : (
          <SecurityDashboard alerts={alerts} onUpdateStatus={updateAlertStatus} onAssignGuard={handleAssignGuard} />
        )}
      </main>
    </div>
  );
};

export default App;
