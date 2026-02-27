import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { PlayerProgress, Lesson, Level } from './types';
import { LevelStatus } from './types';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { ToolbarProvider } from './hooks/useToolbarState';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import LevelView from './components/LevelView';
import PolynomialsLevel1 from './levels/PolynomialsLevel1';
import LikeTermsLevel1 from './levels/LikeTermsLevel1';
import TermCollectorLevel2 from './levels/TermCollectorLevel2';
import CombineAndConquerLevel3 from './levels/CombineAndConquerLevel3';
import MonomialPolyLevel1 from './levels/MonomialPolyLevel1';
import BinomialBinomialLevel2 from './levels/BinomialBinomialLevel2';
import PolynomialMasterLevel3 from './levels/PolynomialMasterLevel3';
import WebLevel from './levels/WebLevel';

// --- Icon Components ---
const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill={filled ? "#fbbf24" : "#334155"} 
        className={className}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.841Z" />
    </svg>
);

const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
);

const LESSON_DEFINITIONS: Lesson[] = [
    {
        title: "Understanding Polynomials",
        levels: [
            { id: 'polynomials-level-1', name: 'Level 1', description: 'Polynomials and Degrees', component: PolynomialsLevel1, topic: 'Polynomials' },
        ]
    },
    {
        title: "Collecting Like Terms",
        levels: [
            { id: 'like-terms-level-1', name: 'Level 1', description: 'Sort Terms', component: LikeTermsLevel1, topic: 'Like Terms' },
            { id: 'like-terms-level-2', name: 'Level 2', description: 'Term Collector', component: TermCollectorLevel2, topic: 'Like Terms' },
            { id: 'like-terms-level-3', name: 'Level 3', description: 'Combine & Conquer', component: CombineAndConquerLevel3, topic: 'Like Terms' },
        ],
        bonus: {
            title: "Bonus Mission",
            levels: [
                { 
                    id: 'like-terms-video', 
                    name: 'Binogi Video', 
                    description: 'Algebraic Introduction', 
                    component: WebLevel, 
                    topic: 'Algebraic Expressions',
                    externalUrl: 'https://app.binogi.ca/l/working-with-algebraic-expressions-introduction'
                }
            ]
        }
    },
    {
        title: "Expanding Expressions",
        levels: [
            { id: 'monomial-poly-level-1', name: 'Level 1', description: 'Monomial x Poly', component: MonomialPolyLevel1, topic: 'Expansion' },
            { id: 'binomial-binomial-level-2', name: 'Level 2', description: 'Binomial x Binomial', component: BinomialBinomialLevel2, topic: 'Expansion' },
            { id: 'polynomial-master-level-3', name: 'Level 3', description: 'Mastery Challenge', component: PolynomialMasterLevel3, topic: 'Expansion' },
        ],
        bonus: {
            title: "Bonus Mission",
            levels: [
                { 
                    id: 'expansion-video-2', 
                    name: 'Expansion', 
                    description: 'Multiplying Expressions', 
                    component: WebLevel, 
                    topic: 'Multiplying Linear Expressions',
                    externalUrl: 'https://app.binogi.ca/l/multiplying-linear-expressions'
                }
            ]
        }
    }
];

const getLevelStatus = (levelId: string, progress: PlayerProgress): LevelStatus => {
    if ((progress[levelId] || 0) >= 1) return LevelStatus.COMPLETED;
    return LevelStatus.UNLOCKED;
};

