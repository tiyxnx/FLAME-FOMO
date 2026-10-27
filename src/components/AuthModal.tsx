'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalReason, 
    closeAuthModal, 
    loginWithGoogle
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset modal state on open/close
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Google 1-Tap Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in encountered an error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-md bg-[#16131d] text-white rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8"
      >
        {/* Washi tape header motif */}
        <div 
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-6 bg-rose-500/30 border border-rose-500/40 shadow-md backdrop-blur-xs rotate-[-1deg] pointer-events-none rounded-xs"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Stamp with New Runner Bell Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-auto mb-3">
            <img 
              src="/brand-logo.png" 
              alt="FLAME FOMO Logo" 
              className="h-14 w-auto object-contain filter drop-shadow-[0_2px_12px_rgba(255,45,85,0.45)]"
            />
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
            FLAME Student Access
          </h2>
          <p className="text-xs text-neutral-400 font-sans-ui mt-1.5 max-w-xs mx-auto leading-relaxed">
            {authModalReason || 'Sign in with your FLAME Google account to save events, avoid timetable clashes, and build your campus plan.'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Primary Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-5 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-neutral-700">
                <div className="w-4 h-4 border-2 border-neutral-700 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
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
                <span className="font-semibold text-neutral-900">Sign in with FLAME Google</span>
              </>
            )}
          </button>

          {/* Institutional note */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2.5 text-xs text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-[#ff2d55] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">University Verification:</span> Strictly requires official{' '}
              <span className="font-mono font-semibold text-rose-300">@flame.edu.in</span> Google account.
            </div>
          </div>
        </div>

        {/* Security verification footer */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-neutral-500 font-sans-ui flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Closed FLAME University network. Strangers &amp; non-students cannot access campus events.</span>
          </p>
        </div>

      </div>
    </div>
  );
};
