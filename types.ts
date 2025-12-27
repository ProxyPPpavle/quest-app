
export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'MEME' | 'IMPOSSIBLE';

export type QuestType = 'TEXT' | 'IMAGE' | 'LOCATION' | 'QUIZ' | 'LOGIC' | 'ONLINE_IMAGE';

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  type: QuestType;
  points: number;
  instructions: string;
  createdAt: number;
  quizOptions?: string[];
  correctAnswer?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
    name: string;
  };
}

export interface UserStats {
  completed: number;
  lost: number;
  streak: number;
  bestStreak: number;
  totalPoints: number;
  xp: number;
  level: number;
  // Counters for difficulties
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  memeCount: number;
  impossibleCount: number;
  // Achievement system
  badges: string[];
  typeCounts: Record<string, number>;
}

export interface QuestCompletion {
  questId: string;
  questData: Quest;
  timestamp: number;
  durationSeconds: number;
  proof: string;
  aiResponse: string;
  saved: boolean;
}

export type Language = 'en' | 'sr';
export type Theme = 'dark' | 'light';

export interface AppState {
  user: {
    username: string | null;
    isLoggedIn: boolean;
    isPremium: boolean;
    refreshesLeft: number;
    language: Language;
    theme: Theme;
  };
  activeQuests: Quest[];
  completedQuests: QuestCompletion[];
  stats: UserStats;
  lastRefresh: number;
}
