import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Scale, 
  Plane, 
  Sparkles, 
  CheckCircle, 
  ArrowRightLeft,
  X,
  Gauge,
  Compass,
  Users
} from 'lucide-react';
import { AIRCRAFT_DATABASE } from '../../data/aircraftDatabase';
import { AircraftSpecs } from '../../types/aircraft';
import { AchievementService } from '../../data/achievements';
import { audioService } from '../../services/audioService';

interface AircraftEncyclopediaProps {
  onUnlockAchievement: (id: string) => void;
}

export const AircraftEncyclopedia: React.FC<AircraftEncyclopediaProps> = ({
  onUnlockAchievement
}) => {
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftSpecs>(AIRCRAFT_DATABASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Comparison Tool State
  const [isComparing, setIsComparing] = useState(false);
  const [compareAircraft1, setCompareAircraft1] = useState<AircraftSpecs>(AIRCRAFT_DATABASE[0]);
  const [compareAircraft2, setCompareAircraft2] = useState<AircraftSpecs>(AIRCRAFT_DATABASE[1]);

  const filteredAircraft = AIRCRAFT_DATABASE.filter(ac => {
    if (manufacturerFilter !== 'all' && ac.manufacturer !== manufacturerFilter) return false;
    if (categoryFilter !== 'all' && ac.category !== categoryFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        ac.name.toLowerCase().includes(q) ||
        ac.manufacturer.toLowerCase().includes(q) ||
        ac.engineType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectAircraft = (ac: AircraftSpecs) => {
    setSelectedAircraft(ac);
    audioService.playAlertBeep(false);
    AchievementService.unlock('encyclopedia_scholar', (ach) => onUnlockAchievement(ach.id));
  };

  const manufacturers = ['all', 'Boeing', 'Airbus', 'Cessna', 'Piper', 'Gulfstream'];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Encyclopedia Header */}
      <div className="bg-[#071329] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-cyan-300">
              AIRCRAFT ENCYCLOPEDIA & COMPARISON HANGAR
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            TECHNICAL SPECIFICATIONS, AERONAUTICAL HISTORY & FUN FACTS
          </p>
        </div>

        {/* Toggle Compare Mode */}
        <button
          onClick={() => setIsComparing(!isComparing)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isComparing
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:bg-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{isComparing ? 'Exit Comparison' : 'Compare 2 Aircraft Side-by-Side'}</span>
        </button>
      </div>

      {/* Comparison Tool Modal / Full View */}
      {isComparing ? (
        <div className="bg-[#081224] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <h3 className="font-mono text-sm font-bold text-amber-300 uppercase tracking-wide">
                SIDE-BY-SIDE AIRFRAME COMPARISON
              </h3>
            </div>
            <button
              onClick={() => setIsComparing(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Selectors for 2 planes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">AIRCRAFT 1</label>
              <select
                value={compareAircraft1.id}
                onChange={(e) => {
                  const match = AIRCRAFT_DATABASE.find(a => a.id === e.target.value);
                  if (match) setCompareAircraft1(match);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none"
              >
                {AIRCRAFT_DATABASE.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">AIRCRAFT 2</label>
              <select
                value={compareAircraft2.id}
                onChange={(e) => {
                  const match = AIRCRAFT_DATABASE.find(a => a.id === e.target.value);
                  if (match) setCompareAircraft2(match);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none"
              >
                {AIRCRAFT_DATABASE.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Bar Visuals */}
          <div className="space-y-4 text-xs font-mono">
            
            {/* Metric: Wingspan */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                <span>{compareAircraft1.wingspanFt} FT</span>
                <span className="text-cyan-300">WINGSPAN</span>
                <span>{compareAircraft2.wingspanFt} FT</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex justify-end">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft1.wingspanFt / 262) * 100)}%` }}
                  />
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft2.wingspanFt / 262) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metric: Passenger Capacity */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                <span>{compareAircraft1.passengerCapacity} PAX</span>
                <span className="text-cyan-300">PASSENGER CAPACITY</span>
                <span>{compareAircraft2.passengerCapacity} PAX</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex justify-end">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft1.passengerCapacity / 555) * 100)}%` }}
                  />
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft2.passengerCapacity / 555) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metric: Max Range */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                <span>{compareAircraft1.maxRangeNm.toLocaleString()} NM</span>
                <span className="text-cyan-300">MAX RANGE</span>
                <span>{compareAircraft2.maxRangeNm.toLocaleString()} NM</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex justify-end">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft1.maxRangeNm / 8100) * 100)}%` }}
                  />
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft2.maxRangeNm / 8100) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metric: Cruising Speed */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                <span>{compareAircraft1.cruisingSpeedKts} KTS (M{compareAircraft1.cruisingMach})</span>
                <span className="text-cyan-300">CRUISE SPEED</span>
                <span>{compareAircraft2.cruisingSpeedKts} KTS (M{compareAircraft2.cruisingMach})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex justify-end">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft1.cruisingSpeedKts / 520) * 100)}%` }}
                  />
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${Math.min(100, (compareAircraft2.cruisingSpeedKts / 520) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : null}

      {/* Filter and Search Toolbar */}
      <div className="bg-[#09152b] border border-cyan-900/40 rounded-xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Manufacturer Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-mono font-bold mr-1">MAKER:</span>
          {manufacturers.map(m => (
            <button
              key={m}
              onClick={() => setManufacturerFilter(m)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                manufacturerFilter === m
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search aircraft or engine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>

      </div>

      {/* Main Aircraft Grid & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Aircraft Selector List */}
        <div className="bg-[#081224] border border-cyan-900/50 rounded-3xl p-4 shadow-xl flex flex-col h-[600px]">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
            AIRCRAFT DATABASE ({filteredAircraft.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredAircraft.map(ac => {
              const isSelected = selectedAircraft.id === ac.id;
              return (
                <div
                  key={ac.id}
                  onClick={() => handleSelectAircraft(ac)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-sm group-hover:text-cyan-300">
                      {ac.name}
                    </span>
                    <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-slate-950">
                      {ac.category.split(' ')[1] || ac.category}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{ac.manufacturer} • {ac.engineCount} Engines</span>
                    <span className="font-mono">{ac.passengerCapacity} Pax</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Full Aircraft Technical Sheet */}
        <div className="lg:col-span-2 bg-[#081224] border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-[600px] overflow-y-auto">
          
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-cyan-950 pb-4 mb-4">
              <div>
                <div className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold mb-1">
                  {selectedAircraft.category.toUpperCase()} • FIRST FLIGHT {selectedAircraft.firstFlightYear}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  {selectedAircraft.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Manufactured by {selectedAircraft.manufacturer} • Powered by {selectedAircraft.engineCount}x {selectedAircraft.engineType}
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shrink-0">
                <Plane className="w-8 h-8 transform -rotate-45" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              {selectedAircraft.description}
            </p>

            {/* Technical Specifications Grid */}
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              Aeronautical Engineering Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 font-mono text-xs">
              
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">WINGSPAN:</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedAircraft.wingspanFt} ft ({selectedAircraft.wingspanMeters} m)
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">AIRCRAFT LENGTH:</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedAircraft.lengthFt} ft ({selectedAircraft.lengthMeters} m)
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">CRUISING SPEED:</span>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">
                  {selectedAircraft.cruisingSpeedKts} kts (Mach {selectedAircraft.cruisingMach})
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">MAX RANGE:</span>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {selectedAircraft.maxRangeNm.toLocaleString()} NM
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">MAX TAKEOFF WEIGHT:</span>
                <div className="text-sm font-bold text-amber-300 mt-0.5">
                  {selectedAircraft.maxTakeoffWeightLbs.toLocaleString()} lbs
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">SERVICE CEILING:</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedAircraft.serviceCeilingFt.toLocaleString()} ft
                </div>
              </div>

            </div>

            {/* Interesting Aviation Facts for Kids & Enthusiasts */}
            <div className="bg-gradient-to-br from-blue-950/80 via-slate-900 to-cyan-950/80 border border-cyan-400/40 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Did You Know? Fascinating Aviation Facts</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {selectedAircraft.funFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="pt-4 text-center text-[10px] font-mono text-slate-500">
            AIRCRAFT SPEC SHEET • CJ INTERNATIONAL AIRPORT AVIATION REFERENCE LIBRARY
          </div>

        </div>

      </div>

    </div>
  );
};
