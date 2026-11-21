import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  RotateCcw, 
  HelpCircle, 
  Award, 
  Compass, 
  Gauge, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Plane,
  Volume2
} from 'lucide-react';
import { SimulatorAircraftModel, PrimaryFlightDisplayData, LandingResult } from '../../types/simulator';
import { WeatherData } from '../../types/weather';
import { audioService } from '../../services/audioService';
import { AchievementService } from '../../data/achievements';

interface FlightSimulatorProps {
  weather: WeatherData;
  onUnlockAchievement: (id: string) => void;
}

const AIRCRAFT_CONFIGS: Record<SimulatorAircraftModel, {
  name: string;
  category: string;
  targetApproachSpeed: number;
  initialAlt: number;
  glideSlopeDeg: number;
  maxFlaps: number;
  weightCategory: string;
}> = {
  c172: {
    name: 'Cessna 172 Skyhawk',
    category: 'Trainer',
    targetApproachSpeed: 65,
    initialAlt: 1200,
    glideSlopeDeg: 3.0,
    maxFlaps: 30,
    weightCategory: 'Light'
  },
  b737: {
    name: 'Boeing 737-800 "CJ Express"',
    category: 'Twin-Jet Airliner',
    targetApproachSpeed: 142,
    initialAlt: 2500,
    glideSlopeDeg: 3.0,
    maxFlaps: 40,
    weightCategory: 'Medium'
  },
  a380: {
    name: 'Airbus A380 Superjumbo',
    category: 'Heavy Quad-Jet',
    targetApproachSpeed: 148,
    initialAlt: 3000,
    glideSlopeDeg: 3.0,
    maxFlaps: 40,
    weightCategory: 'Super Heavy'
  }
};

