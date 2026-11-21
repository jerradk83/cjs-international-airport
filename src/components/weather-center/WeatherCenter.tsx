import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudSun, 
  Wind, 
  Eye, 
  Gauge, 
  Compass, 
  Droplets, 
  CloudRain, 
  CloudFog, 
  CloudSnow, 
  CloudLightning, 
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { WeatherData, WeatherScenario } from '../../types/weather';
import { WEATHER_PRESETS } from '../../services/simulationStore';
import { audioService } from '../../services/audioService';
import { AchievementService } from '../../data/achievements';

interface WeatherCenterProps {
  currentWeather: WeatherData;
  onSelectWeatherScenario: (scenario: WeatherScenario) => void;
  onUnlockAchievement: (id: string) => void;
}

export const WeatherCenter: React.FC<WeatherCenterProps> = ({
  currentWeather,
  onSelectWeatherScenario,
  onUnlockAchievement
}) => {
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [radarSweepAngle, setRadarSweepAngle] = useState(0);

  // Animate Doppler Weather Radar
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRadarSweepAngle(prev => (prev + 1.5) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw Doppler Precipitation Radar Canvas
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.44;

    // Background
    ctx.fillStyle = '#030a16';
    ctx.fillRect(0, 0, width, height);

    // Range rings
    [0.33, 0.66, 1.0].forEach((f, idx) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * f, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.font = '9px monospace';
      ctx.fillText(`${(idx + 1) * 20} NM`, centerX + 6, centerY - radius * f + 12);
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Render Simulated Doppler Storm Cells based on scenario
    if (currentWeather.scenario === 'thunderstorm' || currentWeather.scenario === 'severe') {
      // Violent red/yellow/green precipitation core
      const grad = ctx.createRadialGradient(centerX - 35, centerY + 20, 10, centerX - 35, centerY + 20, 80);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)'); // Heavy Red
      grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.7)'); // Amber
      grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.45)'); // Green
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX - 35, centerY + 20, 80, 0, Math.PI * 2);
      ctx.fill();

      // Second squall band
      const grad2 = ctx.createRadialGradient(centerX + 40, centerY - 45, 5, centerX + 40, centerY - 45, 55);
      grad2.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
      grad2.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)');
      grad2.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(centerX + 40, centerY - 45, 55, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentWeather.scenario === 'rain') {
      // Moderate Green/Blue rain bands
      const grad = ctx.createRadialGradient(centerX - 20, centerY - 10, 5, centerX - 20, centerY - 10, 95);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX - 20, centerY - 10, 95, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentWeather.scenario === 'snow') {
      // Cyan/White snowy clutter
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 110);
      grad.addColorStop(0, 'rgba(224, 242, 254, 0.5)');
      grad.addColorStop(0.6, 'rgba(147, 197, 253, 0.25)');
      grad.addColorStop(1, 'rgba(147, 197, 253, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentWeather.scenario === 'fog') {
      // Low uniform milky opacity
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rotating Radar Sweep Beam
    const sweepRad = (radarSweepAngle * Math.PI) / 180;
    const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    sweepGrad.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
    sweepGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, sweepRad - 0.35, sweepRad);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    ctx.restore();

    // Center CJIA Marker
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CJIA NEXRAD', centerX + 8, centerY - 6);

  }, [currentWeather, radarSweepAngle]);

  const handleScenarioChange = (sc: WeatherScenario) => {
    onSelectWeatherScenario(sc);
    audioService.playAlertBeep(false);

    if (sc === 'thunderstorm' || sc === 'severe') {
      AchievementService.unlock('storm_master', (ach) => onUnlockAchievement(ach.id));
      audioService.speakAnnouncement('Weather alert: Severe thunderstorm and wind shear warning active for CJ International Airport.', false);
    }
  };

  // Crosswind vs Headwind Calculation on Runway 09 (Heading 090)
  const angleDiffRad = ((currentWeather.windDirectionDeg - 90) * Math.PI) / 180;
  const headwindComponent = Math.round(currentWeather.windSpeedKts * Math.cos(angleDiffRad));
  const crosswindComponent = Math.round(Math.abs(currentWeather.windSpeedKts * Math.sin(angleDiffRad)));

  const scenariosList: { id: WeatherScenario; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'clear', label: 'Clear Skies (VFR)', icon: <CloudSun className="w-4 h-4 text-amber-400" />, desc: 'Unlimited ceiling, calm winds, max throughput' },
    { id: 'rain', label: 'Moderate Rain', icon: <CloudRain className="w-4 h-4 text-cyan-400" />, desc: 'Wet runways, minor delays, 4SM visibility' },
    { id: 'fog', label: 'Dense Fog (CAT III)', icon: <CloudFog className="w-4 h-4 text-slate-300" />, desc: '1/4SM visibility, 100ft ceiling, autoland only' },
    { id: 'snow', label: 'Winter Snowstorm', icon: <CloudSnow className="w-4 h-4 text-blue-200" />, desc: 'De-icing active, runway 09R snowplow ops' },
    { id: 'thunderstorm', label: 'Severe Thunderstorm', icon: <CloudLightning className="w-4 h-4 text-amber-400" />, desc: 'Lightning hold, microburst risk, holding patterns' },
    { id: 'crosswind', label: 'Strong Crosswind', icon: <Wind className="w-4 h-4 text-emerald-400" />, desc: '90° crosswind shear, Runway 18/36 active' },
    { id: 'severe', label: 'Microburst Gale', icon: <AlertTriangle className="w-4 h-4 text-red-400" />, desc: '55kt gust front, airfield ground stop' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Weather Center Title Banner */}
      <div className="bg-[#071329] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-cyan-300">
              AVIATION METEOROLOGY & WEATHER RADAR
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            TERMINAL AERODROME FORECAST (TAF) • DOPPLER PRECIPITATION RADAR
          </p>
        </div>

        {/* Current Active Rule Badge */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 font-mono text-xs">
          <span className="text-slate-400">FLIGHT RULES:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            currentWeather.flightRules === 'VFR' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
            currentWeather.flightRules === 'MVFR' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
            'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
          }`}>
            {currentWeather.flightRules}
          </span>
        </div>
      </div>

      {/* Selectable Weather Scenarios Toolbar */}
      <div className="bg-[#09152b] border border-cyan-900/40 rounded-2xl p-4 shadow-lg">
        <div className="text-xs font-mono font-bold text-slate-300 mb-3 flex items-center space-x-2">
          <span>SELECT SIMULATION WEATHER SCENARIO:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {scenariosList.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleScenarioChange(sc.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                currentWeather.scenario === sc.id
                  ? 'bg-gradient-to-b from-cyan-600 to-blue-700 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                {sc.icon}
                {currentWeather.scenario === sc.id && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="font-bold text-xs leading-tight mb-1">{sc.label}</div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-300 leading-snug line-clamp-2">
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Telemetry & Doppler Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Telemetry Instruments & Decoded METAR */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Real-Time Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            
            {/* Wind & Gust */}
            <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>WIND</span>
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {currentWeather.windDirectionDeg}° @ {currentWeather.windSpeedKts} <span className="text-xs text-slate-400">KT</span>
              </div>
              <div className="text-[10px] text-amber-400 mt-1">
                GUSTS TO {currentWeather.windGustKts} KT
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>TEMP / DEW</span>
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {currentWeather.temperatureF}°F <span className="text-xs text-slate-400">({currentWeather.temperatureC}°C)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                DEW POINT: {currentWeather.dewPointC}°C
              </div>
            </div>

            {/* Visibility & Ceiling */}
            <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>VISIBILITY</span>
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {currentWeather.visibilityMiles} <span className="text-xs text-slate-400">SM</span>
              </div>
              <div className="text-[10px] text-cyan-300 mt-1">
                CEILING: {currentWeather.ceilingFt.toLocaleString()} FT
              </div>
            </div>

            {/* Altimeter */}
            <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>ALTIMETER</span>
                <Gauge className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-white">
                {currentWeather.barometerInHg.toFixed(2)} <span className="text-xs text-slate-400">inHg</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                QNH {currentWeather.barometerHpa} hPa
              </div>
            </div>

          </div>

          {/* Runway Crosswind Calculator Card */}
          <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-4">
            <h3 className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Compass className="w-4 h-4" />
              <span>RUNWAY 09L / 09R CROSSWIND COMPONENT CALCULATOR</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">HEADWIND:</span>
                <div className="text-lg font-bold text-emerald-400">
                  {headwindComponent >= 0 ? `${headwindComponent} KTS` : `${Math.abs(headwindComponent)} KTS TAILWIND`}
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">CROSSWIND:</span>
                <div className="text-lg font-bold text-amber-400">
                  {crosswindComponent} KTS
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">RUNWAY CONDITION:</span>
                <div className="text-sm font-bold text-white mt-1">
                  {currentWeather.runwayCondition}
                </div>
              </div>
            </div>
          </div>

          {/* Raw METAR & Plain English Decoder */}
          <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                RAW AVIATION METAR REPORT (KCJIA)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">AUTOMATED WEATHER OBSERVATION SYSTEM</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-sm tracking-wide mb-4 select-all">
              {currentWeather.rawMetar}
            </div>

            <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              DECODED OBSERVATION NOTES:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {currentWeather.decodedNotes.map((note, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Col: Doppler Weather Radar */}
        <div className="bg-[#040d1c] border-2 border-cyan-900/70 rounded-3xl p-4 shadow-2xl flex flex-col justify-between h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-mono text-xs">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>TERMINAL DOPPLER WEATHER RADAR (TDWR)</span>
            </div>
          </div>

          <canvas
            ref={radarCanvasRef}
            className="w-full h-[400px] rounded-2xl"
          />

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>RADAR SCAN: 360° CONTINUOUS SWEEP</span>
            </div>
            <span className="text-cyan-400 font-bold">{currentWeather.operationalImpact}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
