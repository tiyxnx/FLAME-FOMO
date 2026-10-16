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
  FileText,
  RefreshCw
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
    isSyncingLifeAtFlame,
    lastLifeAtFlameSync,
    syncLifeAtFlameNow,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleTabClick = (tab: 'home' | 'explore' | 'applications' | 'my-plan' | 'campus-map' | 'profile') => {
    if ((tab === 'my-plan' || tab === 'campus-map' || tab === 'profile') && !isAuthenticated) {
      openAuthModal(`Sign in with your FLAME email to access ${tab === 'my-plan' ? 'My Plan' : tab === 'campus-map' ? 'the Campus Map' : 'your Profile'}.`);
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
    <header className="sticky top-0 z-40 bg-[#1e1b17]/95 backdrop-blur-md border-b border-[#38332b] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Editorial Header */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#c93b2b] rounded-sm flex items-center justify-center shadow-lg border border-[#f4a9a3]/30 group-hover:rotate-[-3deg] transition-transform duration-200">
                <span className="font-editorial text-xl sm:text-2xl font-black text-amber-100 tracking-wider">F</span>
              </div>
              <div className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-[#f3da90] text-[#4a3b1a] text-[9px] font-bold uppercase tracking-widest rounded-xs shadow-xs transform rotate-6 font-handwritten">
                campus
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#f5ebd7] group-hover:text-amber-200 transition-colors">
                  FLAME <span className="text-[#e25845] italic font-serif">FOMO</span>
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#b8ab96] tracking-wide font-sans-ui -mt-1 hidden xs:block">
                Campus Events
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => handleTabClick('home')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-[#fbf7ee] text-[#1c1a17] font-semibold shadow-md'
                  : 'text-[#d6cbaf] hover:text-[#fbf7ee] hover:bg-[#2b2721]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleTabClick('explore')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'explore'
                  ? 'bg-[#fbf7ee] text-[#1c1a17] font-semibold shadow-md'
                  : 'text-[#d6cbaf] hover:text-[#fbf7ee] hover:bg-[#2b2721]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => handleTabClick('applications')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'applications'
                  ? 'bg-[#fbf7ee] text-[#1c1a17] font-semibold shadow-md'
                  : 'text-[#d6cbaf] hover:text-[#fbf7ee] hover:bg-[#2b2721]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Applications</span>
            </button>

            <button
              onClick={() => handleTabClick('my-plan')}
              className={`relative px-3.5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'my-plan'
                  ? 'bg-[#fbf7ee] text-[#1c1a17] font-semibold shadow-md'
                  : 'text-[#d6cbaf] hover:text-[#fbf7ee] hover:bg-[#2b2721]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Plan</span>
              {!isAuthenticated && (
                <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleTabClick('campus-map')}
              className={`relative px-3.5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'campus-map'
                  ? 'bg-[#fbf7ee] text-[#1c1a17] font-semibold shadow-md'
                  : 'text-[#d6cbaf] hover:text-[#fbf7ee] hover:bg-[#2b2721]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Campus Map</span>
              {!isAuthenticated && (
                <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
              )}
            </button>
          </nav>

          {/* Right Header Controls: Notification Bell & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Life@FLAME Live Sync Status Badge */}
            <button
              onClick={() => syncLifeAtFlameNow(true)}
              disabled={isSyncingLifeAtFlame}
              title={
                lastLifeAtFlameSync
                  ? `Permanently linked with Life@FLAME portal. Last checked ${new Date(lastLifeAtFlameSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Click to sync now.`
                  : 'Permanently linked with Life@FLAME portal. Click to sync now.'
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#2a241c] border border-[#4a3e31] text-[#d6cbaf] hover:text-[#fbf7ee] hover:border-[#7c6953] hover:bg-[#362e24] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span className={`w-2 h-2 rounded-full ${isSyncingLifeAtFlame ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-[11px] font-sans-ui tracking-tight font-medium hidden xs:inline">
                {isSyncingLifeAtFlame ? 'Syncing...' : 'Life@FLAME'}
              </span>
              <RefreshCw className={`w-3 h-3 text-[#a89b87] ${isSyncingLifeAtFlame ? 'animate-spin' : ''}`} />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleBellClick}
                title="Upcoming Deadlines & Notifications"
                className="relative p-2.5 rounded-full text-[#d6cbaf] hover:text-[#fbf7ee] hover:bg-[#2c2720] transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c93b2b] text-[10px] font-bold text-white shadow-sm ring-2 ring-[#1e1b17] animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#25211c] border border-[#443c31] rounded-lg shadow-2xl z-50 p-3 overflow-hidden text-neutral-200">
                  <div className="flex items-center justify-between pb-2 border-b border-[#3b342a] mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-editorial text-base font-bold text-amber-100">Deadline Awareness</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#c93b2b]/20 text-red-300 font-semibold rounded">
                        FOMO Radar
                      </span>
                    </div>
                    <span className="text-xs text-[#a89b87] font-handwritten">stay ahead</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-sm text-[#8c806f]">
                        No urgent deadlines right now. Enjoy campus life!
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const targetEvt = events.find((e) => e.id === notif.eventId);
                        return (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-md text-xs border transition-colors ${
                              notif.type === 'urgent_deadline'
                                ? 'bg-[#33221f] border-[#6b2b24] text-red-100'
                                : 'bg-[#2b2721] border-[#3d372e] text-[#ddd1ba]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-amber-200">{notif.title}</span>
                              <span className="text-[10px] text-[#a1947f] whitespace-nowrap">{notif.timestamp}</span>
                            </div>
                            <p className="mt-1 text-xs text-[#cfc2aa] leading-relaxed">{notif.message}</p>
                            {targetEvt && (
                              <button
                                onClick={() => {
                                  openEventDetail(targetEvt);
                                  setIsNotifOpen(false);
                                }}
                                className="mt-2 text-[11px] font-semibold text-[#f3da90] hover:underline flex items-center gap-1"
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

            {/* Profile Avatar / Authentication Toggle */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-full bg-[#2c261e] border border-[#443a2d] hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-[#f5ebd7] truncate max-w-[100px] sm:max-w-[130px]">
                      {user.name}
                    </span>
                    <span className="text-[9px] text-[#d49942] font-mono">
                      {user.academic_year} · FLAME
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#c93b2b] text-amber-100 font-bold text-xs flex items-center justify-center border border-amber-300/30">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#a89a84]" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#25211c] border border-[#443c31] rounded-lg shadow-2xl z-50 p-2 text-neutral-200">
                    <div className="px-3 py-2 border-b border-[#383127] mb-1">
                      <p className="text-xs text-[#a89b87]">Signed in as</p>
                      <p className="text-xs font-semibold text-amber-200 truncate">{user.flame_email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-xs text-[#d6cbaf] hover:bg-[#342e26] hover:text-white flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Profile & Timetable</span>
                    </button>

                    <button
                      onClick={() => {
                        openOnboarding();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-xs text-amber-200 hover:bg-[#342e26] hover:text-amber-100 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Retake Student Quiz</span>
                    </button>

                    <button
                      onClick={() => {
                        openSiteFeedback();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-xs text-[#d6cbaf] hover:bg-[#342e26] hover:text-white flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Give Site Feedback</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-xs text-red-300 hover:bg-[#3d2320] flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#a89b87] hidden sm:inline-block font-handwritten text-base">
                  guest mode
                </span>
                <button
                  onClick={() => openAuthModal('Sign in with your FLAME email to save events and build your schedule.')}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#c93b2b] hover:bg-[#b53324] text-amber-100 text-xs sm:text-sm font-semibold rounded-md shadow-md border border-amber-200/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Student Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#312b23] text-xs">
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              currentTab === 'home' ? 'text-amber-300 font-bold' : 'text-[#a89b87]'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleTabClick('explore')}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              currentTab === 'explore' ? 'text-amber-300 font-bold' : 'text-[#a89b87]'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => handleTabClick('applications')}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              currentTab === 'applications' ? 'text-amber-300 font-bold' : 'text-[#a89b87]'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span>Apply</span>
          </button>

          <button
            onClick={() => handleTabClick('my-plan')}
            className={`flex flex-col items-center py-1 px-2 rounded relative ${
              currentTab === 'my-plan' ? 'text-amber-300 font-bold' : 'text-[#a89b87]'
            }`}
          >
            <div className="relative">
              <Calendar className="w-4 h-4 mb-0.5" />
              {!isAuthenticated && (
                <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-2" />
              )}
            </div>
            <span>Plan</span>
          </button>

          <button
            onClick={() => handleTabClick('campus-map')}
            className={`flex flex-col items-center py-1 px-2 rounded relative ${
              currentTab === 'campus-map' ? 'text-amber-300 font-bold' : 'text-[#a89b87]'
            }`}
          >
            <div className="relative">
              <MapPin className="w-4 h-4 mb-0.5" />
              {!isAuthenticated && (
                <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-2" />
              )}
            </div>
            <span>Map</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => handleTabClick('profile')}
              className={`flex flex-col items-center py-1 px-2 rounded ${
                currentTab === 'profile' ? 'text-amber-300 font-bold' : 'text-[#a89b87]'
              }`}
            >
              <User className="w-4 h-4 mb-0.5" />
              <span>Profile</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
