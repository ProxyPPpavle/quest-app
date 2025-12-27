
import React, { useState, useEffect } from 'react';
import { useQuestStore } from './hooks/useQuestStore';
import { translations } from './translations';
import QuestCard from './components/QuestCard';
import CompletionModal from './components/CompletionModal';
import { Quest, Language, QuestCompletion } from './types';

const AuthScreen = ({ onLogin }: { onLogin: (u: string) => void }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (u.trim()) onLogin(u);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>
      
      <div className="w-full max-w-sm space-y-10 animate-in fade-in zoom-in duration-700 relative z-10 auth-container">
        <div className="text-center space-y-2">
          <h1 className="text-7xl font-fun font-black text-white italic drop-shadow-[0_10px_30px_rgba(99,102,241,0.5)] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">PP Quest</h1>
          <div className="inline-block px-4 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
            <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[9px]">Master Your Day</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[3.5rem] border-2 border-white/10 shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5 px-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <input 
                value={u} 
                onChange={e=>setU(e.target.value)} 
                placeholder="Enter your name..." 
                autoComplete="username"
                inputMode="text"
                className="w-full p-5 bg-slate-800/50 rounded-2xl border-2 border-slate-700 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg shadow-inner" 
              />
            </div>
            <div className="space-y-1.5 px-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" 
                value={p}
                onChange={e=>setP(e.target.value)}
                placeholder="••••••••" 
                autoComplete="current-password"
                className="w-full p-5 bg-slate-800/50 rounded-2xl border-2 border-slate-700 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg shadow-inner" 
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-rose-500 text-white rounded-[2rem] font-black text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-600/40 border-b-4 border-indigo-900 active:border-b-0 uppercase tracking-tight"
          >
            START ADVENTURE
          </button>
        </form>

        <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">v1.0.2 Stable Release</p>
      </div>
    </div>
  );
};

const SavedDetailModal = ({ completion, onClose, t }: { completion: QuestCompletion, onClose: () => void, t: any }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
    <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border-2 border-white/10 p-6 animate-in zoom-in shadow-2xl">
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t.saved} Entry</span>
          <h3 className="font-fun font-black text-white text-lg leading-tight uppercase tracking-tight">{completion.questData.title}</h3>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full text-white transition-colors hover:bg-slate-700">✕</button>
      </div>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {(completion.questData.type === 'IMAGE' || completion.questData.type === 'ONLINE_IMAGE') && (
          <div className="rounded-2xl overflow-hidden border-2 border-white/5 shadow-lg">
            <img src={completion.proof} className="w-full object-cover max-h-56" alt="Submission" />
          </div>
        )}
        <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5">
          <p className="text-[9px] uppercase font-black text-indigo-400 mb-1.5 tracking-widest">{t.submission_proof}</p>
          <p className="text-white text-xs italic break-words leading-relaxed">
            {(completion.questData.type === 'IMAGE' || completion.questData.type === 'ONLINE_IMAGE') ? 'Visual Proof' : completion.proof}
          </p>
        </div>
        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <p className="text-[9px] uppercase font-black text-indigo-400 mb-1.5 tracking-widest">{t.masters_verdict}</p>
          <p className="text-white text-xs italic leading-relaxed">"{completion.aiResponse}"</p>
        </div>
        <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest pt-2">
          <span>{new Date(completion.timestamp).toLocaleDateString()}</span>
          <span>+{completion.questData.points} XP</span>
        </div>
      </div>
    </div>
  </div>
);