const LevelNode: React.FC<{ 
    level: Level; 
    status: LevelStatus; 
    stars: number; 
    onSelectLevel: (id: string) => void;
}> = ({ level, status, stars, onSelectLevel }) => {
    const isCompleted = status === LevelStatus.COMPLETED;

    return (
        <div className="flex flex-col items-center gap-3 min-w-[120px]">
            <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative bg-[#1e70e9] border-[5px] border-[#1e70e9]/50 hover:scale-110 active:scale-95 cursor-pointer z-10"
                onClick={() => onSelectLevel(level.id)}
            >
                <PlayIcon className="w-10 h-10 text-white" />
            </div>

            <div className="text-center">
                <p className="text-[14px] font-bold text-slate-300">
                    {level.name}
                </p>
                <div className="flex justify-center mt-1">
                    {[1, 2, 3].map(i => (
                        <StarIcon key={i} filled={i <= stars} className="w-5 h-5 mx-0.5" />
                    ))}
                </div>
            </div>

        </div>
    );
};

const LessonBlock: React.FC<{ lesson: any; progress: PlayerProgress; onSelectLevel: (id: string) => void }> = ({ lesson, progress, onSelectLevel }) => {
    return (
        <div className="relative p-10 pt-8 rounded-2xl border-[1px] border-slate-700/50 bg-[#161f2d] shadow-2xl flex flex-col items-center z-10">
            <h3 className="text-[18px] font-black text-blue-400 mb-8 tracking-widest text-center">
                {lesson.title}
            </h3>
            <div className="flex items-start gap-12">
                {lesson.levels.map((level: Level) => (
                    <LevelNode 
                        key={level.id} 
                        level={level} 
                        status={getLevelStatus(level.id, progress)} 
                        stars={progress[level.id] || 0}
                        onSelectLevel={onSelectLevel}
                    />
                ))}
            </div>
        </div>
    );
};

const BonusMissionBlock: React.FC<{ lesson: any; progress: PlayerProgress; onSelectLevel: (id: string) => void }> = ({ lesson, progress, onSelectLevel }) => {
    return (
        <div className="relative flex flex-col items-center z-10">
            <div className="w-[4px] h-12 bg-slate-700/50 z-0"></div>
            
            <div className={`bg-[#161f2d] border-[1px] rounded-xl p-5 min-w-[180px] shadow-2xl flex flex-col items-center relative z-20 border-slate-700/50`}>
                <div className={`absolute top-[-14px] left-1/2 -translate-x-1/2 px-4 py-1 rounded-[4px] font-black text-[11px] whitespace-nowrap shadow-md bg-[#fbbf24] text-[#0b121e]`}>
                    {lesson.title}
                </div>
                
                <div className="flex gap-6 mt-4">
                    {lesson.levels.map((level: Level) => {
                        const status = getLevelStatus(level.id, progress);
                        const isCompleted = status === LevelStatus.COMPLETED;
                        const stars = progress[level.id] || 0;
                        
                        return (
                            <div key={level.id} className="flex flex-col items-center gap-2">
                                <div 
                                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative bg-[#1e70e9] border-[4px] border-[#1e70e9]/50 hover:scale-110 active:scale-95 cursor-pointer z-10"
                                    onClick={() => onSelectLevel(level.id)}
                                >
                                    <PlayIcon className="w-8 h-8 text-white" />
                                </div>
                                
                                <div className="flex justify-center">
                                    <StarIcon filled={stars >= 1} className="w-5 h-5" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const LevelMap: React.FC<{ 
    progress: PlayerProgress; 
    onSelectLevel: (id: string) => void;
    onReset: () => void;
}> = ({ progress, onSelectLevel, onReset }) => {
    const totalStars = (Object.values(progress) as number[]).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#0b121e] overflow-x-auto select-none">
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden">
                        <span className="text-2xl">👤</span>
                    </div>
                    <div className="bg-[#161f2d] border border-slate-700/50 rounded-full px-5 py-2 flex items-center gap-3">
                        <StarIcon filled={true} className="w-6 h-6" />
                        <span className="text-xl font-black text-white">{totalStars}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onReset} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-lg border border-slate-700/30 transition-all">
                        <span className="text-xl">↺</span> Reset Progress
                    </button>
                </div>
            </div>

            <div className="text-center mt-4 mb-10 px-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
                    Simplifying Algebraic Expressions
                </h1>
                <p className="text-slate-400 text-sm md:text-base font-medium italic tracking-wider max-w-4xl mx-auto">
                    Goal: I can simplify algebraic expressions by using various tools and representations.
                </p>
            </div>

            {/* Container now uses items-center by default but overrides alignment for bonus assemblies */}
            <div className="relative flex items-center gap-24 px-[200px] min-h-[600px] flex-nowrap pb-40 w-fit">
                {/* Connector line changed to z-0 so it sits behind blocks (z-10) but on top of parent background */}
                <div className="absolute top-[230px] left-0 right-0 h-[8px] bg-[#fbbf24] z-0 shadow-[0_0_15px_rgba(251,191,36,0.2)]"></div>

                {LESSON_DEFINITIONS.map((lesson, idx) => (
                    <React.Fragment key={idx}>
                        <div className="relative z-10 flex-shrink-0">
                            <LessonBlock lesson={lesson} progress={progress} onSelectLevel={onSelectLevel} />
                        </div>
                        
                        {lesson.bonus && (
                            <div className="relative z-10 flex-shrink-0 self-start mt-[234px]">
                                <BonusMissionBlock lesson={lesson.bonus} progress={progress} onSelectLevel={onSelectLevel} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

function App() {
    const { progress, partialProgress, savePartialProgress, completeLevel, resetProgress } = usePlayerProgress(LESSON_DEFINITIONS);
    const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
    
    const allLevels = useMemo(() => {
        const levels: Level[] = [];
        LESSON_DEFINITIONS.forEach(lesson => {
            levels.push(...lesson.levels);
            if (lesson.bonus) levels.push(...lesson.bonus.levels);
        });
        return levels;
    }, []);

    const handleSelectLevel = (id: string) => {
        const level = allLevels.find(l => l.id === id);
        if (level?.externalUrl) {
            // Video Level: Open in new tab and mark as complete immediately
            window.open(level.externalUrl, '_blank', 'noopener,noreferrer');
            completeLevel(id, 1); // Reward 1 star for watching
        } else {
            setCurrentLevelId(id);
        }
    };

    const currentLevel = allLevels.find(l => l.id === currentLevelId);
    const lessonTitle = LESSON_DEFINITIONS.find(lesson => 
        lesson.levels.some(l => l.id === currentLevelId) || 
        lesson.bonus?.levels.some(l => l.id === currentLevelId)
    )?.title || (currentLevel?.topic);

    return (
        <DndProvider backend={HTML5Backend}>
            <ToolbarProvider>
                <div className="min-h-screen bg-[#0b121e] font-sans text-white antialiased">
                    {currentLevel ? (
                        <LevelView 
                            level={currentLevel} 
                            onBackToMap={() => setCurrentLevelId(null)} 
                            onComplete={(stars) => { completeLevel(currentLevelId!, stars); setCurrentLevelId(null); }} 
                            onExit={() => setCurrentLevelId(null)} 
                            partialProgress={partialProgress[currentLevelId!]} 
                            onSavePartialProgress={(state) => savePartialProgress(currentLevelId!, state)} 
                            progress={progress} 
                            lessonTitle={lessonTitle} 
                        />
                    ) : (
                        <LevelMap 
                            progress={progress} 
                            onSelectLevel={handleSelectLevel} 
                            onReset={resetProgress}
                        />
                    )}
                </div>
            </ToolbarProvider>
        </DndProvider>
    );
}

export default App;