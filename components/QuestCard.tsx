
import React, { useState } from 'react';
import { Quest, QuestDifficulty, QuestType } from '../types';

interface QuestCardProps {
  quest: Quest;
  onClick: (quest: Quest) => void;
  lang: string;
  isCompleted?: boolean;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

const DIFFICULTY_STYLE: Record<QuestDifficulty, string> = {
  EASY: 'bg-emerald-500 text-white border-emerald-400',
  MEDIUM: 'bg-yellow-400 text-slate-950 border-yellow-300',
  HARD: 'bg-rose-600 text-white border-rose-400',
  MEME: 'bg-purple-600 text-white border-purple-400',
  IMPOSSIBLE: 'bg-slate-900 text-white border-slate-700',
};

const TYPE_CONFIG: Record<QuestType, { icon: string, color: string, gradient: string }> = {
  IMAGE: { icon: '📸', color: 'border-rose-500/50', gradient: 'from-rose-500/20 to-transparent' },
  ONLINE_IMAGE: { icon: '🌐', color: 'border-cyan-500/50', gradient: 'from-cyan-500/20 to-transparent' },
  TEXT: { icon: '✍️', color: 'border-sky-500/50', gradient: 'from-sky-500/20 to-transparent' },
  LOCATION: { icon: '📍', color: 'border-emerald-500/50', gradient: 'from-emerald-500/20 to-transparent' },
  LOGIC: { icon: '🧩', color: 'border-indigo-500/50', gradient: 'from-indigo-500/20 to-transparent' },
  QUIZ: { icon: '❓', color: 'border-amber-500/50', gradient: 'from-amber-500/20 to-transparent' },
};

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick, isCompleted, onSave, isSaved }) => {
  const config = TYPE_CONFIG[quest.type] || { icon: '⚡', color: 'border-slate-500/40', gradient: 'from-slate-500/10 to-transparent' };
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Quest: ${quest.title}\n"${quest.description}"\nJoin PP Quest!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'PP Quest Challenge',
          text: shareText,
          url: window.location.href
        });
      } else {
        throw new Error('Share API unavailable');
      }
    } catch (err) {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isCompleted) {
    return (
      <div className="group relative transition-all duration-300 rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-900/40 p-2.5 flex items-center gap-3 opacity-90 backdrop-blur-sm">
        <span className="text-lg grayscale opacity-40">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[11px] font-bold text-slate-400 truncate leading-none mb-1">{quest.title}</h3>
          <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase border-2 ${DIFFICULTY_STYLE[quest.difficulty]}`}>
            {quest.difficulty}
          </span>
        </div>
        <div className="flex gap-1.5">
          {onSave && (
            <button 
              onClick={(e) => { e.stopPropagation(); onSave(quest.id); }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] transition-all ${isSaved ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
            >
              {isSaved ? '❤️' : '💾'}
            </button>
          )}
          <button 
            onClick={handleShare}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] hover:bg-slate-700 transition-colors"
          >
            {copied ? '✅' : '↗️'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(quest)}
      className={`group relative cursor-pointer active:scale-[0.98] transition-all duration-300 rounded-[2.2rem] overflow-hidden border-[3px] bg-slate-900 shadow-xl ${config.color}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none opacity-40`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
      
      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex gap-1.5 items-center">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase border-2 ${DIFFICULTY_STYLE[quest.difficulty]}`}>
              {quest.difficulty}
            </span>
            <span className="text-xl drop-shadow-md">{config.icon}</span>
          </div>
          <button 
            onClick={handleShare}
            className="w-8 h-8 rounded-xl bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-xs hover:bg-slate-700 transition-colors border border-white/5"
          >
            {copied ? '✅' : '↗️'}
          </button>
        </div>

        <h3 className="text-lg font-fun font-black text-white mb-1 leading-tight group-hover:text-indigo-300 transition-colors drop-shadow-sm">
          {quest.title}
        </h3>
        <p className="text-slate-400 text-xs font-medium leading-normal mb-4 line-clamp-2">
          {quest.description}
        </p>

        <div className="flex justify-between items-center pt-3 border-t border-white/5">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{quest.type}</span>
          <div className="px-3 py-1 rounded-xl border-2 border-white/5 bg-white/5 flex items-center gap-1.5">
             <span className="font-black text-indigo-400 text-[11px]">+{quest.points} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
