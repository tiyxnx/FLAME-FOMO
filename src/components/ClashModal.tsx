'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, Clock, Calendar, Check, X } from 'lucide-react';

export const ClashModal: React.FC = () => {
  const { clashInfo, resolveClash } = useApp();

  if (!clashInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#131017] text-[#f4f3f6] rounded-xl shadow-2xl border border-amber-500/40 p-6 text-center select-none"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Yellow disclaimer banner motif */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-300 rounded-full shadow-md font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 rotate-[-1deg]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Schedule Conflict Warning</span>
        </div>

        {/* Warning sign */}
        <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mt-3 mb-4 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />
        </div>

        {/* Required copy from read.md */}
        <h3 className="font-editorial text-xl font-bold text-white mb-2">
          This clashes with your scheduled event/class.
        </h3>

        <p className="text-xs text-[#9d93a8] mb-4 font-sans-ui">
          You are attempting to add <span className="font-bold text-white">&ldquo;{clashInfo.event.event_name}&rdquo;</span>, but your planner already has a conflicting commitment:
        </p>

        {/* Conflict Details Card */}
        <div className="p-3 bg-[#181420] border border-[#2b2438] rounded-lg text-left mb-6 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Conflict: {clashInfo.conflictTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#9d93a8]">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Time: {clashInfo.conflictTime}</span>
          </div>
        </div>

        {/* Exact Two Buttons from read.md: "Continue Anyway" and "Nevermind" */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => resolveClash(false)}
            className="px-4 py-2.5 bg-[#1e1926] hover:bg-[#2b2336] text-neutral-300 text-xs sm:text-sm font-semibold rounded-full border border-[#2b2438] transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4 text-neutral-400" />
            <span>Nevermind</span>
          </button>

          <button
            onClick={() => resolveClash(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_0_15px_rgba(255,45,85,0.4)] transition-transform active:scale-95 flex items-center justify-center gap-1.5 hover:brightness-110"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Continue Anyway</span>
          </button>
        </div>

        <p className="mt-3 text-[10px] text-[#8a7f96] font-handwritten text-sm">
          your academic calendar remains editable under Profile
        </p>
      </div>
    </div>
  );
};
