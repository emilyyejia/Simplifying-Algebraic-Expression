import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';

type SubTask = 1 | 2 | 3;

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

const TermCollectorLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress, onNext }) => {
  const [subTask, setSubTask] = useState<SubTask>(() => partialProgress?.subTask || 1);
  const [maxSubTask, setMaxSubTask] = useState<SubTask>(() => partialProgress?.maxSubTask || 1);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; msg?: string } | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Task 1 State
  const [t1Answers, setT1Answers] = useState(['', '', '']);
  const [t1Complete, setT1Complete] = useState([false, false, false]);
  const [t1Hints, setT1Hints] = useState(['', '', '']);
  const [t1Errors, setT1Errors] = useState([false, false, false]);

  // Task 2 State
  const [t2Step, setT2Step] = useState(() => partialProgress?.t2Step || 1); 
  const [t2Jan, setT2Jan] = useState(() => partialProgress?.t2Jan || '');
  const [t2Sum, setT2Sum] = useState(() => partialProgress?.t2Sum || ['', '', '']);
  const [t2Simplified, setT2Simplified] = useState(() => partialProgress?.t2Simplified || '');
  const [t2Blocks, setT2Blocks] = useState<{jan: number, feb: number, mar: number}>(() => partialProgress?.t2Blocks || {jan: 0, feb: 0, mar: 0});
  const [isVisualizationConfirmed, setIsVisualizationConfirmed] = useState(() => partialProgress?.isVisualizationConfirmed || false);

  // Task 3 State
  const [t3Answer, setT3Answer] = useState(() => partialProgress?.t3Answer || '');

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress && !isGameOver) {
        onSavePartialProgress({ 
          subTask, 
          maxSubTask,
          t1Answers,
          t1Complete,
          t2Step,
          t2Jan,
          t2Sum,
          t2Simplified,
          t2Blocks,
          isVisualizationConfirmed,
          t3Answer
        });
      }
    };
  }, [onSavePartialProgress, subTask, maxSubTask, isGameOver]);

  const normalizeInput = (input: string) => input.replace(/\s+/g, '').replace(/\^/g, '').toLowerCase();

  const handleCorrect = (nextTask?: SubTask) => {
    setFeedback({ type: 'correct', msg: 'Excellent job!' });
    setTimeout(() => {
      setFeedback(null);
      if (nextTask) {
        setSubTask(nextTask);
        if (nextTask > maxSubTask) setMaxSubTask(nextTask);
      }
      else {
        setIsGameOver(true);
      }
    }, 1500);
  };

  const handleIncorrect = (msg: string) => {
    setErrorCount(prev => prev + 1);
    setFeedback({ type: 'incorrect', msg });
  };

  const validateT1 = (index: number) => {
    const rawInput = t1Answers[index].replace(/\s+/g, '').toLowerCase();
    const val = rawInput.replace(/\^/g, '');
    const solutions = [
      ['7x+5', '5+7x'],
      ['5x2+2y-5', '2y+5x2-5'],
      ['2y3+4x', '4x+2y3']
    ];
    
    if (solutions[index].includes(val)) {
      const newComplete = [...t1Complete];
      newComplete[index] = true;
      setT1Complete(newComplete);
      
      const newHints = [...t1Hints];
      newHints[index] = '';
      setT1Hints(newHints);

      const newErrors = [...t1Errors];
      newErrors[index] = false;
      setT1Errors(newErrors);

      if (newComplete.every(v => v)) {
        handleCorrect(2);
      } else {
        setFeedback({ type: 'correct', msg: 'Correct!' });
        setTimeout(() => setFeedback(null), 1500);
      }
    } else {
      let hint = "Find the like terms! Combine numbers with numbers and variables with variables.";
      const newErrors = [...t1Errors];
      newErrors[index] = true;
      setT1Errors(newErrors);

      if (index === 0) { // 4x + 7 + 3x - 2
        if (val.includes('7x')) hint = "Your x terms are perfect! Check your subtraction: 7 - 2 = ?";
        else if (val.includes('5') && !val.includes('x5')) hint = "The constant is correct! Check your addition: 4x + 3x = ?";
      } else if (index === 1) { // 3x² + 2y + 2x² - 5
        if (rawInput.includes('x4')) hint = "Remember: when adding like terms, we add the coefficients, not the exponents!";
        else if (val.includes('5x2')) hint = "Your x² terms are perfect! Check the y and constant terms.";
      } else if (index === 2) { // y³ + 5x - x + y³
        if (rawInput.includes('y6')) hint = "Remember: when adding like terms, we add the coefficients, not the exponents!";
        else if (val.includes('2y3')) hint = "Your y³ terms are perfect! Take another look at the x terms.";
        else if (val.includes('4x')) hint = "Your x terms are perfect! Take another look at the y³ terms.";
      }

      const newHints = [...t1Hints];
      newHints[index] = hint;
      setT1Hints(newHints);
      setErrorCount(prev => prev + 1);
    }
  };

  const validateVisualization = () => {
    if (t2Blocks.jan === 2 && t2Blocks.feb === 2 && t2Blocks.mar === 2) {
        setIsVisualizationConfirmed(true);
        setFeedback({ type: 'correct', msg: 'Perfect visualization!' });
        setTimeout(() => setFeedback(null), 1500);
    } else {
        handleIncorrect("The program costs 2y each month. Each 'y' tile represents 1y.");
    }
  };

  const validateT2 = () => {
    if (t2Step === 1) {
      if (normalizeInput(t2Jan) === '2y') setT2Step(2);
      else handleIncorrect("How many y tiles do you have in total for January?");
    } else if (t2Step === 2) {
      const sum = t2Sum.map(s => normalizeInput(s));
      if (sum.every(v => v === '2y')) setT2Step(3);
      else handleIncorrect("The fee is 2y for EACH month.");
    } else {
      if (normalizeInput(t2Simplified) === '6y') handleCorrect(3);
      else handleIncorrect("Combine them! 2y + 2y + 2y = ?");
    }
  };

  const validateT3 = () => {
    const val = normalizeInput(t3Answer);
    if (val === '6t3') {
      handleCorrect();
    } else {
      handleIncorrect("Perimeter is the sum of all sides. Add up the t³ terms and the numbers separately!");
    }
  };

  const handleReplay = () => {
    setSubTask(1);
    setMaxSubTask(1);
    setT1Answers(['', '', '']);
    setT1Complete([false, false, false]);
    setT1Hints(['', '', '']);
    setT1Errors([false, false, false]);
    setT2Step(1);
    setT2Jan('');
    setT2Sum(['', '', '']);
    setT2Simplified('');
    setT2Blocks({jan: 0, feb: 0, mar: 0});
    setIsVisualizationConfirmed(false);
    setT3Answer('');
    setErrorCount(0);
    setIsGameOver(false);
  };

  const calculateStars = () => {
    if (errorCount === 0) return 3;
    if (errorCount <= 4) return 2;
    return 1;
  };

  const removeBlock = (month: 'jan' | 'feb' | 'mar') => {
    if (isVisualizationConfirmed) return;
    setT2Blocks(prev => ({ ...prev, [month]: Math.max(0, prev[month] - 1) }));
    setFeedback(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-6 pt-4 text-white font-sans max-w-7xl mx-auto relative overflow-hidden">
      <div className="w-full flex flex-col items-center mb-10 border-b border-gray-800 pb-6">
        <div className="flex justify-center gap-4 mb-2">
          {([1, 2, 3] as SubTask[]).map(i => (
            <button 
              key={i} 
              onClick={() => i <= maxSubTask && setSubTask(i)}
              disabled={i > maxSubTask}
              className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  subTask === i ? 'bg-sky-500 border-sky-300 scale-125 shadow-glow' : 
                  i <= maxSubTask ? 'bg-sky-900 border-sky-600 hover:bg-sky-500' :
                  'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50'
              }`}
              title={i <= maxSubTask ? `Go to Task ${i}` : `Complete Task ${i - 1} first`}
            />
          ))}
        </div>
      </div>

      {feedback && !isGameOver && subTask !== 1 && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-12 py-5 rounded-[2rem] font-black text-2xl shadow-2xl z-[200] animate-fade-in border-4 max-w-2xl text-center ${
          feedback.type === 'correct' ? 'bg-emerald-600 border-emerald-400' : 'bg-rose-700 border-rose-500 animate-shake'
        }`}>
          {feedback.msg}
        </div>
      )}

      <div className="w-full max-w-6xl bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-800">
        
        {subTask === 1 && (
          <div className="animate-fade-in">
            <p className="text-slate-200 text-xl md:text-2xl font-bold mb-10 text-center">Combine like terms to simplify the expressions. (Use ^ for exponents like <span className="font-mono text-white">x^2</span>)</p>
            
            <div className="space-y-6">
              {[
                { exp: '4x + 7 + 3x - 2' },
                { exp: '3x² + 2y + 2x² - 5' },
                { exp: 'y³ + 5x - x + y³' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className={`flex flex-col sm:flex-row items-center gap-8 p-6 rounded-[1.5rem] border-2 transition-all ${
                    t1Complete[idx] ? 'bg-emerald-900/20 border-emerald-500/50' : 
                    t1Errors[idx] ? 'bg-rose-900/20 border-rose-500' :
                    'bg-slate-900/40 border-slate-700'
                  }`}>
                    <span className="text-4xl font-mono flex-grow font-bold">{item.exp} =</span>
                    <div className="flex gap-4 w-full sm:w-auto">
                      <input 
                        type="text"
                        className={`flex-grow sm:w-64 bg-slate-800 border-4 rounded-2xl px-6 py-4 text-3xl font-mono focus:border-sky-500 outline-none transition-all ${
                          t1Complete[idx] ? 'text-emerald-400 border-emerald-500' : 
                          t1Errors[idx] ? 'text-rose-400 border-rose-500' :
                          'border-slate-600'
                        }`}
                        placeholder="Answer..."
                        value={t1Answers[idx]}
                        onChange={e => {
                          const newAns = [...t1Answers];
                          newAns[idx] = e.target.value;
                          setT1Answers(newAns);
                          
                          const newErrors = [...t1Errors];
                          newErrors[idx] = false;
                          setT1Errors(newErrors);

                          const newHints = [...t1Hints];
                          newHints[idx] = '';
                          setT1Hints(newHints);

                          setFeedback(null);
                        }}
                        disabled={t1Complete[idx]}
                      />
                      {!t1Complete[idx] && <button onClick={() => validateT1(idx)} className="bg-sky-600 hover:bg-sky-500 px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-tighter shadow-lg">Check</button>}
                    </div>
                  </div>
                  {t1Hints[idx] && (
                    <div className="px-8 py-3 bg-rose-900/40 border-l-4 border-rose-500 rounded-lg text-rose-100 italic font-medium animate-fade-in">
                      {t1Hints[idx]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {subTask === 2 && (
          <div className="animate-fade-in">
            <div className="bg-slate-900/60 p-8 rounded-[2rem] mb-10 border border-slate-700 shadow-inner">
              <p className="text-3xl text-slate-300 leading-relaxed italic font-medium">
                An after-school program costs <span className="text-white font-black font-serif italic text-4xl">2y</span> dollars per month. 
                What is the total cost for January, February, and March?
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8 min-h-[400px]">
                {!isVisualizationConfirmed ? (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-900/40 rounded-[2rem] p-10 border-4 border-dashed border-slate-700/50 opacity-60">
                        <span className="text-7xl mb-6">🔒</span>
                        <p className="text-center font-black text-slate-400 text-xl tracking-tight uppercase">Complete the "Visualize It" section to unlock the algebraic questions!</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className={t2Step > 1 ? 'opacity-50' : ''}>
                        <label className="block text-slate-400 mb-2 text-lg font-bold uppercase tracking-widest">Write an algebraic expression for January:</label>
                        <div className="flex gap-4">
                            <input type="text" value={t2Jan} onChange={e => { setT2Jan(e.target.value); setFeedback(null); }} disabled={t2Step > 1} className="bg-slate-950 border-4 border-slate-700 rounded-2xl px-6 py-4 w-full text-3xl font-mono focus:border-sky-500 outline-none shadow-xl" />
                            {t2Step === 1 && <button onClick={validateT2} className="bg-sky-600 hover:bg-sky-500 px-10 py-4 rounded-2xl font-black text-xl uppercase tracking-tighter shadow-xl transition-all active:scale-95">Check</button>}
                        </div>
                        </div>

                        {t2Step >= 2 && (
                        <div className={t2Step > 2 ? 'opacity-50' : ''}>
                            <label className="block text-slate-400 mb-2 text-lg font-bold uppercase tracking-widest">Total cost for the three months:</label>
                            <div className="flex items-center gap-4">
                            {[0, 1, 2].map(i => (
                                <React.Fragment key={i}>
                                <input type="text" value={t2Sum[i]} onChange={e => { const ns = [...t2Sum]; ns[i] = e.target.value; setT2Sum(ns); setFeedback(null); }} disabled={t2Step > 2} className="bg-slate-950 border-4 border-slate-700 rounded-2xl px-2 py-4 w-24 text-center text-3xl font-mono focus:border-sky-500 outline-none shadow-xl" />
                                {i < 2 && <span className="text-3xl font-black text-white">+</span>}
                                </React.Fragment>
                            ))}
                            {t2Step === 2 && <button onClick={validateT2} className="bg-sky-600 hover:bg-sky-500 px-6 py-4 rounded-2xl font-black ml-4 text-xl uppercase tracking-tighter shadow-xl transition-all active:scale-95">Check</button>}
                            </div>
                        </div>
                        )}

                        {t2Step >= 3 && (
                        <div className="animate-fade-in-up">
                            <label className="block text-slate-400 mb-2 text-lg font-bold uppercase tracking-widest">Simplify the total expression:</label>
                            <div className="flex gap-4">
                            <input type="text" value={t2Simplified} onChange={e => { setT2Simplified(e.target.value); setFeedback(null); }} className="bg-slate-950 border-4 border-slate-700 rounded-2xl px-6 py-4 w-full text-3xl font-mono focus:border-sky-500 outline-none shadow-xl" />
                            <button onClick={validateT2} className="bg-emerald-600 hover:bg-emerald-500 px-10 py-4 rounded-2xl font-black text-xl uppercase tracking-tighter shadow-xl transition-all active:scale-95">Check</button>
                            </div>
                        </div>
                        )}
                    </div>
                )}
              </div>

              <div className="bg-slate-900/60 rounded-[2.5rem] p-10 border-4 border-indigo-500/30 flex flex-col items-center shadow-inner">
                <h4 className="font-black text-indigo-300 mb-4 uppercase tracking-[0.3em] text-sm">Visualize it</h4>
                <p className="text-center text-lg text-slate-400 mb-10 italic leading-relaxed">
                    Use <span className="text-white font-black italic font-serif">y</span> tiles to show how much the after-school program costs each month in total.
                </p>
                <div className="flex gap-10 mb-8">
                  {(['jan', 'feb', 'mar'] as const).map(m => (
                    <div key={m} className="flex flex-col items-center gap-4">
                      <div className="w-24 h-48 bg-slate-950 rounded-2xl border-4 border-slate-800 flex flex-col-reverse p-3 overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                        {Array.from({length: t2Blocks[m]}).map((_, i) => (
                            <div 
                                key={i} 
                                className="h-10 w-full bg-indigo-600 border-2 border-indigo-400 rounded-lg mb-2 flex items-center justify-center text-2xl font-serif italic font-black animate-fade-in-up shadow-md transition-all relative group"
                            >
                                <span>y</span>
                                {!isVisualizationConfirmed && (
                                  <button 
                                    onClick={() => removeBlock(m)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-sans text-white border border-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ✕
                                  </button>
                                )}
                            </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setT2Blocks({...t2Blocks, [m]: t2Blocks[m] + 1}); setFeedback(null); }} 
                        disabled={isVisualizationConfirmed}
                        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs py-3 px-6 rounded-xl font-black text-slate-200 uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                      >
                        Add y
                      </button>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-[0.4em] mt-2">
                        {m === 'jan' ? 'Jan' : m === 'feb' ? 'Feb' : 'Mar'}
                      </span>
                    </div>
                  ))}
                </div>
                {!isVisualizationConfirmed && (
                    <button 
                        onClick={validateVisualization}
                        className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-2xl active:scale-95 border-b-4 border-indigo-800"
                    >
                        Check
                    </button>
                )}
              </div>
            </div>
          </div>
        )}

        {subTask === 3 && (
          <div className="animate-fade-in flex flex-col items-center">
            <p className="text-slate-300 mb-12 self-start text-xl font-medium leading-relaxed italic">
                Write an algebraic expression for the perimeter of the triangle. <strong className="text-white">Simplify your answer.</strong>
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-20 w-full px-6">
              <div className="relative w-80 h-80 lg:w-[400px] lg:h-[400px]">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_50px_rgba(30,58,138,0.6)]">
                  <polygon points="15,15 15,85 85,85" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round" />
                  <rect x="15" y="78" width="7" height="7" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                </svg>
                <div className="absolute left-[-50px] top-1/2 -translate-y-1/2 font-mono text-3xl font-black text-sky-300 transform -rotate-90 drop-shadow-md">2t³ + 1</div>
                <div className="absolute bottom-[-10px] left-[60%] -translate-x-1/2 font-mono text-2xl font-black text-emerald-400 drop-shadow-md">t³ - 5</div>
                <div className="absolute right-[10px] top-[40%] font-mono text-2xl font-black text-purple-400 transform rotate(45deg) drop-shadow-md">3t³ + 4</div>
              </div>

              <div className="flex-grow space-y-8 w-full max-w-lg">
                <div className="bg-slate-950 p-8 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl">
                  <div className="flex flex-col gap-6">
                    <input 
                      type="text" value={t3Answer} onChange={e => { setT3Answer(e.target.value); setFeedback(null); }}
                      className="bg-slate-900 border-4 border-slate-700 rounded-3xl px-8 py-6 text-4xl font-mono flex-grow focus:border-sky-500 outline-none transition-all shadow-inner text-center"
                      placeholder="e.g., 3n^2 - 4"
                    />
                    <button onClick={validateT3} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-5 rounded-2xl font-black text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-tighter">Check</button>
                  </div>
                </div>
                {feedback?.type === 'incorrect' && (
                  <div className="p-6 bg-indigo-900/40 border-l-8 border-indigo-500 rounded-2xl text-lg text-indigo-100 italic leading-relaxed shadow-xl">
                    Perimeter is the sum of all sides. Add up the <span className="font-mono bg-slate-900 px-2 rounded font-black">t³</span> terms and the numbers separately!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
                  {stars === 1 && (
                    <div className="mb-6">
                      <p className="text-lg text-white font-black mb-2 uppercase tracking-tight">You need 2 stars to unlock the next level.</p>
                      <p className="text-sm text-slate-400 font-black uppercase tracking-widest">Answer correctly on the first try to earn more stars!</p>
                    </div>
                  )}
                  <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3].map(i => <StarIcon key={i} className={`w-20 h-20 ${i <= stars ? "text-yellow-400" : "text-gray-700"}`} filled={i <= stars} />)}
                  </div>
                  {stars === 2 && <p className="text-sm text-slate-400 mb-10 font-black uppercase tracking-widest">Answer correctly on the first try to earn more stars!</p>}
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

export default TermCollectorLevel2;