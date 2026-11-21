export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'radar' | 'fids' | 'atc' | 'simulator' | 'management' | 'scholar';
  icon: string;
  unlockedAt?: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_flight_tracked',
    title: 'Sky Watcher',
    description: 'Tracked your first flight on the interactive CJIA radar.',
    category: 'radar',
    icon: 'Radio'
  },
  {
    id: 'fids_announcement',
    title: 'Terminal Announcer',
    description: 'Broadcast a live airport boarding chime and announcement.',
    category: 'fids',
    icon: 'Volume2'
  },
  {
    id: 'atc_first_landing',
    title: 'Tower Controller Trainee',
    description: 'Cleared an incoming flight for a safe landing on Runway 09R.',
    category: 'atc',
    icon: 'ShieldCheck'
  },
  {
    id: 'atc_flawless_streak',
    title: 'Radar Maestro',
    description: 'Executed 5 consecutive flawless ATC clearances without separation issues.',
    category: 'atc',
    icon: 'Award'
  },
  {
    id: 'flt_butter_landing',
    title: 'Butter Smooth Touchdown',
    description: 'Executed a flawless landing under 120 fpm descent in the flight simulator!',
    category: 'simulator',
    icon: 'CheckCircle'
  },
  {
    id: 'flt_crosswind_ace',
    title: 'Crosswind Ace',
    description: 'Successfully touched down during strong crosswind conditions.',
    category: 'simulator',
    icon: 'Wind'
  },
  {
    id: 'mgmt_first_upgrade',
    title: 'Airport Director',
    description: 'Purchased your first piece of ground support equipment for CJIA.',
    category: 'management',
    icon: 'Briefcase'
  },
  {
    id: 'storm_master',
    title: 'Master of the Storm',
    description: 'Navigated airport operations safely through severe weather conditions.',
    category: 'radar',
    icon: 'CloudLightning'
  },
  {
    id: 'encyclopedia_scholar',
    title: 'Aviation Scholar',
    description: 'Explored aircraft technical specifications and compared airplanes in the database.',
    category: 'scholar',
    icon: 'BookOpen'
  }
];

export class AchievementService {
  private static STORAGE_KEY = 'cjia_unlocked_achievements';

  public static getUnlockedIds(): string[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static unlock(id: string, onNewUnlock?: (ach: Achievement) => void): boolean {
    const unlocked = this.getUnlockedIds();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unlocked));
      } catch {}
      const found = ACHIEVEMENTS_LIST.find(a => a.id === id);
      if (found && onNewUnlock) {
        onNewUnlock(found);
      }
      return true;
    }
    return false;
  }
}
