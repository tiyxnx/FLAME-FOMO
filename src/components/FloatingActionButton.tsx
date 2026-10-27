'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Sparkles } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const { isAuthenticated, openCreateEvent, currentTab, canCreateEvents } = useApp();

  // Crucial RBAC requirement: Only Admins and verified Clubs/Committees can add events
  // Strictly hidden for unauthenticated guests and regular student sign-in accounts
  if (!isAuthenticated || !canCreateEvents) {
    return null;
  }

  const isApplicationsTab = currentTab === 'applications';

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={() => openCreateEvent(isApplicationsTab ? 'application' : 'event')}
        title={isApplicationsTab ? "Post Application" : "Post New Campus Event"}
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white rounded-full shadow-2xl shadow-rose-950/60 border border-rose-400/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none"
      >
        {/* Washi tape accent on FAB */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-amber-400/30 border border-amber-400/40 rounded-xs rotate-[-8deg] shadow-xs pointer-events-none" />
        
        <Plus className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:rotate-90 text-white" />

        {/* Hover speech bubble tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 bg-[#181420] text-rose-200 text-xs font-semibold rounded-xl shadow-xl border border-rose-500/30 whitespace-nowrap pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{isApplicationsTab ? 'Post Application' : 'Post an Event'}</span>
        </div>
      </button>
    </div>
  );
};
