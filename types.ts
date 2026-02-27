
import React from 'react';

export enum LevelStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED',
}

export interface Level {
  id: string;
  name: string;
  description: string;
  // FIX: Import React to resolve the 'Cannot find namespace React' error for React.FC.
  component: React.FC<LevelComponentProps>;
  topic: string;
  questions?: QuizQuestion[];
  isGated?: boolean;
  externalUrl?: string; // Add this for direct redirection
}

export interface Lesson {
  title: string;
  levels: Level[];
  isBonus?: boolean;
  bonus?: Lesson;
}

export type PlayerProgress = {
  [levelId: string]: number;
};

export interface LevelComponentProps {
  topic: string;
  onComplete: (stars: number) => void;
  onExit?: () => void;
  questions?: QuizQuestion[];
  isGated?: boolean;
  partialProgress?: any;
  onSavePartialProgress?: (state: any | null) => void;
  progress?: PlayerProgress;
  levelId?: string;
  onNext?: () => void;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswers: string[];
  type: 'single' | 'multi';
}

export interface StoryChunk {
  text: string;
  choices: string[];
}

export type Tool = 'help' | 'listen' | 'zoomIn' | 'zoomOut' | 'lineReader' | 'highContrast' | 'highlighter' | 'eraser' | 'notes' | 'calculator' | 'documents';