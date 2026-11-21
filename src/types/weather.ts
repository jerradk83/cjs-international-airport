export type WeatherScenario = 
  | 'clear'
  | 'rain'
  | 'fog'
  | 'snow'
  | 'thunderstorm'
  | 'crosswind'
  | 'severe';

export type FlightRules = 'VFR' | 'MVFR' | 'IFR' | 'LIFR';

export interface WeatherData {
  scenario: WeatherScenario;
  scenarioName: string;
  temperatureC: number;
  temperatureF: number;
  dewPointC: number;
  windDirectionDeg: number;
  windSpeedKts: number;
  windGustKts: number;
  visibilityMiles: number;
  ceilingFt: number; // Cloud base altitude
  barometerInHg: number; // e.g. 29.92
  barometerHpa: number; // e.g. 1013
  humidityPercent: number;
  flightRules: FlightRules;
  rawMetar: string;
  decodedNotes: string[];
  runwayCondition: 'Dry' | 'Wet' | 'Standing Water' | 'Snow / Slush' | 'Icy';
  activeRunways: string[];
  operationalImpact: string;
}
