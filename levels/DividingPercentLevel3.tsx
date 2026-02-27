
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const DividingPercentLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [taskIndex, setTaskIndex] = useState(() => partialProgress?.taskIndex || 0);
  const [maxTaskReached, setMaxTaskReached] = useState(() => partialProgress?.maxTaskReached || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const totalTasks = 4; // Placeholder count
  const isCompletedRef = useRef(false);

  // Save state on unmount
  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ taskIndex, maxTaskReached });
      }
    };
  }, [onSavePartialProgress, taskIndex, maxTaskReached]);

  const handleNext = () => {
    if (taskIndex < totalTasks - 1) {
      const next = taskIndex + 1;
      setTaskIndex(next);
      if (next > maxTaskReached) setMaxTaskReached(next);
    } else {
      isCompletedRef.current = true;
      onComplete(3); // Complete with 3 stars
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-white relative font-sans">
      {/* Instruction UI */}
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Level Instructions"
      >
        <p>Instructions for this level go here.</p>
      </InstructionModal>

      {/* Progress Dots */}
      <div className="absolute top-4 right-4 flex gap-2">
        {Array.from({ length: totalTasks }).map((_, index) => (
          <button
            key={index}
            disabled={index > maxTaskReached}
            onClick={() => setTaskIndex(index)}
            className={`w-6 h-6 rounded-full transition-all duration-300 border-2 flex items-center justify-center text-[10px] font-bold ${
              index === taskIndex ? 'bg-sky-500 border-sky-300 scale-110 shadow-glow' : 
              index <= maxTaskReached ? 'bg-emerald-600 border-emerald-500 hover:bg-emerald-400' : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
            }`}
            title={`Go to task ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-slate-800/40 backdrop-blur-md p-12 rounded-3xl border border-slate-700 shadow-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-sky-300 animate-fade-in">Task {taskIndex + 1} placeholder</h2>
        <p className="text-slate-400 mb-10 italic">This content is being developed. Click next to progress.</p>

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-center">
            <button
            onClick={handleNext}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
            {taskIndex < totalTasks - 1 ? 'Next' : 'Finish'}
            </button>
            <button
            onClick={onExit}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
            Back to Map
            </button>
        </div>
      </div>
    </div>
  );
};

export default DividingPercentLevel3;
