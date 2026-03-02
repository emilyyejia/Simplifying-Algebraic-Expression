import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { LevelComponentProps } from '../types';
import InstructionModal from '../components/InstructionModal';

type SortItem = {
  id: string;
  display: string;
  category: string;
};

const PHASE1_ITEMS: SortItem[] = [
  { id: 'p1-1', display: 'x + 3', category: 'Binomials' },
  { id: 'p1-2', display: '2x³y', category: 'Monomials' },
  { id: 'p1-3', display: 'x²', category: 'Monomials' },
  { id: 'p1-4', display: '4x - y', category: 'Binomials' },
  { id: 'p1-5', display: '3ab', category: 'Monomials' },
  { id: 'p1-6', display: '(x³)²', category: 'Monomials' },
];

const PHASE2_ITEMS: SortItem[] = [
  { id: 'p2-1', display: '7x', category: '1 Degree' },
  { id: 'p2-2', display: '3x²', category: '2 Degrees' },
  { id: 'p2-3', display: 'x³', category: '3 Degrees or More' },
  { id: 'p2-4', display: '-5x²', category: '2 Degrees' },
  { id: 'p2-5', display: '2x³', category: '3 Degrees or More' },
  { id: 'p2-6', display: 'xy', category: '2 Degrees' },
  { id: 'p2-7', display: '(a²)²', category: '3 Degrees or More' },
  { id: 'p2-8', display: 'b', category: '1 Degree' },
  { id: 'p2-9', display: '-3m²n', category: '3 Degrees or More' },
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

const DraggableItem: React.FC<{ item: SortItem; isIncorrect: boolean }> = ({ item, isIncorrect }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'expression',
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item.id]);

  return (
    <div
      ref={(node) => { drag(node); }}
      className={`px-8 py-5 rounded-2xl font-mono text-3xl border-2 transition-all transform cursor-grab active:cursor-grabbing shadow-lg ${
        isDragging ? 'opacity-0 scale-90' : 'hover:scale-105 opacity-100'
      } ${
        isIncorrect ? 'bg-rose-950 border-rose-500 animate-shake' : 'bg-gray-800 border-gray-700 hover:border-sky-500'
      }`}
    >
      {item.display}
    </div>
  );
};

