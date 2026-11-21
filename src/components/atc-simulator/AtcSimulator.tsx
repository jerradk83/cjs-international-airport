import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  ShieldAlert, 
  Award, 
  Volume2, 
  Compass, 
  HelpCircle, 
  CheckCircle, 
  RotateCcw,
  Plane,
  AlertTriangle,
  Play
} from 'lucide-react';
import { AtcTargetAircraft, AtcActionType, AtcTransmission, AtcDifficulty } from '../../types/atc';
import { WeatherData } from '../../types/weather';
import { audioService } from '../../services/audioService';
import { AchievementService } from '../../data/achievements';

interface AtcSimulatorProps {
  weather: WeatherData;
  onUnlockAchievement: (id: string) => void;
}

const INITIAL_ATC_TARGETS: AtcTargetAircraft[] = [
  {
    id: 'atc-1',
    flightNumber: 'United 245',
    callsign: 'UNITED 245',
    airline: 'United Airlines',
    aircraftType: 'Boeing 737-800',
    phase: 'holding_short',
    assignedRunway: '09L',
    distanceNm: 0,
    altitudeFt: 0,
    speedKts: 0,
    headingDeg: 90,
    position: { x: 30, y: 38 },
    fuelMins: 140,
    pendingRequest: 'CJ Tower, United 245 holding short Runway 09L, ready for departure.',
    validActions: ['CLEAR_TAKEOFF', 'LINE_UP_WAIT', 'HOLD_SHORT', 'REQUEST_INFO'],
    statusText: 'Holding Short 09L'
  },
  {
    id: 'atc-2',
    flightNumber: 'CJ Air 102',
    callsign: 'CJ-BIRD 102',
    airline: 'CJ Air',
    aircraftType: 'Boeing 787-9',
    phase: 'final_approach',
    assignedRunway: '09R',
    distanceNm: 4.8,
    altitudeFt: 1500,
    speedKts: 145,
    headingDeg: 90,
    position: { x: 18, y: 65 },
    fuelMins: 95,
    pendingRequest: 'CJ Tower, CJ-Bird 102 established on ILS Runway 09R, 5 miles out.',
    validActions: ['CLEAR_LAND', 'GO_AROUND', 'REQUEST_INFO'],
    statusText: '5 NM Final 09R'
  },
  {
    id: 'atc-3',
    flightNumber: 'Delta 1209',
    callsign: 'DELTA 1209',
    airline: 'Delta Air Lines',
    aircraftType: 'Airbus A321neo',
    phase: 'inbound',
    assignedRunway: '09L',
    distanceNm: 9.2,
    altitudeFt: 3000,
    speedKts: 180,
    headingDeg: 90,
    position: { x: 8, y: 38 },
    fuelMins: 110,
    pendingRequest: 'CJ Tower, Delta 1209 inbound 9 miles, requesting landing clearance 09L.',
    validActions: ['CLEAR_LAND', 'GO_AROUND', 'REQUEST_INFO'],
    statusText: '9 NM Inbound 09L'
  },
  {
    id: 'atc-4',
    flightNumber: 'SkyJet 842',
    callsign: 'SKYJET 842',
    airline: 'SkyJet Cargo',
    aircraftType: 'Boeing 777-300ER',
    phase: 'touchdown',
    assignedRunway: '09R',
    distanceNm: 0,
    altitudeFt: 0,
    speedKts: 35,
    headingDeg: 90,
    position: { x: 55, y: 65 },
    fuelMins: 60,
    pendingRequest: 'CJ Tower, SkyJet 842 runway vacated at Taxiway Echo, requesting taxi to ramp.',
    validActions: ['TAXI_TO_GATE', 'HOLD_SHORT'],
    statusText: 'Runway Vacated 09R'
  }
];

