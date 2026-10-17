'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Sparkles } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const { isAuthenticated, openCreateEvent, currentTab } = useApp();

  // Crucial requirement: hidden for Guest Users, strictly visible for authenticated students
  if (!isAuthenticated) {
    return null;
  }

  const isApplicationsTab = currentTab === 'applications';

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={() => openCreateEvent(isApplicationsTab ? 'application' : 'event')}
        title={isApplicationsTab ? "Post Application" : "Post New Campus Event"}
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 rounded-full shadow-2xl border-2 border-amber-200/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none"
      >
        {/* Washi tape accent on FAB */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#f3da90]/80 rounded-xs rotate-[-8deg] shadow-xs pointer-events-none" />
        
        <Plus className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:rotate-90 text-amber-100" />

        {/* Hover speech bubble tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 bg-[#25211c] text-amber-200 text-xs font-semibold rounded-md shadow-xl border border-[#4a4033] whitespace-nowrap pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isApplicationsTab ? 'Post Application' : 'Post an Event'}</span>
        </div>
      </button>
    </div>
  );
};
