'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Flame, Sparkles, MessageCircleQuestion } from 'lucide-react';

export const FloatingChatBotLauncher: React.FC = () => {
  const { openChatBot, isChatBotOpen, canCreateEvents, isAuthenticated } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  if (isChatBotOpen) return null;

  // Position above the FAB (+) button if user has permission to post events,
  // or at the primary bottom-right position if regular student
  const positionClass = canCreateEvents && isAuthenticated
    ? 'bottom-24 sm:bottom-26 right-6'
    : 'bottom-6 right-6';

  return (
    <div className={`fixed ${positionClass} z-40 select-none transition-all duration-300`}>
      <button
        onClick={openChatBot}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Ask FOMO Bot: Free rn? Next events, film comps & campus queries!"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-br from-[#2a241c] to-[#1c1813] hover:from-[#362e24] hover:to-[#221d17] text-amber-200 rounded-full shadow-2xl border-2 border-amber-500/40 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
      >
        {/* Washi tape accent on launcher */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-[#f3da90]/80 rounded-2xs rotate-[6deg] shadow-2xs pointer-events-none" />

        <div className="relative">
          <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 fill-amber-400 group-hover:scale-110 transition-transform duration-200" />
          <Sparkles className="w-3.5 h-3.5 text-amber-200 absolute -top-1.5 -right-2 animate-pulse" />
        </div>

        {/* Hover Speech Bubble Tooltip */}
        <div 
          className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#25211c] text-amber-200 text-xs font-semibold rounded-md shadow-2xl border border-[#4a4033] whitespace-nowrap pointer-events-none transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Ask FOMO Bot anything! 💬</span>
        </div>
      </button>
    </div>
  );
};
