export interface AirportEquipment {
  id: string;
  name: string;
  category: 'ground_handling' | 'safety' | 'deicing' | 'passenger';
  cost: number;
  maintenancePerDay: number;
  count: number;
  efficiencyBonus: number;
  description: string;
  icon: string;
}

export interface GateAssignment {
  id: string;
  terminal: 'A' | 'B' | 'C';
  gateNumber: string;
  supportedTypes: 'Narrowbody' | 'Widebody' | 'Regional';
  status: 'Occupied' | 'Available' | 'Maintenance';
  assignedFlightId?: string;
  currentAirline?: string;
  turnaroundTimerMins?: number;
}

export interface AirportDirectorState {
  funds: number; // CJ$
  dailyRevenue: number;
  dailyExpenses: number;
  passengerSatisfaction: number; // 0-100%
  airportReputationLevel: number; // 1-5
  efficiencyScore: number; // 0-100%
  safetyRating: number; // 0-100%
  passengersHandled: number;
  flightsServiced: number;
  unlockedTerminals: string[];
  equipment: AirportEquipment[];
  activeEvents: ManagementEvent[];
}

export interface ManagementEvent {
  id: string;
  title: string;
  description: string;
  type: 'emergency' | 'weather' | 'vip' | 'opportunity';
  options: {
    text: string;
    cost: number;
    satisfactionChange: number;
    safetyChange: number;
    efficiencyChange: number;
    outcomeText: string;
  }[];
}