export const FlightSimulator: React.FC<FlightSimulatorProps> = ({
  weather,
  onUnlockAchievement
}) => {
  const [selectedModel, setSelectedModel] = useState<SimulatorAircraftModel>('b737');
  const [isRunning, setIsRunning] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [landingResult, setLandingResult] = useState<LandingResult | null>(null);

  // Flight Physics State
  const [pfd, setPfd] = useState<PrimaryFlightDisplayData>({
    pitch: 0,
    bank: 0,
    heading: 90,
    airspeed: 145,
    altitude: 2200,
    verticalSpeed: -650,
    throttle: 55,
    flaps: 15,
    gearDown: true,
    brakesActive: false,
    glideslopeDev: 0,
    localizerDev: 0
  });

  const [distanceToRunwayM, setDistanceToRunwayM] = useState(4800); // meters to threshold
  const [crossTrackOffsetM, setCrossTrackOffsetM] = useState(0); // lateral offset from centerline
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunning) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          // Pitch down (push yoke forward)
          setPfd(prev => ({ ...prev, pitch: Math.max(prev.pitch - 1.5, -20) }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          // Pitch up (pull yoke back)
          setPfd(prev => ({ ...prev, pitch: Math.min(prev.pitch + 1.5, 25) }));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          // Bank left
          setPfd(prev => ({ ...prev, bank: Math.max(prev.bank - 2, -35) }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          // Bank right
          setPfd(prev => ({ ...prev, bank: Math.min(prev.bank + 2, 35) }));
          break;
        case 'g':
        case 'G':
          // Toggle Gear
          setPfd(prev => ({ ...prev, gearDown: !prev.gearDown }));
          audioService.playAlertBeep(false);
          break;
        case 'f':
        case 'F':
          // Cycle flaps
          setPfd(prev => {
            const nextFlaps = prev.flaps === 0 ? 15 : prev.flaps === 15 ? 30 : prev.flaps === 30 ? 40 : 0;
            return { ...prev, flaps: nextFlaps };
          });
          break;
        case 'b':
        case 'B':
          // Toggle Brakes
          setPfd(prev => ({ ...prev, brakesActive: !prev.brakesActive }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  // Simulation physics loop (60 FPS)
  useEffect(() => {
    if (!isRunning || landingResult) return;

    const interval = setInterval(() => {
      setPfd(prev => {
        // Compute Vertical Speed based on pitch and airspeed
        const calculatedVs = Math.round((prev.pitch * 60) + ((prev.throttle - 50) * 15) - 600);
        
        // Compute altitude
        const nextAlt = Math.max(0, prev.altitude + (calculatedVs / 60));

        // Compute Airspeed
        const targetSpeed = 100 + (prev.throttle * 0.9) - (prev.flaps * 0.6) - (prev.gearDown ? 10 : 0);
        const nextSpeed = Math.round(prev.airspeed + (targetSpeed - prev.airspeed) * 0.05);

        // Heading changes slowly with bank
        const nextHeading = (prev.heading + (prev.bank * 0.03) + 360) % 360;

        return {
          ...prev,
          altitude: nextAlt,
          verticalSpeed: calculatedVs,
          airspeed: nextSpeed,
          heading: nextHeading
        };
      });

      // Advance distance to runway
      setDistanceToRunwayM(prevDist => {
        const nextDist = Math.max(0, prevDist - 25);
        return nextDist;
      });

      // Lateral drift from crosswind
      setCrossTrackOffsetM(prev => {
        const drift = (weather.windSpeedKts * 0.1) - (pfd.bank * 0.2);
        return prev + drift;
      });

    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, landingResult, weather.windSpeedKts, pfd.bank]);

  // Check Touchdown condition
  useEffect(() => {
    if (isRunning && !landingResult && (pfd.altitude <= 5 || distanceToRunwayM <= 0)) {
      evaluateTouchdown();
    }
  }, [pfd.altitude, distanceToRunwayM, isRunning, landingResult]);

  const evaluateTouchdown = () => {
    setIsRunning(false);
    const absVs = Math.abs(pfd.verticalSpeed);
    const offset = Math.abs(crossTrackOffsetM);

    let score = 100;
    let rating: LandingResult['rating'] = 'ACCEPTABLE';
    let feedback = '';

    if (!pfd.gearDown) {
      score = 10;
      rating = 'RUNWAY EXCURSION / CRASH';
      feedback = 'Landing gear was not extended! Belly landing emergency!';
      audioService.playAlertBeep(true);
    } else if (absVs <= 120 && offset < 15) {
      score = 98;
      rating = 'BUTTER SMOOTH';
      feedback = 'Sensational grease touchdown! Centerline precision and perfect flare!';
      AchievementService.unlock('flt_butter_landing', (ach) => onUnlockAchievement(ach.id));
      if (weather.scenario === 'crosswind') {
        AchievementService.unlock('flt_crosswind_ace', (ach) => onUnlockAchievement(ach.id));
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      audioService.playAirportChime();
    } else if (absVs <= 240 && offset < 25) {
      score = 88;
      rating = 'EXCELLENT';
      feedback = 'Firm, safe airline standard touchdown. Passenger applause in the cabin!';
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } else if (absVs <= 450) {
      score = 72;
      rating = 'ACCEPTABLE';
      feedback = 'Hard positive contact on Runway 09L. Main gear inspected, safe landing.';
    } else {
      score = 45;
      rating = 'HARD TOUCHDOWN';
      feedback = 'High descent rate on touchdown! Passengers felt that one. Structural inspection required.';
    }

    setLandingResult({
      score,
      rating,
      touchdownFpm: pfd.verticalSpeed,
      touchdownSpeedKts: pfd.airspeed,
      centerlineOffsetM: Math.round(offset),
      feedback
    });
  };

  const handleStartFlight = () => {
    const config = AIRCRAFT_CONFIGS[selectedModel];
    setPfd({
      pitch: 2,
      bank: 0,
      heading: 90,
      airspeed: config.targetApproachSpeed,
      altitude: config.initialAlt,
      verticalSpeed: -650,
      throttle: 52,
      flaps: 20,
      gearDown: true,
      brakesActive: false,
      glideslopeDev: 0,
      localizerDev: 0
    });
    setDistanceToRunwayM(4500);
    setCrossTrackOffsetM(0);
    setLandingResult(null);
    setIsRunning(true);
    audioService.playAlertBeep(false);
  };

  // Canvas View 3D Runway Approach & PFD Rendering
  useEffect(() => {
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const horizonY = (height / 2) + (pfd.pitch * 4);

    // 1. Sky & Ground Division (Artificial Horizon View)
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((pfd.bank * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    // Sky
    ctx.fillStyle = '#0f2744';
    ctx.fillRect(-width, -height, width * 3, horizonY + height);

    // Ground / Terrain
    ctx.fillStyle = '#061a10';
    ctx.fillRect(-width, horizonY, width * 3, height * 2);

    // Horizon line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-width, horizonY);
    ctx.lineTo(width * 2, horizonY);
    ctx.stroke();

    // 2. 3D Perspective Runway Approach (Runway 09L)
    const runDist = Math.max(distanceToRunwayM, 10);
    const perspectiveScale = 1200 / (runDist + 300);
    const rwyCenterX = (width / 2) - (crossTrackOffsetM * perspectiveScale * 2);

    const rwyTopY = horizonY;
    const rwyBottomY = horizonY + Math.min(height * 0.45, 180 * perspectiveScale);
    const rwyTopWidth = 14 * perspectiveScale;
    const rwyBottomWidth = 110 * perspectiveScale;

    // Runway Asphalt
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(rwyCenterX - rwyTopWidth / 2, rwyTopY);
    ctx.lineTo(rwyCenterX + rwyTopWidth / 2, rwyTopY);
    ctx.lineTo(rwyCenterX + rwyBottomWidth / 2, rwyBottomY);
    ctx.lineTo(rwyCenterX - rwyBottomWidth / 2, rwyBottomY);
    ctx.closePath();
    ctx.fill();

    // Runway Centerline Lights
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rwyCenterX, rwyTopY);
    ctx.lineTo(rwyCenterX, rwyBottomY);
    ctx.stroke();
    ctx.setLineDash([]);

    // PAPI Glidepath Lights (4 Lights: 2 Red, 2 White = On Glidepath!)
    const papiX = rwyCenterX - (rwyBottomWidth / 2) - 15;
    const papiY = rwyBottomY - 10;
    const glideslopeOk = pfd.altitude > 100 && pfd.altitude < 1500;
    const lights = glideslopeOk ? ['#ffffff', '#ffffff', '#ef4444', '#ef4444'] : ['#ef4444', '#ef4444', '#ef4444', '#ef4444'];

    lights.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(papiX + (idx * 5), papiY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    // 3. Heads-Up Display (HUD) Flight Reticle
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Aircraft boresight symbol
    ctx.moveTo(width / 2 - 25, height / 2);
    ctx.lineTo(width / 2 - 8, height / 2);
    ctx.lineTo(width / 2 - 8, height / 2 + 6);
    ctx.moveTo(width / 2 + 25, height / 2);
    ctx.lineTo(width / 2 + 8, height / 2);
    ctx.lineTo(width / 2 + 8, height / 2 + 6);
    ctx.arc(width / 2, height / 2, 4, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Airspeed Tape (Left side)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(20, height * 0.2, 55, height * 0.6);
    ctx.strokeStyle = '#00f2fe';
    ctx.strokeRect(20, height * 0.2, 55, height * 0.6);

    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('KTS', 32, height * 0.2 - 6);
    ctx.fillText(`${Math.round(pfd.airspeed)}`, 30, height / 2 + 4);

    // 5. Altimeter Tape (Right side)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(width - 85, height * 0.2, 65, height * 0.6);
    ctx.strokeStyle = '#00f2fe';
    ctx.strokeRect(width - 85, height * 0.2, 65, height * 0.6);

    ctx.fillStyle = '#00f2fe';
    ctx.fillText('ALT FT', width - 80, height * 0.2 - 6);
    ctx.fillText(`${Math.round(pfd.altitude)}`, width - 80, height / 2 + 4);

    // 6. Compass Heading Tape (Top center)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(width / 2 - 50, 15, 100, 30);
    ctx.strokeStyle = '#00f2fe';
    ctx.strokeRect(width / 2 - 50, 15, 100, 30);
    ctx.fillStyle = '#00f2fe';
    ctx.fillText(`HDG: ${Math.round(pfd.heading)}°`, width / 2 - 32, 35);

  }, [pfd, distanceToRunwayM, crossTrackOffsetM]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Flight Simulator Banner */}
      <div className="bg-[#071329] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-indigo-300">
              CJIA FLIGHT SIMULATOR • APPROACH & LANDING
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            ILS RUNWAY 09L APPROACH • PRIMARY FLIGHT DISPLAY (PFD)
          </p>
        </div>

        {/* Aircraft Selector */}
        <div className="flex items-center space-x-2">
          {(['c172', 'b737', 'a380'] as const).map(model => (
            <button
              key={model}
              onClick={() => {
                setSelectedModel(model);
                setIsRunning(false);
                setLandingResult(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedModel === model
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {model === 'c172' ? 'Cessna 172' : model === 'b737' ? 'Boeing 737' : 'Airbus A380'}
            </button>
          ))}

          <button
            onClick={() => setShowTutorial(true)}
            className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white"
            title="Cockpit Controls Tutorial"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Cockpit Display Viewport */}
      <div className="relative bg-[#020b14] border-2 border-indigo-950 rounded-3xl overflow-hidden shadow-2xl h-[520px]">
        
        {/* Canvas Cockpit Perspective */}
        <canvas
          ref={simCanvasRef}
          className="w-full h-full"
        />

        {/* Pre-Flight Start Overlay if not running */}
        {!isRunning && !landingResult && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-600/40">
              <Plane className="w-8 h-8 transform -rotate-45" />
            </div>
            <h3 className="text-2xl font-black text-white font-mono mb-1">
              READY FOR FINAL APPROACH
            </h3>
            <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
              Aircraft: {AIRCRAFT_CONFIGS[selectedModel].name} • ILS Runway 09L • 4.5 Miles Out • Target Vref: {AIRCRAFT_CONFIGS[selectedModel].targetApproachSpeed} kts.
            </p>
            <button
              onClick={handleStartFlight}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 tracking-wider transition-all transform hover:scale-105"
            >
              START APPROACH & TAKEOFF / LANDING
            </button>
          </div>
        )}

        {/* Landing Debrief Modal Result */}
        {landingResult && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fadeIn">
            <div className="max-w-md w-full bg-[#081224] border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl">
              <div className="text-3xl font-black font-mono text-cyan-300 mb-1">
                {landingResult.rating}
              </div>
              <div className="text-sm font-bold text-amber-400 font-mono mb-4">
                LANDING SCORE: {landingResult.score} / 100
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-4">
                <div>
                  <span className="text-slate-400">TOUCHDOWN RATE:</span>
                  <div className="text-white font-bold">{Math.abs(landingResult.touchdownFpm)} FPM</div>
                </div>
                <div>
                  <span className="text-slate-400">AIRSPEED:</span>
                  <div className="text-white font-bold">{landingResult.touchdownSpeedKts} KTS</div>
                </div>
                <div>
                  <span className="text-slate-400">CENTERLINE:</span>
                  <div className="text-white font-bold">{landingResult.centerlineOffsetM} M</div>
                </div>
                <div>
                  <span className="text-slate-400">RUNWAY:</span>
                  <div className="text-emerald-400 font-bold">09L (DRY)</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                {landingResult.feedback}
              </p>

              <button
                onClick={handleStartFlight}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider uppercase transition-colors"
              >
                Fly Approach Again
              </button>
            </div>
          </div>
        )}

        {/* On-Screen Mobile & Touch Flight Controls (Overlay) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          
          {/* Pitch & Roll Yoke Buttons */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-2 flex items-center space-x-1.5">
            <button
              onClick={() => setPfd(prev => ({ ...prev, pitch: prev.pitch + 2 }))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white"
              title="Pitch Nose Up"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPfd(prev => ({ ...prev, pitch: prev.pitch - 2 }))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white"
              title="Pitch Nose Down"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPfd(prev => ({ ...prev, bank: prev.bank - 4 }))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white"
              title="Bank Left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPfd(prev => ({ ...prev, bank: prev.bank + 4 }))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white"
              title="Bank Right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Throttle Slider */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-cyan-400">THROTTLE:</span>
            <input
              type="range"
              min="20"
              max="100"
              value={pfd.throttle}
              onChange={(e) => setPfd(prev => ({ ...prev, throttle: Number(e.target.value) }))}
              className="w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-xs font-mono font-bold text-white">{pfd.throttle}%</span>
          </div>

          {/* Flaps & Gear Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPfd(prev => ({ ...prev, flaps: prev.flaps === 0 ? 15 : prev.flaps === 15 ? 30 : 0 }))}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-cyan-300 font-mono text-xs font-bold"
            >
              FLAPS: {pfd.flaps}°
            </button>

            <button
              onClick={() => setPfd(prev => ({ ...prev, gearDown: !prev.gearDown }))}
              className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                pfd.gearDown
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  : 'bg-red-950 text-red-300 border border-red-500/50 animate-pulse'
              }`}
            >
              GEAR: {pfd.gearDown ? 'DOWN' : 'UP'}
            </button>
          </div>

        </div>

      </div>

      {/* Beginner Tutorial Overlay Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#081224] border-2 border-indigo-500/60 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-indigo-300 font-mono">
                HOW TO FLY & LAND LIKE AN AIRLINE CAPTAIN
              </h3>
              <button onClick={() => setShowTutorial(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>Welcome, Captain! Flying the approach to CJIA is exciting and realistic:</p>
              
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-cyan-400 mb-1">🎮 Keyboard & Touch Controls:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Down Arrow / S:</strong> Pull nose UP (flare right before touchdown).</li>
                  <li><strong>Up Arrow / W:</strong> Push nose DOWN.</li>
                  <li><strong>Left & Right Arrow / A & D:</strong> Bank aircraft to align with runway centerline.</li>
                  <li><strong>G:</strong> Lower / Raise landing gear.</li>
                  <li><strong>F:</strong> Extend flaps to slow down safely.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-emerald-400 mb-1">🔴⚪ PAPI Glidepath Lights (Next to Runway):</h4>
                <p>Look at the 4 small lights to the left of the runway:</p>
                <ul className="list-disc list-inside mt-1">
                  <li><strong>2 White, 2 Red:</strong> Perfect! You are on the exact 3-degree glide slope.</li>
                  <li><strong>4 Red:</strong> Too low! Pull up and add throttle.</li>
                  <li><strong>4 White:</strong> Too high! Pitch down and reduce throttle.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowTutorial(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Got It, Let&apos;s Fly! ✈️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
