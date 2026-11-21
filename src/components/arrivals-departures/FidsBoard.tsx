import React, { useState } from 'react';
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Search, 
  Volume2, 
  Filter, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { Flight, FlightStatus } from '../../types/flight';
import { audioService } from '../../services/audioService';
import { AchievementService } from '../../data/achievements';

interface FidsBoardProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  onUnlockAchievement: (id: string) => void;
}

export const FidsBoard: React.FC<FidsBoardProps> = ({
  flights,
  onSelectFlight,
  onUnlockAchievement
}) => {
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [terminalFilter, setTerminalFilter] = useState<string>('all');
  const [airlineFilter, setAirlineFilter] = useState<string>('all');

  const filteredFlights = flights.filter(f => {
    // Tab filter
    if (activeTab === 'departures' && f.type === 'arrival') return false;
    if (activeTab === 'arrivals' && f.type === 'departure') return false;

    // Terminal filter
    if (terminalFilter !== 'all' && f.terminal !== terminalFilter) return false;

    // Status filter
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;

    // Airline filter
    if (airlineFilter !== 'all' && f.airline !== airlineFilter) return false;

    // Search term
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchCity = f.destination.city.toLowerCase().includes(q) || f.origin.city.toLowerCase().includes(q);
      const matchCode = f.destination.code.toLowerCase().includes(q) || f.origin.code.toLowerCase().includes(q);
      const matchFlight = f.flightNumber.toLowerCase().includes(q);
      const matchAirline = f.airline.toLowerCase().includes(q);
      return matchCity || matchCode || matchFlight || matchAirline;
    }

    return true;
  });

  const getStatusBadge = (status: FlightStatus) => {
    switch (status) {
      case 'On Time':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
      case 'Boarding':
        return 'bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse';
      case 'Final Call':
        return 'bg-red-950 text-red-300 border-red-500/40 animate-pulse';
      case 'Delayed':
        return 'bg-amber-950 text-amber-400 border-amber-500/50';
      case 'Departed':
        return 'bg-blue-950 text-blue-300 border-blue-500/40';
      case 'Approaching':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/40 animate-pulse';
      case 'Landed':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Cancelled':
        return 'bg-red-950 text-red-400 border-red-600';
      case 'Emergency':
        return 'bg-red-900 text-white border-red-500 animate-bounce';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleAnnounce = (flight: Flight, e: React.MouseEvent) => {
    e.stopPropagation();
    const city = activeTab === 'departures' ? flight.destination.city : flight.origin.city;
    const action = activeTab === 'departures'
      ? `Flight ${flight.flightNumber} to ${city} is currently ${flight.status.toLowerCase()} at Terminal ${flight.terminal}, Gate ${flight.gate}.`
      : `Flight ${flight.flightNumber} from ${city} has landed and will arrive at Gate ${flight.gate}. Baggage claim is at Carousel ${flight.gate.charCodeAt(0) % 6 + 1}.`;

    audioService.speakAnnouncement(action, true);
    AchievementService.unlock('fids_announcement', (ach) => onUnlockAchievement(ach.id));
  };

  const airlinesList = Array.from(new Set(flights.map(f => f.airline)));

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Board Header & Title */}
      <div className="bg-[#071329] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-amber-300">
              FLIGHT INFORMATION DISPLAY SYSTEM (FIDS)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            TERMINAL MAIN CONCOURSE • LIVE TIME SYNCHRONIZED
          </p>
        </div>

        {/* Departure / Arrival Tabs */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('departures')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'departures'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>DEPARTURES</span>
          </button>

          <button
            onClick={() => setActiveTab('arrivals')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'arrivals'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlaneLanding className="w-4 h-4" />
            <span>ARRIVALS</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#09152b] border border-cyan-900/40 rounded-xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Terminal filter */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 font-mono font-bold">TERMINAL:</span>
            <select
              value={terminalFilter}
              onChange={(e) => setTerminalFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none focus:border-amber-400"
            >
              <option value="all">All Terminals</option>
              <option value="A">Terminal A (Domestic)</option>
              <option value="B">Terminal B (International)</option>
              <option value="C">Terminal C (Regional)</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 font-mono font-bold">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none focus:border-amber-400"
            >
              <option value="all">All Statuses</option>
              <option value="On Time">On Time</option>
              <option value="Boarding">Boarding</option>
              <option value="Final Call">Final Call</option>
              <option value="Approaching">Approaching</option>
              <option value="Delayed">Delayed</option>
              <option value="Landed">Landed</option>
              <option value="Departed">Departed</option>
            </select>
          </div>

          {/* Airline filter */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 font-mono font-bold">AIRLINE:</span>
            <select
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none focus:border-amber-400"
            >
              <option value="all">All Airlines</option>
              {airlinesList.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search destination, flight #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 outline-none focus:border-amber-400"
          />
        </div>

      </div>

      {/* The Iconic Digital Split-Flap / LED Flight Board */}
      <div className="bg-[#050a14] border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#091124] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Flight</th>
                <th className="py-3 px-4">Airline</th>
                <th className="py-3 px-4">{activeTab === 'departures' ? 'Destination' : 'Origin'}</th>
                <th className="py-3 px-4">Scheduled</th>
                <th className="py-3 px-4">Estimated</th>
                <th className="py-3 px-4">Term</th>
                <th className="py-3 px-4">Gate</th>
                <th className="py-3 px-4">{activeTab === 'departures' ? 'Check-in' : 'Baggage'}</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">PA Audio</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-900/80">
              {filteredFlights.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    No matching flights found in current schedule.
                  </td>
                </tr>
              ) : (
                filteredFlights.map((flight) => {
                  const locationCity = activeTab === 'departures' ? flight.destination.city : flight.origin.city;
                  const locationCode = activeTab === 'departures' ? flight.destination.code : flight.origin.code;
                  const carouselOrDesk = activeTab === 'departures' 
                    ? `Desk ${flight.terminal}1-${flight.terminal}4`
                    : `Belt ${flight.gate.charCodeAt(0) % 6 + 1}`;

                  return (
                    <tr
                      key={flight.id}
                      onClick={() => onSelectFlight(flight)}
                      className="hover:bg-cyan-950/40 cursor-pointer transition-colors group"
                    >
                      {/* Flight Number */}
                      <td className="py-3 px-4 font-bold text-amber-300 group-hover:text-cyan-300">
                        {flight.flightNumber}
                      </td>

                      {/* Airline */}
                      <td className="py-3 px-4 text-slate-200">
                        {flight.airline}
                      </td>

                      {/* Destination / Origin */}
                      <td className="py-3 px-4 font-bold text-white">
                        <span>{locationCity.toUpperCase()}</span>
                        <span className="ml-1.5 text-cyan-400 text-[10px]">({locationCode})</span>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3 px-4 text-slate-400">
                        {flight.scheduledTime}
                      </td>

                      {/* Estimated Time */}
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {flight.estimatedTime}
                      </td>

                      {/* Terminal */}
                      <td className="py-3 px-4 text-slate-300 font-bold">
                        {flight.terminal}
                      </td>

                      {/* Gate */}
                      <td className="py-3 px-4 font-bold text-amber-400">
                        {flight.gate}
                      </td>

                      {/* Desk / Carousel */}
                      <td className="py-3 px-4 text-slate-400">
                        {carouselOrDesk}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(flight.status)}`}>
                          {flight.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Broadcast Announcement Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => handleAnnounce(flight, e)}
                          title="Broadcast Airport PA Chime & Announcement"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all shadow-sm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* FIDS Footer */}
        <div className="bg-[#070e1c] border-t border-slate-800/80 px-4 py-2.5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>LAST RADAR REFRESH: LIVE CONTINUOUS UPDATE</span>
          </div>
          <div>
            <span>SHOWING {filteredFlights.length} OF {flights.length} FLIGHTS</span>
          </div>
        </div>

      </div>

    </div>
  );
};
