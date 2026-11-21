export type AtcDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type AtcActionType = 
  | 'CLEAR_TAKEOFF'
  | 'HOLD_SHORT'
  | 'LINE_UP_WAIT'
  | 'CLEAR_LAND'
  | 'GO_AROUND'
  | 'TAXI_TO_GATE'
  | 'EXPEDITE_DESCENT'
  | 'REQUEST_INFO';

export interface AtcTransmission {
  id: string;
  timestamp: string;
  sender: 'TOWER' | 'PILOT' | 'SYSTEM' | 'APPROACH';
  callsign: string;
  message: string;
  type: 'info' | 'instruction' | 'readback' | 'warning' | 'alert';
}

export interface AtcTargetAircraft {
  id: string;
  flightNumber: string;
  callsign: string;
  airline: string;
  aircraftType: string;
  phase: 'pushback' | 'taxi_out' | 'holding_short' | 'takeoff_roll' | 'enroute' | 'inbound' | 'final_approach' | 'touchdown' | 'taxi_in' | 'go_around';
  assignedRunway: string;
  distanceNm: number;
  altitudeFt: number;
  speedKts: number;
  headingDeg: number;
  position: { x: number; y: number };
  fuelMins: number;
  isEmergency?: boolean;
  emergencyDescription?: string;
  pendingRequest?: string;
  validActions: AtcActionType[];
  statusText: string;
}

export interface AtcGameSession {
  score: number;
  successfulOperations: number;
  separationBreaches: number;
  difficulty: AtcDifficulty;
  streak: number;
  trafficLoad: number;
}