const BadgeNotification = ({ badgeId, lang, onFinish }: { badgeId: string, lang: Language, onFinish: () => void }) => {
  const t = (translations as any)[lang];
  useEffect(() => {
    const timer = setTimeout(onFinish, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed bottom-24 right-4 z-[100] bg-indigo-600 border border-white/20 px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-4 badge-toast mb-4">
      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-2xl shadow-inner">
        {getBadgeIcon(badgeId)}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-indigo-200 tracking-[0.1em]">Unlocked Badge!</p>
        <p className="text-[13px] font-black text-white uppercase tracking-tight leading-tight">{t[badgeId]}</p>
      </div>
    </div>
  );
};

const ALL_BADGE_IDS = [
  'badge_first_quest', 'badge_quest_10', 'badge_quest_50', 'badge_quest_100',
  'badge_streak_3', 'badge_streak_7', 'badge_streak_15', 'badge_extreme',
  'badge_meme', 'badge_web_1', 'badge_web_10', 'badge_photo_1', 'badge_photo_20',
  'badge_loc_1', 'badge_loc_10', 'badge_text_1', 'badge_text_20', 'badge_quiz_pro',
  'badge_fast', 'badge_owl', 'badge_bird', 'badge_vault', 'badge_lvl_5', 'badge_lvl_10', 'badge_lvl_20'
];

const App: React.FC = () => {
  const { state, loading, refreshQuests, completeQuest, failQuest, toggleSave, updateSetting, login, logout, newBadges, clearNewBadges } = useQuestStore();
  const [activeTab, setActiveTab] = useState<'QUESTS' | 'LIVE' | 'STATS' | 'SAVED'>('QUESTS');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [viewingCompletion, setViewingCompletion] = useState<QuestCompletion | null>(null);
  const [currentToast, setCurrentToast] = useState<string | null>(null);

  const t = (translations as any)[state.user.language] || translations.en;

  const handleLanguageChange = (lang: Language) => {
    updateSetting('language', lang);
  };

  useEffect(() => {
    if (state.user.isLoggedIn && state.activeQuests.length === 0 && !loading && state.completedQuests.length === 0) {
      refreshQuests(true);
    }
  }, [state.user.isLoggedIn, loading]);

  useEffect(() => {
    if (newBadges.length > 0 && !currentToast) {
      setCurrentToast(newBadges[0]);
      clearNewBadges();
    }
  }, [newBadges, currentToast]);

  if (!state.user.isLoggedIn) return <AuthScreen onLogin={login} />;

  const getTier = (level: number) => {
    if (level < 2) return 'Noob';
    if (level < 5) return 'Novice';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Legend';
    return 'Demigod';
  };

  const progressPercent = `${Math.min(100, Math.max(0, (state.stats.xp / 500) * 100))}%`;

  return (
    <div className={`min-h-screen max-w-lg mx-auto pb-32 flex flex-col transition-all duration-700 relative overflow-x-hidden ${state.user.theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_45%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.18),transparent_45%)] pointer-events-none"></div>

      <header className={`sticky top-0 z-40 px-5 py-5 backdrop-blur-xl border-b-[2px] border-white/5 bg-slate-950/85`}>
        <div className="flex justify-between items-center">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-fun font-black tracking-tight text-white uppercase drop-shadow-md">{t.app_name}</h1>
              <div className="px-2.5 py-0.5 bg-indigo-600 rounded-full border border-indigo-400/50 shadow-lg shadow-indigo-600/20">
                <span className="text-[9px] text-white font-black uppercase tracking-tighter">{state.user.username}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={state.user.language} 
                  onChange={e => handleLanguageChange(e.target.value as Language)} 
                  className="bg-slate-800/80 text-[10px] font-black border border-white/10 rounded-lg px-3 py-2 uppercase outline-none text-white cursor-pointer appearance-none pr-8 transition-colors hover:bg-slate-700"
                >
                  <option value="en">EN</option>
                  <option value="sr">SR</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] opacity-40">▼</div>
              </div>
              <button onClick={logout} className="text-[10px] font-black border border-white/10 bg-slate-900/50 text-rose-400 rounded-lg px-3 py-2 uppercase active:scale-95 transition-all hover:bg-rose-500/10">LOGOUT</button>
            </div>
          </div>
          <div className="flex flex-col items-end min-w-[140px]">
            <span className="text-[13px] font-black text-rose-400 uppercase tracking-widest mb-0.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] italic">{getTier(state.stats.level)}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">{t.progress_level}</span>
              <span className="text-3xl font-black italic text-white drop-shadow-md leading-none">{state.stats.level}</span>
            </div>
            <div className="relative w-full h-3.5 bg-slate-900/80 rounded-full mt-2 border border-white/10 overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-rose-500 transition-all duration-1000" style={{width: progressPercent}}></div>
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mix-blend-difference tracking-wider uppercase">
                {state.stats.xp} / 500 XP
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 space-y-10 relative z-10">
        {activeTab === 'QUESTS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center px-1">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-fun font-black leading-none text-white tracking-tight uppercase">{t.hunt}</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-70">{t.hunt_desc}</p>
              </div>
              <button 
                onClick={()=>refreshQuests()} 
                disabled={loading} 
                className="bg-slate-900/90 border-2 border-white/5 px-5 py-2.5 rounded-xl text-[10px] font-black shadow-xl active:scale-95 transition-all text-white whitespace-nowrap uppercase tracking-widest"
              >
                {loading ? '...' : `${t.refresh.toUpperCase()} (${state.user.refreshesLeft})`}
              </button>
            </div>

            {state.activeQuests.length > 0 && !loading && (
              <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 text-center">
                <p className="text-[10px] font-bold text-indigo-300 italic">{t.lang_refresh}</p>
              </div>
            )}

            {loading ? (
              <div className="py-28 text-center space-y-5">
                <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl"></div>
                <p className="font-black text-indigo-400/60 uppercase tracking-[0.4em] text-[10px]">UPDATING REALITY...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {state.activeQuests.map(q => <QuestCard key={q.id} quest={q} lang={state.user.language} onClick={setSelectedQuest} />)}
                
                {state.completedQuests.length > 0 && (
                  <div className="mt-10 pt-8 border-t-2 border-white/5 space-y-4">
                    <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">{t.today_achievements}</h3>
                    <div className="grid gap-4">
                      {state.completedQuests.map(c => (
                        <QuestCard 
                          key={c.questId} 
                          quest={c.questData} 
                          lang={state.user.language} 
                          onClick={()=>{}} 
                          isCompleted 
                          onSave={()=>toggleSave(c.questId)}
                          isSaved={c.saved}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'STATS' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
            <h2 className="text-2xl font-fun font-black text-white px-2 uppercase tracking-tight">{t.stats}</h2>
            
            <div className="grid grid-cols-2 gap-5">
              <StatBox label={t.completed} value={state.stats.completed} color="bg-emerald-500/5" border="border-emerald-500/20" textColor="text-emerald-400" icon="👑" />
              <StatBox label={t.failed} value={state.stats.lost} color="bg-rose-500/5" border="border-rose-500/20" textColor="text-rose-400" icon="💥" />
              <StatBox label={t.streak} value={state.stats.streak} color="bg-indigo-500/5" border="border-indigo-500/20" textColor="text-indigo-400" icon="⚡" />
              <StatBox label={t.total_xp} value={state.stats.totalPoints} color="bg-amber-500/5" border="border-amber-500/20" textColor="text-amber-400" icon="💎" />
            </div>

            <div className="bg-slate-900/50 p-7 rounded-[3rem] border-2 border-white/5 space-y-6 shadow-xl">
              <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] text-center">{t.mastery_breakdown}</h3>
              <div className="grid grid-cols-3 gap-4">
                <MiniStat label={t.easy} val={state.stats.easyCount} color="bg-emerald-500" />
                <MiniStat label={t.medium} val={state.stats.mediumCount} color="bg-amber-500" />
                <MiniStat label={t.hard} val={state.stats.hardCount} color="bg-rose-500" />
                <MiniStat label={t.meme} val={state.stats.memeCount} color="bg-purple-500" />
                <MiniStat label={t.extreme} val={state.stats.impossibleCount} color="bg-rose-900" />
              </div>
            </div>

            <div className="space-y-5 px-1">
              <h3 className="text-[12px] font-black text-white uppercase tracking-widest text-center">{t.badges_title}</h3>
              <div className="grid grid-cols-2 gap-4">
                {ALL_BADGE_IDS.map(bid => {
                  const isUnlocked = state.stats.badges?.includes(bid);
                  return (
                    <div key={bid} className={`p-4 rounded-[1.8rem] border-2 transition-all flex flex-col items-center text-center group ${isUnlocked ? 'bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-600/5' : 'bg-slate-900/50 border-white/5 opacity-40 grayscale'}`}>
                      <div className={`w-12 h-12 flex items-center justify-center text-3xl mb-2 transition-transform ${isUnlocked ? 'group-hover:scale-110 group-hover:rotate-12' : ''}`}>
                         {isUnlocked ? getBadgeIcon(bid) : '🔒'}
                      </div>
                      <p className={`text-[10px] font-black uppercase mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                        {isUnlocked ? (translations as any)[state.user.language][bid] : t.badge_locked}
                      </p>
                      <p className="text-[8px] text-slate-500 font-bold leading-tight">
                        {(translations as any)[state.user.language][bid + '_desc']}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SAVED' && (
          <div className="space-y-6 animate-in slide-in-from-left-5 duration-500">
             <h2 className="text-2xl font-fun font-black text-white px-2 uppercase tracking-tight">{t.saved}</h2>
             {state.completedQuests.filter(c => c.saved).length === 0 ? (
               <div className="py-28 text-center opacity-20 flex flex-col items-center">
                 <span className="text-8xl mb-6">🏛️</span>
                 <p className="font-black text-[11px] uppercase tracking-[0.5em] italic leading-loose">{t.empty_vault}</p>
               </div>
             ) : (
               <div className="grid gap-5">
                 {state.completedQuests.filter(c => c.saved).map(c => (
                    <div 
                      key={c.questId} 
                      onClick={() => setViewingCompletion(c)}
                      className="bg-slate-900/60 p-5 rounded-[2.5rem] border-2 border-white/5 flex gap-5 items-center group shadow-xl cursor-pointer hover:bg-slate-800/80 transition-all active:scale-[0.98]"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-3xl flex items-center justify-center text-2xl shadow-2xl group-hover:rotate-6 transition-transform">🏆</div>
                      <div className="flex-1 min-w-0">
                         <p className="font-black text-[12px] text-white uppercase mb-1 leading-tight tracking-tight">{c.questData.title}</p>
                         <p className="text-[10px] text-slate-500 line-clamp-2 italic leading-relaxed">"{c.aiResponse}"</p>
                      </div>
                      <button 
                        onClick={(e)=>{ e.stopPropagation(); toggleSave(c.questId); }} 
                        className="text-rose-500 text-3xl hover:scale-125 active:scale-90 transition-all drop-shadow-md"
                      >
                        ❤️
                      </button>
                    </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </main>

      <nav className={`fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border-2 border-white/10 px-10 py-5 flex justify-between items-center z-50 shadow-2xl neon-glow`}>
        <NavBtn icon="🎯" label={t.quests} active={activeTab === 'QUESTS'} onClick={() => setActiveTab('QUESTS')} />
        <NavBtn icon="⚡" label="Live" active={activeTab === 'LIVE'} onClick={() => setActiveTab('LIVE')} />
        <NavBtn icon="📉" label={t.stats} active={activeTab === 'STATS'} onClick={() => setActiveTab('STATS')} />
        <NavBtn icon="🏛️" label={t.saved} active={activeTab === 'SAVED'} onClick={() => setActiveTab('SAVED')} />
      </nav>

      {selectedQuest && (
        <CompletionModal 
          quest={selectedQuest} 
          lang={state.user.language} 
          onClose={() => setSelectedQuest(null)} 
          onFail={failQuest}
          onSuccess={(proof, feedback, duration) => { completeQuest(selectedQuest.id, proof, feedback, duration); setSelectedQuest(null); }} 
        />
      )}

      {viewingCompletion && (
        <SavedDetailModal 
          completion={viewingCompletion} 
          onClose={() => setViewingCompletion(null)} 
          t={t}
        />
      )}

      {currentToast && (
        <BadgeNotification 
          badgeId={currentToast} 
          lang={state.user.language} 
          onFinish={() => setCurrentToast(null)} 
        />
      )}
    </div>
  );
};

function getBadgeIcon(id: string) {
  const icons: Record<string, string> = {
    badge_first_quest: '🩸', badge_quest_10: '⚔️', badge_quest_50: '🛡️', badge_quest_100: '🏛️',
    badge_streak_3: '🔥', badge_streak_7: '🌪️', badge_streak_15: '🧨', badge_extreme: '🏔️',
    badge_meme: '🤡', badge_web_1: '🔎', badge_web_10: '📡', badge_photo_1: '📸', badge_photo_20: '🎞️',
    badge_loc_1: '🚶', badge_loc_10: '🛸', badge_text_1: '✒️', badge_text_20: '📚', badge_quiz_pro: '🎓',
    badge_fast: '🏎️', badge_owl: '🦉', badge_bird: '🌅', badge_vault: '🏺', 
    badge_lvl_5: '🏅', badge_lvl_10: '🎖️', badge_lvl_20: '👑'
  };
  return icons[id] || '🏅';
}

const StatBox = ({ label, value, color, border, textColor, icon }: any) => (
  <div className={`${color} ${border} p-6 rounded-[2.5rem] border-2 text-center group hover:translate-y-[-4px] transition-all relative overflow-hidden shadow-lg`}>
    <div className="absolute top-2 right-2 opacity-10 text-3xl grayscale group-hover:grayscale-0 transition-all transform group-hover:rotate-12">{icon}</div>
    <span className={`text-4xl font-fun font-black block mb-1 ${textColor} drop-shadow-sm`}>{value}</span>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
  </div>
);

const MiniStat = ({ label, val, color }: any) => (
  <div className="bg-slate-800/60 p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center group">
    <div className={`w-2 h-2 rounded-full ${color} mb-2 shadow-sm group-hover:scale-125 transition-transform`}></div>
    <span className="block text-xl font-black text-white leading-none mb-1">{val}</span>
    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap">{label}</span>
  </div>
);

const NavBtn = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center transition-all duration-300 relative ${active ? 'scale-110 translate-y-[-6px]' : 'opacity-20 grayscale hover:opacity-40'}`}>
    <span className="text-2xl drop-shadow-xl">{icon}</span>
    <span className="text-[9px] font-black uppercase mt-1.5 tracking-widest">{active ? label : ''}</span>
    {active && <div className="absolute -bottom-3 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_12px_#6366f1]"></div>}
  </button>
);

export default App;
