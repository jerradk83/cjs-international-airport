# ✈️ CJ International Airport (CJIA / KCJI)
> *"Where Every Flight Begins an Adventure!"*

A fully interactive virtual airport operations hub, flight tracking radar, air traffic control simulator, 3D flight simulator, and airport management game built for aviation enthusiasts of all ages.

![CJ International Airport](public/favicon.svg)

---

## 🌟 Features Overview

### 1. 🏢 Airport Operations Dashboard (Homepage)
- **Live Airfield Telemetry**: Scheduled flights, active airborne traffic in sector, on-time percentage, active runways, and braking conditions.
- **Simulation Clock**: Real-time Local Airport Time (LOC) and UTC/Zulu (`Z`) time with speed controls (Pause, 1x, 2x, 5x speed).
- **Airport Public Address (PA) Audio System**: Realistic Web Audio API dual-tone chime (F4 &rarr; C5) with speech synthesized boarding and flight announcements.
- **Live Flight Information Mini-Display**: Next departures and arrivals with status badges.
- **Quick-Access Navigation**: Seamless routing to all 8 specialized aviation modules.

### 2. 📡 Interactive Flight Tracker (Radar)
- **Radar Scope (ASR-11)**: Dynamic vector display with rotating radar sweep beam, range rings (10 NM, 25 NM, 50 NM, 100 NM), navigation fixes (CJI VOR, JERRD, SKYBO, ALPHA, MERIT), and ILS extended localizer cones.
- **Aircraft Telemetry**: Real-time altitude, ground speed (knots), heading degrees, vertical speed (fpm), squawk code, and flight trail paths.
- **Aircraft Cards**: Click any airplane to inspect flight progress, origin/destination, and trigger custom gate announcements.
- **Custom Flight Creator**: Build and spawn custom flights directly onto the active radar screen.

### 3. 📋 Arrivals & Departures Board (FIDS)
- Authentic split-flap LED terminal board with real-time status updates: *On Time*, *Boarding*, *Final Call*, *Departed*, *Approaching*, *Landed*, and *Delayed*.
- Filters by Terminal (A, B, C), Status, and Airline.
- Individual **Broadcast PA Announcement** button with synthesized airport chime and speech.

### 4. 🎙️ Air Traffic Control (ATC) Tower Simulator
- **Tower Radar (ASDE-X)**: Surface movement radar showing aircraft on final approach, holding short, lining up, and taxiing.
- **ATC Clearance Commands**:
  - *Cleared for Takeoff*
  - *Hold Short Runway*
  - *Line Up and Wait*
  - *Cleared to Land*
  - *Execute Go-Around* (immediate emergency separation)
  - *Taxi to Gate via Taxiway Alpha*
- **Separation Alerts**: Automatic detection of loss of separation minimums (&lt; 2.5 NM on approach).
- **Scoring & Streak**: Real-time score counter, difficulty settings (*Beginner*, *Intermediate*, *Advanced*), and educational ATC phraseology guide.

### 5. 🗺️ Interactive Airport Diagram & Map
- Complete fictional airport layout featuring:
  - **Runway 09L / 27R**: 11,800 ft CAT IIIb Primary Runway
  - **Runway 09R / 27L**: 9,500 ft South Commercial Runway
  - **Runway 18 / 36**: 7,200 ft Crosswind Runway
  - **Terminals A, B & C**: Domestic, International Widebody (A380 gate), and Regional
  - **Air Traffic Control Tower**, ARFF Fire & Rescue Stations 1 & 2, Cargo Hub, Fuel Farm, and Maintenance Hangars.
- **Animated Taxiing Aircraft**: Planes taxiing along taxiways Alpha and Bravo in real-time.
- **Interactive Hotspot Inspector**: Click any building or runway to view dimensions, historical specifications, and educational science facts.

