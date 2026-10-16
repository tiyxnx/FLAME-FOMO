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
  Compass 
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

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 0. 2-Day Auto-Expiry Rule: Remove from all events after 2 days of happening unless favourited
      if (timeFilter !== 'Past') {
        if (!isEventActive(evt, favouriteEventIds)) {
          return false;
        }
      }

      // 1. Search Query
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

      // 2. Category Filter
      if (selectedCategory !== 'All' && evt.category !== selectedCategory) {
        return false;
      }

      // 3. Time Filter
      if (timeFilter === 'Today' && evt.date !== todayStr) return false;
      if (timeFilter === 'Tomorrow' && evt.date !== tomorrowStr) return false;
      if (timeFilter === 'Past' && evt.date >= todayStr) return false;

      // 4. "Fits My Schedule" toggle
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
  }, [events, searchQuery, selectedCategory, timeFilter, fitsMyScheduleOnly, isAuthenticated, user, todayStr, tomorrowStr, savedEventIds, favouriteEventIds]);

  const handleFitsScheduleToggle = () => {
    if (!isAuthenticated) {
      openAuthModal('Sign in with your FLAME email to enable timetable clash filtering.');
      return;
    }
    setFitsMyScheduleOnly(!fitsMyScheduleOnly);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Editorial Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="stamp-urgent text-xs bg-amber-950/60 border-amber-500 text-amber-200">
            All Events
          </span>
          <span className="text-xs text-[#a89b87] font-handwritten text-base">
            everything in one place
          </span>
        </div>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#f5ebd7] mt-1">
          Explore All Events
        </h2>
        <p className="text-xs sm:text-sm text-[#b8ab96] font-sans-ui mt-0.5">
          Browse and filter all events happening at FLAME.
        </p>
      </div>

      {/* Top-Anchored Filter Bar as specified in read.md Section 6.2 */}
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
          <span>
            Showing <strong className="text-amber-200 font-mono">{filteredEvents.length}</strong> {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>

          {(searchQuery || selectedCategory !== 'All' || timeFilter !== 'All' || fitsMyScheduleOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setTimeFilter('All');
                setFitsMyScheduleOnly(false);
              }}
              className="text-[#f3da90] hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Flexible Masonry / Collage Grid as specified in read.md Section 6.2 */}
      {filteredEvents.length === 0 ? (
        <EmptyStateScrapbook
          title="No Events Found"
          subtitle="Try loosening your search or category filters, or check out a spontaneous campus prompt below!"
          actionButton={{
            label: "Reset All Filters",
            onClick: () => {
              setSearchQuery('');
              setSelectedCategory('All');
              setTimeFilter('All');
              setFitsMyScheduleOnly(false);
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
