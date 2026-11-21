import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, 
  Plane, 
  Radio, 
  ShieldAlert, 
  Package, 
  Wrench, 
  Flame, 
  Compass, 
  Layers, 
  Info,
  X,
  Sparkles
} from 'lucide-react';
import { AIRPORT_FACILITIES, AirportFacility } from '../../data/airportFacilities';
import { audioService } from '../../services/audioService';

export const AirportMap: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<AirportFacility | null>(AIRPORT_FACILITIES[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated taxiing aircraft state
  const taxiPlanesRef = useRef([
    { id: 'tx-1', flight: 'CJ 245', type: 'Boeing 787-9', x: 45, y: 44, targetX: 18, targetY: 22, progress: 0.1, speed: 0.0015 },
    { id: 'tx-2', flight: 'DL 1209', type: 'A321neo', x: 20, y: 78, targetX: 45, targetY: 48, progress: 0.4, speed: 0.0018 },
    { id: 'tx-3', flight: 'EK 215', type: 'A380', x: 65, y: 78, targetX: 62, targetY: 44, progress: 0.7, speed: 0.0012 }
  ]);

  // Animation frame loop for taxiing aircraft
  useEffect(() => {
    let animId: number;
    const animate = () => {
      taxiPlanesRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
      });

      drawAirfield();
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [selectedFacility, filterCategory]);

  const drawAirfield = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 1. Tarmac & Grass Airfield Background
    ctx.fillStyle = '#06131f';
    ctx.fillRect(0, 0, width, height);

    // Airfield perimeter boundary
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // 2. Draw Runways
    // Runway 09L / 27R (North Primary)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width * 0.15, height * 0.2, width * 0.7, 24);
    // Runway centerline dashes
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(width * 0.18, height * 0.2 + 12);
    ctx.lineTo(width * 0.82, height * 0.2 + 12);
    ctx.stroke();
    ctx.setLineDash([]);
    // Numbers
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('09L', width * 0.16, height * 0.2 + 16);
    ctx.fillText('27R', width * 0.81, height * 0.2 + 16);

    // Runway 09R / 27L (South Commercial)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width * 0.2, height * 0.78, width * 0.6, 20);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(width * 0.23, height * 0.78 + 10);
    ctx.lineTo(width * 0.77, height * 0.78 + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('09R', width * 0.21, height * 0.78 + 15);
    ctx.fillText('27L', width * 0.76, height * 0.78 + 15);

    // Runway 18 / 36 (Crosswind Runway)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width * 0.22, height * 0.15, 20, height * 0.68);
    ctx.strokeStyle = '#f8fafc';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(width * 0.22 + 10, height * 0.18);
    ctx.lineTo(width * 0.22 + 10, height * 0.8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('36', width * 0.22 + 3, height * 0.82);
    ctx.fillText('18', width * 0.22 + 3, height * 0.17);

    // 3. Main Taxiways (Yellow guide lines)
    // Taxiway Alpha (Parallel North)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(width * 0.18, height * 0.27);
    ctx.lineTo(width * 0.82, height * 0.27);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.18, height * 0.27);
    ctx.lineTo(width * 0.82, height * 0.27);
    ctx.stroke();

    // Taxiway Bravo (Parallel South)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(width * 0.22, height * 0.72);
    ctx.lineTo(width * 0.78, height * 0.72);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.22, height * 0.72);
    ctx.lineTo(width * 0.78, height * 0.72);
    ctx.stroke();

    // High speed exit connectors (Charlie, Delta, Echo)
    const connectors = [0.35, 0.5, 0.65];
    connectors.forEach(cx => {
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(width * cx, height * 0.2);
      ctx.lineTo(width * (cx + 0.04), height * 0.27);
      ctx.moveTo(width * cx, height * 0.78);
      ctx.lineTo(width * (cx + 0.04), height * 0.72);
      ctx.stroke();
    });

    // 4. Passenger Terminals Apron Areas
    // Terminal A (Center-left)
    ctx.fillStyle = '#0f243d';
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.fillRect(width * 0.38, height * 0.42, width * 0.14, height * 0.12);
    ctx.strokeRect(width * 0.38, height * 0.42, width * 0.14, height * 0.12);

    // Terminal B (Center-right International)
    ctx.fillStyle = '#0f243d';
    ctx.strokeStyle = '#38bdf8';
    ctx.fillRect(width * 0.55, height * 0.42, width * 0.14, height * 0.12);
    ctx.strokeRect(width * 0.55, height * 0.42, width * 0.14, height * 0.12);

    // Terminal C (Regional)
    ctx.fillRect(width * 0.27, height * 0.42, width * 0.08, height * 0.1);
    ctx.strokeRect(width * 0.27, height * 0.42, width * 0.08, height * 0.1);

    // Terminal Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('TERMINAL A (DOMESTIC)', width * 0.39, height * 0.48);
    ctx.fillText('TERMINAL B (INTL)', width * 0.57, height * 0.48);
    ctx.fillText('TERM C', width * 0.28, height * 0.48);

    // 5. ATC Control Tower (Iconic circular base)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(width * 0.52, height * 0.35, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('TOWER', width * 0.505, height * 0.35 + 3);

    // 6. Draw Hotspot Facilities
    AIRPORT_FACILITIES.forEach(fac => {
      const isSelected = selectedFacility?.id === fac.id;
      const hx = (fac.coordinates.x / 100) * width;
      const hy = (fac.coordinates.y / 100) * height;

      // Draw interactive pulse circle on hotspot
      ctx.fillStyle = isSelected ? '#00f2fe' : 'rgba(0, 242, 254, 0.3)';
      ctx.beginPath();
      ctx.arc(hx, hy, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 7. Render Animated Taxiing Aircraft
    taxiPlanesRef.current.forEach(tp => {
      // Linear interpolation along taxi route
      const curX = ((tp.x + (tp.targetX - tp.x) * tp.progress) / 100) * width;
      const curY = ((tp.y + (tp.targetY - tp.y) * tp.progress) / 100) * height;

      ctx.save();
      ctx.translate(curX, curY);

      // Airplane symbol on tarmac
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Plane Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(tp.flight, 8, 3);
      ctx.restore();
    });

  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Check click against facilities
    let found: AirportFacility | null = null;
    let minDist = 40;

    AIRPORT_FACILITIES.forEach(fac => {
      const fx = (fac.coordinates.x / 100) * width;
      const fy = (fac.coordinates.y / 100) * height;
      const d = Math.hypot(clickX - fx, clickY - fy);
      if (d < minDist) {
        minDist = d;
        found = fac;
      }
    });

    if (found) {
      setSelectedFacility(found);
      audioService.playAlertBeep(false);
    }
  };

  const filteredFacilities = AIRPORT_FACILITIES.filter(f => {
    if (filterCategory === 'all') return true;
    return f.category === filterCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Airport Map Header */}
      <div className="bg-[#071329] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-cyan-300">
              INTERACTIVE AIRPORT DIAGRAM & TERMINAL MAP
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            KCJIA AERONAUTICAL GROUND CHART • CLICK FACILITIES TO EXPLORE
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['all', 'runway', 'terminal', 'tower', 'safety', 'cargo', 'maintenance', 'fuel'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                filterCategory === cat
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Airfield Layout & Interactive Inspector Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Canvas Diagram Viewport */}
        <div className="lg:col-span-2 relative bg-[#040e1b] border-2 border-cyan-900/60 rounded-3xl overflow-hidden shadow-2xl h-[560px]">
          
          <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center space-x-2">
            <Plane className="w-4 h-4 text-cyan-400 transform -rotate-45" />
            <span className="text-white font-bold">ANIMATED TAXIING MOVEMENTS ACTIVE</span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[10px] text-slate-400">
            CLICK ANY FACILITY OR RUNWAY TO INSPECT SPECIFICATIONS
          </div>

          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer"
          />
        </div>

        {/* Facility Educational Details Card */}
        <div className="space-y-4 flex flex-col justify-between h-[560px]">
          
          {selectedFacility ? (
            <div className="bg-[#081224] border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col justify-between overflow-y-auto">
              
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-cyan-950 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold">
                        {selectedFacility.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {selectedFacility.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {selectedFacility.description}
                </p>

                {/* Technical Specifications */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider mb-2">
                    Operational Specifications
                  </h4>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs font-mono">
                    {Object.entries(selectedFacility.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-slate-800/60 pb-1 last:border-0 last:pb-0">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-white font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Educational Fun Fact for Kids & Adults */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/80 to-cyan-950/80 border border-cyan-400/30">
                  <div className="flex items-center space-x-1.5 text-cyan-300 text-xs font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Aviation Science & Educational Fact</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedFacility.educationalFact}
                  </p>
                </div>
              </div>

              <div className="pt-4 text-center">
                <span className="text-[10px] font-mono text-slate-500">
                  FACILITY ID: {selectedFacility.id.toUpperCase()} • CJIA AERONAUTICAL SURVEY
                </span>
              </div>

            </div>
          ) : (
            <div className="bg-[#081224] border border-cyan-900/50 rounded-3xl p-6 flex items-center justify-center text-slate-500 text-xs">
              Click any airport building or runway to inspect details.
            </div>
          )}

          {/* Quick Facility Switcher Buttons */}
          <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-3 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {filteredFacilities.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFacility(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedFacility?.id === f.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {f.shortCode}
              </button>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
