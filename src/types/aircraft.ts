export interface AircraftSpecs {
  id: string;
  name: string;
  manufacturer: 'Boeing' | 'Airbus' | 'Cessna' | 'Piper' | 'Embraer' | 'Gulfstream';
  category: 'Commercial Widebody' | 'Commercial Narrowbody' | 'Regional Jet' | 'General Aviation' | 'Business Jet';
  passengerCapacity: number;
  wingspanMeters: number;
  wingspanFt: number;
  lengthMeters: number;
  lengthFt: number;
  cruisingSpeedKts: number;
  cruisingMach: number;
  maxRangeNm: number;
  maxTakeoffWeightLbs: number;
  serviceCeilingFt: number;
  engineCount: number;
  engineType: string;
  firstFlightYear: number;
  funFacts: string[];
  description: string;
  imagePlaceholderColor: string;
  silhouetteType: 'twin_wide' | 'quad_super' | 'twin_narrow' | 'single_prop' | 'twin_prop' | 'bizjet';
}
