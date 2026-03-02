import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { LevelComponentProps } from '../types';

type SortPair = {
  id: number;
  exp1: string;
  exp2: string;
  isEquivalent: boolean;
  hint: string;
};

const PAIRS: SortPair[] = [
  { id: 1, exp1: '2x + 3', exp2: 'x + x + 3', isEquivalent: true, hint: 'x + x simplifies to 2x.' },
  { id: 2, exp1: 'x² + 4x + 4', exp2: '(x + 2)²', isEquivalent: true, hint: 'Expand (x + 2)² to check.' },
  { id: 3, exp1: '3x - 5', exp2: '3(x - 5)', isEquivalent: false, hint: 'Check the distribution: 3(x - 5) = 3x - 15.' },
  { id: 4, exp1: '2(x + 3)', exp2: '2x + 6', isEquivalent: true, hint: 'Distribute the 2 to both x and 3.' },
  { id: 5, exp1: 'x² - x + 1', exp2: 'x² + 1', isEquivalent: false, hint: 'The middle term "-x" matters!' },
  { id: 6, exp1: '4x + 2', exp2: '2(2x + 1)', isEquivalent: true, hint: '2(2x) is 4x and 2(1) is 2.' },
];

const DraggablePair: React.FC<{ pair: SortPair; validationStatus?: 'correct' | 'incorrect' }> = ({ pair, validationStatus }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'expressionPair',
    item: { id: pair.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [pair.id]);

  return (
    <div
      ref={(node) => { drag(node); }}
      className={`p-3 rounded-xl border-2 transition-all text-left relative cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-0 scale-90' : 'bg-slate-800 border-slate-700 hover:border-slate-500'
      } ${validationStatus === 'incorrect' ? 'bg-rose-950 border-rose-500 animate-shake' : ''}`}
    >
      <div className="flex flex-col font-mono text-sm">
        <span className="text-slate-400 text-[10px] mb-1 uppercase font-bold tracking-tighter">Pair {pair.id}</span>
        <div className="flex items-center justify-between">
          <span className="text-white">{pair.exp1}</span>
          <span className="text-slate-600 text-xs italic mx-2">and</span>
          <span className="text-white">{pair.exp2}</span>
        </div>
      </div>
    </div>
  );
};

