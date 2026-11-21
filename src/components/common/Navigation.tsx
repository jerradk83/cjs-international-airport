import React from 'react';
import { 
  Radar, 
  PlaneTakeoff, 
  Radio, 
  Map, 
  CloudSun, 
  Gamepad2, 
  Briefcase, 
  BookOpen, 
  Home
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'tracker'
  | 'fids'
  | 'atc'
  | 'map'
  | 'weather'
  | 'simulator'
  | 'management'
  | 'encyclopedia';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  flightCount: number;
  alertCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  flightCount,
  alertCount = 0
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number; color?: string }[] = [
    { id: 'dashboard', label: 'Operations Center', icon: <Home className="w-4 h-4" /> },
    { id: 'tracker', label: 'Flight Tracker', icon: <Radar className="w-4 h-4" />, badge: flightCount },
    { id: 'fids', label: 'Arrivals & Departures', icon: <PlaneTakeoff className="w-4 h-4" /> },
    { id: 'atc', label: 'Air Traffic Control', icon: <Radio className="w-4 h-4" />, badge: alertCount > 0 ? 'ALERT' : undefined, color: 'text-amber-400' },
    { id: 'map', label: 'Airport Map', icon: <Map className="w-4 h-4" /> },
    { id: 'weather', label: 'Weather Center', icon: <CloudSun className="w-4 h-4" /> },
    { id: 'simulator', label: 'Flight Simulator', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'management', label: 'Airport Management', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'encyclopedia', label: 'Aircraft Encyclopedia', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-[#081121] border-b border-cyan-950/80 px-2 sm:px-6 shadow-md overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 py-2 min-w-max">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative select-none ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 border border-cyan-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-white' : item.color || 'text-cyan-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  item.badge === 'ALERT'
                    ? 'bg-red-500 text-white animate-pulse'
                    : isActive
                    ? 'bg-cyan-900 text-cyan-200'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
