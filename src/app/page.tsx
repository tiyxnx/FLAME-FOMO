'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { HomeView } from '@/components/HomeView';
import { ExploreView } from '@/components/ExploreView';
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
import { SiteFeedbackWidget } from '@/components/SiteFeedbackWidget';

export default function App() {
  const { currentTab, isAuthenticated, openAuthModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-scrapbook-board text-neutral-100">
      
      {/* Persistent Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {currentTab === 'home' && <HomeView />}
        {currentTab === 'explore' && <ExploreView />}
        {currentTab === 'my-plan' && <MyPlanView />}
        {currentTab === 'campus-map' && <CampusMap />}
        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Persistent Floating Action Button for Event Creation (Hidden for Guests) */}
      <FloatingActionButton />

      {/* Persistent Floating Feedback Widget (Site Suggestions & Bug Reports) */}
      <SiteFeedbackWidget />

      {/* System Modals */}
      <AuthModal />
      <OnboardingModal />
      <CreateEventModal />
      <EventDetailModal />
      <EventFeedbackModal />
      <ClashModal />
      <ExternalRegModal />
      <InAppReminder />
      <FloatingPlanWidget />

      {/* Editorial Footer */}
      <footer className="border-t border-[#312b23] bg-[#141210] py-8 text-neutral-400 text-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-sm font-bold text-amber-100">
              FLAME <span className="text-[#e25845] italic">FOMO</span>
            </span>
            <span>·</span>
            <span>FLAME University Student Discovery & Scheduling Planner</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#9b8d74]">
            <span className="font-handwritten text-base">crafted with nostalgia & tactile care</span>
            <span>•</span>
            <span>Pune, Maharashtra</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
