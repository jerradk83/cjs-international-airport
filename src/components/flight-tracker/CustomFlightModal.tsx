import React, { useState } from 'react';
import { X, Sparkles, Plane, Compass, Gauge, MapPin } from 'lucide-react';
import { Flight } from '../../types/flight';
import { audioService } from '../../services/audioService';

interface CustomFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomFlight: (flight: Flight) => void;
}

export const CustomFlightModal: React.FC<CustomFlightModalProps> = ({
  isOpen,
  onClose,
  onAddCustomFlight
}) => {
  const [flightNumber, setFlightNumber] = useState('CJ 777');
  const [callsign, setCallsign] = useState('CJ-BIRD 777');
  const [airline, setAirline] = useState('CJ Air');
  const [aircraftType, setAircraftType] = useState('Boeing 787-9');
  const [flightType, setFlightType] = useState<'arrival' | 'departure'>('arrival');
  const [originCity, setOriginCity] = useState('Seattle');
  const [originCode, setOriginCode] = useState('SEA');
  const [destCity, setDestCity] = useState('CJ International');
  const [destCode, setDestCode] = useState('CJI');
  const [altitude, setAltitude] = useState(14000);
  const [speed, setSpeed] = useState(380);
  const [heading, setHeading] = useState(90);
  const [gate, setGate] = useState('A8');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isArr = flightType === 'arrival';
    const newFlight: Flight = {
      id: `custom-${Date.now()}`,
      flightNumber,
      callsign,
      airline,
      airlineCode: flightNumber.split(' ')[0] || 'CJ',
      aircraftType,
      aircraftRegistration: `N${Math.floor(100 + Math.random() * 899)}CJ`,
      origin: {
        city: isArr ? originCity : 'CJ International',
        code: isArr ? originCode : 'CJI',
        airportName: isArr ? `${originCity} International` : 'CJ International Airport',
        country: 'USA'
      },
      destination: {
        city: isArr ? 'CJ International' : destCity,
        code: isArr ? 'CJI' : destCode,
        airportName: isArr ? 'CJ International Airport' : `${destCity} International`,
        country: 'USA'
      },
      type: flightType,
      scheduledTime: '12:00',
      estimatedTime: '12:05',
      status: isArr ? 'Approaching' : 'Boarding',
      terminal: gate.startsWith('B') ? 'B' : gate.startsWith('C') ? 'C' : 'A',
      gate,
      runway: '09L',
      altitude: isArr ? altitude : 0,
      groundSpeed: isArr ? speed : 0,
      heading,
      verticalSpeed: isArr ? -600 : 0,
      squawk: `${Math.floor(1000 + Math.random() * 8000)}`,
      position: isArr ? { x: 15, y: 35 } : { x: 48, y: 52 },
      pathHistory: isArr ? [{ x: 15, y: 35 }] : [{ x: 48, y: 52 }],
      isCustom: true,
      passengers: 210
    };

    onAddCustomFlight(newFlight);
    audioService.playAirportChime();
    audioService.speakAnnouncement(`Custom flight ${flightNumber} has been authorized into the CJIA radar sector!`, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#091326] border-2 border-indigo-500/60 rounded-2xl p-6 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-950 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-400/50 text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                CREATE CUSTOM FLIGHT
              </h3>
              <p className="text-xs text-indigo-300">
                Spawn your personalized aircraft onto the live radar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">FLIGHT NUMBER</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">ATC CALLSIGN</label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-indigo-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">AIRLINE NAME</label>
              <input
                type="text"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">AIRCRAFT MODEL</label>
              <select
                value={aircraftType}
                onChange={(e) => setAircraftType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-400 outline-none"
              >
                <option value="Boeing 787-9">Boeing 787-9 Dreamliner</option>
                <option value="Boeing 777-300ER">Boeing 777-300ER</option>
                <option value="Boeing 747-8">Boeing 747-8 Queen</option>
                <option value="Boeing 737 MAX 8">Boeing 737 MAX 8</option>
                <option value="Airbus A380-800">Airbus A380-800 Giant</option>
                <option value="Airbus A350-900">Airbus A350-900</option>
                <option value="Airbus A321neo">Airbus A321neo</option>
                <option value="Cessna 172">Cessna 172 Skyhawk</option>
                <option value="Piper Saratoga">Piper Saratoga</option>
              </select>
            </div>
          </div>

          {/* Flight Operation: Arrival or Departure */}
          <div>
            <label className="block text-slate-400 font-mono mb-1">OPERATION TYPE</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFlightType('arrival')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  flightType === 'arrival'
                    ? 'bg-cyan-600 text-white border border-cyan-400 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                🛬 Inbound Arrival to CJIA
              </button>
              <button
                type="button"
                onClick={() => setFlightType('departure')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  flightType === 'departure'
                    ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                🛫 Outbound Departure
              </button>
            </div>
          </div>

          {/* City & Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">
                {flightType === 'arrival' ? 'DEPARTED FROM (CITY)' : 'DESTINATION CITY'}
              </label>
              <input
                type="text"
                value={flightType === 'arrival' ? originCity : destCity}
                onChange={(e) => flightType === 'arrival' ? setOriginCity(e.target.value) : setDestCity(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">AIRPORT CODE (IATA)</label>
              <input
                type="text"
                value={flightType === 'arrival' ? originCode : destCode}
                onChange={(e) => flightType === 'arrival' ? setOriginCode(e.target.value.toUpperCase()) : setDestCode(e.target.value.toUpperCase())}
                maxLength={3}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold uppercase focus:border-indigo-400 outline-none"
              />
            </div>
          </div>

          {/* Flight Telemetry Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">ALTITUDE (FT)</label>
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(Number(e.target.value))}
                min={0}
                max={45000}
                step={500}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">SPEED (KTS)</label>
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                min={100}
                max={600}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">GATE</label>
              <input
                type="text"
                value={gate}
                onChange={(e) => setGate(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-indigo-400 outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Plane className="w-4 h-4" />
              <span>Spawn Flight on Live Radar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
