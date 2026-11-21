import React from 'react';
import { 
  X, 
  Plane, 
  Gauge, 
  Compass, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Radio, 
  MapPin, 
  Clock, 
  Volume2
} from 'lucide-react';
import { Flight } from '../../types/flight';
import { audioService } from '../../services/audioService';

interface FlightDetailModalProps {
  flight: Flight | null;
  onClose: () => void;
}

export const FlightDetailModal: React.FC<FlightDetailModalProps> = ({ flight, onClose }) => {
  if (!flight) return null;

  const handleMakeAnnouncement = () => {
    const text = `Attention passengers. Flight ${flight.flightNumber} to ${flight.destination.city} is currently ${flight.status.toLowerCase()} at Terminal ${flight.terminal}, Gate ${flight.gate}.`;
    audioService.speakAnnouncement(text, true);
  };

  const getVerticalSpeedIcon = (vs: number) => {
    if (vs > 200) return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (vs < -200) return <ArrowDownRight className="w-4 h-4 text-cyan-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#081224] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-950 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold font-mono tracking-wider text-white">
                  {flight.flightNumber}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  {flight.callsign}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {flight.airline} • {flight.aircraftType} ({flight.aircraftRegistration})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            {/* Origin */}
            <div className="text-left">
              <div className="text-2xl font-black font-mono text-cyan-400">
                {flight.origin.code}
              </div>
              <div className="text-xs font-semibold text-slate-200">{flight.origin.city}</div>
              <div className="text-[10px] text-slate-400">{flight.origin.airportName}</div>
            </div>

            {/* Flight Path Graphic */}
            <div className="flex-1 mx-4 flex flex-col items-center">
              <div className="text-[10px] font-mono text-slate-400 mb-1">
                {flight.status.toUpperCase()}
              </div>
              <div className="w-full flex items-center relative">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-500 relative">
                  <Plane 
                    className="w-3.5 h-3.5 text-white absolute top-1/2 -translate-y-1/2 transform -rotate-45"
                    style={{ left: flight.altitude === 0 ? '90%' : '50%' }}
                  />
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <div className="text-[10px] font-mono text-cyan-300 mt-1">
                Sched: {flight.scheduledTime} • Est: {flight.estimatedTime}
              </div>
            </div>

            {/* Destination */}
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-cyan-400">
                {flight.destination.code}
              </div>
              <div className="text-xs font-semibold text-slate-200">{flight.destination.city}</div>
              <div className="text-[10px] text-slate-400">{flight.destination.airportName}</div>
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 font-mono">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span>ALTITUDE</span>
            </div>
            <div className="text-base font-bold text-white">
              {flight.altitude.toLocaleString()} <span className="text-[10px] text-slate-400">FT</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-1">
              <Gauge className="w-3 h-3 text-emerald-400" />
              <span>SPEED</span>
            </div>
            <div className="text-base font-bold text-white">
              {flight.groundSpeed} <span className="text-[10px] text-slate-400">KTS</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>HEADING</span>
            </div>
            <div className="text-base font-bold text-white">
              {flight.heading}°
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-1">
              {getVerticalSpeedIcon(flight.verticalSpeed)}
              <span>V-SPEED</span>
            </div>
            <div className="text-base font-bold text-white">
              {flight.verticalSpeed > 0 ? `+${flight.verticalSpeed}` : flight.verticalSpeed} <span className="text-[10px] text-slate-400">FPM</span>
            </div>
          </div>

        </div>

        {/* Airport Operations Assignment */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mb-5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-400">Terminal: </span>
              <span className="font-bold text-white">{flight.terminal}</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-slate-400">Gate: </span>
              <span className="font-bold text-white">{flight.gate}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400">Squawk: </span>
              <span className="font-mono font-bold text-amber-300">{flight.squawk}</span>
            </div>
          </div>
        </div>

        {/* Emergency or Delay notice if present */}
        {flight.emergencyType && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
            <span className="font-bold">⚠️ PRIORITY SITUATION: </span>
            {flight.emergencyType}
          </div>
        )}

        {flight.delayReason && (
          <div className="mb-4 p-3 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs">
            <span className="font-bold">⚠️ DELAY NOTICE: </span>
            {flight.delayReason}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleMakeAnnouncement}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Volume2 className="w-4 h-4" />
            <span>Broadcast Gate Announcement</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
