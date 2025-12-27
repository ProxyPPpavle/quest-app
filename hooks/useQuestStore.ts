
import { useState, useEffect, useCallback } from 'react';
import { AppState, Quest, QuestCompletion, UserStats, Language } from '../types';
import { generateDailyQuests } from '../services/geminiService';

const STORAGE_KEY = 'pp_quest_v6_state';

const INITIAL_STATS: UserStats = {
  completed: 0, 
  lost: 0, 
  streak: 0, 
  bestStreak: 0, 
  totalPoints: 0, 
  xp: 0, 
  level: 1,
  easyCount: 0,
  mediumCount: 0,
  hardCount: 0,
  memeCount: 0,
  impossibleCount: 0,
  badges: [],
  typeCounts: { IMAGE: 0, TEXT: 0, LOCATION: 0, QUIZ: 0, ONLINE_IMAGE: 0 }
};

const INITIAL_STATE: AppState = {
  user: {
    username: null,
    isLoggedIn: false,
    isPremium: false,
    refreshesLeft: 2,
    language: 'en',
    theme: 'dark'
  },
  activeQuests: [],
  completedQuests: [],
  stats: INITIAL_STATS,
  lastRefresh: 0,
};

export function useQuestStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return INITIAL_STATE;
  });

  const [loading, setLoading] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (username: string) => {
    setState(prev => ({ ...prev, user: { ...prev.user, username, isLoggedIn: true } }));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const refreshQuests = useCallback(async (isAuto = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const newQuests = await generateDailyQuests(state.user.language);
      setState(prev => ({
        ...prev,
        activeQuests: newQuests,
        lastRefresh: Date.now(),
        user: { ...prev.user, refreshesLeft: isAuto ? prev.user.refreshesLeft : Math.max(0, prev.user.refreshesLeft - 1) }
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [state.user.language, state.user.refreshesLeft, loading]);

  const completeQuest = useCallback((questId: string, proof: string, aiResponse: string, duration: number) => {
    setState(prev => {
      const quest = prev.activeQuests.find(q => q.id === questId);
      if (!quest) return prev;

      const completion: QuestCompletion = {
        questId,
        questData: quest,
        timestamp: Date.now(),
        durationSeconds: duration,
        proof,
        aiResponse,
        saved: false
      };

      let newXp = prev.stats.xp + quest.points;
      let newLevel = prev.stats.level;
      if (newXp >= 500) { newLevel += 1; newXp -= 500; }

      const diff = quest.difficulty;
      const type = quest.type;
      
      const updatedTypeCounts = {
        ...prev.stats.typeCounts,
        [type]: (prev.stats.typeCounts[type] || 0) + 1
      };

      const updatedStats = {
        ...prev.stats,
        easyCount: diff === 'EASY' ? prev.stats.easyCount + 1 : prev.stats.easyCount,
        mediumCount: diff === 'MEDIUM' ? prev.stats.mediumCount + 1 : prev.stats.mediumCount,
        hardCount: diff === 'HARD' ? prev.stats.hardCount + 1 : prev.stats.hardCount,
        memeCount: diff === 'MEME' ? prev.stats.memeCount + 1 : prev.stats.memeCount,
        impossibleCount: diff === 'IMPOSSIBLE' ? prev.stats.impossibleCount + 1 : prev.stats.impossibleCount,
        completed: prev.stats.completed + 1,
        totalPoints: prev.stats.totalPoints + quest.points,
        xp: newXp,
        level: newLevel,
        streak: prev.stats.streak + 1,
        bestStreak: Math.max(prev.stats.bestStreak, prev.stats.streak + 1),
        typeCounts: updatedTypeCounts
      };

      // Check for badges
      const oldBadges = prev.stats.badges || [];
      const currentBadges = [...oldBadges];
      const hour = new Date().getHours();
      
      const checkBadge = (id: string, condition: boolean) => {
        if (condition && !currentBadges.includes(id)) currentBadges.push(id);
      };

      checkBadge('badge_first_quest', updatedStats.completed >= 1);
      checkBadge('badge_quest_10', updatedStats.completed >= 10);
      checkBadge('badge_quest_50', updatedStats.completed >= 50);
      checkBadge('badge_quest_100', updatedStats.completed >= 100);
      checkBadge('badge_streak_3', updatedStats.streak >= 3);
      checkBadge('badge_streak_7', updatedStats.streak >= 7);
      checkBadge('badge_streak_15', updatedStats.streak >= 15);
      checkBadge('badge_extreme', updatedStats.impossibleCount >= 1);
      checkBadge('badge_meme', updatedStats.memeCount >= 5);
      checkBadge('badge_web_1', updatedTypeCounts.ONLINE_IMAGE >= 1);
      checkBadge('badge_web_10', updatedTypeCounts.ONLINE_IMAGE >= 10);
      checkBadge('badge_photo_1', updatedTypeCounts.IMAGE >= 1);
      checkBadge('badge_photo_20', updatedTypeCounts.IMAGE >= 20);
      checkBadge('badge_loc_1', updatedTypeCounts.LOCATION >= 1);
      checkBadge('badge_loc_10', updatedTypeCounts.LOCATION >= 10);
      checkBadge('badge_text_1', updatedTypeCounts.TEXT >= 1);
      checkBadge('badge_text_20', updatedTypeCounts.TEXT >= 20);
      checkBadge('badge_quiz_pro', updatedTypeCounts.QUIZ >= 10);
      checkBadge('badge_fast', duration < 30);
      checkBadge('badge_owl', hour >= 0 && hour < 5);
      checkBadge('badge_bird', hour >= 5 && hour < 9);
      checkBadge('badge_lvl_5', updatedStats.level >= 5);
      checkBadge('badge_lvl_10', updatedStats.level >= 10);
      checkBadge('badge_lvl_20', updatedStats.level >= 20);

      const newlyAdded = currentBadges.filter(b => !oldBadges.includes(b));
      if (newlyAdded.length > 0) {
        setNewBadges(prev => [...prev, ...newlyAdded]);
      }

      updatedStats.badges = currentBadges;

      return {
        ...prev,
        activeQuests: prev.activeQuests.filter(q => q.id !== questId),
        completedQuests: [completion, ...prev.completedQuests],
        stats: updatedStats
      };
    });
  }, []);

  const failQuest = useCallback(() => {
    setState(prev => ({
      ...prev,
      stats: { 
        ...prev.stats, 
        lost: prev.stats.lost + 1,
        streak: 0 
      }
    }));
  }, []);

  const toggleSave = (questId: string) => {
    setState(prev => {
      const updated = prev.completedQuests.map(c => 
        c.questId === questId ? { ...c, saved: !c.saved } : c
      );
      const vaultCount = updated.filter(u => u.saved).length;
      const oldBadges = prev.stats.badges || [];
      const currentBadges = [...oldBadges];
      
      if (vaultCount >= 10 && !currentBadges.includes('badge_vault')) {
        currentBadges.push('badge_vault');
        setNewBadges(p => [...p, 'badge_vault']);
      }
      
      return {
        ...prev,
        completedQuests: updated,
        stats: { ...prev.stats, badges: currentBadges }
      };
    });
  };

  const updateSetting = (key: string, value: any) => {
    setState(prev => ({ ...prev, user: { ...prev.user, [key]: value } }));
  };

  const clearNewBadges = () => setNewBadges([]);

  return { state, loading, refreshQuests, completeQuest, failQuest, toggleSave, updateSetting, login, logout, newBadges, clearNewBadges };
}
