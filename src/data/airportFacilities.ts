export interface AirportFacility {
  id: string;
  name: string;
  category: 'runway' | 'terminal' | 'tower' | 'safety' | 'cargo' | 'maintenance' | 'fuel';
  shortCode: string;
  coordinates: { x: number; y: number; width?: number; height?: number };
  description: string;
  specifications: Record<string, string>;
  educationalFact: string;
  iconName: string;
}

export const AIRPORT_FACILITIES: AirportFacility[] = [
  {
    id: 'rwy-09l-27r',
    name: 'Runway 09L / 27R (North Primary)',
    category: 'runway',
    shortCode: '09L/27R',
    coordinates: { x: 50, y: 22, width: 70, height: 4 },
    description: 'The longest primary runway at CJIA, capable of handling fully loaded long-haul widebody aircraft like the Airbus A380 and Boeing 747-8 in all weather conditions.',
    specifications: {
      'Length': '11,800 ft (3,596 m)',
      'Width': '200 ft (60 m)',
      'Surface': 'Grooved Asphalt with Concrete Touchdown Zones',
      'ILS Category': 'CAT IIIb (Zero visibility autoland certified)',
      'Lighting': 'High Intensity Runway Lights (HIRL) & ALSF-2'
    },
    educationalFact: 'Runway numbers represent magnetic heading divided by 10! Runway 09 points due East (090°), and its reciprocal Runway 27 points due West (270°). The "L" stands for Left because CJIA has two parallel east-west runways!',
    iconName: 'Plane'
  },
  {
    id: 'rwy-09r-27l',
    name: 'Runway 09R / 27L (South Commercial)',
    category: 'runway',
    shortCode: '09R/27L',
    coordinates: { x: 50, y: 78, width: 62, height: 4 },
    description: 'The south parallel commercial runway, primarily dedicated to domestic departures, narrowbody arrivals, and cargo operations.',
    specifications: {
      'Length': '9,500 ft (2,895 m)',
      'Width': '150 ft (45 m)',
      'Surface': 'Engineered Porous Friction Asphalt',
      'ILS Category': 'CAT II Precision Instrument Approach',
      'Lighting': 'MALSR (Medium Intensity Approach Light System)'
    },
    educationalFact: 'Having parallel runways allows CJIA to land one aircraft while another takes off at the same time, doubling the airport\'s flight capacity!',
    iconName: 'Plane'
  },
  {
    id: 'rwy-18-36',
    name: 'Runway 18 / 36 (Crosswind & General Aviation)',
    category: 'runway',
    shortCode: '18/36',
    coordinates: { x: 22, y: 50, width: 4, height: 55 },
    description: 'The north-south crosswind runway. When strong cold fronts bring heavy winds from the north or south, this runway keeps CJIA operating safely.',
    specifications: {
      'Length': '7,200 ft (2,195 m)',
      'Width': '150 ft (45 m)',
      'Surface': 'Reinforced Concrete',
      'Primary Use': 'Crosswind Operations, GA, Flight Academy',
      'Lighting': 'MIRL & PAPI (4-light precision glide path indicator)'
    },
    educationalFact: 'Airplanes must take off and land into the wind to generate maximum lift at lower ground speeds. When winds blow perpendicular across the main runways, ATC directs traffic to Runway 18/36!',
    iconName: 'Compass'
  },
  {
    id: 'terminal-a',
    name: 'Terminal A (Domestic & CJ Air Flagship Hub)',
    category: 'terminal',
    shortCode: 'TERM-A',
    coordinates: { x: 45, y: 44, width: 14, height: 9 },
    description: 'The bustling domestic terminal with 12 gates (A1 to A12), equipped with glass boarding bridges, high-speed baggage sorting, and the CJ Aviation Kids Lounge.',
    specifications: {
      'Gates': '12 Gates (A1 - A12)',
      'Capacity': '15 Million passengers / year',
      'Main Airlines': 'CJ Air Domestic, Delta, American, United',
      'Special Features': 'Viewing Terrace, Automated People Mover'
    },
    educationalFact: 'Modern jet bridges are climate controlled and have sensitive optical sensors to gently seal against the airplane doorway without scratching the aircraft fuselage!',
    iconName: 'Building'
  },
  {
    id: 'terminal-b',
    name: 'Terminal B (International Concourse)',
    category: 'terminal',
    shortCode: 'TERM-B',
    coordinates: { x: 62, y: 44, width: 14, height: 9 },
    description: 'The international terminal featuring widebody dual-level boarding gates for superjumbos, US Customs & Border Protection inspection facilities, and VIP airline lounges.',
    specifications: {
      'Gates': '10 Widebody Gates (B1 - B10)',
      'A380 Compatible': 'Gate B1 & B3 (Upper Deck Jetbridges)',
      'Customs': '40 Automated Passport Control Kiosks',
      'International Carriers': 'British Airways, Lufthansa, Emirates, Japan Airlines'
    },
    educationalFact: 'Terminal B contains sterile international transit zones so passengers travelling between Europe and Asia can transfer flights without needing a US visa!',
    iconName: 'Globe'
  },
  {
    id: 'terminal-c',
    name: 'Terminal C (Regional & Low-Cost Carrier)',
    category: 'terminal',
    shortCode: 'TERM-C',
    coordinates: { x: 32, y: 44, width: 10, height: 8 },
    description: 'A modern, eco-friendly terminal designed for fast 25-minute turnarounds for regional jets, turboprops, and discount carriers.',
    specifications: {
      'Gates': '8 Gates (C1 - C8)',
      'Main Aircraft': 'Embraer E195, A220, Boeing 737 MAX',
      'Sustainability': '100% Rooftop Solar Powered'
    },
    educationalFact: 'Low-cost terminals are designed with shorter taxi distances to the runway to save jet fuel and keep ticket prices affordable!',
    iconName: 'Layers'
  },
  {
    id: 'atc-tower',
    name: 'Air Traffic Control Tower',
    category: 'tower',
    shortCode: 'ATC-CAB',
    coordinates: { x: 53, y: 36, width: 5, height: 5 },
    description: 'Standing 325 feet (99 meters) above the airfield, the CJIA Control Tower gives FAA air traffic controllers an unobstructed 360-degree view of all runways and taxiways.',
    specifications: {
      'Tower Height': '325 ft (99 meters)',
      'Cab Visibility': '360° Panoramic Heated Anti-Glare Glass',
      'Radar Systems': 'ASDE-X Surface Detection, ASR-11 Terminal Radar',
      'Frequencies': 'Tower 118.70, Ground 121.90, Clearance 125.10'
    },
    educationalFact: 'Controllers use special color-coded binoculars and infrared cameras to monitor taxiways even in dense fog or pitch-black night conditions!',
    iconName: 'Radio'
  },
  {
    id: 'arff-station-1',
    name: 'ARFF Station 1 (Fire & Rescue)',
    category: 'safety',
    shortCode: 'ARFF-1',
    coordinates: { x: 42, y: 34, width: 6, height: 5 },
    description: 'Aircraft Rescue and Firefighting Station 1. Houses heavy 8x8 Rosenbauer Panther crash trucks capable of responding to any runway in under 3 minutes.',
    specifications: {
      'Vehicles': '4 Heavy ARFF Crash Trucks, 1 Command Vehicle',
      'Water Capacity': '3,000 Gallons per truck + 400 Gallons Foam',
      'Response Requirement': 'Under 3 minutes to any airfield point',
      'Staffing': '24/7 dedicated certified airport firefighters'
    },
    educationalFact: 'ARFF trucks have high-pressure roof turrets that can shoot firefighting foam up to 300 feet (90 meters) away while driving at 65 mph!',
    iconName: 'ShieldAlert'
  },
  {
    id: 'cargo-logistics',
    name: 'CJ Cargo Logistics Hub',
    category: 'cargo',
    shortCode: 'CARGO',
    coordinates: { x: 75, y: 65, width: 12, height: 8 },
    description: 'The freight hub handling air cargo, express mail, e-commerce packages, and refrigerated pharmaceutical shipments from across the world.',
    specifications: {
      'Warehouse Area': '350,000 sq ft',
      'Cargo Stands': '6 Heavy Freighter Parking Bays',
      'Annual Cargo': '450,000 Tons',
      'Key Operators': 'CJ Cargo Express, FedEx, UPS, Atlas Air'
    },
    educationalFact: 'Cargo aircraft fly primarily during the late night and early morning hours so that your packages arrive by next morning!',
    iconName: 'Package'
  },
  {
    id: 'maintenance-hangars',
    name: 'CJ Technic Maintenance & Overhaul Hangars',
    category: 'maintenance',
    shortCode: 'MAINT',
    coordinates: { x: 75, y: 32, width: 12, height: 8 },
    description: 'State-of-the-art aircraft maintenance and overhaul facility capable of fitting two Boeing 777s simultaneously for A, B, and C-checks.',
    specifications: {
      'Hangar Bay Area': '120,000 sq ft clear-span',
      'Overhaul Capability': 'Line Maintenance, Engine Swaps, Avionics',
      'Paint Facility': 'Fully sealed eco-friendly downdraft paint booth'
    },
    educationalFact: 'Every commercial airliner undergoes rigorous safety inspections: from daily pre-flight walkarounds to heavy "D-checks" where the entire plane is taken apart piece by piece!',
    iconName: 'Wrench'
  },
  {
    id: 'fuel-farm',
    name: 'Jet-A Underground Hydrant Fuel Farm',
    category: 'fuel',
    shortCode: 'FUEL',
    coordinates: { x: 18, y: 72, width: 8, height: 8 },
    description: 'Bulk Jet-A aviation fuel storage tanks feeding underground high-pressure pipelines that connect directly to every terminal gate hydrant.',
    specifications: {
      'Storage Capacity': '12 Million Gallons of Jet-A Fuel',
      'Distribution': 'Underground Hydrant Cart Pits at every gate',
      'Quality Testing': 'Continuous automated particulate & water testing'
    },
    educationalFact: 'Instead of fuel tanker trucks driving around airplanes at terminal gates, fuel is pumped underground under pressure, allowing an A380 to receive 50,000 gallons in under 45 minutes!',
    iconName: 'Flame'
  }
];
