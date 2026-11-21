import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  Plus, 
  Truck, 
  Building, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AirportEquipment, GateAssignment, ManagementEvent } from '../../types/management';
import { audioService } from '../../services/audioService';
import { AchievementService } from '../../data/achievements';

interface AirportManagementProps {
  onUnlockAchievement: (id: string) => void;
}

const INITIAL_EQUIPMENT: AirportEquipment[] = [
  {
    id: 'eq-pushback',
    name: 'Electric Pushback Tug',
    category: 'ground_handling',
    cost: 12500,
    maintenancePerDay: 400,
    count: 3,
    efficiencyBonus: 8,
    description: 'Heavy electric aircraft tug to push 737s and 787s back from gates smoothly without jet blast.',
    icon: 'Truck'
  },
  {
    id: 'eq-deice',
    name: 'High-Reach De-Icing Rigs',
    category: 'deicing',
    cost: 25000,
    maintenancePerDay: 750,
    count: 2,
    efficiencyBonus: 15,
    description: 'Heated Type IV glycol sprayers to keep wings ice-free during winter storms.',
    icon: 'Flame'
  },
  {
    id: 'eq-arff',
    name: 'Rosenbauer 8x8 Crash Tender',
    category: 'safety',
    cost: 45000,
    maintenancePerDay: 1200,
    count: 2,
    efficiencyBonus: 20,
    description: 'Flagship airport rescue vehicle ensuring CAT 10 safety certification.',
    icon: 'ShieldAlert'
  },
  {
    id: 'eq-cobus',
    name: 'Electric Apron Passenger Buses',
    category: 'passenger',
    cost: 18000,
    maintenancePerDay: 500,
    count: 4,
    efficiencyBonus: 12,
    description: 'High-capacity low-floor electric shuttles transferring passengers to remote stands.',
    icon: 'Truck'
  }
];

const INITIAL_GATES: GateAssignment[] = [
  { id: 'gate-a1', terminal: 'A', gateNumber: 'A1', supportedTypes: 'Narrowbody', status: 'Occupied', currentAirline: 'CJ Air' },
  { id: 'gate-a2', terminal: 'A', gateNumber: 'A2', supportedTypes: 'Narrowbody', status: 'Available' },
  { id: 'gate-a3', terminal: 'A', gateNumber: 'A3', supportedTypes: 'Narrowbody', status: 'Occupied', currentAirline: 'Delta' },
  { id: 'gate-b1', terminal: 'B', gateNumber: 'B1', supportedTypes: 'Widebody', status: 'Occupied', currentAirline: 'Emirates (A380)' },
  { id: 'gate-b2', terminal: 'B', gateNumber: 'B2', supportedTypes: 'Widebody', status: 'Available' },
  { id: 'gate-c1', terminal: 'C', gateNumber: 'C1', supportedTypes: 'Regional', status: 'Available' },
];

const RANDOM_EVENTS: ManagementEvent[] = [
  {
    id: 'evt-snow',
    title: 'Sudden Winter Blizzard Approaching',
    description: 'Heavy lake-effect snow will hit CJIA in 45 minutes. How should Director CJ deploy airport resources?',
    type: 'weather',
    options: [
      {
        text: 'Pre-treat runways with anti-icing chemicals & mobilize de-icers (Cost: CJ$ 8,500)',
        cost: 8500,
        satisfactionChange: 12,
        safetyChange: 15,
        efficiencyChange: 10,
        outcomeText: 'Proactive de-icing kept Runway 09L open! Zero cancelled flights.'
      },
      {
        text: 'Close Runway 09R and operate single runway to save budget',
        cost: 0,
        satisfactionChange: -10,
        safetyChange: 5,
        efficiencyChange: -15,
        outcomeText: 'Budget saved, but flights suffered 35-minute departure queues.'
      }
    ]
  },
  {
    id: 'evt-vip',
    title: 'International Aviation Summit Delegation',
    description: 'A fleet of VIP charter flights and international delegates are arriving at Terminal B.',
    type: 'vip',
    options: [
      {
        text: 'Roll out red carpet, executive lounge catering & fast-track customs (Cost: CJ$ 5,000)',
        cost: 5000,
        satisfactionChange: 20,
        safetyChange: 0,
        efficiencyChange: 10,
        outcomeText: 'Delegates awarded CJIA "Best International Gateway of the Year"!'
      },
      {
        text: 'Standard terminal processing',
        cost: 0,
        satisfactionChange: 0,
        safetyChange: 0,
        efficiencyChange: 0,
        outcomeText: 'Operations proceeded normally.'
      }
    ]
  }
];

