'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Lock, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Compass, 
  Home, 
  User, 
  LogOut, 
  Check, 
  ExternalLink,
  ChevronDown,
  MessageSquare,
  FileText
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    isAuthenticated,
    currentTab,
    setCurrentTab,
    openAuthModal,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    openEventDetail,
    events,
    openOnboarding,
    openSiteFeedback,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleTabClick = (tab: 'home' | 'explore' | 'applications' | 'my-plan' | 'campus-map' | 'profile') => {
    if ((tab === 'my-plan' || tab === 'profile') && !isAuthenticated) {
      openAuthModal(`Sign in with your FLAME email to access ${tab === 'my-plan' ? 'My Plan' : 'your Profile'}.`);
      return;
    }
    setCurrentTab(tab);
  };

  const handleBellClick = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadNotificationsCount > 0) {
      markNotificationsAsRead();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d0a11]/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Editorial Header */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group py-1"
          >
            <div className="relative flex items-center justify-center">
              <img 
                src="/brand-logo.png" 
                alt="FLAME FOMO Logo" 
                className="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="font-editorial text-2xl sm:text-[27px] font-black tracking-tight leading-none text-white flex items-center gap-1.5">
                <span>FLAME</span>
                <span className="italic bg-gradient-to-r from-[#ff2453] via-[#ff543c] to-[#ffaa20] bg-clip-text text-transparent">FOMO</span>
              </div>
            </div>
          </div>

          {/* Navigation Links: Only visible to logged-in students */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center p-1.5 bg-[#120e18]/95 border border-[#2d2438] rounded-full shadow-inner">
              <button
                onClick={() => handleTabClick('home')}
                className={`transition-all flex items-center gap-2 ${
                  currentTab === 'home'
                    ? 'bg-[#ff2453] text-white font-bold px-5 py-2 rounded-full shadow-[0_2px_14px_rgba(255,36,83,0.35)] text-sm sm:text-[15px]'
                    : 'text-neutral-400 hover:text-white px-4 sm:px-5 py-2 rounded-full text-sm font-medium hover:bg-white/5'
                }`}
              >
                <Home className="w-4 h-4 stroke-[2.2]" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleTabClick('explore')}
                className={`transition-all flex items-center gap-2 ${
                  currentTab === 'explore'
                    ? 'bg-[#ff2453] text-white font-bold px-5 py-2 rounded-full shadow-[0_2px_14px_rgba(255,36,83,0.35)] text-sm sm:text-[15px]'
                    : 'text-neutral-400 hover:text-white px-4 sm:px-5 py-2 rounded-full text-sm font-medium hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4 stroke-[2.2]" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => handleTabClick('applications')}
                className={`transition-all flex items-center gap-2 ${
                  currentTab === 'applications'
                    ? 'bg-[#ff2453] text-white font-bold px-5 py-2 rounded-full shadow-[0_2px_14px_rgba(255,36,83,0.35)] text-sm sm:text-[15px]'
                    : 'text-neutral-400 hover:text-white px-4 sm:px-5 py-2 rounded-full text-sm font-medium hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4 stroke-[2.2]" />
                <span>Applications</span>
              </button>

              <button
                onClick={() => handleTabClick('my-plan')}
                className={`relative transition-all flex items-center gap-2 ${
                  currentTab === 'my-plan'
                    ? 'bg-[#ff2453] text-white font-bold px-5 py-2 rounded-full shadow-[0_2px_14px_rgba(255,36,83,0.35)] text-sm sm:text-[15px]'
                    : 'text-neutral-400 hover:text-white px-4 sm:px-5 py-2 rounded-full text-sm font-medium hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4 stroke-[2.2]" />
                <span>My Plan</span>
              </button>

              <button
                onClick={() => handleTabClick('campus-map')}
                className={`relative transition-all flex items-center gap-2 ${
                  currentTab === 'campus-map'
                    ? 'bg-[#ff2453] text-white font-bold px-5 py-2 rounded-full shadow-[0_2px_14px_rgba(255,36,83,0.35)] text-sm sm:text-[15px]'
                    : 'text-neutral-400 hover:text-white px-4 sm:px-5 py-2 rounded-full text-sm font-medium hover:bg-white/5'
                }`}
              >
                <MapPin className="w-4 h-4 stroke-[2.2]" />
                <span>Campus Map</span>
              </button>
            </nav>
          )}

          {/* Right Header Controls: Notification Bell, Guest Mode & Auth CTA */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notification Bell (Only for logged in students) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  title="Upcoming Deadlines & Notifications"
                  className="relative p-2.5 rounded-full bg-[#15121b] border border-white/5 hover:border-white/10 text-neutral-300 hover:text-white transition-all focus:outline-none"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#ff2d55] text-[10px] font-black text-white shadow-sm ring-2 ring-[#0d0a11] animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#16131d] border border-white/10 rounded-2xl shadow-2xl z-50 p-3.5 overflow-hidden text-neutral-200 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-editorial text-base font-bold text-white">Deadline Radar</span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#ff2d55]/20 text-[#ff4d6d] font-semibold rounded-full border border-[#ff2d55]/30">
                        FOMO Alerts
                      </span>
                    </div>
                    <span className="text-xs text-rose-300/80 font-handwritten">stay ahead</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-neutral-400">
                        No urgent deadlines right now. Enjoy campus life!
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const targetEvt = events.find((e) => e.id === notif.eventId);
                        return (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl text-xs border transition-colors ${
                              notif.type === 'urgent_deadline'
                                ? 'bg-rose-950/30 border-rose-500/30 text-rose-100'
                                : 'bg-white/5 border-white/5 text-neutral-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-rose-200">{notif.title}</span>
                              <span className="text-[10px] text-neutral-400 whitespace-nowrap">{notif.timestamp}</span>
                            </div>
                            <p className="mt-1 text-xs text-neutral-300 leading-relaxed">{notif.message}</p>
                            {targetEvt && (
                              <button
                                onClick={() => {
                                  openEventDetail(targetEvt);
                                  setIsNotifOpen(false);
                                }}
                                className="mt-2 text-[11px] font-semibold text-[#ff4d6d] hover:underline flex items-center gap-1"
                              >
                                View Event Details <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

            {/* Profile Avatar / Authentication Toggle */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-full bg-[#15121b] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-white truncate max-w-[100px] sm:max-w-[130px]">
                      {user.name}
                    </span>
                    <span className="text-[9px] text-[#ff4d6d] font-mono">
                      {user.academic_year} · FLAME
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white font-bold text-xs flex items-center justify-center border border-white/20">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#16131d] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 text-neutral-200 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs text-neutral-400">Signed in as</p>
                      <p className="text-xs font-semibold text-white truncate">{user.flame_email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-neutral-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Profile & Timetable</span>
                    </button>

                    <button
                      onClick={() => {
                        openOnboarding();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-white/5 hover:text-rose-200 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>Retake Student Quiz</span>
                    </button>

                    <button
                      onClick={() => {
                        openSiteFeedback();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-neutral-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                      <span>Give Site Feedback</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('Sign in with your FLAME email (@flame.edu.in) to access campus events and schedule.')}
                  className="px-4 py-2 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] hover:opacity-95 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg shadow-rose-950/40 transition-all flex items-center gap-1.5"
                >
                  <span>Student Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar (Only for logged-in students) */}
        {isAuthenticated && (
          <div className="md:hidden flex items-center justify-around py-2.5 border-t border-white/5 text-xs">
            <button
              onClick={() => handleTabClick('home')}
              className={`flex flex-col items-center py-1 px-3 rounded-full transition-colors ${
                currentTab === 'home' ? 'text-[#ff2d55] font-bold bg-[#ff2d55]/10' : 'text-neutral-400'
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleTabClick('explore')}
              className={`flex flex-col items-center py-1 px-3 rounded-full transition-colors ${
                currentTab === 'explore' ? 'text-[#ff2d55] font-bold bg-[#ff2d55]/10' : 'text-neutral-400'
              }`}
            >
              <Compass className="w-4 h-4 mb-0.5" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => handleTabClick('applications')}
              className={`flex flex-col items-center py-1 px-3 rounded-full transition-colors ${
                currentTab === 'applications' ? 'text-[#ff2d55] font-bold bg-[#ff2d55]/10' : 'text-neutral-400'
              }`}
            >
              <FileText className="w-4 h-4 mb-0.5" />
              <span>Apply</span>
            </button>

            <button
              onClick={() => handleTabClick('my-plan')}
              className={`flex flex-col items-center py-1 px-3 rounded-full relative transition-colors ${
                currentTab === 'my-plan' ? 'text-[#ff2d55] font-bold bg-[#ff2d55]/10' : 'text-neutral-400'
              }`}
            >
              <Calendar className="w-4 h-4 mb-0.5" />
              <span>Plan</span>
            </button>

            <button
              onClick={() => handleTabClick('campus-map')}
              className={`flex flex-col items-center py-1 px-3 rounded-full relative transition-colors ${
                currentTab === 'campus-map' ? 'text-[#ff2d55] font-bold bg-[#ff2d55]/10' : 'text-neutral-400'
              }`}
            >
              <MapPin className="w-4 h-4 mb-0.5" />
              <span>Map</span>
            </button>

            <button
              onClick={() => handleTabClick('profile')}
              className={`flex flex-col items-center py-1 px-3 rounded-full transition-colors ${
                currentTab === 'profile' ? 'text-[#ff2d55] font-bold bg-[#ff2d55]/10' : 'text-neutral-400'
              }`}
            >
              <User className="w-4 h-4 mb-0.5" />
              <span>Profile</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
