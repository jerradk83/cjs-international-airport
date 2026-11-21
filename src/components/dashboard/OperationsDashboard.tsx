import React from 'react';
import { 
  Radar, 
  PlaneTakeoff, 
  Radio, 
  Map, 
  CloudSun, 
  Gamepad2, 
  Briefcase, 
  BookOpen, 
  Volume2, 
  ArrowRight,
  TrendingUp,
  Activity,
  Compass,
  Sparkles,
  Plane
} from 'lucide-react';
import { Flight } from '../../types/flight';
import { WeatherData } from '../../types/weather';
import { ActiveTab } from '../common/Navigation';
import { audioService } from '../../services/audioService';
import { AchievementService } from '../../data/achievements';

interface OperationsDashboardProps {
  flights: Flight[];
  weather: WeatherData;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectFlight: (flight: Flight) => void;
  onOpenCustomFlightModal: () => void;
  onUnlockAchievement: (id: string) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  flights,
  weather,
  onSelectTab,
  onSelectFlight,
  onOpenCustomFlightModal,
  onUnlockAchievement
}) => {
  const airborneFlights = flights.filter(f => f.altitude > 0);
  const arrivingFlights = flights.filter(f => f.type === 'arrival').slice(0, 4);
  const departingFlights = flights.filter(f => f.type === 'departure').slice(0, 4);

  const announcements = [
    {
      flight: 'CJ 245',
      gate: 'A7',
      dest: 'Honolulu',
      text: 'CJ Air Flight 245 non-stop service to Honolulu is now boarding at Gate Alpha 7. Please have your boarding passes ready.'
    },
    {
      flight: 'UA 842',
      gate: 'B4',
      dest: 'London Heathrow',
      text: 'United Flight 842 from London Heathrow has touched down on Runway 09 Right and is taxiing to Gate Bravo 4.'
    },
    {
      flight: 'DL 1209',
      gate: 'A3',
      dest: 'Atlanta',
      text: 'Delta Flight 1209 arriving from Atlanta is now on final approach for Runway 09 Left.'
    }
  ];

  const handleBroadcastAnnouncement = (announcement: typeof announcements[0]) => {
    audioService.speakAnnouncement(announcement.text, true);
    AchievementService.unlock('fids_announcement', (ach) => onUnlockAchievement(ach.id));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Hero Airport Operations Center Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#071329] via-[#091b3b] to-[#050c1b] border border-cyan-800/40 p-6 sm:p-10 shadow-2xl">
        {/* Subtle background radar circles */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full border border-cyan-500/10 pointer-events-none" />
        <div className="absolute right-10 bottom-10 w-40 h-40 rounded-full border border-cyan-500/15 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>OPERATIONAL STATUS: NORMAL OPTIMAL OPERATIONS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Welcome to <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">CJ International Airport</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Where Every Flight Begins an Adventure! Explore live radar tracking, command aircraft as an Air Traffic Controller, pilot a commercial airliner in the flight simulator, and manage a world-class international gateway.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectTab('tracker')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Radar className="w-4 h-4" />
              <span>Launch Live Flight Radar</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onSelectTab('atc')}
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-sm flex items-center space-x-2 transition-all"
            >
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Enter Air Traffic Control Tower</span>
            </button>

            <button
              onClick={onOpenCustomFlightModal}
              className="px-4 py-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 font-semibold text-sm flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Create Custom Flight</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Airport Operations Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Flights Today */}
        <div className="bg-[#09152b] border border-cyan-900/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Scheduled Flights</span>
            <PlaneTakeoff className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {flights.length + 132}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14 flights vs yesterday</span>
          </div>
        </div>

        {/* Metric 2: Airborne Aircraft */}
        <div className="bg-[#09152b] border border-cyan-900/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Active Airborne</span>
            <Activity className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
            {airborneFlights.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1 mt-1">
            <span>In CJIA 50-mile terminal sector</span>
          </div>
        </div>

        {/* Metric 3: Active Runways */}
        <div className="bg-[#09152b] border border-cyan-900/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Active Runways</span>
            <Compass className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-sky-200 font-mono">
            09L & 09R
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate mt-1">
            Crosswind 18/36 standby
          </div>
        </div>

        {/* Metric 4: On-Time Departure Rate */}
        <div className="bg-[#09152b] border border-cyan-900/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">On-Time Performance</span>
            <Plane className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            94.8%
          </div>
          <div className="text-[11px] text-cyan-300 font-medium mt-1">
            Braking condition: {weather.runwayCondition}
          </div>
        </div>

      </div>

      {/* Live Airport Announcements Ticker */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0 animate-pulse">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Terminal PA Audio System • Live Broadcast
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              &ldquo;{announcements[0].text}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => handleBroadcastAnnouncement(announcements[0])}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center space-x-1.5 transition-all"
          >
            <span>Play Chime & Voice</span>
            <span>🔔</span>
          </button>
        </div>
      </div>

      {/* Split FIDS Mini-Boards Preview: Arrivals & Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Departures Card */}
        <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-extrabold text-base text-white tracking-wide">
                CURRENT DEPARTURES
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('fids')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
            >
              <span>Full Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {departingFlights.map((flight) => (
              <div
                key={flight.id}
                onClick={() => onSelectFlight(flight)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-white text-sm group-hover:text-cyan-300">
                    {flight.flightNumber}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {flight.destination.city} ({flight.destination.code})
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {flight.airline} • {flight.aircraftType}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs text-slate-300">
                    {flight.scheduledTime}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    flight.status === 'Boarding' ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse' :
                    flight.status === 'Final Call' ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse' :
                    flight.status === 'Departed' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {flight.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrivals Card */}
        <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="font-extrabold text-base text-white tracking-wide">
                CURRENT ARRIVALS
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('fids')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
            >
              <span>Full Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {arrivingFlights.map((flight) => (
              <div
                key={flight.id}
                onClick={() => onSelectFlight(flight)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-white text-sm group-hover:text-cyan-300">
                    {flight.flightNumber}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {flight.origin.city} ({flight.origin.code})
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {flight.airline} • Gate {flight.gate}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs text-slate-300">
                    ETA {flight.estimatedTime}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    flight.status === 'Approaching' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 animate-pulse' :
                    flight.status === 'Landed' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                    flight.status === 'Delayed' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {flight.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Feature Navigation Modules Grid (All 8 core experiences) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">
            EXPLORE CJ INTERNATIONAL AIRPORT
          </h2>
          <span className="text-xs font-mono text-cyan-400">8 INTERACTIVE AVIATION MODULES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Flight Tracker */}
          <div
            onClick={() => onSelectTab('tracker')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-cyan-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-4 group-hover:scale-110 transition-transform">
              <Radar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
              1. Flight Tracker Radar
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time interactive radar tracking moving aircraft, altitudes, speeds, waypoints, and aircraft trails.
            </p>
          </div>

          {/* Card 2: FIDS */}
          <div
            onClick={() => onSelectTab('fids')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-cyan-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-300 mb-4 group-hover:scale-110 transition-transform">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
              2. Arrivals & Departures
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Authentic terminal split-flap flight displays with filters, gates, status progression, and PA chime announcements.
            </p>
          </div>

          {/* Card 3: ATC */}
          <div
            onClick={() => onSelectTab('atc')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-amber-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-4 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
              3. ATC Tower Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Issue takeoff and landing clearances, manage runway separation, communicate with pilots, and handle emergencies.
            </p>
          </div>

          {/* Card 4: Airport Map */}
          <div
            onClick={() => onSelectTab('map')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-cyan-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
              4. Interactive Airport Map
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explore CJIA runways, taxiways, Terminals A, B & C, fire rescue stations, fuel farms, and animated taxiing planes.
            </p>
          </div>

          {/* Card 5: Weather */}
          <div
            onClick={() => onSelectTab('weather')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-sky-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-300 mb-4 group-hover:scale-110 transition-transform">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
              5. Weather Center
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Live METAR decoder, Doppler precipitation radar, crosswind windsock calculator, and selectable storm scenarios.
            </p>
          </div>

          {/* Card 6: Flight Simulator */}
          <div
            onClick={() => onSelectTab('simulator')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-indigo-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 mb-4 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
              6. Flight Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Fly a Cessna 172, Boeing 737, or A380 with working Primary Flight Display, throttle, flaps, and landing scoring!
            </p>
          </div>

          {/* Card 7: Airport Management */}
          <div
            onClick={() => onSelectTab('management')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-purple-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
              7. Airport Management
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Step into the shoes of Airport Director CJ! Manage gates, buy de-icing trucks, solve dilemmas, and grow airport revenue.
            </p>
          </div>

          {/* Card 8: Encyclopedia */}
          <div
            onClick={() => onSelectTab('encyclopedia')}
            className="group cursor-pointer bg-gradient-to-b from-[#09152b] to-[#060e1d] hover:from-[#0f2142] hover:to-[#09152b] border border-cyan-900/50 hover:border-emerald-400/80 rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
              8. Aircraft Encyclopedia
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Educational specs, wingspan comparisons, and fun facts for 12 iconic airliners and general aviation planes.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
