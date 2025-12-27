
import React, { useState, useRef } from 'react';
import { Quest, Language } from '../types';
import { verifyQuestWithAI } from '../services/geminiService';
import { translations } from '../translations';

interface CompletionModalProps {
  quest: Quest;
  lang: Language;
  onClose: () => void;
  onFail: () => void;
  onSuccess: (proof: string, aiResponse: string, duration: number) => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ quest, lang, onClose, onFail, onSuccess }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string, success: boolean } | null>(null);
  const [startTime] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (translations as any)[lang] || translations.en;

  const handleVerify = async (type: 'IMAGE' | 'TEXT' | 'LOCATION' | 'ONLINE_IMAGE') => {
    setLoading(true);
    setError(null);
    let proof = '';

    try {
      if (type === 'LOCATION') {
        const pos: GeolocationPosition = await new Promise((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { 
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
          })
        );
        proof = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      } else {
        proof = (type === 'IMAGE' || type === 'ONLINE_IMAGE') ? image! : input;
      }

      if (!proof) throw new Error("No submission found.");

      const result = await verifyQuestWithAI(quest, proof, type, lang);
      if (result.success) {
        setFeedback({ success: true, text: result.feedback });
      } else {
        setError(result.feedback);
        onFail(); // Now correctly updates global stats
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = "System error. Try again.";
      if (err.code === 1) errMsg = "Location denied! Enable GPS in settings.";
      if (err.code === 2) errMsg = "Location unavailable. Move outdoors!";
      if (err.code === 3) errMsg = "Location timeout. Satellite search failed.";
      setError(errMsg);
      onFail(); // Now correctly updates global stats
    } finally {
      setLoading(false);
    }
  };

  const handleQuiz = (choice: string) => {
    if (choice === quest.correctAnswer || !quest.correctAnswer) {
      setFeedback({ success: true, text: t.success_msg });
    } else {
      setError(`${t.failed_msg}!`); 
      onFail(); // Now correctly updates global stats
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border-2 border-slate-800 shadow-2xl overflow-hidden p-6 animate-in zoom-in duration-300 my-auto">
        {!feedback ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-fun font-bold text-white tracking-tight uppercase">{t.mission_type}: {quest.type}</h2>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full hover:bg-slate-700 text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-5 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <h3 className="font-bold text-indigo-400 mb-1 text-sm leading-tight">{quest.title}</h3>
              <p className="text-slate-300 text-[11px] italic leading-relaxed">{quest.instructions}</p>
            </div>

            {(quest.type === 'IMAGE' || quest.type === 'ONLINE_IMAGE') && (
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="aspect-square w-full max-w-[180px] mx-auto bg-slate-800/50 rounded-[2rem] border-[3px] border-dashed border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden mb-6 relative shadow-inner"
              >
                {image ? (
                  <img src={image} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="text-3xl mb-1 block">{quest.type === 'IMAGE' ? '📸' : '🌐'}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {quest.type === 'IMAGE' ? 'Take Photo' : 'Upload Search Result'}
                    </span>
                  </div>
                )}
                <input type="file" accept="image/*" capture={quest.type === 'IMAGE' ? "environment" : undefined} ref={fileInputRef} className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(f); }
                }} />
              </div>
            )}

            {quest.type === 'TEXT' && (
              <textarea className="w-full p-4 rounded-2xl bg-slate-800/80 text-white border-2 border-slate-700 outline-none focus:border-indigo-500 mb-5 min-h-[120px] text-sm" placeholder="Tell the Master..." value={input} onChange={(e)=>setInput(e.target.value)} />
            )}

            {quest.type === 'QUIZ' && (
              <div className="grid gap-2.5 mb-5">
                {quest.quizOptions?.map((o, i) => (
                  <button key={i} onClick={()=>handleQuiz(o)} className="p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-left hover:border-indigo-500 hover:bg-slate-700 transition-all font-black text-sm text-white">
                    {o}
                  </button>
                ))}
              </div>
            )}

            {quest.type === 'LOCATION' && (
              <button onClick={()=>handleVerify('LOCATION')} disabled={loading} className="w-full py-10 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-[2rem] text-emerald-400 font-black mb-5 flex flex-col items-center gap-2 transition-all hover:bg-emerald-500/20 active:scale-95 shadow-lg shadow-emerald-500/5">
                <span className="text-4xl">{loading ? '📡' : '📍'}</span>
                <span className="text-[10px] tracking-[0.2em] uppercase">{loading ? t.loc_checking : 'VERIFY MY GPS'}</span>
              </button>
            )}

            {error && (
              <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl mb-5 text-[11px] font-bold border border-rose-500/20 whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-top-2">
                ⚠️ {error}
              </div>
            )}

            {(quest.type === 'IMAGE' || quest.type === 'TEXT' || quest.type === 'ONLINE_IMAGE') && (
              <button 
                onClick={()=>handleVerify(quest.type as any)} 
                disabled={loading || ((quest.type === 'IMAGE' || quest.type === 'ONLINE_IMAGE') && !image) || (quest.type === 'TEXT' && !input)} 
                className={`w-full py-5 rounded-[1.8rem] font-black text-xl transition-all shadow-xl shadow-indigo-600/20 border-b-4 border-indigo-800 ${loading ? 'bg-slate-800 text-slate-500 border-none cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:scale-[1.02] active:scale-95 active:border-b-0'}`}
              >
                {loading ? t.verify : t.submit}
              </button>
            )}
          </>
        ) : (
          <div className="text-center animate-in slide-in-from-bottom-5 duration-500">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/10">✅</div>
            <h3 className="text-2xl font-fun font-bold mb-3 text-white uppercase tracking-tight">{t.success_msg}</h3>
            <div className="p-5 bg-slate-800/60 rounded-[1.5rem] mb-6 border border-white/5 shadow-inner">
              <p className="text-slate-200 italic text-sm leading-relaxed">"{feedback.text}"</p>
            </div>
            <button onClick={()=>onSuccess(image || input || 'Completed', feedback.text, Math.floor((Date.now()-startTime)/1000))} className="w-full py-5 bg-gradient-to-br from-emerald-500 to-emerald-400 text-slate-950 rounded-[1.8rem] font-black text-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-emerald-700 active:border-b-0">
              {t.claim_xp} (+{quest.points})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletionModal;
