'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { EventCard } from './EventCard';
import { EmptyStateScrapbook } from './EmptyStateScrapbook';
import { EVENT_CATEGORIES, isEventActive } from '@/lib/constants';
import { EventCategory, EventItem } from '@/types';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Sparkles, 
  Check, 
  X,
  Compass,
  UserCheck
} from 'lucide-react';

export const ExploreView: React.FC = () => {
  const { 
    events, 
    user, 
    isAuthenticated, 
    savedEventIds, 
    goingEventIds, 
    favouriteEventIds,
    openAuthModal,
    isUserAuthor,
    canCreateEvents,
    setCurrentTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<'All' | 'Today' | 'Tomorrow' | 'This Week' | 'Past'>('All');
  const [fitsMyScheduleOnly, setFitsMyScheduleOnly] = useState(false);
  const [viewMyEventsOnly, setViewMyEventsOnly] = useState(false);

  const [todayStr, setTodayStr] = useState('2026-10-07');
  const [tomorrowStr, setTomorrowStr] = useState('2026-10-08');

  useEffect(() => {
    const today = new Date();
    setTodayStr(today.toISOString().split('T')[0]);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTomorrowStr(tomorrow.toISOString().split('T')[0]);
  }, []);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Events submitted by the authenticated user / current author (excluding applications)
  const userSubmittedEvents = useMemo(() => {
    return events.filter((e) => e.item_type !== 'application' && isUserAuthor(e));
  }, [events, isUserAuthor]);

  const hasPostedEvents = userSubmittedEvents.length > 0;

  const userInterests = useMemo(() => {
    return user?.category_preferences || [];
  }, [user?.category_preferences]);

  // Helper: Extract all categories for an event
  const getEventCategories = (evt: EventItem): string[] => {
    if (Array.isArray(evt.categories) && evt.categories.length > 0) {
      return evt.categories;
    }
    if (evt.category) {
      return evt.category.split(',').map((c) => c.trim()).filter(Boolean);
    }
    return [];
  };

  // Helper: Check if event matches user's mapped interests
  const doesEventMatchUserInterest = (evt: EventItem, interests: string[]): boolean => {
    if (!interests || interests.length === 0) return false;
    const cats = getEventCategories(evt);
    return cats.some((c) =>
      interests.some((pref) => pref.toLowerCase() === c.toLowerCase())
    );
  };

  // Helper: Calculate most urgent upcoming timestamp (registration deadline or event date/time)
  const getEventSortTimestamp = (evt: EventItem, nowMs: number): number => {
    let deadlineTime: number | null = null;
    if (evt.registration_deadline) {
      const clean = evt.registration_deadline.replace(' ', 'T');
      const iso = clean.length === 10 ? `${clean}T23:59:59` : (clean.length === 16 ? `${clean}:00` : clean);
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        deadlineTime = d.getTime();
      }
    }

    let eventDateTime: number | null = null;
    if (evt.date) {
      const timeStart = evt.time_start || (evt.time_start_end ? evt.time_start_end.split('-')[0].trim() : '00:00');
      const validTime = /^\d{2}:\d{2}$/.test(timeStart) ? timeStart : '00:00';
      const d = new Date(`${evt.date}T${validTime}:00`);
      if (!isNaN(d.getTime())) {
        eventDateTime = d.getTime();
      }
    }

    // If registration deadline is upcoming, prioritize that urgency
    if (deadlineTime !== null && deadlineTime >= nowMs) {
      return deadlineTime;
    }
    // Otherwise use event date and time
    if (eventDateTime !== null) {
      return eventDateTime;
    }
    // Fallback
    if (deadlineTime !== null) {
      return deadlineTime;
    }
    return Infinity;
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Applications strictly belong to the Applications tab, never regular events
      if (evt.item_type === 'application') return false;

      const isOwn = isUserAuthor(evt);
      const isOver = evt.status === 'Completed' || (todayStr ? evt.date < todayStr : false);

      // 1. My Events vs All Events visibility rule:
      if (viewMyEventsOnly) {
        // In My Events: only show user's own events (both active & past so author can manage/view them)
        if (!isOwn) return false;
      } else {
        // In All Events: "don't show their own events if they're over"
        if (isOwn && isOver) {
          return false;
        }
      }

      // 2. 2-Day Auto-Expiry Rule: Remove from all events after 2 days of happening unless favourited
      if (timeFilter !== 'Past' && !viewMyEventsOnly) {
        if (!isEventActive(evt, favouriteEventIds)) {
          return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = evt.event_name.toLowerCase().includes(q);
        const matchesOrg = evt.organizer.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        const matchesZone = evt.venue_zone.toLowerCase().includes(q);
        const matchesRoom = evt.room_specific?.toLowerCase().includes(q);
        if (!matchesName && !matchesOrg && !matchesDesc && !matchesZone && !matchesRoom) {
          return false;
        }
      }

      // 4. Category Filter
      if (selectedCategory !== 'All') {
        const eventCats = Array.isArray(evt.categories) && evt.categories.length > 0
          ? evt.categories
          : (evt.category ? evt.category.split(',').map((c: string) => c.trim()) : []);
        const matchCat = eventCats.some((c: string) => c.toLowerCase() === selectedCategory.toLowerCase());
        if (!matchCat) return false;
      }

      // 5. Time Filter
      if (timeFilter === 'Today' && evt.date !== todayStr) return false;
      if (timeFilter === 'Tomorrow' && evt.date !== tomorrowStr) return false;
      if (timeFilter === 'Past' && evt.date >= todayStr) return false;

      // 6. "Fits My Schedule" toggle
      if (fitsMyScheduleOnly && isAuthenticated && user) {
        const evtDate = new Date(evt.date);
        const evtDay = dayNames[evtDate.getDay()];
        const evtStart = evt.time_start || evt.time_start_end.split('-')[0]?.trim();
        const evtEnd = evt.time_end || evt.time_start_end.split('-')[1]?.trim();

        if (evtStart && evtEnd) {
          // Check if any class in timetable overlaps
          for (const cls of user.academic_timetable || []) {
            if (cls.day === evtDay) {
              if (
                (evtStart >= cls.timeStart && evtStart < cls.timeEnd) ||
                (evtEnd > cls.timeStart && evtEnd <= cls.timeEnd)
              ) {
                return false; // clashes with timetable
              }
            }
          }
        }
      }

      return true;
    }).sort((a, b) => {
      const todayString = todayStr || (typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-10-17');
      const aCompleted = a.status === 'Completed' || a.status === 'Cancelled' || (todayString ? a.date < todayString : false);
      const bCompleted = b.status === 'Completed' || b.status === 'Cancelled' || (todayString ? b.date < todayString : false);

      // 1. Ended events NEVER appear before active events (they go to the bottom)
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      if (aCompleted && bCompleted) {
        // For past/ended events, sort most recent first
        return b.date.localeCompare(a.date);
      }
      
      // 2. Active Events: Interest mapping prioritization
      // "For interest mapping, Whatever they select should come before on the explore tab and the others should come after based on the deadline/date of event"
      const aMatches = doesEventMatchUserInterest(a, userInterests);
      const bMatches = doesEventMatchUserInterest(b, userInterests);

      if (aMatches && !bMatches) return -1; // Selected interest comes first
      if (!aMatches && bMatches) return 1;  // Others come after

      // 3. Within each group: Order by upcoming deadline or date of event (closest first)
      const nowMs = typeof window !== 'undefined' ? Date.now() : 0;
      const tsA = getEventSortTimestamp(a, nowMs);
      const tsB = getEventSortTimestamp(b, nowMs);

      if (tsA !== tsB) {
        return tsA - tsB;
      }

      // Tie breaker 1: Alphabetical date
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      // Tie breaker 2: Time start
      const timeStartA = a.time_start || (a.time_start_end ? a.time_start_end.split('-')[0].trim() : '');
      const timeStartB = b.time_start || (b.time_start_end ? b.time_start_end.split('-')[0].trim() : '');
      if (timeStartA && timeStartB && timeStartA !== timeStartB) {
        return timeStartA.localeCompare(timeStartB);
      }

      return a.event_name.localeCompare(b.event_name);
    });
  }, [events, searchQuery, selectedCategory, timeFilter, fitsMyScheduleOnly, isAuthenticated, user, userInterests, todayStr, tomorrowStr, savedEventIds, favouriteEventIds, viewMyEventsOnly]);

  const handleFitsScheduleToggle = () => {
    if (!isAuthenticated) {
      openAuthModal('Sign in with your FLAME email to enable timetable clash filtering.');
      return;
    }
    setFitsMyScheduleOnly(!fitsMyScheduleOnly);
  };

  // Sectioning logic: show interest group & other group when exploring all categories
  const showInterestSections = 
    selectedCategory === 'All' && 
    !viewMyEventsOnly && 
    timeFilter !== 'Past' && 
    userInterests.length > 0;

  const interestEvents = useMemo(() => {
    if (!showInterestSections) return [];
    return filteredEvents.filter((evt) => doesEventMatchUserInterest(evt, userInterests));
  }, [filteredEvents, showInterestSections, userInterests]);

  const otherEvents = useMemo(() => {
    if (!showInterestSections) return filteredEvents;
    return filteredEvents.filter((evt) => !doesEventMatchUserInterest(evt, userInterests));
  }, [filteredEvents, showInterestSections, userInterests]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Editorial Title & View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md shadow-rose-950/40">
              {viewMyEventsOnly ? 'My Events' : 'All Events'}
            </span>
            <span className="text-xs text-rose-300/80 font-handwritten text-base">
              {viewMyEventsOnly ? 'events you created & manage' : 'everything in one place'}
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1">
            {viewMyEventsOnly ? 'My Events' : 'Explore All Events'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans-ui mt-0.5">
            {viewMyEventsOnly
              ? `You have posted ${userSubmittedEvents.length} ${userSubmittedEvents.length === 1 ? 'event' : 'events'} on FLAME FOMO. Edit or delete them anytime.`
              : 'Browse and filter all events happening at FLAME.'}
          </p>
        </div>

        {/* "My Events" Tab Toggle (Only shown if user has posted on website and can create events) */}
        {hasPostedEvents && canCreateEvents && (
          <div className="flex items-center gap-1.5 bg-[#15121b] p-1.5 rounded-full border border-white/5 shrink-0 self-start sm:self-center shadow-lg">
            <button
              onClick={() => setViewMyEventsOnly(false)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                !viewMyEventsOnly
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setViewMyEventsOnly(true)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMyEventsOnly
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Events</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                viewMyEventsOnly ? 'bg-rose-950/80 text-rose-200' : 'bg-neutral-800 text-neutral-300'
              }`}>
                {userSubmittedEvents.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Top-Anchored Filter Bar */}
      <div className="bg-[#131017] border border-white/5 rounded-3xl p-5 shadow-2xl mb-8 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, clubs, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#181422] border border-white/10 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500/60 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Filter Dropdown */}
          <div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-[#181422] border border-white/10 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-rose-500/60"
            >
              <option value="All">Time: All Upcoming Dates</option>
              <option value="Today">Time: Happening Today</option>
              <option value="Tomorrow">Time: Happening Tomorrow</option>
              <option value="Past">Time: Past & Closed</option>
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div>
            <select
              value={viewMyEventsOnly ? 'MY_EVENTS' : selectedCategory}
              onChange={(e) => {
                if (e.target.value === 'MY_EVENTS') {
                  setViewMyEventsOnly(true);
                } else {
                  setViewMyEventsOnly(false);
                  setSelectedCategory(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-[#181422] border border-white/10 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-rose-500/60"
            >
              <option value="All">Category: All Categories</option>
              {hasPostedEvents && (
                <option value="MY_EVENTS">✦ My Events ({userSubmittedEvents.length})</option>
              )}
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          </div>

          {/* "Fits My Schedule" Toggle Button */}
          <button
            onClick={handleFitsScheduleToggle}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              fitsMyScheduleOnly
                ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white border-rose-400 shadow-md ring-2 ring-rose-500/30'
                : 'bg-[#181422] text-neutral-300 border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
              fitsMyScheduleOnly ? 'bg-white border-white text-rose-600' : 'border-neutral-500'
            }`}>
              {fitsMyScheduleOnly && <Check className="w-2.5 h-2.5 text-[#ff2d55]" />}
            </div>
            <span>Fits My Schedule</span>
          </button>

        </div>

        {/* Quick pill count summary & My Events toolbar button */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 pt-3 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing <strong className="text-amber-200 font-mono">{filteredEvents.length}</strong> {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
            {viewMyEventsOnly && (
              <span className="text-[10px] bg-red-950/80 text-amber-200 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                My Events Only
              </span>
            )}
            {showInterestSections && interestEvents.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-950/70 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded-full font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Interests prioritized first</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasPostedEvents && (
              <button
                type="button"
                onClick={() => setViewMyEventsOnly(!viewMyEventsOnly)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMyEventsOnly
                    ? 'bg-[#c93b2b] text-white shadow-xs ring-1 ring-red-400'
                    : 'bg-[#1b1814] text-[#d6cbaf] hover:text-white border border-[#42392d]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{viewMyEventsOnly ? 'View All Events' : `My Events (${userSubmittedEvents.length})`}</span>
              </button>
            )}

            {(searchQuery || selectedCategory !== 'All' || timeFilter !== 'All' || fitsMyScheduleOnly || viewMyEventsOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setTimeFilter('All');
                  setFitsMyScheduleOnly(false);
                  setViewMyEventsOnly(false);
                }}
                className="text-[#f3da90] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Flexible Masonry / Collage Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyStateScrapbook
          title={viewMyEventsOnly ? "No Events Found in My Events" : "No Events Found"}
          subtitle={
            viewMyEventsOnly
              ? "You haven't posted any events matching these search or filter criteria."
              : "Try loosening your search or category filters, or check out a spontaneous campus prompt below!"
          }
          actionButton={{
            label: viewMyEventsOnly ? "Show All Events" : "Reset All Filters",
            onClick: () => {
              setSearchQuery('');
              setSelectedCategory('All');
              setTimeFilter('All');
              setFitsMyScheduleOnly(false);
              setViewMyEventsOnly(false);
            },
          }}
        />
      ) : showInterestSections && interestEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 pt-2">
          {/* Section 1: Tailored to Your Interests */}
          <div className="col-span-full pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-amber-950/40 via-[#262019] to-transparent border border-amber-500/30 rounded-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-editorial text-sm sm:text-base font-bold text-amber-100">
                    Tailored to Your Interests
                  </span>
                  <span className="text-xs text-[#a89b87]">
                    ({userInterests.join(', ')})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-amber-300/80 font-mono">
                  {interestEvents.length} {interestEvents.length === 1 ? 'event' : 'events'} · Earliest deadline first
                </span>
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="text-[11px] text-amber-400 hover:text-amber-200 underline cursor-pointer"
                >
                  Edit interests
                </button>
              </div>
            </div>
          </div>

          {/* Interest-matched event cards */}
          {interestEvents.map((evt, idx) => (
            <EventCard key={evt.id} event={evt} rotationIndex={idx} />
          ))}

          {/* Section 2 Divider: More Campus Events */}
          {otherEvents.length > 0 && (
            <>
              <div className="col-span-full pt-8 pb-2">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#3d3326]" />
                  </div>
                  <div className="relative bg-[#171512] px-4 text-center">
                    <div className="flex items-center gap-2 justify-center text-xs font-bold uppercase tracking-wider text-[#d6cbaf] font-mono">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>More Campus Events</span>
                      <span className="text-[10px] text-neutral-500 font-normal lowercase">(all other categories)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Sorted by upcoming deadline &amp; event date
                    </p>
                  </div>
                </div>
              </div>

              {/* Other event cards */}
              {otherEvents.map((evt, idx) => (
                <EventCard key={evt.id} event={evt} rotationIndex={interestEvents.length + idx} />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 pt-2">
          {filteredEvents.map((evt, idx) => (
            <EventCard key={evt.id} event={evt} rotationIndex={idx} />
          ))}
        </div>
      )}

    </div>
  );
};
