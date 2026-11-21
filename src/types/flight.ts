export type FlightStatus = 
  | 'On Time'
  | 'Boarding'
  | 'Final Call'
  | 'Departed'
  | 'En Route'
  | 'Approaching'
  | 'Landed'
  | 'Delayed'
  | 'Cancelled'
  | 'Emergency';

export type FlightType = 'arrival' | 'departure' | 'enroute';

export interface Flight {
  id: string;
  flightNumber: string;
  callsign: string;
  airline: string;
  airlineCode: string;
  aircraftType: string;
  aircraftRegistration: string;
  origin: {
    city: string;
    code: string;
    airportName: string;
    country: string;
  };
  destination: {
    city: string;
    code: string;
    airportName: string;
    country: string;
  };
  type: FlightType;
  scheduledTime: string; // HH:MM
  estimatedTime: string; // HH:MM
  status: FlightStatus;
  terminal: string; // 'A', 'B', 'C'
  gate: string; // e.g. 'A7', 'B3'
  runway?: string; // e.g. '09L', '27R'
  altitude: number; // in feet (e.g. 35000 or 2400)
  groundSpeed: number; // in knots (e.g. 460 or 145)
  heading: number; // 0-360 degrees
  verticalSpeed: number; // feet per minute (-800, 0, +1500)
  squawk: string; // e.g. '4721'
  position: {
    x: number; // percentage on radar canvas (0 to 100)
    y: number; // percentage on radar canvas (0 to 100)
  };
  targetPosition?: {
    x: number;
    y: number;
  };
  pathHistory: Array<{ x: number; y: number }>;
  isCustom?: boolean;
  emergencyType?: string;
  delayReason?: string;
  passengers?: number;
}
