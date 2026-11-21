export interface PrimaryFlightDisplayData {
  pitch: number; // degrees, -30 to +30
  bank: number; // roll degrees, -60 to +60
  heading: number; // 0 to 359
  airspeed: number; // knots
  altitude: number; // feet
  verticalSpeed: number; // fpm
  throttle: number; // 0 to 100%
  flaps: number; // 0, 15, 30, 40 degrees
  gearDown: boolean;
  brakesActive: boolean;
  glideslopeDev: number; // -2 to +2 dots
  localizerDev: number; // -2 to +2 dots
}

export type SimulatorAircraftModel = 'c172' | 'b737' | 'a380';

export interface LandingResult {
  score: number; // 0 - 100
  rating: 'BUTTER SMOOTH' | 'EXCELLENT' | 'ACCEPTABLE' | 'HARD TOUCHDOWN' | 'RUNWAY EXCURSION / CRASH' | 'GO-AROUND';
  touchdownFpm: number;
  touchdownSpeedKts: number;
  centerlineOffsetM: number;
  feedback: string;
}
