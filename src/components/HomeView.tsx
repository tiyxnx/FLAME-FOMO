'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DontForget } from './home/DontForget';
import { HappeningSoon } from './home/HappeningSoon';
import { YourWeek } from './home/YourWeek';
import { EventCard } from './EventCard';
import { EVENT_CATEGORIES, isEventActive } from '@/lib/constants';
import { EventCategory } from '@/types';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Compass, 
  Filter, 
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { events, savedEventIds, favouriteEventIds, goingEventIds, setCurrentTab } = useApp();

  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [dateFormatted, setDateFormatted] = useState('Wednesday, Oct 7, 2026');
  const [todayIsoStr, setTodayIsoStr] = useState('');

  useEffect(() => {
    const today = new Date();
    setDateFormatted(
      today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
    setTodayIsoStr(today.toISOString().split('T')[0]);
  }, []);

  // Filter featured cards with 2-day auto-expiry rule (or indefinitely if favourited)
  const displayedEvents = events.filter((evt) => {
    // Applications strictly belong to the Applications tab, never regular events
    if (evt.item_type === 'application') {
      return false;
    }

    // 2-day auto-expiry rule: remove from discovery collage after 2 days unless favourited
    if (!isEventActive(evt, favouriteEventIds)) {
      return false;
    }

    if (selectedQuickCategory !== 'All') {
      const eventCats = Array.isArray(evt.categories) && evt.categories.length > 0
        ? evt.categories
        : (evt.category ? evt.category.split(',').map((c: string) => c.trim()) : []);
      const matchCat = eventCats.some((c: string) => c.toLowerCase() === selectedQuickCategory.toLowerCase());
      if (!matchCat) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        evt.event_name.toLowerCase().includes(q) ||
        evt.organizer.toLowerCase().includes(q) ||
        evt.venue_zone.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const todayStr = todayIsoStr || (typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-10-17');
    const aCompleted = a.status === 'Completed' || a.status === 'Cancelled' || (todayStr ? a.date < todayStr : false);
    const bCompleted = b.status === 'Completed' || b.status === 'Cancelled' || (todayStr ? b.date < todayStr : false);

    // 1. Ended events NEVER appear before active events (they go to the bottom)
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    
    // 2. Active events in order of when they were posted: recent ones -> old posted
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA && timeB && timeA !== timeB) {
      return timeB - timeA;
    }

    const indexA = events.indexOf(a);
    const indexB = events.indexOf(b);
    if (indexA !== -1 && indexB !== -1 && indexA !== indexB) {
      return indexA - indexB;
    }

    return b.date.localeCompare(a.date);
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Hero Section matching Image 2 with Enclosed Dark Container & Crimson Ambient Glow */}
      <div className="relative mb-8 rounded-3xl bg-[#131017] border border-white/5 p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Ambient Wine/Crimson Glow on Right Side */}
        <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-gradient-to-l from-rose-950/25 via-rose-900/10 to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#ff2d55]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            {/* Date Pill with Calendar Icon matching Picture 2 */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181119] border border-[#ff2d55]/35 text-xs font-mono tracking-wider uppercase text-[#ff6b81] mb-4 shadow-sm">
              <CalendarIcon className="w-3.5 h-3.5 text-[#ff2d55]" />
              <span>{dateFormatted.toUpperCase()}</span>
            </div>

            {/* Bold Expanded Italic Typography matching Picture 2 */}
            <div className="space-y-1">
              <h1 className="font-display-hero text-5xl sm:text-7xl text-white tracking-wider leading-none select-none">
                FLAME
              </h1>
              <h1 className="font-display-hero text-5xl sm:text-7xl bg-gradient-to-r from-[#ff2252] via-[#ff436b] to-[#ff758f] bg-clip-text text-transparent tracking-wider leading-none pr-4 inline-block select-none">
                FOMO
              </h1>
            </div>
            
            {/* Subtitle Quote */}
            <p className="text-sm sm:text-base text-neutral-300 font-serif italic mt-4 tracking-wide">
              &quot;Don&apos;t just hear about it — experience it live.&quot;
            </p>
          </div>

          {/* Right Column: Find Opportunities Search Input matching Image 2 */}
          <div className="w-full lg:w-96 flex flex-col">
            <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 font-mono mb-2">
              FIND OPPORTUNITIES
            </span>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events, clubs, sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-3 bg-[#191522]/90 border border-white/10 rounded-full text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explore Categories Section matching Image 2 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff2d55]" />
            <span>EXPLORE CATEGORIES</span>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline-block">Horizontal scroll</span>
        </div>

        {/* Horizontal Quick-Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedQuickCategory('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedQuickCategory === 'All'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white shadow-lg shadow-rose-950/40'
                : 'bg-[#15121b] text-neutral-300 hover:text-white hover:bg-white/5 border border-white/5'
            }`}
          >
            All Categories
          </button>

          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedQuickCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedQuickCategory === cat
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white shadow-lg shadow-rose-950/40'
                  : 'bg-[#15121b] text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Priority 1: Don't Forget */}
      <DontForget eventsProp={displayedEvents} />

      {/* Priority: Happening Soon (Next 7 Days) */}
      <HappeningSoon eventsProp={displayedEvents} />

      {/* Your Week */}
      <YourWeek eventsProp={events} />

      {/* Here's everything that's happening */}
      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
              Here&apos;s everything that&apos;s happening
            </h3>
            <p className="text-xs text-neutral-400 font-sans-ui mt-0.5">
              All upcoming events at FLAME.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('explore')}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {displayedEvents.slice(0, 6).map((evt, idx) => (
            <EventCard key={evt.id} event={evt} rotationIndex={idx} />
          ))}
        </div>
      </div>

    </div>
  );
};

