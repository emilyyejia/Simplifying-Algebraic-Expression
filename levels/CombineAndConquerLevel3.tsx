import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';

type Question = {
  id: number;
  type: 'single' | 'multi';
  question: React.ReactNode;
  options: string[];
  correct: string[];
  hint: string;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'single',
    question: <>Which expression is equivalent to <span className="font-mono text-sky-400 font-bold">2x³ - 4x + 3x² + 7 - 4x + x²</span>?</>,
    options: ['2x³ + 4x² - 4x + 7', '2x³ + 4x² - 8x + 7', '2x³ + 3x² - 8x + 7', '2x³ + 4x² + 7'],
    correct: ['2x³ + 4x² - 8x + 7'],
    hint: 'Group like terms: x² terms together (3x² + x²) and x terms together (-4x - 4x).'
  },
  {
    id: 2,
    type: 'single',
    question: <>In a video game, a player <span className="text-sky-400 font-black">earns</span> <span className="font-mono text-sky-300 font-bold">2x³</span> points in Level 1 and <span className="text-sky-400 font-black">earns</span> <span className="font-mono text-sky-300 font-bold">3x³</span> points in Level 2. The player <span className="text-orange-400 font-black">loses 5 points</span> due to a penalty, but <span className="text-sky-400 font-black">earns</span> <span className="text-emerald-400 font-black">a bonus of x points</span>. Which expression represents the total points?</>,
    options: ['5x³ + x', '5x³ - 5', '5x³ + x - 5', '5x³ + x + 5'],
    correct: ['5x³ + x - 5'],
    hint: 'Add the two level scores, add the bonus, then subtract the penalty.'
  },
  {
    id: 3,
    type: 'single',
    question: <>A class raises <span className="font-mono font-bold">7y</span> dollars selling cookies and <span className="font-mono font-bold">y</span> dollars selling drinks. They also receive a donation of 20 dollars. Which expression represents the total amount raised?</>,
    options: ['8y', '8y + 20', '7y + 20', '7y + x + 20'],
    correct: ['8y + 20'],
    hint: 'Combine the variable items (7y + y) and then add the constant donation.'
  },
  {
    id: 4,
    type: 'multi',
    question: <>Select <strong className="text-amber-400">TWO</strong> expressions that simplify to <span className="font-mono text-emerald-400 font-bold text-3xl">3x + 7</span>.</>,
    options: ['x + 2x - 7', '5x - 2x + 7', '4x + x² - x + 7', 'x³ - x³ + 3 + 4 + 3x'],
    correct: ['5x - 2x + 7', 'x³ - x³ + 3 + 4 + 3x'],
    hint: 'Combine like terms. Put the x terms together and the numbers together.'
  }
];

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-12 h-12 mx-1" }) => (
  <svg
    className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "2"}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
);

const CombineAndConquerLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [currentIdx, setCurrentIdx] = useState(() => partialProgress?.currentIdx || 0);
  const [maxReachedIdx, setMaxReachedIdx] = useState(() => partialProgress?.maxReachedIdx || 0);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; msg?: string } | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress && !isGameOver) {
        onSavePartialProgress({ currentIdx, maxReachedIdx });
      }
    };
  }, [onSavePartialProgress, currentIdx, maxReachedIdx, isGameOver]);

  const currentQ = QUESTIONS[currentIdx];

  const handleToggleOption = (option: string) => {
    setFeedback(null);
    if (currentQ.type === 'single') setSelected([option]);
    else setSelected(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const handleCheck = () => {
    const isCorrect = selected.length === currentQ.correct.length && selected.every(s => currentQ.correct.includes(s));
    if (isCorrect) {
      setFeedback({ type: 'correct', msg: 'Great!' });
      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        if (nextIdx > maxReachedIdx) setMaxReachedIdx(nextIdx);
        
        if (currentIdx < QUESTIONS.length - 1) {
          setCurrentIdx(nextIdx);
          setSelected([]);
          setFeedback(null);
        } else {
          setCurrentIdx(QUESTIONS.length);
          setSelected([]);
          setFeedback(null);
        }
      }, 1500);
    } else {
      setErrorCount(e => e + 1);
      setFeedback({ type: 'incorrect', msg: `Tip: ${currentQ.hint}` });
    }
  };

  const handleGeoAnswer = (ans: string) => {
    if (ans === '21x² + 4x') { 
      setFeedback({ type: 'correct', msg: 'Great!' });
      setTimeout(() => {
        setIsGameOver(true);
      }, 1500);
    } else {
      setErrorCount(e => e + 1);
      setFeedback({ type: 'incorrect', msg: 'Tip: Draw one line to divide the shape into two rectangles. Find the area of each rectangle! (Rectangle 1: 5x * 4x. Rectangle 2: x * (x + 4)). Then combine them.' });
    }
  };

  const handleReplay = () => {
    setCurrentIdx(0);
    setMaxReachedIdx(0);
    setSelected([]);
    setFeedback(null);
    setErrorCount(0);
    setIsGameOver(false);
  };

  const calculateStars = () => {
    if (errorCount === 0) return 3;
    if (errorCount <= 2) return 2;
    return 1;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 text-white font-sans max-w-7xl mx-auto overflow-y-auto">
      <div className="w-full flex flex-col items-center mb-10 border-b border-gray-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-black text-sky-400 italic tracking-tighter uppercase text-center mb-4">
          Combine & Conquer
        </h1>
        
        <div className="flex justify-center gap-4 mb-2">
          {Array.from({ length: QUESTIONS.length + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIdx(i); setFeedback(null); setSelected([]); }}
              className={`w-4 h-4 rounded-full transition-all duration-300 border-2 flex items-center justify-center ${
                  currentIdx === i ? 'bg-sky-500 border-sky-300 scale-125 shadow-glow' : 
                  i <= maxReachedIdx ? 'bg-emerald-700 border-emerald-500 hover:bg-emerald-500' : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
              }`}
              title={`Task ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full relative min-h-[500px]">
        {currentIdx < QUESTIONS.length ? (
          <div className="animate-fade-in">
            <h2 className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs mb-8 italic">Challenge Question {currentIdx + 1}</h2>
            <div className="text-3xl md:text-4xl font-bold mb-12 leading-[1.3] text-white tracking-tight">{currentQ.question}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQ.options.map(opt => (
                <button key={opt} onClick={() => handleToggleOption(opt)} className={`p-8 rounded-[1.5rem] text-3xl font-mono border-4 transition-all text-left flex justify-between items-center ${selected.includes(opt) ? 'bg-sky-600/30 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.2)]' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
                  <span className="font-bold">{opt}</span>
                  <div className={`w-10 h-10 rounded-full border-4 transition-all ${selected.includes(opt) ? 'bg-sky-400 border-sky-200' : 'border-slate-800'}`} />
                </button>
              ))}
            </div>
            <div className="mt-16 flex items-center justify-between gap-10">
              <button 
                onClick={handleCheck} 
                disabled={selected.length === 0} 
                className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-tighter"
              >
                Check Answer
              </button>
              {feedback?.type === 'correct' && (
                 <div className="bg-emerald-900/50 border-l-8 border-emerald-500 p-6 rounded-r-2xl animate-fade-in flex-grow">
                    <p className="text-emerald-200 italic font-bold text-2xl">{feedback.msg}</p>
                 </div>
              )}
              {feedback?.type === 'incorrect' && (
                 <div className="bg-rose-950/50 border-l-8 border-rose-500 p-6 rounded-r-2xl animate-shake flex-grow">
                    <p className="text-rose-200 italic font-bold text-lg leading-relaxed">{feedback.msg}</p>
                 </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 w-full">
               <h2 className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs mb-8 italic">Final Mastery Task: Composite Area</h2>
               <p className="text-xl font-medium mb-10 text-sky-50 leading-tight">Find the total area expression for this composite shape:</p>
               <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-slate-800 flex justify-center shadow-inner relative group">
                  <svg viewBox="0 0 300 250" className="w-[450px] overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                    <path d="M 50,50 L 250,50 L 250,200 L 150,200 L 150,120 L 50,120 Z" fill="#111827" stroke="#10b981" strokeWidth="4" strokeLinejoin="round" />
                    <text x="150" y="35" textAnchor="middle" fill="#10b981" className="text-2xl font-mono font-black uppercase italic tracking-tighter">5x</text>
                    <text x="30" y="85" textAnchor="middle" fill="#10b981" className="text-2xl font-mono font-black uppercase italic tracking-tighter" transform="rotate(-90 30 85)">4x</text>
                    <text x="275" y="125" textAnchor="middle" fill="#10b981" className="text-xl font-mono font-black uppercase italic tracking-tighter" transform="rotate(90 275 125)">x + 4</text>
                    <text x="200" y="225" textAnchor="middle" fill="#10b981" className="text-2xl font-mono font-black uppercase italic tracking-tighter">x</text>
                  </svg>
               </div>
            </div>
            <div className="flex-1 space-y-6 w-full lg:max-w-md">
               <div className="grid grid-cols-1 gap-5">
                 {['21x² + 4x', '20x² + 4', '25x²', '19x² + 4x'].map(ans => (
                   <button key={ans} onClick={() => handleGeoAnswer(ans)} className="w-full p-8 bg-slate-900 border-4 border-slate-800 rounded-[1.5rem] text-4xl font-mono font-black text-center hover:border-emerald-500 hover:text-emerald-400 transition-all active:scale-95 shadow-xl">{ans}</button>
                 ))}
               </div>
               {feedback?.type === 'correct' && !isGameOver && (
                 <div className="p-8 bg-emerald-950/50 border-l-[12px] border-emerald-500 rounded-r-3xl text-3xl text-emerald-100 italic font-black shadow-2xl animate-fade-in text-center">
                    {feedback.msg}
                 </div>
               )}
               {feedback?.type === 'incorrect' && (
                 <div className="p-8 bg-indigo-950/50 border-l-[12px] border-indigo-500 rounded-r-3xl text-xl text-indigo-100 italic leading-relaxed shadow-2xl animate-fade-in">
                    <strong className="text-indigo-400 font-black uppercase tracking-widest block mb-2">Hint:</strong>
                    {feedback.msg}
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {isGameOver && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[300] p-6 animate-fade-in">
          <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center text-white border-[12px] border-slate-800/50">
            {(() => {
              const stars = calculateStars();
              const isLow = stars === 1;
              return (
                <>
                  <h2 className={`font-black mb-4 italic tracking-tighter uppercase ${isLow ? 'text-emerald-400 text-4xl' : 'text-sky-400 text-5xl'}`}>
                    {isLow ? "Good effort!" : "Mastery complete!"}
                  </h2>
                  <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3].map(i => <StarIcon key={i} className={`w-20 h-20 ${i <= stars ? "text-yellow-400" : "text-gray-700"}`} filled={i <= stars} />)}
                  </div>
                  {stars < 3 && <p className="text-sm text-slate-400 mb-10 font-black uppercase tracking-widest">Complete the test with fewer errors to earn 3 stars!</p>}
                  <div className="flex flex-col gap-4 mt-8">
                    <button onClick={handleReplay} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-[1.5rem] transition-all text-xl uppercase tracking-tighter shadow-sm">Replay</button>
                    <button onClick={() => { isCompletedRef.current = true; onComplete(stars); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">Back to Map</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <button onClick={onExit} className="mt-16 text-slate-600 hover:text-white underline font-black transition-all uppercase tracking-[0.4em] text-[10px]">Abandon Mastery Attempt</button>
    </div>
  );
};

export default CombineAndConquerLevel3;