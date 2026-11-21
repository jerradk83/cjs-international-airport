import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Filter, 
  Search, 
  Plane, 
  Radio, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { Flight } from '../../types/flight';
import { FlightDetailModal } from './FlightDetailModal';
import { CustomFlightModal } from './CustomFlightModal';
import { audioService } from '../../services/audioService';
import { AchievementService } from '../../data/achievements';

interface FlightTrackerProps {
  flights: Flight[];
  onAddCustomFlight: (flight: Flight) => void;
  onUnlockAchievement: (id: string) => void;
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight | null) => void;
}

export const FlightTracker: React.FC<FlightTrackerProps> = ({
  flights,
  onAddCustomFlight,
  onUnlockAchievement,
  selectedFlight,
  onSelectFlight
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState<'all' | 'arrival' | 'departure' | 'enroute' | 'ground'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [radarSweepAngle, setRadarSweepAngle] = useState(0);

  // Radar sweep animation loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRadarSweepAngle(prev => (prev + 1.2) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Filtered flights
  const filteredFlights = flights.filter(f => {
    if (filterType === 'arrival' && f.type !== 'arrival') return false;
    if (filterType === 'departure' && f.type !== 'departure') return false;
    if (filterType === 'enroute' && f.altitude === 0) return false;
    if (filterType === 'ground' && f.altitude > 0) return false;

    if (filterCategory !== 'all') {
      if (filterCategory === 'widebody' && !['Boeing 787-9', 'Airbus A380-800', 'Boeing 777-300ER', 'Boeing 747-8', 'Airbus A350-900'].includes(f.aircraftType)) return false;
      if (filterCategory === 'narrowbody' && !['Boeing 737-800', 'Boeing 737 MAX 8', 'Airbus A320neo', 'Airbus A321neo'].includes(f.aircraftType)) return false;
      if (filterCategory === 'ga' && !['Cessna 172', 'Piper Saratoga'].includes(f.aircraftType)) return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        f.flightNumber.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.origin.city.toLowerCase().includes(q) ||
        f.destination.city.toLowerCase().includes(q) ||
        f.callsign.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = (width / 2) + pan.x;
    const centerY = (height / 2) + pan.y;
    const radius = Math.min(width, height) * 0.45 * zoom;

    // 1. Radar Background
    ctx.fillStyle = '#030813';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle coordinate grid
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40 * zoom;
    for (let x = (pan.x % gridSize); x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = (pan.y % gridSize); y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Concentric Range Rings (10 NM, 25 NM, 50 NM, 100 NM)
    const ringDistances = [0.25, 0.5, 0.75, 1.0];
    const ringLabels = ['10 NM', '25 NM', '50 NM', '100 NM TCA'];

    ringDistances.forEach((fraction, index) => {
      const ringR = radius * fraction;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = index === 3 ? 'rgba(0, 242, 254, 0.35)' : 'rgba(0, 242, 254, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Ring distance labels
      ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText(ringLabels[index], centerX + 8, centerY - ringR + 12);
    });

    // 4. Radar Crosshairs / Compass Bearings
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // 5. Extended Runway 09L / 09R ILS Approach Cones
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15 * zoom);
    ctx.lineTo(centerX - radius * 0.9, centerY - 80 * zoom);
    ctx.lineTo(centerX - radius * 0.9, centerY + 50 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Navigation Fixes & VORs
    const waypoints = [
      { name: 'CJI VOR', x: 0, y: 0, label: 'KCJIA (090°/270°)' },
      { name: 'JERRD', x: -0.45, y: -0.15, label: 'FL180' },
      { name: 'SKYBO', x: -0.65, y: 0.1, label: 'ILS 09L' },
      { name: 'ALPHA', x: -0.3, y: 0.35, label: 'HOLD 4000' },
      { name: 'MERIT', x: 0.55, y: -0.4, label: 'DEP SID' },
      { name: 'BRAVO', x: 0.4, y: 0.45, label: 'RADAR 5000' }
    ];

    waypoints.forEach(wp => {
      const wx = centerX + wp.x * radius;
      const wy = centerY + wp.y * radius;

      // Triangle for Fix
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wx, wy - 5);
      ctx.lineTo(wx - 4, wy + 4);
      ctx.lineTo(wx + 4, wy + 4);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 242, 254, 0.8)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(wp.name, wx + 6, wy - 2);
    });

    // 7. Rotating Radar Sweep Beam
    const sweepRad = (radarSweepAngle * Math.PI) / 180;
    const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    sweepGrad.addColorStop(0, 'rgba(0, 242, 254, 0.3)');
    sweepGrad.addColorStop(0.8, 'rgba(0, 242, 254, 0.08)');
    sweepGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, sweepRad - 0.3, sweepRad);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // Crisp sweep leading line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(sweepRad) * radius, centerY + Math.sin(sweepRad) * radius);
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 8. CJIA Airport Center Icon
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('CJIA AIRPORT (CJI)', centerX + 10, centerY + 4);

    // 9. Draw Aircraft Blips & Trails
    filteredFlights.forEach(flight => {
      // Map flight percentage coordinates (0-100) to radar canvas space
      const normX = (flight.position.x - 50) / 45;
      const normY = (flight.position.y - 50) / 45;
      const planeX = centerX + normX * radius;
      const planeY = centerY + normY * radius;

      const isSelected = selectedFlight?.id === flight.id;
      const isEmergency = flight.status === 'Emergency';

      // Draw flight trail
      if (flight.pathHistory.length > 1) {
        ctx.beginPath();
        flight.pathHistory.forEach((pt, i) => {
          const ptX = centerX + ((pt.x - 50) / 45) * radius;
          const ptY = centerY + ((pt.y - 50) / 45) * radius;
          if (i === 0) ctx.moveTo(ptX, ptY);
          else ctx.lineTo(ptX, ptY);
        });
        ctx.strokeStyle = isEmergency 
          ? 'rgba(239, 68, 68, 0.4)' 
          : isSelected 
          ? 'rgba(0, 242, 254, 0.6)' 
          : 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Aircraft Airplane Silhouette / Symbol
      ctx.save();
      ctx.translate(planeX, planeY);
      ctx.rotate((flight.heading * Math.PI) / 180);

      const planeColor = isEmergency 
        ? '#ef4444' 
        : isSelected 
        ? '#00f2fe' 
        : flight.altitude === 0 
        ? '#94a3b8' 
        : '#38bdf8';

      // Draw stylized aircraft shape
      ctx.fillStyle = planeColor;
      ctx.beginPath();
      // Fuselage & Wings
      ctx.moveTo(0, -9);
      ctx.lineTo(2, -4);
      ctx.lineTo(10, 1);
      ctx.lineTo(10, 3);
      ctx.lineTo(2, 1);
      ctx.lineTo(1, 8);
      ctx.lineTo(4, 10);
      ctx.lineTo(4, 11);
      ctx.lineTo(0, 10);
      ctx.lineTo(-4, 11);
      ctx.lineTo(-4, 10);
      ctx.lineTo(-1, 8);
      ctx.lineTo(-2, 1);
      ctx.lineTo(-10, 3);
      ctx.lineTo(-10, 1);
      ctx.lineTo(-2, -4);
      ctx.closePath();
      ctx.fill();

      // Heading vector line (projecting 15px ahead)
      ctx.strokeStyle = planeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, -22);
      ctx.stroke();

      ctx.restore();

      // If selected or emergency, pulse a target circle around plane
      if (isSelected || isEmergency) {
        ctx.beginPath();
        ctx.arc(planeX, planeY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = isEmergency ? '#ef4444' : '#00f2fe';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Leader Line to Data Tag
      const tagOffsetX = 18;
      const tagOffsetY = -18;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(planeX, planeY);
      ctx.lineTo(planeX + tagOffsetX, planeY + tagOffsetY);
      ctx.lineTo(planeX + tagOffsetX + 8, planeY + tagOffsetY);
      ctx.stroke();

      // Data Block Text Box
      const altThousands = Math.round(flight.altitude / 100).toString().padStart(3, '0');
      ctx.fillStyle = isSelected ? '#ffffff' : '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(flight.flightNumber, planeX + tagOffsetX + 10, planeY + tagOffsetY - 4);

      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.font = '9px monospace';
      const teleText = `${altThousands} | ${flight.groundSpeed}kt | ${flight.aircraftType.split(' ')[0]}`;
      ctx.fillText(teleText, planeX + tagOffsetX + 10, planeY + tagOffsetY + 8);
    });

  }, [filteredFlights, selectedFlight, zoom, pan, radarSweepAngle]);

  // Click on canvas to select an aircraft
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = (width / 2) + pan.x;
    const centerY = (height / 2) + pan.y;
    const radius = Math.min(width, height) * 0.45 * zoom;

    // Find closest flight within 25px
    let matchedFlight: Flight | null = null;
    let minDistance = 25;

    filteredFlights.forEach(flight => {
      const normX = (flight.position.x - 50) / 45;
      const normY = (flight.position.y - 50) / 45;
      const planeX = centerX + normX * radius;
      const planeY = centerY + normY * radius;

      const dist = Math.hypot(clickX - planeX, clickY - planeY);
      if (dist < minDistance) {
        minDistance = dist;
        matchedFlight = flight;
      }
    });

    if (matchedFlight) {
      onSelectFlight(matchedFlight);
      audioService.playAlertBeep(false);
      AchievementService.unlock('first_flight_tracked', (ach) => onUnlockAchievement(ach.id));
    }
  };

  // Drag to pan map
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Top Controls Toolbar */}
      <div className="bg-[#09152b] border border-cyan-900/40 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <div className="flex items-center space-x-1 text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono uppercase font-bold text-[11px]">Type:</span>
          </div>

          {(['all', 'arrival', 'departure', 'enroute', 'ground'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === type
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'all' ? 'All Radar' :
               type === 'arrival' ? '🛬 Arrivals' :
               type === 'departure' ? '🛫 Departures' :
               type === 'enroute' ? '✈️ Airborne' : '🛞 On Ground'}
            </button>
          ))}

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs font-semibold outline-none focus:border-cyan-400"
          >
            <option value="all">All Airframes</option>
            <option value="widebody">Heavy Widebody (777/787/A380/747)</option>
            <option value="narrowbody">Narrowbody (737/A320/A321)</option>
            <option value="ga">General Aviation (Cessna/Piper)</option>
          </select>
        </div>

        {/* Right: Search & Create Custom Flight */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search flight # or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spawn Flight</span>
          </button>
        </div>

      </div>

      {/* Main Radar Screen & Active Flight List Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Radar Scope Viewport */}
        <div className="lg:col-span-3 relative bg-[#030813] border-2 border-cyan-900/70 rounded-3xl overflow-hidden shadow-2xl h-[580px] flex flex-col justify-between">
          
          {/* Radar Header Overlay */}
          <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 font-bold">CJIA TERMINAL RADAR SCOPE (ASR-11)</span>
              <span className="text-slate-400">|</span>
              <span className="text-white">{filteredFlights.length} TRACKED</span>
            </div>
          </div>

          {/* Map Controls Overlay (Zoom, Center) */}
          <div className="absolute top-3 right-4 z-10 flex flex-col space-y-2">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950 border border-slate-700 text-white shadow-lg transition-colors"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.6))}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950 border border-slate-700 text-white shadow-lg transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950 border border-slate-700 text-cyan-400 shadow-lg transition-colors"
              title="Center on CJIA"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive HTML5 Canvas Radar */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full cursor-crosshair touch-none"
          />

          {/* Bottom Telemetry Bar */}
          <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl">
            <div className="flex items-center space-x-3">
              <span>LAT: 34°52&apos;14&quot;N</span>
              <span>LON: 82°13&apos;08&quot;W</span>
              <span>RANGE: {Math.round(100 / zoom)} NM</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <span>SWEEP: {Math.round(radarSweepAngle)}°</span>
              <span>•</span>
              <span>SCALE: 1:{Math.round(250000 / zoom)}</span>
            </div>
          </div>

        </div>

        {/* Radar Sector Target List */}
        <div className="bg-[#081224] border border-cyan-900/50 rounded-3xl p-4 shadow-xl flex flex-col h-[580px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm tracking-wide">
                RADAR TARGETS ({filteredFlights.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">TAP TO FOCUS</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredFlights.map(flight => {
              const isSelected = selectedFlight?.id === flight.id;
              const isEmergency = flight.status === 'Emergency';

              return (
                <div
                  key={flight.id}
                  onClick={() => {
                    onSelectFlight(flight);
                    audioService.playAlertBeep(false);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md shadow-cyan-950'
                      : isEmergency
                      ? 'bg-red-950/50 border-red-500/60 text-red-200 animate-pulse'
                      : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sm text-cyan-300">
                      {flight.flightNumber}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      flight.altitude === 0 ? 'bg-slate-800 text-slate-400' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      {flight.altitude === 0 ? 'GROUND' : `${flight.altitude.toLocaleString()} FT`}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {flight.origin.code} → {flight.destination.code} ({flight.airline})
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>{flight.aircraftType}</span>
                    <span>{flight.groundSpeed} KTS • {flight.heading}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Flight Detail Modal */}
      <FlightDetailModal
        flight={selectedFlight}
        onClose={() => onSelectFlight(null)}
      />

      {/* Custom Flight Creator Modal */}
      <CustomFlightModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onAddCustomFlight={onAddCustomFlight}
      />

    </div>
  );
};