### 6. 🌦️ Aviation Weather Center & Doppler Radar
- **Live METAR Decoder**: Raw METAR string accompanied by plain-English explanations.
- **Interactive Doppler Weather Radar**: Simulated precipitation reflectivity for storm cells, rain bands, and snow.
- **7 Selectable Scenarios**: *Clear Skies (VFR)*, *Rain*, *Dense Fog (CAT III)*, *Winter Snowstorm*, *Severe Thunderstorm*, *Strong Crosswind*, and *Microburst Gale*.
- **Runway Crosswind Calculator**: Computes headwind vs crosswind component based on selected runway heading.

### 7. 🛩️ 3D Flight Simulator (Approach & Landing)
- **Aircraft Selection**: Cessna 172 Skyhawk, Boeing 737-800 "CJ Express", and Airbus A380 Superjumbo.
- **Primary Flight Display (PFD)**: Working Artificial Horizon, Airspeed tape (kts), Altimeter (ft), Heading tape, and Vertical Speed.
- **3D Runway Perspective**: Dynamic runway approach with PAPI glidepath lights (2 white, 2 red = on glidepath).
- **Landing Evaluation**: Touchdown vertical speed grading (*Butter Smooth*, *Excellent*, *Acceptable*, *Hard Touchdown*, *Go-Around*) with confetti celebrations!

### 8. 🏢 Airport Management Mode ("Director CJ")
- Step into the shoes of Airport Director CJ!
- Manage gate assignments across Terminals A, B, and C.
- Purchase ground handling equipment (pushback tugs, de-icing rigs, Rosenbauer crash trucks, apron buses).
- Handle operational crisis dilemmas with budget and satisfaction trade-offs.
- Progress from Level 1 Regional Hub to Level 5 Global Mega-Hub!

### 9. 📖 Aircraft Encyclopedia & Comparison Tool
- Technical specifications, dimensions, engine types, and fascinating aviation facts for 12 iconic aircraft:
  - Boeing 787-9, 777-300ER, 747-8, 737-800, 737 MAX 8
  - Airbus A380, A350-900, A320neo, A321neo
  - Cessna 172, Piper Saratoga, Gulfstream G650ER
- **Side-by-Side Comparison Tool**: Visual bar charts comparing Wingspan, Passenger Capacity, Range, and Cruising Speed.

### 10. 🚨 Emergency Incident Dispatch & 🏆 Achievements
- **Emergency Scenarios**: Inboard medical diversion (CJ-911), severe wind shear squall line, hydraulic emergency, and runway foreign object debris (FOD).
- **Persistent Achievements**: Unlock badges such as *Sky Watcher*, *Terminal Announcer*, *Butter Smooth Touchdown*, *Crosswind Ace*, *Radar Maestro*, and *Master of the Storm* saved via `localStorage`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/jerradk83/cjs-international-airport.git
cd cjs-international-airport

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

---

## ⌨️ Controls & Keybindings

### Flight Simulator Controls
| Key | Action |
| --- | --- |
| `Down Arrow` / `S` | Pitch Nose Up (Flare for landing) |
| `Up Arrow` / `W` | Pitch Nose Down |
| `Left Arrow` / `A` | Bank Left |
| `Right Arrow` / `D` | Bank Right |
| `G` | Toggle Landing Gear (UP / DOWN) |
| `F` | Cycle Flaps (0° &rarr; 15° &rarr; 30° &rarr; 40°) |
| `B` | Toggle Wheel Brakes |
| Throttle Slider | Adjust engine thrust (20% - 100%) |

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Sound**: Web Audio API (Synthesized chime) + Web Speech API (Airport public address voice)
- **Visuals**: HTML5 Canvas (60 FPS Radar, Doppler Weather, 3D Flight Simulator, Airfield Map)
- **Celebrations**: Canvas-Confetti
- **Storage**: LocalStorage for persistent career and achievements

---

## 📜 Disclaimer
All flight tracking, air traffic control communications, radar blips, and weather information displayed on CJ International Airport are fictional simulations designed for aviation education and entertainment.
