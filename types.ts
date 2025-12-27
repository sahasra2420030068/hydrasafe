
export enum EmergencyType {
  HARASSMENT = 'Harassment',
  MEDICAL = 'Medical',
  SECURITY = 'Security Breach',
  FIRE = 'Fire Emergency',
  UNSAFE = 'Unsafe Feeling'
}

export enum AlertStatus {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  DISPATCHED = 'Security Dispatched'
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface SOSAlert {
  id: string;
  studentName: string;
  studentId: string;
  type: EmergencyType;
  location: GeoLocation;
  timestamp: string;
  status: AlertStatus;
  silentMode: boolean;
  assignedGuardId?: string;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'Security' | 'Medical' | 'Hostel' | 'Lighted';
  location: GeoLocation;
  description: string;
}

export interface IncidentData {
  location: string;
  count: number;
}

export interface Guard {
  id: string;
  name: string;
  status: 'Patrolling' | 'Responding' | 'Stationary';
  zone: string;
  battery: number;
  lastSync: string;
}

export interface TimeData {
  hour: string;
  incidents: number;
}
