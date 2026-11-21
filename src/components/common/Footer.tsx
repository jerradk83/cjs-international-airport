import React from 'react';
import { Plane, ShieldCheck, Heart } from 'lucide-react';
import { ActiveTab } from './Navigation';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#040812] border-t border-cyan-950/80 text-slate-400 py-8 px-4 sm:px-8 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <Plane className="w-4 h-4 transform -rotate-45" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wider text-base">
                CJ INTERNATIONAL AIRPORT
              </span>
              <span className="ml-2 font-mono text-[10px] text-cyan-400 font-bold">KCJIA</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            A premier virtual aviation hub dedicated to inspiring future aviators, aeronautical engineers, and air traffic controllers. Explore realistic radar tracking, control tower operations, weather systems, and flight simulations.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-cyan-400/80 font-mono">
            <span>ELEVATION: 645 FT MSL</span>
            <span>•</span>
            <span>COORDINATES: 34°52&apos;N 82°13&apos;W</span>
            <span>•</span>
            <span>CAT IIIb CERTIFIED</span>
          </div>
        </div>

        {/* Quick Hub Navigation */}
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3">
            Airport Sections
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onSelectTab('tracker')} className="hover:text-cyan-400 transition-colors">
                ✈️ Live Flight Tracker
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('fids')} className="hover:text-cyan-400 transition-colors">
                📋 Arrivals & Departures Board
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('atc')} className="hover:text-cyan-400 transition-colors">
                🎙️ Air Traffic Control Simulator
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('map')} className="hover:text-cyan-400 transition-colors">
                🗺️ Interactive Airport Diagram
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('simulator')} className="hover:text-cyan-400 transition-colors">
                🛩️ 3D Flight Simulator
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('management')} className="hover:text-cyan-400 transition-colors">
                🏢 Airport Management Game
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('encyclopedia')} className="hover:text-cyan-400 transition-colors">
                📖 Aircraft Encyclopedia
              </button>
            </li>
          </ul>
        </div>

        {/* Educational Disclaimer */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Simulated Data Notice</span>
          </h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            CJ International Airport is a virtual airport simulator created for education and entertainment. All flights, METAR weather, radar blips, and ATC transmissions are generated simulations.
          </p>
          <div className="text-[11px] text-slate-500 pt-2 flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-red-500 fill-current inline" />
            <span>for aviation enthusiasts of all ages.</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
        <div>© {new Date().getFullYear()} CJ International Airport (CJIA). All rights reserved.</div>
        <div className="mt-2 sm:mt-0 font-mono text-cyan-400/70">Slogan: &ldquo;Where Every Flight Begins an Adventure!&rdquo;</div>
      </div>
    </footer>
  );
};
