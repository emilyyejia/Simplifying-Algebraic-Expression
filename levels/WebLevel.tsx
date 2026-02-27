
import React, { useState } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

interface WebLevelProps extends LevelComponentProps {
  url: string;
}

const WebLevel: React.FC<WebLevelProps> = ({ onComplete, url, topic }) => {
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col bg-gray-950 rounded-[2.5rem] overflow-hidden relative border-4 border-slate-800 shadow-2xl min-h-[600px]">
      <InstructionButton onClick={() => setIsInstructionOpen(true)} className="fixed bottom-24 right-8" />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Educational Video"
      >
        <p className="text-xl leading-relaxed">Watch this Binogi resource to learn more about <strong>{topic}</strong>.</p>
        <p className="mt-4 text-xl leading-relaxed italic">Once you have finished viewing the material, click the large green button at the bottom to return to the map.</p>
      </InstructionModal>

      <div className="flex-grow w-full h-full relative bg-black flex flex-col">
        {/* Header */}
        <div className="relative bg-slate-900/90 backdrop-blur-md p-5 text-center z-10 border-b border-slate-800 flex justify-between items-center px-10">
           <div className="flex flex-col items-start">
             <p className="text-sky-400 font-black uppercase tracking-[0.2em] text-xs mb-1">Binogi Learning Resource</p>
             <h2 className="text-white font-bold text-lg">{topic}</h2>
           </div>
           <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2 px-6 rounded-lg text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
           >
              Open in New Tab
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
           </a>
        </div>

        <div className="flex-grow relative">
            {/* Main Iframe */}
            <iframe
                src={url}
                className="w-full h-full border-none bg-slate-900"
                title={`Learning Video: ${topic}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            
            {/* Fallback info layer (always present but usually behind iframe) */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center p-12 text-center bg-slate-900">
                <div className="max-w-xl p-10 rounded-[2rem] bg-slate-800 border-2 border-slate-700 shadow-2xl">
                    <div className="text-6xl mb-6">📺</div>
                    <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">Iframe content restricted</h3>
                    <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                        To protect your security, some external sites like Binogi may prevent themselves from being embedded.
                    </p>
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-black py-4 px-10 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest"
                    >
                        Watch on Binogi.ca
                    </a>
                </div>
            </div>
        </div>
        
        {/* Footer Completion Area */}
        <div className="p-8 bg-slate-900/90 border-t border-slate-800 flex justify-center items-center gap-10">
          <p className="hidden md:block text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] max-w-[200px]">
            Ready to continue your journey?
          </p>
          <button
            onClick={() => onComplete(1)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 px-16 rounded-[1.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xl border-b-4 border-emerald-800"
          >
            Finished Viewing
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebLevel;