const DropBin: React.FC<{ 
  binType: 'equiv' | 'not-equiv'; 
  onDrop: (id: number) => void;
  assignedPairs: SortPair[];
  validation: Record<number, 'correct' | 'incorrect'>;
  label: string;
  colorClass: string;
}> = ({ binType, onDrop, assignedPairs, validation, label, colorClass }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'expressionPair',
    drop: (item: { id: number }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [onDrop]);

  return (
    <div
      ref={(node) => { drop(node); }}
      className={`p-6 rounded-3xl border-2 border-dashed transition-all flex flex-col gap-4 ${
        isOver ? 'bg-sky-500/5 border-sky-400/50 scale-102 ring-1 ring-sky-500/20' : 'bg-slate-900 border-slate-800'
      }`}
    >
      <h4 className={`${colorClass} font-black text-center uppercase tracking-widest text-sm`}>{label}</h4>
      <div className="space-y-2">
        {assignedPairs.map(pair => (
          <div 
            key={pair.id}
            className={`p-3 rounded-lg border font-mono text-xs flex justify-between items-center ${
              validation[pair.id] === 'correct' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300' :
              validation[pair.id] === 'incorrect' ? 'bg-rose-950 border-rose-500/50 text-rose-300' :
              'bg-slate-800 border-slate-700'
            }`}
          >
            <span className={`
                ${binType === 'not-equiv' && validation[pair.id] !== 'incorrect' ? 'line-through decoration-slate-500/50' : ''}
                ${validation[pair.id] === 'incorrect' ? 'line-through decoration-rose-500 decoration-4 text-rose-500 font-black' : ''}
            `}>
              {pair.exp1} {binType === 'equiv' ? '=' : '≠'} {pair.exp2}
            </span>
            {validation[pair.id] === 'correct' && <span>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

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

const PolynomialMasterLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress, onNext }) => {
  const [taskNum, setTaskNum] = useState<1 | 2>(() => partialProgress?.taskNum || 1);
  const [maxTaskReached, setMaxTaskReached] = useState<number>(() => partialProgress?.maxTaskReached || 1);
  const [sortAssignments, setSortAssignments] = useState<Record<number, 'equiv' | 'not-equiv'>>({});
  const [validation, setValidation] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; msg?: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorCount, setErrorCount] = useState<number>(() => partialProgress?.errorCount || 0);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!isCompletedRef.current && onSavePartialProgress && !isCompleted) {
      onSavePartialProgress({ taskNum, sortAssignments, maxTaskReached, errorCount });
    }
  }, [taskNum, sortAssignments, onSavePartialProgress, maxTaskReached, isCompleted, errorCount]);

  const handleDrop = (id: number, bin: 'equiv' | 'not-equiv') => {
    setSortAssignments(prev => ({ ...prev, [id]: bin }));
    const newVal = { ...validation };
    delete newVal[id];
    setValidation(newVal);
  };

  const checkSort = () => {
    const newValidation: Record<number, 'correct' | 'incorrect'> = {};
    let allCorrect = true;
    PAIRS.forEach(pair => {
      const assigned = sortAssignments[pair.id];
      if (!assigned) {
        allCorrect = false;
        return;
      }
      const isCorrect = (assigned === 'equiv' && pair.isEquivalent) || (assigned === 'not-equiv' && !pair.isEquivalent);
      newValidation[pair.id] = isCorrect ? 'correct' : 'incorrect';
      if (!isCorrect) {
        allCorrect = false;
        setErrorCount(prev => prev + 1);
      }
    });
    setValidation(newValidation);
    if (allCorrect && Object.keys(sortAssignments).length === PAIRS.length) {
      setFeedback({ type: 'correct' });
      setTimeout(() => {
        setTaskNum(2);
        setMaxTaskReached(2);
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ type: 'incorrect', msg: "You are almost there! Check the expansion carefully." });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleGeoAnswer = (ans: string) => {
    if (ans === '14x²') {
      setFeedback({ type: 'correct' });
      setTimeout(() => {
        setIsCompleted(true);
      }, 1500);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback({ type: 'incorrect', msg: "Draw one line to divide the shape into two rectangles. Find the area of each rectangle, then add them." });
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const calculateStars = () => {
    if (errorCount <= 1) return 3;
    if (errorCount === 2) return 2;
    return 1;
  };

  const resetLevel = () => {
    setTaskNum(1);
    setMaxTaskReached(1);
    setSortAssignments({});
    setValidation({});
    setFeedback(null);
    setIsCompleted(false);
    setErrorCount(0);
    onSavePartialProgress?.(null);
  };

  const handleReplay = resetLevel;

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 pt-4 text-white font-sans max-w-7xl mx-auto overflow-x-hidden relative">
      <div className="w-full flex flex-col items-center mb-10 border-b border-gray-800 pb-6">
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setTaskNum(1)}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${taskNum === 1 ? 'bg-sky-500 border-sky-300 scale-125 shadow-glow' : 'bg-sky-900 border-sky-600 hover:bg-sky-500'}`}
            title="Task 1: Compare & Sort"
          />
          <button 
            onClick={() => maxTaskReached >= 2 && setTaskNum(2)}
            disabled={maxTaskReached < 2}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
              taskNum === 2 ? 'bg-sky-500 border-sky-300 scale-125 shadow-glow' : 
              maxTaskReached >= 2 ? 'bg-sky-900 border-sky-600 hover:bg-sky-500' : 
              'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50'
            }`}
            title={maxTaskReached >= 2 ? "Task 2: Final Area Problem" : "Complete Task 1 first"}
          />
        </div>
      </div>

      {taskNum === 1 ? (
        <div className="w-full animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl mb-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-slate-200 text-xl md:text-2xl font-bold">Compare the expressions. <strong className="text-white">Drag each pair into the correct box.</strong></p>
            </div>
            <button 
              onClick={checkSort}
              disabled={Object.keys(sortAssignments).length < PAIRS.length}
              className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-gray-600 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 uppercase tracking-tighter"
            >
              Check
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 min-h-[500px] shadow-inner">
              <div className="flex flex-col gap-3">
                {PAIRS.map(pair => (
                  (!sortAssignments[pair.id] || validation[pair.id] === 'incorrect') && 
                  <DraggablePair key={pair.id} pair={pair} validationStatus={validation[pair.id]} />
                ))}
              </div>
            </div>

            <DropBin 
              binType="equiv"
              label="Equivalent"
              colorClass="text-emerald-400"
              onDrop={(id) => handleDrop(id, 'equiv')}
              assignedPairs={PAIRS.filter(p => sortAssignments[p.id] === 'equiv')}
              validation={validation}
            />

            <DropBin 
              binType="not-equiv"
              label="Not Equivalent"
              colorClass="text-rose-400"
              onDrop={(id) => handleDrop(id, 'not-equiv')}
              assignedPairs={PAIRS.filter(p => sortAssignments[p.id] === 'not-equiv')}
              validation={validation}
            />
          </div>
        </div>
      ) : (
        <div className="w-full animate-fade-in flex flex-col items-center">
          <div className="bg-slate-900 border-l-4 border-emerald-500 p-6 rounded-r-2xl mb-12 w-full shadow-xl">
             <p className="text-slate-200 text-xl md:text-2xl font-bold">Which expression represents the area of this shape?</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16 w-full max-w-5xl">
            <div className="relative p-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
              <svg viewBox="0 0 400 400" className="w-full max-w-sm overflow-visible">
                <path 
                  d="M 50,50 L 250,50 L 250,150 L 150,150 L 150,300 L 50,300 Z" 
                  fill="#1e293b" 
                  stroke="#10b981" 
                  strokeWidth="4" 
                  strokeLinejoin="round"
                  className="animate-path"
                />
                <text x="150" y="40" textAnchor="middle" fill="#94a3b8" className="text-sm font-mono font-bold uppercase tracking-tight">4x</text>
                <text x="40" y="175" textAnchor="middle" fill="#94a3b8" className="text-sm font-mono font-bold uppercase tracking-tight" transform="rotate(-90 40 175)">5x</text>
                <text x="100" y="320" textAnchor="middle" fill="#94a3b8" className="text-sm font-mono font-bold uppercase tracking-tight">2x</text>
                <text x="260" y="100" textAnchor="middle" fill="#94a3b8" className="text-sm font-mono font-bold uppercase tracking-tight" transform="rotate(90 260 100)">2x</text>
              </svg>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 gap-4">
              {[
                { label: 'A', value: '14x²' },
                { label: 'B', value: '10x² + 2x' },
                { label: 'C', value: '12x²' },
                { label: 'D', value: '8x² + 4x' },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => handleGeoAnswer(opt.value)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center flex items-center justify-center group shadow-md active:scale-95 ${
                    feedback?.type === 'correct' && opt.value === '14x²'
                      ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 border-slate-800 hover:border-sky-500'
                  }`}
                >
                  <span className="text-2xl font-mono font-bold tracking-tight uppercase">{opt.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-[300] p-6 animate-fade-in">
          <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center text-white border-[12px] border-slate-800/50">
            {(() => {
              const stars = calculateStars();
              return (
                <>
                  <h2 className="text-sky-400 text-5xl font-black mb-4 italic tracking-tighter uppercase">
                    {stars === 1 ? "Good Effort!" : "Level Complete!"}
                  </h2>
                  <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3].map(i => <StarIcon key={i} className={`w-20 h-20 ${i <= stars ? "text-yellow-400" : "text-gray-700"}`} filled={i <= stars} />)}
                  </div>
                  {stars === 1 && (
                    <p className="text-slate-300 text-lg mb-6">
                      You completed the level, but made several mistakes. Try again to improve your score!
                    </p>
                  )}
                  {stars === 2 && (
                    <p className="text-slate-300 text-lg mb-6">
                      Great job! You made a couple of errors, but you can replay to get 3 stars.
                    </p>
                  )}
                  <div className="flex flex-col gap-4 mt-8">
                    {stars === 1 ? (
                      <>
                        <button onClick={() => { isCompletedRef.current = true; onComplete(stars); }} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">Save & Exit</button>
                        <button onClick={handleReplay} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">Replay</button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleReplay} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">Replay</button>
                        <button onClick={() => { isCompletedRef.current = true; onComplete(stars); if (onNext) { onNext(); } }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">{onNext ? 'Next Level' : 'Back to Map'}</button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {feedback && !isCompleted && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-12 py-5 rounded-[2rem] font-black text-2xl shadow-2xl z-[200] border-4 flex items-center gap-4 max-w-2xl ${
          feedback.type === 'correct' ? 'bg-emerald-500 border-emerald-300 uppercase italic tracking-tighter' : 'bg-rose-600 border-rose-400 animate-shake italic'
        }`}>
          {feedback.type === 'correct' ? '✨ Perfect!' : feedback.msg}
        </div>
      )}
    </div>
  );
};

export default PolynomialMasterLevel3;