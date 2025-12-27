
import { SafeZone, IncidentData, Guard, TimeData } from './types';

export const HYDERABAD_CAMPUSES = [
  { id: 'klh', name: 'KLH University Bachupally', lat: 17.5365, lng: 78.3756 },
  { id: 'ou', name: 'Osmania University', lat: 17.4139, lng: 78.5285 },
  { id: 'jntu', name: 'JNTU Hyderabad', lat: 17.4933, lng: 78.3915 },
  { id: 'uoh', name: 'University of Hyderabad', lat: 17.4583, lng: 78.3315 }
];

export const SAFE_ZONES: (SafeZone & { camId?: string })[] = [
  {
    id: 'sz1',
    name: 'KLH Main Gate',
    type: 'Security',
    location: { lat: 17.5365, lng: 78.3756 },
    description: '24/7 Main entry security checkpoint.',
    camId: 'cam1'
  },
  {
    id: 'sz2',
    name: 'KLH Health Center',
    type: 'Medical',
    location: { lat: 17.5370, lng: 78.3760 },
    description: 'Campus clinic with ambulance on standby.',
    camId: 'cam3'
  },
  {
    id: 'sz3',
    name: 'Admin Block Atrium',
    type: 'Lighted',
    location: { lat: 17.5360, lng: 78.3750 },
    description: 'Central hub with maximum surveillance.',
    camId: 'cam2'
  },
  {
    id: 'sz4',
    name: 'Girls Hostel Secure Zone',
    type: 'Hostel',
    location: { lat: 17.5355, lng: 78.3745 },
    description: 'Secure biometric access hostel area.'
  }
];

export const HELPLINES = [
  { category: 'Immediate Emergency', icon: '🚨', items: [
    { name: 'Police Emergency', phone: '100', subtitle: 'Standard local police dispatch' },
    { name: 'Medical Help', phone: '108', subtitle: 'Ambulance & Trauma response' },
    { name: 'Fire Department', phone: '101', subtitle: 'Fire & rescue services' }
  ]},
  { category: 'KLH Campus Support', icon: '🏫', items: [
    { name: 'KLH Security Desk', phone: '+91 40 4567 8901', subtitle: '24/7 Bachupally Command Room' },
    { name: 'Student Welfare Cell', phone: '+91 40 4567 8902', subtitle: 'Internal safety & support' },
    { name: 'Bachupally Police', phone: '040 2785 2435', subtitle: 'Local Station' }
  ]},
  { category: 'Health & Wellness', icon: '🌱', items: [
    { name: 'Counseling Service', phone: '+91 40 4567 8903', subtitle: 'Mental health support' },
    { name: 'Night Escort', phone: 'Ext #9', subtitle: 'Safe transit request after hours' }
  ]}
];

export const HEATMAP_DATA: IncidentData[] = [
  { location: 'Academic Block B', count: 12 },
  { location: 'Hostel Road', count: 8 },
  { location: 'Parking Zone 2', count: 5 },
  { location: 'Ground Perimeter', count: 2 },
  { location: 'Canteen Corridor', count: 7 }
];

export const GUARDS: Guard[] = [
  { id: 'G01', name: 'Suresh Kumar', status: 'Patrolling', zone: 'Hostel Block', battery: 88, lastSync: '2 mins ago' },
  { id: 'G02', name: 'Mohammed Ali', status: 'Responding', zone: 'Admin Block', battery: 42, lastSync: 'Just now' },
  { id: 'G03', name: 'Vikram Singh', status: 'Stationary', zone: 'Main Gate', battery: 100, lastSync: '15 mins ago' },
  { id: 'G04', name: 'Anjali Reddy', status: 'Patrolling', zone: 'Library Annex', battery: 95, lastSync: '5 mins ago' },
];

export const HOURLY_DATA: TimeData[] = [
  { hour: '00:00', incidents: 2 },
  { hour: '04:00', incidents: 1 },
  { hour: '08:00', incidents: 3 },
  { hour: '12:00', incidents: 5 },
  { hour: '16:00', incidents: 8 },
  { hour: '20:00', incidents: 14 },
  { hour: '22:00', incidents: 10 },
];

export const CAMPUS_FEEDS = [
  { 
    id: 'cam1', 
    name: 'Bachupally Main Gate', 
    status: 'High Activity', 
    image: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800',
    safeScore: 98
  },
  { 
    id: 'cam2', 
    name: 'KLH Admin Atrium', 
    status: 'Low Activity', 
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
    safeScore: 100
  },
  { 
    id: 'cam3', 
    name: 'Engineering Block A', 
    status: 'Moderate Activity', 
    image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=800',
    safeScore: 92
  },
  { 
    id: 'cam4', 
    name: 'Hostel Courtyard', 
    status: 'Secured', 
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    safeScore: 95
  }
];