const DropBin: React.FC<{ 
  category: string; 
  onDrop: (id: string) => void; 
  onRemove: (id: string) => void;
  assignedItems: SortItem[];
  feedback: Record<string, 'correct' | 'incorrect'>;
}> = ({ category, onDrop, onRemove, assignedItems, feedback }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'expression',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [onDrop]);

  return (
    <div
      ref={(node) => { drop(node); }}
      className={`p-8 rounded-[2rem] border-2 border-dashed transition-all flex flex-col min-h-[250px] relative overflow-hidden ${
        isOver ? 'bg-sky-500/10 border-sky-400 shadow-[inset_0_0_30px_rgba(56,189,248,0.2)]' : 'bg-gray-900 border-gray-800'
      }`}
    >
      <h4 className="text-sky-300 font-black uppercase text-sm tracking-widest mb-8">{category}</h4>
      <div className="flex flex-wrap gap-3">
        {assignedItems.map(item => (
          <button
            key={item.id}
            onClick={() => onRemove(item.id)}
            title="Click to remove"
            className={`px-5 py-3 rounded-xl font-mono text-2xl border-2 transition-all hover:scale-95 group relative ${
              feedback[item.id] === 'correct' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' :
              feedback[item.id] === 'incorrect' ? 'bg-rose-950 border-rose-500 text-rose-400 animate-shake' :
              'bg-indigo-950/30 border-indigo-700 text-indigo-200'
            }`}
          >
            {item.display}
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const PolynomialsLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress, onNext }) => {
  const [phase, setPhase] = useState<1 | 2>(() => partialProgress?.phase || 1);
  const [maxReachedPhase, setMaxReachedPhase] = useState<number>(() => partialProgress?.maxReachedPhase || 1);
  const [assignments, setAssignments] = useState<Record<string, string>>(() => partialProgress?.assignments || {});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [helpfulFeedback, setHelpfulFeedback] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isGameOver, setIsGameOver] = useState(false);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!isCompletedRef.current && onSavePartialProgress && !isGameOver) {
      onSavePartialProgress({ phase, assignments, errorCount, maxReachedPhase });
    }
  }, [phase, assignments, errorCount, onSavePartialProgress, isGameOver, maxReachedPhase]);

  const items = phase === 1 ? PHASE1_ITEMS : PHASE2_ITEMS;
  const categories = phase === 1 ? ['Monomials', 'Binomials'] : ['1 Degree', '2 Degrees', '3 Degrees or More'];

  const handleDrop = (itemId: string, category: string) => {
    setAssignments(prev => ({ ...prev, [itemId]: category }));
    const newFeedback = { ...feedback };
    delete newFeedback[itemId];
    setFeedback(newFeedback);
    setHelpfulFeedback(null);
  };

  const handleRemove = (itemId: string) => {
    setAssignments(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
    });
    setFeedback(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
    });
    setHelpfulFeedback(null);
  };

  const handleCheck = () => {
    const newFeedback: Record<string, 'correct' | 'incorrect'> = {};
    let allCorrect = true;
    let errorsThisCheck = 0;

    items.forEach(item => {
      const assigned = assignments[item.id];
      if (assigned === item.category) {
        newFeedback[item.id] = 'correct';
      } else {
        newFeedback[item.id] = 'incorrect';
        allCorrect = false;
        errorsThisCheck++;
      }
    });

    setFeedback(newFeedback);
    if (!allCorrect) {
      setErrorCount(prev => prev + errorsThisCheck);
      if (phase === 1) {
        setHelpfulFeedback("Try again! A monomial has only one term (there is no + or – sign). A binomial has two terms, and they are separated by a + or – sign.");
      } else if (phase === 2) {
        setHelpfulFeedback("Try again! To find the degree of a term, add the exponents on the variables. If a variable has no exponent, it has an exponent of 1.");
      }
    }

    if (allCorrect) {
      setHelpfulFeedback(null);
      setTimeout(() => {
        if (phase === 1) {
          setPhase(2);
          setMaxReachedPhase(2);
          setAssignments({});
          setFeedback({});
        } else {
          setIsGameOver(true);
        }
      }, 1500);
    }
  };

  const handleReplay = () => {
    setPhase(1);
    setMaxReachedPhase(1);
    setAssignments({});
    setFeedback({});
    setErrorCount(0);
    setIsGameOver(false);
    onSavePartialProgress?.(null);
  };

  const calculateStars = () => {
    if (errorCount <= 1) return 3;
    if (errorCount === 2) return 2;
    return 1;
  };

  const unassignedItems = items.filter(i => !assignments[i.id]);
  const isEveryItemAssigned = items.every(i => !!assignments[i.id]);

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-6 pt-4 text-white font-sans max-w-7xl mx-auto relative overflow-hidden">
      <div className="w-full flex flex-col items-center mb-10 border-b border-gray-800 pb-6">
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setPhase(1)}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${phase === 1 ? 'bg-sky-500 border-sky-300 scale-125' : 'bg-sky-900 border-sky-600 hover:bg-sky-500'}`}
            title="Phase 1: Sorting Polynomials"
          />
          <button 
            onClick={() => maxReachedPhase >= 2 && setPhase(2)}
            disabled={maxReachedPhase < 2}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
              phase === 2 ? 'bg-sky-500 border-sky-300 scale-125' : 
              maxReachedPhase >= 2 ? 'bg-sky-900 border-sky-600 hover:bg-sky-500' : 
              'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50'
            }`}
            title={maxReachedPhase >= 2 ? "Phase 2: Sorting Degrees" : "Complete Phase 1 first"}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-200 text-xl md:text-2xl font-bold text-center max-w-3xl mx-auto">
            Drag and drop the expressions into the correct boxes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
        <div className="bg-gray-900/50 p-6 rounded-[2.5rem] border border-gray-800 min-h-[400px] shadow-inner">
          <div className="flex flex-wrap gap-4 justify-center">
            {items.map(item => {
              const isAssigned = !!assignments[item.id];
              if (isAssigned) return null;
              return <DraggableItem key={item.id} item={item} isIncorrect={feedback[item.id] === 'incorrect'} />;
            })}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(cat => (
            <DropBin 
              key={cat} 
              category={cat} 
              onDrop={(id) => handleDrop(id, cat)} 
              onRemove={handleRemove}
              assignedItems={items.filter(i => assignments[i.id] === cat)} 
              feedback={feedback}
            />
          ))}
        </div>
      </div>

      <div className="w-full mt-12 flex flex-col items-center gap-6">
        {helpfulFeedback && (
          <div className="bg-indigo-900/50 border-l-4 border-indigo-400 p-6 rounded-r-xl max-w-2xl mx-auto animate-fade-in mb-6">
            <p className="text-indigo-200 text-lg italic font-medium">{helpfulFeedback}</p>
          </div>
        )}
        <div className="flex gap-6">
            <button
            onClick={handleCheck}
            disabled={!isEveryItemAssigned}
            className="px-16 py-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 rounded-[1.5rem] font-black text-2xl shadow-2xl transition-all transform active:scale-95 tracking-tighter"
            >
            Check
            </button>
        </div>
      </div>

      {isGameOver && (
        <div className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-[300] p-6 animate-fade-in">
          <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center text-white border-[12px] border-slate-800/50">
            {(() => {
              const stars = calculateStars();
              return (
                <>
                  <h2 className={`font-black mb-4 italic tracking-tighter uppercase ${stars === 1 ? 'text-emerald-400 text-4xl' : 'text-sky-400 text-5xl'}`}>
                    {stars === 1 ? "Good Effort!" : "Level Complete!"}
                  </h2>
                  {stars === 1 && <p className="text-lg text-white font-black mb-8 uppercase tracking-tight">You need 2 stars to unlock the next level.</p>}
                  <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3].map(i => <StarIcon key={i} className={`w-20 h-20 ${i <= stars ? "text-yellow-400" : "text-gray-700"}`} filled={i <= stars} />)}
                  </div>
                  {stars < 3 && <p className="text-sm text-slate-400 mb-10 font-black uppercase tracking-widest">Answer correctly on the first try to earn more stars!</p>}
                  <div className="flex flex-col gap-4 mt-8">
                    {stars === 1 && (
                      <>
                        <button onClick={() => { isCompletedRef.current = true; onComplete(stars); }} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">Save & Exit</button>
                        <button onClick={handleReplay} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-[1.5rem] transition-all text-xl uppercase tracking-tighter shadow-sm">Replay</button>
                      </>
                    )}
                    {stars === 2 && (
                      <>
                        <button onClick={handleReplay} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-[1.5rem] transition-all text-xl uppercase tracking-tighter shadow-sm">Replay</button>
                        <button onClick={() => { isCompletedRef.current = true; onComplete(stars); if (onNext) { onNext(); } }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">{onNext ? 'Next Level' : 'Back to Map'}</button>
                      </>
                    )}
                    {stars === 3 && (
                      <button onClick={() => { isCompletedRef.current = true; onComplete(stars); if (onNext) { onNext(); } }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">{onNext ? 'Next Level' : 'Back to Map'}</button>
                    )}
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

export default PolynomialsLevel1;