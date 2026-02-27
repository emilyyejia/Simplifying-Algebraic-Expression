import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { LevelComponentProps } from '../types';

type CalcBox = {
  id: string;
  label: string;
  row: string;
  col: string;
  result: string;
};

const CALC_DECK: CalcBox[] = [
  { id: 'b2', label: 'y · -y = -y²', row: 'y', col: '-y', result: '-y2' },
  { id: 'b4', label: '2 · -y = -2y', row: '2', col: '-y', result: '-2y' },
  { id: 'b1', label: 'y · y² = y³', row: 'y', col: 'y2', result: 'y3' },
  { id: 'b3', label: '2 · y² = 2y²', row: '2', col: 'y2', result: '2y2' },
];

const DraggableCalculation: React.FC<{ box: CalcBox }> = ({ box }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'binomialCalc',
    item: { id: box.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [box.id]);

  return (
    <div
      ref={(node) => { drag(node); }}
      className={`p-5 rounded-2xl border-4 transition-all font-mono text-2xl cursor-grab active:cursor-grabbing shadow-xl ${
        isDragging ? 'opacity-0 scale-90' : 'bg-slate-700 border-slate-600 hover:border-slate-400'
      }`}
    >
      {box.label}
    </div>
  );
};

const GridSection: React.FC<{ 
  row: string; 
  col: string; 
  assignedBox: CalcBox | undefined; 
  onDrop: (id: string) => void;
  bg: string;
}> = ({ row, col, assignedBox, onDrop, bg }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'binomialCalc',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [onDrop]);

  return (
    <div
      ref={(node) => { drop(node); }}
      className={`w-48 h-48 ${bg} border-2 border-slate-400 flex items-center justify-center p-4 cursor-pointer transition-all ${
        isOver ? 'brightness-110 ring-8 ring-pink-500 ring-inset shadow-2xl' : ''
      }`}
    >
      {assignedBox ? (
        <span className="text-slate-900 font-black font-mono text-3xl text-center animate-count-up">{assignedBox.label}</span>
      ) : (
        <div className="text-slate-600 font-black italic text-xs uppercase tracking-widest opacity-40">Drop Box</div>
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

const BinomialBinomialLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [taskNum, setTaskNum] = useState<1 | 2>(() => partialProgress?.taskNum || 1);
  const [maxTaskReached, setMaxTaskReached] = useState<number>(() => partialProgress?.maxTaskReached || 1);
  const [subPhase, setSubPhase] = useState<'sorting' | 'simplifying'>(() => partialProgress?.subPhase || 'sorting');
  
  const [gridAssignments, setGridAssignments] = useState<Record<string, string>>(() => partialProgress?.gridAssignments || {});
  const [t1Input, setT1Input] = useState('');
  const [rainbowAnswers, setRainbowAnswers] = useState<Record<number, string>>({});
  const [rainbowError, setRainbowError] = useState<number | null>(null);
  const [currentRainbowStep, setCurrentRainbowStep] = useState(0); 
  const [t2Input, setT2Input] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; msg?: string } | null>(null);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!isCompletedRef.current && onSavePartialProgress && !isCompleted) {
      onSavePartialProgress({ taskNum, subPhase, gridAssignments, currentRainbowStep, maxTaskReached });
    }
  }, [taskNum, subPhase, gridAssignments, currentRainbowStep, onSavePartialProgress, maxTaskReached, isCompleted]);

  const handleDrop = (boxId: string, row: string, col: string) => {
    const box = CALC_DECK.find(b => b.id === boxId);
    if (box?.row === row && box?.col === col) {
      const newAssignments = { ...gridAssignments, [`${row}-${col}`]: boxId };
      setGridAssignments(newAssignments);
      if (Object.keys(newAssignments).length === CALC_DECK.length) {
        setSubPhase('simplifying');
      }
    } else {
      setFeedback({ type: 'incorrect', msg: "Check the labels! Multiply the side by the top." });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const normalizeExponents = (str: string) => str.replace(/\s+/g, '').replace(/\^/g, '').toLowerCase();

  const handleSimplifySubmit = (input: string, correctArr: string[]) => {
    const normalized = normalizeExponents(input);
    if (correctArr.some(c => normalizeExponents(c) === normalized)) {
      setFeedback({ type: 'correct' });
      setTimeout(() => {
        setFeedback(null);
        if (taskNum === 1) {
          setTaskNum(2);
          setMaxTaskReached(2);
          setSubPhase('sorting');
          setCurrentRainbowStep(0);
        } else {
          setIsCompleted(true);
        }
      }, 1500);
    } else {
      setFeedback({ type: 'incorrect', msg: "Combine like terms by degree. Example: −y² and 2y²." });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleRainbowInputSubmit = (idx: number) => {
    const val = normalizeExponents(rainbowAnswers[idx] || '');
    const correctVals = ['y3', '-y2', '2y2', '-2y'].map(normalizeExponents);
    if (val === correctVals[idx]) {
        setRainbowError(null);
        if (idx === 3) {
            setCurrentRainbowStep(4); // Move past last visual step
            setSubPhase('simplifying');
        } else {
            setCurrentRainbowStep(idx + 1);
        }
    } else {
        setRainbowError(idx);
        setFeedback({ type: 'incorrect', msg: "Check your multiplication!" });
        setTimeout(() => {
            setFeedback(null);
            setRainbowError(null);
        }, 2000);
    }
  };

  const resetLevel = () => {
    setTaskNum(1);
    setMaxTaskReached(1);
    setSubPhase('sorting');
    setGridAssignments({});
    setT1Input('');
    setRainbowAnswers({});
    setCurrentRainbowStep(0);
    setT2Input('');
    setFeedback(null);
    setIsCompleted(false);
    onSavePartialProgress?.(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 pt-4 text-white font-sans max-w-7xl mx-auto overflow-x-hidden overflow-y-auto relative">
      <div className="w-full flex flex-col items-center mb-10 border-b border-gray-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-black text-sky-400 italic tracking-tighter uppercase text-center mb-4">
          Binomial x Binomial
        </h1>
        
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setTaskNum(1)}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${taskNum === 1 ? 'bg-sky-500 border-sky-300 scale-125' : 'bg-sky-900 border-sky-600 hover:bg-sky-500'}`}
            title="Task 1: Grid Expansion"
          />
          <button 
            onClick={() => setTaskNum(2)}
            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${taskNum === 2 ? 'bg-sky-500 border-sky-300 scale-125' : 'bg-sky-900 border-sky-600 hover:bg-sky-500'}`}
            title="Task 2: FOIL Method"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest text-center">
            {taskNum === 1 ? 'Use an area grid for binomial multiplication' : 'Expand each term systematically'}
          </p>
          <p className="text-3xl font-mono font-black text-white drop-shadow-xl">(y + 2)(y² - y)</p>
        </div>
      </div>

      {taskNum === 1 ? (
        <div className="w-full animate-fade-in flex flex-col items-center">
          <div className="bg-slate-900 border-l-[12px] border-pink-500 p-8 rounded-r-3xl mb-12 w-full shadow-2xl text-center md:text-left">
            <h2 className="text-2xl font-black mb-2 italic uppercase tracking-tighter">1. Find the area of each section by dragging calculation boxes.</h2>
            {subPhase === 'simplifying' && (
              <h2 className="text-3xl font-black mt-6 text-emerald-400 animate-fade-in italic uppercase tracking-tighter">2. Combine all sections. <strong className="text-white">Simplify your answer.</strong></h2>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-20 items-center justify-center w-full">
             <div className="relative pt-16 pl-16 pr-6 pb-6 bg-slate-900/40 rounded-[2.5rem] border-2 border-slate-800 shadow-inner">
                <div className="absolute top-4 left-16 right-6 flex h-12 items-center font-mono text-4xl font-black text-indigo-400 italic">
                  <div className="w-48 text-center">y²</div>
                  <div className="w-48 text-center">-y</div>
                </div>
                <div className="absolute left-4 top-16 bottom-6 w-12 flex flex-col font-mono text-4xl font-black text-indigo-400 italic">
                  <div className="h-48 flex items-center justify-center">y</div>
                  <div className="h-48 flex items-center justify-center">2</div>
                </div>
                <div className="grid grid-cols-2 grid-rows-2 border-8 border-slate-700 rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                  {[['y', 'y2', 'bg-purple-100/95'], ['y', '-y', 'bg-orange-100/95'], ['2', 'y2', 'bg-emerald-100/95'], ['2', '-y', 'bg-slate-200/95']].map(([r, c, bg]) => {
                    const boxId = gridAssignments[`${r}-${c}`];
                    const box = CALC_DECK.find(b => b.id === boxId);
                    return (
                      <GridSection 
                        key={`${r}-${c}`}
                        row={r}
                        col={c}
                        assignedBox={box}
                        onDrop={(id) => handleDrop(id, r, c)}
                        bg={bg}
                      />
                    );
                  })}
                </div>
             </div>

             <div className="bg-slate-900/60 p-10 rounded-[3rem] border-4 border-slate-800 w-full lg:w-[380px] shadow-2xl">
                <h3 className="text-slate-500 font-black uppercase text-[10px] mb-8 text-center tracking-[0.4em]">Multiplication Tiles</h3>
                <div className="flex flex-col gap-5">
                  {CALC_DECK.map(box => {
                    const isAssigned = Object.values(gridAssignments).includes(box.id);
                    if (isAssigned) return null;
                    return <DraggableCalculation key={box.id} box={box} />;
                  })}
                  {Object.keys(gridAssignments).length === CALC_DECK.length && (
                      <button onClick={() => {setGridAssignments({}); setSubPhase('sorting'); setT1Input('');}} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl border border-slate-700 text-xs uppercase tracking-widest mt-4">Reset Task</button>
                  )}
                </div>
             </div>
          </div>

          {subPhase === 'simplifying' && (
            <div className="mt-20 p-12 bg-slate-900 rounded-[3.5rem] border-[6px] border-emerald-500/50 w-full max-w-3xl shadow-2xl animate-fade-in-up flex flex-col items-center gap-10">
              <h3 className="text-4xl font-black text-center italic tracking-tighter uppercase text-emerald-400">Combine all sections. Simplify your answer.</h3>
              <div className="flex flex-col sm:flex-row gap-8 items-center justify-center w-full px-6">
                <input 
                  type="text"
                  value={t1Input}
                  onChange={e => setT1Input(e.target.value)}
                  placeholder="e.g., y^3 + y^2 - 2y"
                  className="bg-slate-950 border-4 border-slate-700 rounded-[2rem] px-12 py-8 text-5xl font-mono font-black focus:border-sky-500 outline-none w-full text-center shadow-inner"
                  autoFocus
                />
                <button
                  onClick={() => handleSimplifySubmit(t1Input, ['y3+y2-2y'])}
                  className="bg-emerald-600 hover:bg-emerald-500 px-20 py-8 rounded-[1.5rem] font-black text-3xl transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] uppercase tracking-tighter active:scale-95"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full animate-fade-in flex flex-col items-center">
          <div className="relative w-full max-w-5xl py-24 px-16 bg-slate-900/40 rounded-[3rem] border-4 border-slate-800 shadow-2xl flex flex-col items-center mb-8">
            
            <div className="text-7xl font-mono font-black text-center flex justify-center items-center gap-4 select-none tracking-tighter mb-16 relative z-20">
              <span>(</span>
              <span className={currentRainbowStep <= 1 ? 'text-white' : 'text-slate-600'}>y</span>
              <span className="text-slate-700">+</span>
              <span className={currentRainbowStep >= 2 ? 'text-white' : 'text-slate-600'}>2</span>
              <span>)</span>
              <span>(</span>
              <span className={currentRainbowStep === 0 || currentRainbowStep === 2 ? 'text-white' : 'text-slate-600'}>y²</span>
              <span className="text-slate-700">-</span>
              <span className={currentRainbowStep === 1 || currentRainbowStep === 3 ? 'text-white' : 'text-slate-600'}>y</span>
              <span>)</span>
            </div>

            <div className="flex justify-center items-center gap-6 z-20">
                {[0, 1, 2, 3].map(idx => (
                    <div key={idx} className={`flex flex-col items-center gap-2 transition-all ${currentRainbowStep < idx ? 'opacity-0 scale-50 pointer-events-none' : 'animate-fade-in-up'}`}>
                        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-center">
                           {idx === 0 ? <span className="text-rose-400">y · y²</span> : 
                            idx === 1 ? <span className="text-orange-400">y · -y</span> : 
                            idx === 2 ? <span className="text-amber-400">2 · y²</span> : 
                            <span className="text-emerald-400">2 · -y</span>}
                        </div>
                        <input
                            type="text"
                            className={`w-28 py-4 text-center font-mono font-black text-2xl rounded-xl border-4 transition-all shadow-xl ${
                                idx === 0 ? 'bg-rose-950 border-rose-500 text-rose-300' :
                                idx === 1 ? 'bg-orange-950 border-orange-500 text-orange-300' :
                                idx === 2 ? 'bg-amber-950 border-amber-500 text-amber-300' :
                                'bg-emerald-950 border-emerald-500 text-emerald-300'
                            } ${currentRainbowStep > idx ? 'opacity-50 grayscale' : 'ring-4 ring-white/10'} ${rainbowError === idx ? 'border-rose-500 animate-shake' : ''}`}
                            placeholder="?"
                            value={rainbowAnswers[idx] || ''}
                            onChange={e => setRainbowAnswers(prev => ({...prev, [idx]: e.target.value}))}
                            disabled={currentRainbowStep !== idx}
                            onKeyDown={e => e.key === 'Enter' && handleRainbowInputSubmit(idx)}
                            autoFocus={currentRainbowStep === idx}
                        />
                        {currentRainbowStep === idx && (
                            <button onClick={() => handleRainbowInputSubmit(idx)} className="bg-white/10 hover:bg-white/20 text-white font-black py-1 px-4 rounded-lg uppercase text-[10px] tracking-widest">Verify</button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-16 text-4xl font-mono font-black flex justify-center items-center gap-3">
              <span className={currentRainbowStep > 0 ? "text-rose-400" : "opacity-0"}>{rainbowAnswers[0] || 'y³'}</span>
              <span className={currentRainbowStep > 1 ? "text-slate-600" : "opacity-0"}> - </span>
              <span className={currentRainbowStep > 1 ? "text-orange-400" : "opacity-0"}>{rainbowAnswers[1]?.replace('-', '') || 'y²'}</span>
              <span className={currentRainbowStep > 2 ? "text-slate-600" : "opacity-0"}> + </span>
              <span className={currentRainbowStep > 2 ? "text-amber-400" : "opacity-0"}>{rainbowAnswers[2] || '2y²'}</span>
              <span className={currentRainbowStep >= 4 ? "text-slate-600" : "opacity-0"}> - </span>
              <span className={currentRainbowStep >= 4 ? "text-emerald-400" : "opacity-0"}>{rainbowAnswers[3]?.replace('-', '') || '2y'}</span>
            </div>
          </div>

          {subPhase === 'simplifying' && (
             <div className="mt-8 p-10 bg-slate-900 rounded-[2rem] border-[6px] border-sky-500/50 w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col items-center gap-6">
               <h3 className="text-3xl font-black text-center italic tracking-tighter uppercase text-sky-400">Simplify the full expression:</h3>
               <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full px-6">
                 <input 
                   type="text"
                   value={t2Input}
                   onChange={e => setT2Input(e.target.value)}
                   placeholder="Combine like terms..."
                   className="bg-slate-950 border-4 border-slate-700 rounded-2xl px-10 py-6 text-4xl font-mono font-black focus:border-sky-500 outline-none w-full text-center shadow-inner"
                   autoFocus
                 />
                 <button
                   onClick={() => handleSimplifySubmit(t2Input, ['y3+y2-2y'])}
                   className="bg-sky-600 hover:bg-sky-500 px-16 py-6 rounded-2xl font-black text-2xl transition-all shadow-2xl uppercase tracking-tighter active:scale-95"
                 >
                   Simplify
                 </button>
               </div>
             </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[300] p-6 animate-fade-in">
          <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center text-white border-[12px] border-slate-800/50">
            <h2 className="text-6xl font-black mb-4 italic tracking-tighter text-sky-400 uppercase">Mastery achieved!</h2>
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
        <div className={`fixed bottom-16 px-12 py-6 rounded-full font-black text-xl shadow-2xl z-50 animate-fade-in border-4 flex items-center gap-4 ${
          feedback.type === 'correct' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-rose-700 border-rose-500 text-white animate-shake'
        }`}>
          {feedback.type === 'correct' ? '✨' : '❌'} {feedback.msg || (feedback.type === 'correct' ? 'Brilliant Expansion!' : '')}
        </div>
      )}
    </div>
  );
};

export default BinomialBinomialLevel2;