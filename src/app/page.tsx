'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { HomeView } from '@/components/HomeView';
import { ExploreView } from '@/components/ExploreView';
import { ApplicationsView } from '@/components/ApplicationsView';
import { MyPlanView } from '@/components/MyPlanView';
import { CampusMap } from '@/components/CampusMap';
import { ProfileView } from '@/components/ProfileView';

// Modals
import { AuthModal } from '@/components/AuthModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { CreateEventModal } from '@/components/CreateEventModal';
import { EventDetailModal } from '@/components/EventDetailModal';
import { ClashModal } from '@/components/ClashModal';
import { ExternalRegModal } from '@/components/ExternalRegModal';
import { InAppReminder } from '@/components/InAppReminder';
import { FloatingPlanWidget } from '@/components/FloatingPlanWidget';
import { EventFeedbackModal } from '@/components/EventFeedbackModal';

import { LoginGate } from '@/components/LoginGate';

export default function App() {
  const { currentTab, isAuthenticated } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-scrapbook-board text-neutral-100">
      
      {/* Persistent Top Header */}
      <Header />

      {/* Main Content Area: Enforce Student Login before viewing campus activities */}
      <main className="flex-1 pb-24">
        {isAuthenticated ? (
          <>
            {currentTab === 'home' && <HomeView />}
            {currentTab === 'explore' && <ExploreView />}
            {currentTab === 'applications' && <ApplicationsView />}
            {currentTab === 'my-plan' && <MyPlanView />}
            {currentTab === 'campus-map' && <CampusMap />}
            {currentTab === 'profile' && <ProfileView />}
          </>
        ) : (
          <LoginGate />
        )}
      </main>

      {/* Persistent Floating Action Button for Event Creation (Only for Authenticated Students) */}
      {isAuthenticated && <FloatingActionButton />}

      {/* System Modals */}
      <AuthModal />
      <OnboardingModal />
      {isAuthenticated && (
        <>
          <CreateEventModal />
          <EventDetailModal />
          <EventFeedbackModal />
          <ClashModal />
          <ExternalRegModal />
          <InAppReminder />
          <FloatingPlanWidget />
        </>
      )}

      {/* Editorial Footer */}
      <footer className="border-t border-white/5 bg-[#09080c] py-8 text-neutral-400 text-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/brand-logo.png" alt="FLAME FOMO Logo" className="h-7 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,45,85,0.4)]" />
            <span className="font-editorial text-sm font-bold text-white">
              FLAME <span className="inline-block bg-gradient-to-r from-[#ff2d55] via-[#ff4d6d] to-[#f59e0b] bg-clip-text text-transparent italic font-serif pr-2">FOMO</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="font-medium text-neutral-400">Made by Tiyana</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-mono">
            <span>Pune, Maharashtra</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
