import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, X } from 'lucide-react';
import { Achievement } from '../../data/achievements';
import { audioService } from '../../services/audioService';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose
}) => {
  useEffect(() => {
    if (achievement) {
      audioService.playAirportChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8, x: 0.85 }
      });

      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#081326] border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 text-slate-100 animate-bounce">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-amber-400 tracking-wider">
              ACHIEVEMENT UNLOCKED!
            </div>
            <h4 className="text-base font-bold text-white">{achievement.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{achievement.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
