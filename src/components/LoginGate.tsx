'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Clock,
  AlertCircle
} from 'lucide-react';

export const LoginGate: React.FC = () => {
  const { loginWithGoogle } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in encountered an issue. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 select-none">
      <div className="w-full max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
        
        {/* Brand Showcase */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 group">
            <img 
              src="/brand-logo.png" 
              alt="FLAME FOMO Logo" 
              className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_4px_24px_rgba(255,45,85,0.4)] group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="font-editorial text-4xl sm:text-5xl font-black tracking-tight leading-none text-white flex items-center justify-center gap-2">
            <span>FLAME</span>
            <span className="italic bg-gradient-to-r from-[#ff2453] via-[#ff543c] to-[#ffaa20] bg-clip-text text-transparent">FOMO</span>
          </div>
          
          <p className="font-handwritten text-lg sm:text-xl text-neutral-300 mt-2">
            &ldquo;Don&apos;t just hear about it&rdquo;
          </p>
        </div>

        {/* Protected Gate Card */}
        <div className="relative bg-[#130f1a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-left space-y-6">
          
          {/* Top Security Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
              <span className="p-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span>Protected Campus Network</span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              FLAME Students Only
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Sign in to view campus events &amp; applications
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
              To protect student privacy, schedules, and internal campus announcements, access is strictly reserved for enrolled FLAME University students and faculty.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 text-sm sm:text-base font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group hover:shadow-white/10"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-neutral-700">
                <div className="w-5 h-5 border-2 border-neutral-700 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to FLAME Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with FLAME Google Account</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2.5 text-xs text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-[#ff2d55] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Institutional Gate:</span> Must end with{' '}
              <span className="font-mono font-semibold text-rose-300">@flame.edu.in</span>. Personal or non-FLAME accounts are blocked.
            </div>
          </div>

          {/* Student Perks Quick List */}
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Timetable clash radar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>1-Tap RSVP &amp; My Plan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Campus Map &amp; Walking Times</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Club Audition Deadlines</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
