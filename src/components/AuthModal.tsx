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
    loginAsGuest,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="relative w-full max-w-md bg-[#fcfaf2] text-neutral-900 rounded-sm shadow-2xl border-4 border-[#e8dfc9] p-6 sm:p-8"
        style={{
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Washi tape header motif */}
        <div 
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#f3da90]/90 shadow-md backdrop-blur-xs rotate-[-1deg] pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Stamp */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#c93b2b] text-amber-100 rounded-sm shadow-md mb-2 rotate-[-2deg]">
            <span className="font-editorial text-2xl font-black">F</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900">
            FLAME Student Access
          </h2>
          <p className="text-xs text-neutral-600 font-sans-ui mt-1.5 max-w-xs mx-auto leading-relaxed">
            {authModalReason || 'Sign in with your FLAME Google account to save events, avoid timetable clashes, and build your campus plan.'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-xs text-xs text-red-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Primary Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-5 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 text-sm font-bold rounded-sm shadow-md border-2 border-[#d6cbb0] hover:border-neutral-400 transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-neutral-600">
                <div className="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
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
                <span className="font-semibold text-neutral-800">Sign in with FLAME Google</span>
              </>
            )}
          </button>

          {/* Institutional note */}
          <div className="p-3 bg-[#f5ede0] border border-[#e4d6c0] rounded-xs flex items-start gap-2.5 text-[11px] text-[#6d5d47]">
            <ShieldCheck className="w-4 h-4 text-[#c93b2b] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-800">University Verification:</span> Strictly requires official{' '}
              <span className="font-mono font-semibold text-neutral-900">@flame.edu.in</span> Google account.
            </div>
          </div>
        </div>

        {/* Continue as guest */}
        <div className="mt-6 pt-4 border-t border-[#e8dfc9] text-center">
          <button
            type="button"
            onClick={loginAsGuest}
            className="text-xs text-neutral-500 hover:text-neutral-800 hover:underline font-sans-ui"
          >
            Browse in Guest Mode without saving
          </button>
        </div>

      </div>
    </div>
  );
};
