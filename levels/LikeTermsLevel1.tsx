import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Lightbulb } from 'lucide-react';
import type { LevelComponentProps } from '../types';

type Term = {
  id: string;
  display: string;
  category: 'x' | 'y' | 'constant';
  color: string;
};

const TASK1_TERMS: Term[] = [
  { id: 't1-1', display: '2x', category: 'x', color: 'text-purple-400' },
  { id: 't1-2', display: '-4', category: 'constant', color: 'text-gray-400' },
  { id: 't1-3', display: '+5y', category: 'y', color: 'text-emerald-400' },
  { id: 't1-4', display: '+3x', category: 'x', color: 'text-purple-400' },
  { id: 't1-5', display: '-y', category: 'y', color: 'text-emerald-400' },
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

const DraggableTerm: React.FC<{ term: Term }> = ({ term }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'term',
    item: { id: term.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [term.id]);

  return (
    <div
      ref={(node) => { drag(node); }}
      className={`px-6 py-4 rounded-xl font-mono text-3xl border-2 transition-all transform cursor-grab active:cursor-grabbing shadow-lg ${
        isDragging ? 'opacity-0 scale-90' : 'hover:scale-105 opacity-100 bg-gray-800 border-gray-700'
      } ${term.color}`}
    >
      {term.display}
    </div>
  );
};

const TermBin: React.FC<{ 
  id: string;
  label: string; 
  onDrop: (id: string) => void;
  onRemove: (id: string) => void;
  assignedItems: Term[];
  isChecking: boolean;
}> = ({ id, label, onDrop, onRemove, assignedItems, isChecking }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'term',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [onDrop]);

  return (
    <div
      ref={(node) => { drop(node); }}
      className={`p-8 rounded-[1.5rem] border-2 border-dashed transition-all flex flex-col min-h-[200px] ${
        isOver ? 'bg-sky-500/10 border-sky-400 shadow-inner' : 'bg-gray-800 border-gray-700'
      }`}
    >
      <h4 className="text-sky-300 font-black text-sm mb-6 uppercase tracking-widest">{label}</h4>
      <div className="flex flex-wrap gap-3">
        {assignedItems.map(item => {
          const isWrong = isChecking && item.category !== id;
          return (
            <div 
              key={item.id} 
              onClick={() => onRemove(item.id)}
              className={`px-3 py-2 rounded-lg bg-gray-700 font-mono text-2xl border-4 cursor-pointer hover:scale-95 transition-all ${isWrong ? 'border-rose-500 animate-shake' : 'border-gray-600'} ${item.color}`}
              title="Click to remove"
            >
              {item.display}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LikeTermsLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [subPhase, setSubPhase] = useState<'sorting' | 'simplifying'>(() => partialProgress?.subPhase || 'sorting');
  const [maxSubPhaseReached, setMaxSubPhaseReached] = useState<boolean>(() => partialProgress?.maxSubPhaseReached || false);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [simplifyAnswers, setSimplifyAnswers] = useState({ x: '', y: '', constant: '' });
  const [simplifyFeedback, setSimplifyFeedback] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; msg?: string } | null>(null);
  const [isCheckingSorting, setIsCheckingSorting] = useState(false);
  const [isSimplifyingComplete, setIsSimplifyingComplete] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!isCompletedRef.current && onSavePartialProgress && !isGameOver) {
      onSavePartialProgress({ subPhase, maxSubPhaseReached });
    }
  }, [onSavePartialProgress, subPhase, maxSubPhaseReached, isGameOver]);

  const bins = [
    { id: 'x', label: 'Term with "x"' },
    { id: 'y', label: 'Term with "y"' },
    { id: 'constant', label: 'Constant Terms (numbers)' }
  ];

  const handleDrop = (termId: string, binId: string) => {
    setAssignments(prev => ({ ...prev, [termId]: binId }));
    setIsCheckingSorting(false);
    setFeedback(null);
  };

  const handleRemove = (termId: string) => {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[termId];
      return next;
    });
    setIsCheckingSorting(false);
  };

  const handleCheckSorting = () => {
    setIsCheckingSorting(true);
    let allCorrect = true;
    let errors = 0;
    TASK1_TERMS.forEach(t => {
      if (assignments[t.id] !== t.category) {
        allCorrect = false;
        errors++;
      }
    });

    if (allCorrect) {
      setFeedback({ type: 'correct', msg: "" });
      setMaxSubPhaseReached(true);
      setTimeout(() => {
        setSubPhase('simplifying');
        setFeedback(null);
        setIsCheckingSorting(false);
      }, 1500); 
    } else {
      setErrorCount(prev => prev + errors);
      setFeedback({ type: 'incorrect', msg: "Try again! Check that each term matches the variable or constant type for its box." });
    }
  };

  const handleSimplifySubmit = () => {
    const isXCorrect = simplifyAnswers.x.replace(/\s/g, '').toLowerCase() === '5x';
    const isYCorrect = simplifyAnswers.y.replace(/\s/g, '').toLowerCase() === '4y';
    const isConstCorrect = simplifyAnswers.constant.replace(/\s/g, '').toLowerCase() === '-4';

    const newFeedback = {
      x: isXCorrect ? 'correct' : 'incorrect',
      y: isYCorrect ? 'correct' : 'incorrect',
      constant: isConstCorrect ? 'correct' : 'incorrect'
    } as const;

    setSimplifyFeedback(newFeedback);

    if (isXCorrect && isYCorrect && isConstCorrect) {
      setFeedback({ type: 'correct', msg: "Great job! The simplified expression is 5x + 4y - 4!" });
      setIsSimplifyingComplete(true);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback({ type: 'incorrect', msg: "Check your addition/subtraction in the boxes." });
    }
  };

  const handleReplay = () => {
    setSubPhase('sorting');
    setMaxSubPhaseReached(false);
    setAssignments({});
    setSimplifyAnswers({ x: '', y: '', constant: '' });
    setSimplifyFeedback({});
    setIsSimplifyingComplete(false);
    setErrorCount(0);
    setIsGameOver(false);
    setFeedback(null);
  };

  const calculateStars = () => {
    if (errorCount <= 1) return 3;
    if (errorCount === 2) return 2;
    return 1;
  };

  const isEverySortingItemPlaced = Object.keys(assignments).length === TASK1_TERMS.length;

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 text-white bg-gray-900 font-sans max-w-7xl mx-auto relative overflow-y-auto">
      <div className="w-full flex flex-col items-center mb-10 border-b border-gray-800 pb-6">
        <div className="flex justify-center gap-4 mb-2">
          <button 
            onClick={() => setSubPhase('sorting')}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${subPhase === 'sorting' ? 'bg-sky-500 border-sky-300 scale-125 shadow-glow' : 'bg-sky-900 border-sky-600 hover:bg-sky-500'}`}
            title="Phase 1: Sorting"
          />
          <button 
            onClick={() => maxSubPhaseReached && setSubPhase('simplifying')}
            disabled={!maxSubPhaseReached}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${subPhase === 'simplifying' ? 'bg-sky-500 border-sky-300 scale-125' : maxSubPhaseReached ? 'bg-sky-900 border-sky-600 hover:bg-sky-500' : 'border-gray-600 cursor-not-allowed'}`}
            title="Phase 2: Simplifying"
          />
        </div>
      </div>

      <div className="bg-gray-800 border-l-[6px] border-indigo-500 p-8 rounded-r-3xl mb-12 w-full shadow-2xl">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
          {subPhase === 'sorting' ? 'Step 1: Sort the terms' : 'Step 2: Simplify the collected terms'}
        </h2>
        <p className="text-slate-200 text-xl md:text-2xl font-bold italic">
          {subPhase === 'sorting' 
            ? "Sort the terms into the correct boxes. (Use the colors to help you identify like terms!)"
            : "Now combine the values in each box into a single term."}
        </p>
        <div className="mt-6 p-6 bg-gray-950 rounded-2xl text-5xl font-mono text-center flex justify-center gap-8 shadow-inner border border-gray-800">
          {TASK1_TERMS.map(t => (
            <span key={t.id} className={`${t.color} ${assignments[t.id] && subPhase === 'sorting' ? 'opacity-10 scale-90' : 'transition-all duration-500'}`}>{t.display}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 w-full items-start">
        <div className="bg-gray-800/40 p-8 rounded-[2rem] border border-gray-700 min-h-[250px] shadow-xl">
          <h3 className="text-gray-500 font-bold uppercase text-[10px] mb-6 text-center tracking-[0.3em]">Expressions</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {TASK1_TERMS.filter(t => !assignments[t.id]).map(t => (
              <DraggableTerm key={t.id} term={t} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          {bins.map(bin => (
            <div key={bin.id} className="flex flex-col gap-6">
              <TermBin 
                id={bin.id} 
                label={bin.label} 
                onDrop={(tid) => handleDrop(tid, bin.id)} 
                onRemove={handleRemove}
                assignedItems={TASK1_TERMS.filter(t => assignments[t.id] === bin.id)} 
                isChecking={isCheckingSorting}
              />
              
              {subPhase === 'simplifying' && (
                <div className="animate-fade-in flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="?"
                    value={simplifyAnswers[bin.id as keyof typeof simplifyAnswers]}
                    onChange={(e) => {
                      setSimplifyAnswers(prev => ({ ...prev, [bin.id]: e.target.value }));
                      setSimplifyFeedback(prev => ({ ...prev, [bin.id]: null }));
                      setFeedback(null);
                    }}
                    className={`bg-gray-950 border-4 rounded-2xl px-5 py-4 text-3xl font-mono text-center focus:border-sky-400 outline-none shadow-2xl transition-all ${
                      simplifyFeedback[bin.id] === 'correct' ? 'border-emerald-500 text-emerald-400' : 
                      simplifyFeedback[bin.id] === 'incorrect' ? 'border-rose-500 text-rose-400' : 
                      'border-indigo-500/50'
                    }`}
                  />
                  <div className="h-8 text-center">
                    {showHints && (
                      <span className="text-purple-400 font-black text-sm uppercase tracking-widest italic animate-pulse">
                        {bin.id === 'x' ? '2x + 3x = ?' : bin.id === 'y' ? '5y - y = ?' : '(constant term)'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-8 w-full">
        {feedback && !isGameOver && (
          <div className={`px-12 py-6 rounded-[2rem] font-black text-2xl shadow-2xl animate-fade-in border-4 flex items-center gap-4 max-w-4xl ${
            feedback.type === 'correct' ? 'bg-emerald-600 border-emerald-400' : 'bg-rose-700 border-rose-500 animate-shake'
          }`}>
            {feedback.type === 'correct' && '✨'} {feedback.msg}
          </div>
        )}
        <div className="flex gap-6">
          {subPhase === 'sorting' ? (
            <button
              onClick={handleCheckSorting}
              disabled={!isEverySortingItemPlaced}
              className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-tighter"
            >
              Check
            </button>
          ) : (
            <>
              {!isSimplifyingComplete && (
                <button
                    onClick={() => setShowHints(prev => !prev)}
                    className="bg-purple-600 hover:bg-purple-500 p-5 rounded-2xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center"
                    title="Hint"
                >
                    <Lightbulb className="w-8 h-8" />
                </button>
              )}
              {isSimplifyingComplete ? (
                <button
                    onClick={() => setIsGameOver(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-tighter animate-bounce"
                >
                    Finish
                </button>
              ) : (
                <button
                    onClick={handleSimplifySubmit}
                    className="bg-sky-600 hover:bg-sky-500 px-12 py-5 rounded-2xl font-black text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-tighter"
                >
                    Check
                </button>
              )}
            </>
          )}
        </div>
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
                    {isLow ? "Good effort!" : "Level Complete!"}
                  </h2>
                  <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3].map(i => <StarIcon key={i} className={`w-20 h-20 ${i <= stars ? "text-yellow-400" : "text-gray-700"}`} filled={i <= stars} />)}
                  </div>
                  {stars < 3 && <p className="text-sm text-slate-400 mb-10 font-black uppercase tracking-widest">Simplify expressions with fewer errors to earn 3 stars!</p>}
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

    </div>
  );
};

export default LikeTermsLevel1;