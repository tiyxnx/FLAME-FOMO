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
    openAuthModal 
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

  // Check if current user is author of an event
  const isUserAuthor = (evt: EventItem) => {
    if (!isAuthenticated || !user?.flame_email || !evt.submitted_by) return false;
    const email = user.flame_email.toLowerCase().trim();
    const username = email.split('@')[0];
    const sub = evt.submitted_by.toLowerCase().trim();
    return sub === email || sub === username;
  };

  // Events submitted by the authenticated user
  const userSubmittedEvents = useMemo(() => {
    return events.filter(isUserAuthor);
  }, [events, isAuthenticated, user]);

  const hasPostedEvents = userSubmittedEvents.length > 0;

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
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
      const todayString = todayStr;
      const aCompleted = a.status === 'Completed' || (todayString ? a.date < todayString : false);
      const bCompleted = b.status === 'Completed' || (todayString ? b.date < todayString : false);

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      
      // For upcoming events: Chronological order (soonest to latest)
      if (!aCompleted && !bCompleted) {
        return a.date.localeCompare(b.date);
      }

      // For completed events: Favourited events show up before other completed events
      const aFav = favouriteEventIds.includes(a.id);
      const bFav = favouriteEventIds.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      return b.date.localeCompare(a.date);
    });
  }, [events, searchQuery, selectedCategory, timeFilter, fitsMyScheduleOnly, isAuthenticated, user, todayStr, tomorrowStr, savedEventIds, favouriteEventIds, viewMyEventsOnly]);

  const handleFitsScheduleToggle = () => {
    if (!isAuthenticated) {
      openAuthModal('Sign in with your FLAME email to enable timetable clash filtering.');
      return;
    }
    setFitsMyScheduleOnly(!fitsMyScheduleOnly);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Editorial Title & View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-urgent text-xs bg-amber-950/60 border-amber-500 text-amber-200">
              {viewMyEventsOnly ? 'My Events' : 'All Events'}
            </span>
            <span className="text-xs text-[#a89b87] font-handwritten text-base">
              {viewMyEventsOnly ? 'events you created & manage' : 'everything in one place'}
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#f5ebd7] mt-1">
            {viewMyEventsOnly ? 'My Events' : 'Explore All Events'}
          </h2>
          <p className="text-xs sm:text-sm text-[#b8ab96] font-sans-ui mt-0.5">
            {viewMyEventsOnly
              ? `You have posted ${userSubmittedEvents.length} ${userSubmittedEvents.length === 1 ? 'event' : 'events'} on FLAME FOMO. Edit or delete them anytime.`
              : 'Browse and filter all events happening at FLAME.'}
          </p>
        </div>

        {/* "My Events" Tab Toggle (Only shown if user has posted on website) */}
        {hasPostedEvents && (
          <div className="flex items-center gap-1.5 bg-[#1b1814] p-1.5 rounded-sm border border-[#3e3428] shrink-0 self-start sm:self-center shadow-lg">
            <button
              onClick={() => setViewMyEventsOnly(false)}
              className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all ${
                !viewMyEventsOnly
                  ? 'bg-amber-300 text-neutral-950 shadow-sm'
                  : 'text-[#c4b59d] hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setViewMyEventsOnly(true)}
              className={`px-3.5 py-1.5 rounded-xs text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMyEventsOnly
                  ? 'bg-[#c93b2b] text-white shadow-sm ring-1 ring-red-400'
                  : 'text-[#c4b59d] hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Events</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                viewMyEventsOnly ? 'bg-red-950/80 text-amber-200' : 'bg-neutral-800 text-neutral-300'
              }`}>
                {userSubmittedEvents.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Top-Anchored Filter Bar */}
      <div className="bg-[#221e19] border border-[#3e3428] rounded-sm p-4 shadow-xl mb-8 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, clubs, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#171512] border border-[#42392d] rounded-sm text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
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
              className="w-full px-3 py-2 bg-[#171512] border border-[#42392d] rounded-sm text-xs font-semibold text-neutral-200 focus:outline-none focus:border-amber-400"
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#171512] border border-[#42392d] rounded-sm text-xs font-semibold text-neutral-200 focus:outline-none focus:border-amber-400"
            >
              <option value="All">Category: All Categories</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          </div>

          {/* "Fits My Schedule" Toggle Button */}
          <button
            onClick={handleFitsScheduleToggle}
            className={`px-3 py-2 rounded-sm border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              fitsMyScheduleOnly
                ? 'bg-amber-300 text-neutral-950 border-amber-400 shadow-md ring-2 ring-amber-300/40'
                : 'bg-[#171512] text-[#d6cbaf] border-[#42392d] hover:border-neutral-400'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
              fitsMyScheduleOnly ? 'bg-neutral-900 border-black' : 'border-neutral-500'
            }`}>
              {fitsMyScheduleOnly && <Check className="w-2.5 h-2.5 text-amber-300" />}
            </div>
            <span>Fits My Schedule</span>
          </button>

        </div>

        {/* Quick pill count summary */}
        <div className="flex items-center justify-between text-xs text-[#a89b87] pt-2 border-t border-[#312a20]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-amber-200 font-mono">{filteredEvents.length}</strong> {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
            {viewMyEventsOnly && (
              <span className="text-[10px] bg-red-950/80 text-amber-200 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                My Events Only
              </span>
            )}
          </div>

          {(searchQuery || selectedCategory !== 'All' || timeFilter !== 'All' || fitsMyScheduleOnly || viewMyEventsOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setTimeFilter('All');
                setFitsMyScheduleOnly(false);
                setViewMyEventsOnly(false);
              }}
              className="text-[#f3da90] hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
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
