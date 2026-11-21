import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  FastForward, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Moon,
  CloudSun
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { WeatherData } from '../../types/weather';

interface HeaderProps {
  weather: WeatherData;
  simSpeed: number;
  onSetSimSpeed: (speed: number) => void;
  onOpenEmergencyModal: () => void;
  onOpenWeather: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  simSpeed,
  onSetSimSpeed,
  onOpenEmergencyModal,
  onOpenWeather,
  theme,
  onToggleTheme
}) => {
  const [isMuted, setIsMuted] = useState(audioService.getIsMuted());
  const [volume, setVolume] = useState(audioService.getVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 1000 * (simSpeed === 0 ? 0 : simSpeed)));
    }, 1000);
    return () => clearInterval(timer);
  }, [simSpeed]);

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioService.setMuted(nextMute);
    if (!nextMute) {
      audioService.playAirportChime();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioService.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
      audioService.setMuted(false);
    }
  };

  const formatLocalTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatZuluTime = (date: Date) => {
    return date.toISOString().substring(11, 19) + 'Z';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#060c18]/95 backdrop-blur-md border-b border-cyan-900/40 px-3 sm:px-6 py-2.5 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* CJIA Logo & Identity */}
        <div className="flex items-center space-x-3 cursor-pointer select-none">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-900 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40 group">
            <Plane className="w-5 h-5 text-white transform -rotate-45 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-xl border border-cyan-300 animate-ping opacity-20 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-lg sm:text-xl bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                CJ INTERNATIONAL AIRPORT
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                CJI / KCJI
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-cyan-400/80 font-medium tracking-wide">
              Where Every Flight Begins an Adventure! ✈️
            </p>
          </div>
        </div>

        {/* Airport Status & Clock Widget */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          
          {/* Simulation Clock: Local & Zulu */}
          <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-mono space-x-3 shadow-inner">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>LOC:</span>
              <span className="text-white font-bold">{formatLocalTime(currentTime)}</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div className="flex items-center space-x-1 text-cyan-300">
              <span>ZULU:</span>
              <span className="font-bold text-cyan-200">{formatZuluTime(currentTime)}</span>
            </div>
          </div>

          {/* Simulation Speed Adjusters */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onSetSimSpeed(simSpeed === 0 ? 1 : 0)}
              title={simSpeed === 0 ? "Resume Simulation" : "Pause Simulation"}
              className={`p-1.5 rounded transition-all ${
                simSpeed === 0 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {simSpeed === 0 ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onSetSimSpeed(1)}
              title="1x Real-time Speed"
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                simSpeed === 1 
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => onSetSimSpeed(2)}
              title="2x Fast Simulation"
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                simSpeed === 2 
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => onSetSimSpeed(5)}
              title="5x Turbo Simulation"
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold flex items-center space-x-0.5 transition-all ${
                simSpeed === 5 
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FastForward className="w-3 h-3" />
              <span>5x</span>
            </button>
          </div>

          {/* Live Weather Pill */}
          <button
            onClick={onOpenWeather}
            title="Open Aviation Weather Center"
            className="flex items-center space-x-2 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg px-2.5 py-1 text-xs transition-all group"
          >
            <CloudSun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-left font-mono leading-tight">
              <div className="flex items-center space-x-1">
                <span className={`font-bold text-[10px] px-1 rounded ${
                  weather.flightRules === 'VFR' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                  weather.flightRules === 'MVFR' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                  'bg-red-950 text-red-300 border border-red-500/30'
                }`}>
                  {weather.flightRules}
                </span>
                <span className="text-slate-200 font-semibold">{weather.temperatureF}°F</span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {weather.windDirectionDeg}° @ {weather.windSpeedKts}KT
              </span>
            </div>
          </button>

          {/* Emergency Trigger Shortcut */}
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center space-x-1.5 bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-300 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all animate-pulse"
            title="Simulate Airport Emergency Scenario"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Emergency Mode</span>
          </button>

          {/* Sound Controls */}
          <div className="relative flex items-center">
            <button
              onClick={handleToggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              title={isMuted ? "Unmute Airport Audio & Chimes" : "Mute Sound"}
              className={`p-1.5 rounded-lg border transition-all ${
                isMuted 
                  ? 'bg-slate-900 text-slate-500 border-slate-700' 
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Volume dropdown slider */}
            {showVolumeSlider && (
              <div 
                onMouseLeave={() => setShowVolumeSlider(false)}
                className="absolute right-0 top-full mt-2 bg-slate-900 border border-cyan-900/60 p-2.5 rounded-xl shadow-2xl flex flex-col items-center gap-1.5 z-50 w-32"
              >
                <div className="flex justify-between w-full text-[10px] font-mono text-cyan-300">
                  <span>VOLUME</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <button
                  onClick={() => audioService.playAirportChime()}
                  className="text-[10px] text-cyan-400 hover:underline pt-0.5"
                >
                  Test Chime 🔔
                </button>
              </div>
            )}
          </div>

          {/* Dark / Tactical Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? "Switch to Day Operational Theme" : "Switch to Tactical Night Theme"}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