export const AtcSimulator: React.FC<AtcSimulatorProps> = ({
  weather,
  onUnlockAchievement
}) => {
  const [aircraftList, setAircraftList] = useState<AtcTargetAircraft[]>(INITIAL_ATC_TARGETS);
  const [selectedAircraft, setSelectedAircraft] = useState<AtcTargetAircraft | null>(INITIAL_ATC_TARGETS[0]);
  const [difficulty, setDifficulty] = useState<AtcDifficulty>('beginner');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [transmissions, setTransmissions] = useState<AtcTransmission[]>([
    {
      id: 'tx-0',
      timestamp: '11:20:00',
      sender: 'TOWER',
      callsign: 'CJ TOWER',
      message: 'CJ Tower active on 118.70. Runways 09L and 09R active. Wind 090 at 8 knots.',
      type: 'info'
    }
  ]);
  const [showEduGuide, setShowEduGuide] = useState(false);
  const [separationAlert, setSeparationAlert] = useState<string | null>(null);

  const atcCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Separation check interval
  useEffect(() => {
    const timer = setInterval(() => {
      // Check if two airborne planes on same runway corridor are within 3 NM
      const airborne = aircraftList.filter(a => a.altitudeFt > 0);
      for (let i = 0; i < airborne.length; i++) {
        for (let j = i + 1; j < airborne.length; j++) {
          const a1 = airborne[i];
          const a2 = airborne[j];
          if (a1.assignedRunway === a2.assignedRunway) {
            const distanceDiff = Math.abs(a1.distanceNm - a2.distanceNm);
            const altDiff = Math.abs(a1.altitudeFt - a2.altitudeFt);
            if (distanceDiff < 2.5 && altDiff < 800) {
              setSeparationAlert(`LOSS OF SEPARATION: ${a1.callsign} and ${a2.callsign} separated by only ${distanceDiff.toFixed(1)} NM! Issue immediate go-around!`);
              audioService.playAlertBeep(true);
              return;
            }
          }
        }
      }
      setSeparationAlert(null);
    }, 2000);
    return () => clearInterval(timer);
  }, [aircraftList]);

  // Canvas Radar Scope
  useEffect(() => {
    const canvas = atcCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Dark ATC Radar Background
    ctx.fillStyle = '#020b14';
    ctx.fillRect(0, 0, width, height);

    // Green Radar Grid
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Runway 09L / 27R representation
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.fillRect(width * 0.4, height * 0.38, width * 0.35, 6);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('RWY 09L / 27R (11,800 FT)', width * 0.42, height * 0.38 - 4);

    // Extended ILS approach centerline for 09L
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.38 + 3);
    ctx.lineTo(width * 0.4, height * 0.38 + 3);
    ctx.stroke();

    // Runway 09R / 27L representation
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.fillRect(width * 0.4, height * 0.65, width * 0.3, 6);
    ctx.fillStyle = '#10b981';
    ctx.fillText('RWY 09R / 27L (9,500 FT)', width * 0.42, height * 0.65 - 4);

    // Extended ILS approach centerline for 09R
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.65 + 3);
    ctx.lineTo(width * 0.4, height * 0.65 + 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw ATC Targets
    aircraftList.forEach(ac => {
      const px = (ac.position.x / 100) * width;
      const py = (ac.position.y / 100) * height;
      const isSelected = selectedAircraft?.id === ac.id;

      // Draw blip symbol
      ctx.fillStyle = isSelected ? '#ffffff' : '#10b981';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      // Heading velocity vector
      ctx.strokeStyle = isSelected ? '#ffffff' : '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + (ac.speedKts > 0 ? 16 : 0), py);
      ctx.stroke();

      if (isSelected) {
        ctx.strokeStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Leader tag
      ctx.fillStyle = isSelected ? '#00f2fe' : '#a7f3d0';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(ac.callsign, px + 8, py - 6);

      ctx.fillStyle = 'rgba(209, 250, 229, 0.8)';
      ctx.font = '8px monospace';
      ctx.fillText(`FL${Math.round(ac.altitudeFt / 100)} ${ac.speedKts}K ${ac.statusText}`, px + 8, py + 5);
    });

  }, [aircraftList, selectedAircraft]);

  const addTransmission = (sender: 'TOWER' | 'PILOT' | 'SYSTEM', callsign: string, message: string, type: AtcTransmission['type']) => {
    const newTx: AtcTransmission = {
      id: `tx-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      sender,
      callsign,
      message,
      type
    };
    setTransmissions(prev => [newTx, ...prev.slice(0, 15)]);
  };

  const handleAction = (action: AtcActionType) => {
    if (!selectedAircraft) return;

    const callsign = selectedAircraft.callsign;
    const rwy = selectedAircraft.assignedRunway;

    switch (action) {
      case 'CLEAR_TAKEOFF':
        addTransmission('TOWER', 'CJ TOWER', `${callsign}, Runway ${rwy}, Wind ${weather.windDirectionDeg} at ${weather.windSpeedKts}, Cleared for Takeoff!`, 'instruction');
        audioService.speakRadioTransmission(callsign, `Runway ${rwy}, Cleared for Takeoff!`);
        
        setTimeout(() => {
          addTransmission('PILOT', callsign, `Cleared for takeoff Runway ${rwy}, rolling, ${callsign}.`, 'readback');
          setAircraftList(prev => prev.map(a => a.id === selectedAircraft.id ? {
            ...a,
            phase: 'takeoff_roll',
            speedKts: 160,
            altitudeFt: 500,
            statusText: 'Airborne Climbing',
            position: { x: 75, y: a.position.y },
            pendingRequest: undefined
          } : a));
          setScore(s => s + 100);
          setStreak(st => st + 1);
        }, 1200);
        break;

      case 'HOLD_SHORT':
        addTransmission('TOWER', 'CJ TOWER', `${callsign}, Hold short Runway ${rwy}, traffic on 3-mile final.`, 'instruction');
        audioService.speakRadioTransmission(callsign, `Hold short Runway ${rwy}.`);
        setTimeout(() => {
          addTransmission('PILOT', callsign, `Holding short Runway ${rwy}, ${callsign}.`, 'readback');
          setScore(s => s + 50);
        }, 1200);
        break;

      case 'LINE_UP_WAIT':
        addTransmission('TOWER', 'CJ TOWER', `${callsign}, Runway ${rwy}, Line up and Wait. Traffic landing opposite.`, 'instruction');
        audioService.speakRadioTransmission(callsign, `Runway ${rwy}, Line up and Wait.`);
        setTimeout(() => {
          addTransmission('PILOT', callsign, `Line up and wait Runway ${rwy}, ${callsign}.`, 'readback');
          setAircraftList(prev => prev.map(a => a.id === selectedAircraft.id ? {
            ...a,
            position: { x: 42, y: a.position.y },
            statusText: 'Lined up on runway'
          } : a));
          setScore(s => s + 50);
        }, 1200);
        break;

      case 'CLEAR_LAND':
        addTransmission('TOWER', 'CJ TOWER', `${callsign}, Wind ${weather.windDirectionDeg} at ${weather.windSpeedKts}, Runway ${rwy}, Cleared to Land!`, 'instruction');
        audioService.speakRadioTransmission(callsign, `Runway ${rwy}, Cleared to Land!`);
        setTimeout(() => {
          addTransmission('PILOT', callsign, `Cleared to land Runway ${rwy}, ${callsign}.`, 'readback');
          setAircraftList(prev => prev.map(a => a.id === selectedAircraft.id ? {
            ...a,
            phase: 'touchdown',
            altitudeFt: 0,
            speedKts: 60,
            statusText: 'Touchdown Rolling',
            position: { x: 50, y: a.position.y },
            pendingRequest: undefined
          } : a));
          setScore(s => s + 150);
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          AchievementService.unlock('atc_first_landing', (ach) => onUnlockAchievement(ach.id));
          if (nextStreak >= 5) {
            AchievementService.unlock('atc_flawless_streak', (ach) => onUnlockAchievement(ach.id));
          }
        }, 1200);
        break;

      case 'GO_AROUND':
        addTransmission('TOWER', 'CJ TOWER', `${callsign}, Go-Around! Climb and maintain 3,000 feet, contact departure on 124.60!`, 'alert');
        audioService.playAlertBeep(true);
        audioService.speakRadioTransmission(callsign, `Go Around! Climb and maintain 3,000 feet!`);
        setTimeout(() => {
          addTransmission('PILOT', callsign, `Going around, climbing 3,000, ${callsign}!`, 'readback');
          setAircraftList(prev => prev.map(a => a.id === selectedAircraft.id ? {
            ...a,
            phase: 'go_around',
            altitudeFt: 3000,
            speedKts: 210,
            statusText: 'Going Around Climb 3000',
            position: { x: 60, y: a.position.y - 15 },
            pendingRequest: undefined
          } : a));
          setScore(s => s + 75);
        }, 1200);
        break;

      case 'TAXI_TO_GATE':
        addTransmission('TOWER', 'CJ TOWER', `${callsign}, Taxi to Terminal gate via Taxiway Alpha, monitor Ground 121.90.`, 'instruction');
        audioService.speakRadioTransmission(callsign, `Taxi to gate via Alpha.`);
        setTimeout(() => {
          addTransmission('PILOT', callsign, `Taxi to gate via Alpha, switching to ground, good day ${callsign}.`, 'readback');
          setAircraftList(prev => prev.filter(a => a.id !== selectedAircraft.id));
          setSelectedAircraft(null);
          setScore(s => s + 100);
        }, 1200);
        break;

      case 'REQUEST_INFO':
        addTransmission('TOWER', 'CJ TOWER', `${callsign}, Say intentions and confirm flight fuel remaining.`, 'instruction');
        setTimeout(() => {
          addTransmission('PILOT', callsign, `${callsign} has ${selectedAircraft.fuelMins} minutes fuel remaining, no emergency, ready on your sequence.`, 'readback');
        }, 1000);
        break;
    }
  };

  const handleResetSession = () => {
    setAircraftList(INITIAL_ATC_TARGETS);
    setSelectedAircraft(INITIAL_ATC_TARGETS[0]);
    setScore(0);
    setStreak(0);
    setSeparationAlert(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ATC Header & Control Room Status */}
      <div className="bg-[#040e1c] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-emerald-300">
                AIR TRAFFIC CONTROL TOWER SIMULATOR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                FREQ 118.70 MHz
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              CJ TOWER & TERMINAL RADAR APPROACH CONTROL (TRACON)
            </p>
          </div>
        </div>

        {/* Score & Streak Stats */}
        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono">
          <div className="text-center">
            <div className="text-[10px] text-slate-400">ATC SCORE</div>
            <div className="text-base font-bold text-emerald-400">{score}</div>
          </div>
          <div className="w-[1px] h-6 bg-slate-700" />
          <div className="text-center">
            <div className="text-[10px] text-slate-400">STREAK</div>
            <div className="text-base font-bold text-amber-400">{streak} 🔥</div>
          </div>
          <div className="w-[1px] h-6 bg-slate-700" />
          {/* Difficulty selector */}
          <div>
            <div className="text-[10px] text-slate-400">DIFFICULTY</div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as AtcDifficulty)}
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-cyan-300 font-bold outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button
            onClick={() => setShowEduGuide(true)}
            className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white ml-2"
            title="ATC Phraseology & Educational Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Separation Warning Banner if active */}
      {separationAlert && (
        <div className="p-4 rounded-xl bg-red-950/90 border-2 border-red-500 text-red-200 flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <span className="text-sm font-bold font-mono">{separationAlert}</span>
          </div>
          <button
            onClick={() => handleAction('GO_AROUND')}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-lg shrink-0"
          >
            Issue Immediate Go-Around!
          </button>
        </div>
      )}

      {/* Main ATC Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tower Radar Scope */}
        <div className="lg:col-span-2 bg-[#020b14] border-2 border-emerald-950 rounded-3xl p-4 shadow-2xl flex flex-col justify-between h-[520px]">
          <div className="flex items-center justify-between border-b border-emerald-950/80 pb-2 mb-2 font-mono text-xs">
            <div className="flex items-center space-x-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">CJIA ASDE-X SURFACE MOVEMENT RADAR</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              WIND: {weather.windDirectionDeg}° @ {weather.windSpeedKts}KT • ACTIVE: 09L / 09R
            </div>
          </div>

          {/* Canvas Radar */}
          <canvas
            ref={atcCanvasRef}
            className="w-full h-[400px] rounded-2xl cursor-pointer"
          />

          {/* Selected target quick status bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
            {selectedAircraft ? (
              <>
                <span className="text-emerald-300 font-bold">
                  TARGET: {selectedAircraft.callsign} ({selectedAircraft.aircraftType})
                </span>
                <span className="text-slate-300">
                  RWY: {selectedAircraft.assignedRunway} • ALT: {selectedAircraft.altitudeFt} FT • SPD: {selectedAircraft.speedKts} KTS
                </span>
              </>
            ) : (
              <span className="text-slate-500">Click a flight on the radar to select target.</span>
            )}
          </div>
        </div>

        {/* Right Column: Controller Console & Radio Transmissions */}
        <div className="space-y-4 flex flex-col h-[520px]">
          
          {/* Controller Command Panel */}
          <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-4 shadow-xl">
            <h3 className="font-bold font-mono text-sm text-cyan-300 mb-3 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>CONTROLLER ACTION CONSOLE</span>
            </h3>

            {selectedAircraft ? (
              <div className="space-y-3">
                {/* Incoming Pilot Request Box */}
                {selectedAircraft.pendingRequest && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono leading-relaxed">
                    <span className="font-bold text-white">PILOT REQUEST: </span>
                    &ldquo;{selectedAircraft.pendingRequest}&rdquo;
                  </div>
                )}

                {/* ATC Clearances Buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {selectedAircraft.validActions.includes('CLEAR_TAKEOFF') && (
                    <button
                      onClick={() => handleAction('CLEAR_TAKEOFF')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                    >
                      Cleared for Takeoff
                    </button>
                  )}

                  {selectedAircraft.validActions.includes('CLEAR_LAND') && (
                    <button
                      onClick={() => handleAction('CLEAR_LAND')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                    >
                      Cleared to Land
                    </button>
                  )}

                  {selectedAircraft.validActions.includes('HOLD_SHORT') && (
                    <button
                      onClick={() => handleAction('HOLD_SHORT')}
                      className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition-all"
                    >
                      Hold Short Runway
                    </button>
                  )}

                  {selectedAircraft.validActions.includes('LINE_UP_WAIT') && (
                    <button
                      onClick={() => handleAction('LINE_UP_WAIT')}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all"
                    >
                      Line Up & Wait
                    </button>
                  )}

                  {selectedAircraft.validActions.includes('GO_AROUND') && (
                    <button
                      onClick={() => handleAction('GO_AROUND')}
                      className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition-all"
                    >
                      Execute Go-Around
                    </button>
                  )}

                  {selectedAircraft.validActions.includes('TAXI_TO_GATE') && (
                    <button
                      onClick={() => handleAction('TAXI_TO_GATE')}
                      className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
                    >
                      Taxi to Gate
                    </button>
                  )}

                  {selectedAircraft.validActions.includes('REQUEST_INFO') && (
                    <button
                      onClick={() => handleAction('REQUEST_INFO')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                    >
                      Request Info / Intentions
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                No aircraft selected. Select one from the list below.
              </div>
            )}
          </div>

          {/* Active ATC Target Aircraft Switcher */}
          <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-3 flex-1 flex flex-col overflow-hidden">
            <h4 className="font-mono text-xs text-slate-400 font-bold mb-2">
              ACTIVE RADAR TARGETS
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {aircraftList.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAircraft(a)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedAircraft?.id === a.id
                      ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-emerald-300">{a.callsign}</span>
                    <span className="text-[10px] text-amber-300">RWY {a.assignedRunway}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {a.statusText} • {a.aircraftType}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Live Radio Transmissions Log */}
      <div className="bg-[#050c18] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 font-mono text-xs">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>ATC RADIO TRANSMISSIONS LOG (118.70 MHz)</span>
          </div>
          <button
            onClick={handleResetSession}
            className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ATC Session</span>
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 font-mono text-xs">
          {transmissions.map(tx => (
            <div 
              key={tx.id} 
              className={`p-2 rounded-lg border text-xs leading-relaxed ${
                tx.sender === 'TOWER' 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                  : tx.type === 'alert'
                  ? 'bg-red-950/60 border-red-500/50 text-red-200 font-bold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span className="font-bold text-cyan-400">{tx.callsign}</span>
                <span>{tx.timestamp}</span>
              </div>
              <p>{tx.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Guide Modal for aspiring controllers */}
      {showEduGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#081224] border-2 border-emerald-500/60 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-emerald-300 font-mono">
                ATC PHRASEOLOGY & TOWER PROCEDURES GUIDE
              </h3>
              <button onClick={() => setShowEduGuide(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
                <h4 className="font-bold text-white mb-1">🎮 Entertainment Disclaimer</h4>
                <p>This is a simplified entertainment simulator designed for fun and educational understanding, not official FAA pilot or ATC certification.</p>
              </div>

              <div>
                <h4 className="font-bold text-cyan-300 mb-1">1. Runway Numbering</h4>
                <p>Runway headings are based on magnetic compass direction divided by 10. Runway 09 points 090° (East), Runway 27 points 270° (West). Left (L) and Right (R) indicate parallel runways.</p>
              </div>

              <div>
                <h4 className="font-bold text-cyan-300 mb-1">2. Key ATC Clearances</h4>
                <ul className="list-disc list-inside space-y-1 mt-1 text-slate-300">
                  <li><strong>Cleared for Takeoff:</strong> The runway is clear of all aircraft and vehicles. The pilot is authorized to apply power and take off.</li>
                  <li><strong>Hold Short:</strong> Aircraft must STOP before crossing the solid yellow runway hold-line paint on the taxiway.</li>
                  <li><strong>Line Up and Wait:</strong> Aircraft enters the runway and points down the centerline, but waits for final takeoff clearance.</li>
                  <li><strong>Cleared to Land:</strong> The arriving flight has official clearance to touch down on the assigned runway.</li>
                  <li><strong>Go-Around:</strong> Safety maneuver when a runway is obstructed or approach unstabilized. Pilot applies full thrust, aborts landing, and climbs to safe altitude.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-cyan-300 mb-1">3. Separation Minimums</h4>
                <p>Controllers must maintain at least 3 nautical miles horizontal separation or 1,000 feet vertical separation between aircraft in airport terminal airspace.</p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowEduGuide(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Back to Tower
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
