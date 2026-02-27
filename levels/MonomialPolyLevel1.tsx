import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { LevelComponentProps } from '../types';

type CalculationBox = {
  id: string;
  label: string;
  targetCategory: string;
};

const CALC_BOXES: CalculationBox[] = [
  { id: 'c1', label: '3x · x² = 3x³', targetCategory: 'x2' },
  { id: 'c2', label: '3x · 1 = 3x', targetCategory: '1' },
  { id: 'c3', label: '3x · 2x = 6x²', targetCategory: '2x' },
];

const DraggableCalculation: React.FC<{ box: CalculationBox }> = ({ box }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'calculation',
    item: { id: box.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [box.id]);

  return (
    <div
      ref={(node) => { drag(node); }}
      className={`p-5 rounded-2xl border-4 transition-all font-mono text-2xl cursor-grab active:cursor-grabbing shadow-xl ${
        isDragging ? 'opacity-0' : 'bg-slate-700 border-slate-600 hover:border-slate-400'
      }`}
    >
      {box.label}
    </div>
  );
};

const AreaSection: React.FC<{ 
  category: string; 
  assignedBox: CalculationBox | undefined; 
  onDrop: (id: string) => void;
  color: string;
  textColor: string;
}> = ({ category, assignedBox, onDrop, color, textColor }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'calculation',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [onDrop]);

  return (
    <div
      ref={(node) => { drop(node); }}
      className={`w-48 h-72 ${color} border-r-4 border-slate-400 last:border-r-0 flex flex-col items-center justify-center p-6 transition-all ${
        isOver ? 'brightness-110 ring-8 ring-indigo-500 ring-inset shadow-2xl' : ''
      }`}
    >
      {assignedBox ? (
        <div className={`text-2xl font-black font-mono text-center ${textColor} animate-count-up`}>
          {assignedBox.label}
        </div>
      ) : (
        <div className="text-slate-700 font-black italic text-xs tracking-[0.2em] uppercase opacity-50">Drop Zone</div>
      )}
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

const MonomialPolyLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [taskNum, setTaskNum] = useState<1 | 2>(() => partialProgress?.taskNum || 1);
  const [maxTaskReached, setMaxTaskReached] = useState<number>(() => partialProgress?.maxTaskReached || 1);
  const [subPhase, setSubPhase] = useState<'sorting' | 'simplifying'>(() => partialProgress?.subPhase || 'sorting');
  
  const [assignments, setAssignments] = useState<Record<string, string>>(() => partialProgress?.assignments || {});
  const [finalInput, setFinalInput] = useState('');
  const [revealedSteps, setRevealedSteps] = useState<number[]>(() => partialProgress?.revealedSteps || []);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; msg?: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!isCompletedRef.current && onSavePartialProgress && !isCompleted) {
      onSavePartialProgress({ taskNum, subPhase, assignments, revealedSteps, maxTaskReached });
    }
  }, [taskNum, subPhase, assignments, revealedSteps, onSavePartialProgress, maxTaskReached, isCompleted]);

  const handleDrop = (boxId: string, category: string) => {
    setFeedback(null);
    const box = CALC_BOXES.find(b => b.id === boxId);
    if (box?.targetCategory === category) {
      const newAssignments = { ...assignments, [boxId]: category };
      setAssignments(newAssignments);
      if (Object.keys(newAssignments).length === CALC_BOXES.length) {
        setSubPhase('simplifying');
      }
    } else {
      setFeedback({ type: 'incorrect', msg: "Wait! Match the labels on top/side to find the right area." });
    }
  };

  const handleTask1Submit = () => {
    const normalized = finalInput.replace(/\s+/g, '').replace(/\^/g, '').toLowerCase();
    const correct = ['3x3+6x2+3x'];
    if (correct.includes(normalized)) {
      setFeedback({ type: 'correct' });
      setTimeout(() => {
        setTaskNum(2);
        setMaxTaskReached(2);
        setSubPhase('sorting');
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ type: 'incorrect', msg: "Combine the results from the three sections above!" });
    }
  };

  const handleRainbowStepClick = (index: number) => {
    if (revealedSteps.includes(index) || revealedSteps.length !== index) return;
    setRevealedSteps(prev => [...prev, index]);
    
    if (index === 2) {
      setTimeout(() => {
        setIsCompleted(true);
      }, 2000);
    }
  };

  const resetLevel = () => {
    setTaskNum(1);
    setMaxTaskReached(1);
    setSubPhase('sorting');
    setAssignments({});
    setFinalInput('');
    setRevealedSteps([]);
    setFeedback(null);
    setIsCompleted(false);
    onSavePartialProgress?.(null);
  };

  const unassignedItems = CALC_BOXES.filter(i => !assignments[i.id]);
  const isEveryItemAssigned = CALC_BOXES.every(i => !!assignments[i.id]);

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 pt-4 text-white font-sans max-w-7xl mx-auto overflow-x-hidden relative">
      <div className="w-full flex flex-col items-center mb-10 border-b border-gray-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-black text-sky-400 italic tracking-tighter uppercase text-center mb-4">
          Monomial x Poly
        </h1>
        
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setTaskNum(1)}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${taskNum === 1 ? 'bg-sky-500 border-sky-300 scale-125' : 'bg-sky-900 border-sky-600 hover:bg-sky-500'}`}
            title="Task 1: Area Model"
          />
          <button 
            onClick={() => setTaskNum(2)}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${taskNum === 2 ? 'bg-sky-500 border-sky-300 scale-125' : 'bg-sky-900 border-sky-600 hover:bg-sky-500'}`}
            title="Task 2: Rainbow Expansion"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-200 text-xl md:text-2xl font-bold text-center max-w-3xl mx-auto">
            {taskNum === 1 ? 'Expand using an area model representation' : 'Expand using the distributive property'}
          </p>
          <p className="text-4xl font-mono font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] mt-4">3x(x² + 2x + 1)</p>
        </div>
      </div>

      {taskNum === 1 ? (
        <div className="w-full animate-fade-in flex flex-col items-center">
          <div className="bg-slate-900 border-l-8 border-indigo-500 p-8 rounded-r-[2rem] mb-12 w-full shadow-2xl text-center md:text-left">
            <h2 className="text-2xl font-black mb-2 italic uppercase tracking-tight leading-tight">1. Find the area of each section by dragging and dropping calculation boxes.</h2>
            {subPhase === 'simplifying' && (
              <h2 className="text-3xl font-black mt-6 text-emerald-400 animate-fade-in italic uppercase tracking-tighter">2. Combine all three sections.</h2>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-20 items-center justify-center w-full">
            <div className="relative pt-16 pl-16 pr-6 pb-6 bg-slate-900/40 rounded-[2rem] border-2 border-slate-800 shadow-inner">
              <div className="absolute top-4 left-16 right-6 flex h-12 items-center text-4xl font-mono font-black text-indigo-400 italic">
                <div className="w-48 text-center">x²</div>
                <div className="w-48 text-center">2x</div>
                <div className="w-48 text-center">1</div>
              </div>
              <div className="absolute left-4 top-16 bottom-6 w-12 flex items-center justify-center text-4xl font-mono font-black text-indigo-400 italic">3x</div>
              <div className="flex border-8 border-slate-700 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                {['x2', '2x', '1'].map((cat, idx) => {
                  const colors = ['bg-sky-100/95', 'bg-amber-50/95', 'bg-rose-100/95'];
                  const textColors = ['text-sky-900', 'text-amber-900', 'text-rose-900'];
                  const assignedBox = CALC_BOXES.find(b => assignments[b.id] === cat);
                  return (
                    <AreaSection 
                      key={cat}
                      category={cat}
                      assignedBox={assignedBox}
                      onDrop={(id) => handleDrop(id, cat)}
                      color={colors[idx]}
                      textColor={textColors[idx]}
                    />
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/60 p-10 rounded-[3rem] border-4 border-slate-800 w-full lg:w-[350px] shadow-2xl">
              <h3 className="text-slate-500 font-black uppercase text-[10px] mb-8 text-center tracking-[0.4em]">Calculations Drawer</h3>
              <div className="flex flex-col gap-5">
                {CALC_BOXES.map(box => (
                  !Object.values(assignments).includes(box.targetCategory) && 
                  <DraggableCalculation key={box.id} box={box} />
                ))}
                {unassignedItems.length === 0 && subPhase !== 'simplifying' && (
                    <button onClick={() => setSubPhase('simplifying')} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl shadow-lg transition-all animate-pulse">START COMBINING</button>
                )}
                {isEveryItemAssigned && (
                    <button onClick={() => {setAssignments({}); setSubPhase('sorting'); setFinalInput('');}} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl border border-slate-700 text-xs uppercase tracking-widest mt-4">Reset Task</button>
                )}
              </div>
            </div>
          </div>

          {subPhase === 'simplifying' && (
            <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] border-4 border-emerald-500/50 w-full max-w-3xl shadow-2xl animate-fade-in-up flex flex-col items-center gap-8">
              <h3 className="text-4xl font-black text-center italic tracking-tighter uppercase text-emerald-400">Combine all three sections:</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
                <input 
                  type="text"
                  value={finalInput}
                  onChange={e => {
                    setFinalInput(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder="e.g., 3x^3 + 6x^2 + 3x"
                  className="bg-slate-950 border-4 border-slate-700 rounded-3xl px-10 py-6 text-4xl font-mono font-black focus:border-sky-500 outline-none w-full text-center shadow-inner"
                  autoFocus
                />
                <button
                  onClick={handleTask1Submit}
                  className="bg-emerald-600 hover:bg-emerald-500 px-16 py-6 rounded-[1.5rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-tighter active:scale-95"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full animate-fade-in flex flex-col items-center">
          <div className="bg-slate-900 border-l-8 border-amber-500 p-8 rounded-r-[2rem] mb-12 w-full shadow-2xl">
            <h2 className="text-3xl font-black italic tracking-tighter text-amber-400 uppercase">Rainbow Expansion</h2>
            <p className="text-slate-300 mt-3 text-xl italic font-medium leading-relaxed">Expand and simplify the expression. <strong className="text-white uppercase">Click each term</strong> inside the bracket to see the magic!</p>
          </div>

          <div className="relative w-full max-w-4xl py-48 px-12 bg-slate-900/50 rounded-[4rem] border-4 border-slate-800 shadow-[inset_0_4px_40px_rgba(0,0,0,0.5)]">
            <div className="text-8xl font-mono font-black text-center flex justify-center items-center gap-4 select-none tracking-tight">
              <span className="text-sky-400">3x</span>
              <span>(</span>
              <button 
                onClick={() => handleRainbowStepClick(0)}
                className={`transition-all duration-300 rounded-2xl px-3 hover:bg-white/5 ${revealedSteps.includes(0) ? 'text-rose-400' : revealedSteps.length === 0 ? 'bg-rose-500/20 animate-pulse ring-4 ring-rose-500/30' : ''}`}
              >
                x²
              </button>
              <span className="text-slate-700">+</span>
              <button 
                onClick={() => handleRainbowStepClick(1)}
                className={`transition-all duration-300 rounded-2xl px-3 hover:bg-white/5 ${revealedSteps.includes(1) ? 'text-orange-400' : revealedSteps.length === 1 ? 'bg-orange-500/20 animate-pulse ring-4 ring-orange-500/30' : ''}`}
              >
                2x
              </button>
              <span className="text-slate-700">+</span>
              <button 
                onClick={() => handleRainbowStepClick(2)}
                className={`transition-all duration-300 rounded-2xl px-3 hover:bg-white/5 ${revealedSteps.includes(2) ? 'text-amber-400' : revealedSteps.length === 2 ? 'bg-amber-500/20 animate-pulse ring-4 ring-amber-500/30' : ''}`}
              >
                1
              </button>
              <span>)</span>
            </div>

            <div className="mt-32 h-32 text-6xl font-mono font-black flex justify-center items-center gap-6">
              {revealedSteps.includes(0) && <span className="text-rose-400 animate-fade-in-up drop-shadow-lg">3x³</span>}
              {revealedSteps.includes(1) && (
                <>
                  <span className="text-slate-700 animate-fade-in font-bold">+</span>
                  <span className="text-orange-400 animate-fade-in-up drop-shadow-lg">6x²</span>
                </>
              )}
              {revealedSteps.includes(2) && (
                <>
                  <span className="text-slate-700 animate-fade-in font-bold">+</span>
                  <span className="text-amber-400 animate-fade-in-up drop-shadow-lg">3x</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[300] p-6 animate-fade-in">
          <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center text-white border-[12px] border-slate-800/50">
            <h2 className="text-5xl font-black mb-4 italic tracking-tighter text-sky-400 uppercase">Challenge complete!</h2>
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3].map(i => <StarIcon key={i} filled={true} />)}
            </div>
            <div className="flex flex-col gap-4 mt-8">
                <button onClick={resetLevel} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-[1.5rem] transition-all text-xl uppercase tracking-tighter shadow-sm">Replay</button>
                <button onClick={() => { isCompletedRef.current = true; onComplete(3); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl text-xl uppercase tracking-tighter">Back to Map</button>
            </div>
          </div>
        </div>
      )}

      {feedback && !isCompleted && (
        <div className={`fixed bottom-16 px-16 py-8 rounded-[2.5rem] font-black text-3xl shadow-2xl z-50 animate-fade-in border-[6px] ${
          feedback.type === 'correct' ? 'bg-emerald-600 border-emerald-400' : 'bg-rose-700 border-rose-500 animate-shake'
        }`}>
          {feedback.msg || (feedback.type === 'correct' ? '✨ Excellent Expansion!' : '')}
        </div>
      )}
    </div>
  );
};

export default MonomialPolyLevel1;