export const AirportManagement: React.FC<AirportManagementProps> = ({
  onUnlockAchievement
}) => {
  // Director state with LocalStorage persistence
  const [funds, setFunds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cjia_director_funds');
      return saved ? Number(saved) : 85000;
    } catch {
      return 85000;
    }
  });

  const [satisfaction, setSatisfaction] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cjia_director_sat');
      return saved ? Number(saved) : 92;
    } catch {
      return 92;
    }
  });

  const [safetyRating, setSafetyRating] = useState<number>(96);
  const [efficiencyRating, setEfficiencyRating] = useState<number>(88);
  const [reputationLevel, setReputationLevel] = useState<number>(3); // 1-5
  const [equipment, setEquipment] = useState<AirportEquipment[]>(INITIAL_EQUIPMENT);
  const [gates, setGates] = useState<GateAssignment[]>(INITIAL_GATES);
  const [currentEvent, setCurrentEvent] = useState<ManagementEvent | null>(RANDOM_EVENTS[0]);
  const [lastOutcome, setLastOutcome] = useState<string | null>(null);

  // Auto-revenue ticking
  useEffect(() => {
    const timer = setInterval(() => {
      // Passive airport revenue based on gates and satisfaction
      const revenue = Math.round(250 + (satisfaction * 3) + (efficiencyRating * 2));
      setFunds(prev => {
        const nextFunds = prev + revenue;
        try {
          localStorage.setItem('cjia_director_funds', String(nextFunds));
        } catch {}
        if (nextFunds >= 100000) {
          AchievementService.unlock('mgmt_million_director', (ach) => onUnlockAchievement(ach.id));
        }
        return nextFunds;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [satisfaction, efficiencyRating, onUnlockAchievement]);

  const handleBuyEquipment = (eq: AirportEquipment) => {
    if (funds < eq.cost) {
      audioService.playAlertBeep(true);
      return;
    }

    setFunds(prev => prev - eq.cost);
    setEquipment(prev => prev.map(item => item.id === eq.id ? { ...item, count: item.count + 1 } : item));
    setEfficiencyRating(prev => Math.min(100, prev + 3));
    setSatisfaction(prev => Math.min(100, prev + 2));
    audioService.playAirportChime();
    AchievementService.unlock('mgmt_first_upgrade', (ach) => onUnlockAchievement(ach.id));
  };

  const handleToggleGate = (gateId: string) => {
    setGates(prev => prev.map(g => {
      if (g.id === gateId) {
        const nextStatus = g.status === 'Available' ? 'Occupied' : 'Available';
        return {
          ...g,
          status: nextStatus,
          currentAirline: nextStatus === 'Occupied' ? 'CJ Air' : undefined
        };
      }
      return g;
    }));
    audioService.playAlertBeep(false);
  };

  const handleSolveEvent = (optionIdx: number) => {
    if (!currentEvent) return;
    const choice = currentEvent.options[optionIdx];

    if (funds < choice.cost) {
      audioService.playAlertBeep(true);
      return;
    }

    setFunds(prev => prev - choice.cost);
    setSatisfaction(prev => Math.max(0, Math.min(100, prev + choice.satisfactionChange)));
    setSafetyRating(prev => Math.max(0, Math.min(100, prev + choice.safetyChange)));
    setEfficiencyRating(prev => Math.max(0, Math.min(100, prev + choice.efficiencyChange)));
    setLastOutcome(choice.outcomeText);
    audioService.playAirportChime();

    // Clear event or load next
    setTimeout(() => {
      setCurrentEvent(null);
    }, 2500);
  };

  const handleResetGame = () => {
    setFunds(85000);
    setSatisfaction(92);
    setSafetyRating(96);
    setEfficiencyRating(88);
    setEquipment(INITIAL_EQUIPMENT);
    setGates(INITIAL_GATES);
    setCurrentEvent(RANDOM_EVENTS[0]);
    setLastOutcome(null);
    try {
      localStorage.removeItem('cjia_director_funds');
      localStorage.removeItem('cjia_director_sat');
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Management Mode Header */}
      <div className="bg-[#071329] border border-cyan-900/50 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-purple-300">
                AIRPORT MANAGEMENT • DIRECTOR CJ MODE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
                LEVEL {reputationLevel} AIRPORT
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              MANAGE GATES, EXPAND TERMINALS & EARN AIRPORT REVENUE
            </p>
          </div>
        </div>

        <button
          onClick={handleResetGame}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Career</span>
        </button>
      </div>

      {/* Financial & Performance Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Funds CJ$ */}
        <div className="bg-[#09152b] border border-cyan-900/50 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-mono font-bold uppercase mb-1">
            Airport Treasury
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            CJ$ {funds.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+CJ$ 450 / minute</span>
          </div>
        </div>

        {/* Passenger Satisfaction */}
        <div className="bg-[#09152b] border border-cyan-900/50 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-mono font-bold uppercase mb-1">
            Pax Satisfaction
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
            {satisfaction}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Rating: World-Class (A+)
          </div>
        </div>

        {/* Safety Rating */}
        <div className="bg-[#09152b] border border-cyan-900/50 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-mono font-bold uppercase mb-1">
            Safety Score
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {safetyRating}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            CAT 10 Fire Rescue Certified
          </div>
        </div>

        {/* Efficiency Rating */}
        <div className="bg-[#09152b] border border-cyan-900/50 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-mono font-bold uppercase mb-1">
            Turnaround Speed
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
            {efficiencyRating}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            28-Minute Average Turnaround
          </div>
        </div>

      </div>

      {/* Operational Crisis & Dilemma Event Card */}
      {currentEvent && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center space-x-2 text-purple-400 font-mono font-bold text-xs uppercase mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>OPERATIONAL DIRECTOR DILEMMA</span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">{currentEvent.title}</h3>
          <p className="text-xs text-slate-300 mb-4 max-w-2xl leading-relaxed">
            {currentEvent.description}
          </p>

          {lastOutcome && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center space-x-2 font-mono">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{lastOutcome}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentEvent.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSolveEvent(idx)}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-400 text-left text-xs text-slate-200 transition-all font-semibold"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Purchases & Terminal Gate Allocation Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ground Support Equipment Shop */}
        <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">
                GROUND EQUIPMENT FLEET
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">PURCHASE WITH CJ$</span>
          </div>

          <div className="space-y-3">
            {equipment.map(eq => (
              <div 
                key={eq.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{eq.name}</span>
                    <span className="font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-[10px]">
                      Owned: {eq.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                    {eq.description}
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">
                    Bonus: +{eq.efficiencyBonus}% Airfield Efficiency
                  </div>
                </div>

                <button
                  onClick={() => handleBuyEquipment(eq)}
                  disabled={funds < eq.cost}
                  className={`px-3 py-2 rounded-xl font-bold font-mono text-xs whitespace-nowrap transition-all ${
                    funds >= eq.cost
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Buy: CJ$ {eq.cost.toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Gate Manager */}
        <div className="bg-[#081224] border border-cyan-900/50 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                TERMINAL GATE ALLOCATION
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">CLICK TO RE-ASSIGN</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {gates.map(gate => (
              <div
                key={gate.id}
                onClick={() => handleToggleGate(gate.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  gate.status === 'Occupied'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold mb-1">
                  <span className="text-sm text-white">GATE {gate.gateNumber}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    gate.status === 'Occupied' ? 'bg-amber-900 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {gate.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Terminal {gate.terminal} • {gate.supportedTypes}
                </div>

                {gate.currentAirline && (
                  <div className="text-[10px] text-cyan-300 font-mono mt-1 font-bold">
                    Airline: {gate.currentAirline}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
