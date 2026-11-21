import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, HeartPulse, CloudLightning, Wrench, X, CheckCircle } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerScenario: (type: string, description: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onTriggerScenario
}) => {
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'medical',
      title: 'Medical Emergency Onboard',
      code: 'MAYDAY MEDICAL',
      description: 'Flight CJ-911 (Boeing 777) inbound from Los Angeles reports passenger requires urgent medical care. Requests immediate priority approach to Runway 09L.',
      icon: <HeartPulse className="w-6 h-6 text-red-400" />,
      actionText: 'Declare Medical Priority & Dispatch Paramedics',
      audioText: 'Attention all units, medical emergency declared for inbound flight CJ 911. Priority landing cleared Runway 09 Left. Emergency medical services dispatch to Gate Alpha 1.'
    },
    {
      id: 'storm',
      title: 'Severe Microburst & Gust Front',
      code: 'WEATHER ALERT',
      description: 'Terminal Doppler Weather Radar reports severe wind shear and 48kt gusts approaching Runway 09R. Multiple approaching aircraft must be placed into holding patterns.',
      icon: <CloudLightning className="w-6 h-6 text-amber-400" />,
      actionText: 'Activate Airfield Weather Alert & Issue Go-Arounds',
      audioText: 'Warning, severe microburst alert for runway corridors. All inbound traffic enter holding pattern at Alpha fix. Ground stops initiated.'
    },
    {
      id: 'hydraulic',
      title: 'Simulated Hydraulic Malfunction',
      code: 'PAN-PAN HYDRAULIC',
      description: 'United 842 reports loss of hydraulic system pressure. Flap extension slow, requests foam trucks pre-positioned along Runway 09R.',
      icon: <Wrench className="w-6 h-6 text-yellow-400" />,
      actionText: 'Deploy ARFF Fire & Rescue to Runway 09R',
      audioText: 'Pan-Pan Pan-Pan, United 842 declaring hydraulic urgency. ARFF Station 1 vehicles deploy to runway 09 Right hold positions.'
    },
    {
      id: 'fod',
      title: 'Runway Foreign Object Debris (FOD)',
      code: 'RUNWAY INSPECTION',
      description: 'Tower spots shredded tire debris on Runway 09L from a previous departure. Runway must be closed for airport operations sweeper truck inspection.',
      icon: <ShieldAlert className="w-6 h-6 text-cyan-400" />,
      actionText: 'Close Runway 09L & Dispatch Sweepers',
      audioText: 'Runway 09 Left is temporarily closed for foreign object debris clearing. Diverting all departures to Runway 09 Right.'
    }
  ];

  const handleSelect = (scenario: typeof scenarios[0]) => {
    audioService.playAlertBeep(true);
    audioService.speakAnnouncement(scenario.audioText, false);
    onTriggerScenario(scenario.id, scenario.description);
    setActiveMessage(`Activated: ${scenario.title}. Dispatch and simulation responding.`);
    setTimeout(() => {
      setActiveMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#09101f] border-2 border-red-500/60 rounded-2xl p-6 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-950 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-400">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-red-200">
                AIRPORT EMERGENCY INCIDENT DISPATCH
              </h2>
              <p className="text-xs text-red-400 font-mono">
                SIMULATION SCENARIOS • EDUCATIONAL ENTERTAINMENT
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

        {activeMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 flex items-center space-x-2 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{activeMessage}</span>
          </div>
        )}

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Select an operational emergency scenario below to test CJ International Airport&apos;s crisis protocols. Watch how the Air Traffic Control tower, weather systems, flight boards, and rescue teams respond!
        </p>

        {/* Emergency Scenarios List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {scenarios.map((s) => (
            <div 
              key={s.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-red-950/40"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-800/80">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/90 border border-red-500/40 text-red-300 font-bold">
                    {s.code}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-100 mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-3">{s.description}</p>
              </div>

              <button
                onClick={() => handleSelect(s)}
                className="w-full py-2 px-3 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-semibold tracking-wide transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>{s.actionText}</span>
              </button>
            </div>
          ))}
        </div>

        <div className="text-center text-[11px] text-slate-400 font-mono">
          🚨 All emergency events are fictional simulations for aviation education and game play.
        </div>
      </div>
    </div>
  );
};
