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
  ChevronRight 
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
    const todayStr = todayIsoStr;
    const aCompleted = a.status === 'Completed' || (todayStr ? a.date < todayStr : false);
    const bCompleted = b.status === 'Completed' || (todayStr ? b.date < todayStr : false);

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

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Hero Section */}
      <div className="relative mb-6 sm:mb-8 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#3b3327]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#a89b87] font-mono tracking-wider uppercase">
                {dateFormatted}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl font-black text-[#fbf7ee] tracking-tight leading-[1.15] flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
              <span>FLAME <span className="text-[#e25845] italic font-serif">FOMO</span></span>
              <span className="text-xl sm:text-3xl font-sans-ui font-bold text-[#f5d688] tracking-normal drop-shadow-sm">
                (no more)
              </span>
            </h1>
          </div>

          {/* Compact Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, clubs, sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1b1915] border border-[#3f3528] rounded-sm text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Horizontal Quick-Filter Pills for Categories */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 custom-scrollbar">
          <button
            onClick={() => setSelectedQuickCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedQuickCategory === 'All'
                ? 'bg-[#c93b2b] text-amber-100 shadow-md ring-1 ring-red-400'
                : 'bg-[#221e19] text-[#cfc2a9] hover:bg-[#2c2620] border border-[#3b3226]'
            }`}
          >
            All Categories
          </button>

          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedQuickCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedQuickCategory === cat
                  ? 'bg-amber-300 text-neutral-950 font-bold shadow-md'
                  : 'bg-[#221e19] text-[#cfc2a9] hover:bg-[#2c2620] border border-[#3b3226]'
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
      <YourWeek eventsProp={displayedEvents} />

      {/* Here's everything that's happening */}
      <div className="pt-4 border-t border-[#3b3327]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-100">
              Here&apos;s everything that&apos;s happening
            </h3>
            <p className="text-xs text-[#a89b87] font-sans-ui mt-0.5">
              All upcoming events at FLAME.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('explore')}
            className="text-xs font-semibold text-amber-200 hover:text-amber-100 flex items-center gap-1"
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
