'use client';

import React, { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { EventCard } from '../EventCard';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

export const HappeningSoon: React.FC<{ eventsProp?: import('@/types').EventItem[] }> = ({ eventsProp }) => {
  const { events: contextEvents, savedEventIds } = useApp();
  const events = eventsProp || contextEvents;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [dateRange, setDateRange] = React.useState<{ today: string; sevenDaysLater: string }>({
    today: '',
    sevenDaysLater: '',
  });

  React.useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    const endYear = end.getFullYear();
    const endMonth = String(end.getMonth() + 1).padStart(2, '0');
    const endDay = String(end.getDate()).padStart(2, '0');
    const sevenDaysLater = `${endYear}-${endMonth}-${endDay}`;

    setDateRange({ today, sevenDaysLater });
  }, []);

  // Filter events happening in the next 7 days from today's date
  // Order: Saved events first (soonest to latest), followed by other events (soonest to latest)
  const upcomingEvents = events
    .filter((e) => {
      if (e.item_type === 'application') return false;
      if (e.status === 'Cancelled' || e.status === 'Completed') return false;
      return e.date >= dateRange.today && e.date <= dateRange.sevenDaysLater;
    })
    .sort((a, b) => {
      const aSaved = savedEventIds.includes(a.id);
      const bSaved = savedEventIds.includes(b.id);
      // Saved events appear before other events
      if (aSaved && !bSaved) return -1;
      if (!aSaved && bSaved) return 1;

      // Soonest date to latest date
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // Soonest time to latest time
      const aTime = a.time_start || a.time_start_end || '';
      const bTime = b.time_start || b.time_start_end || '';
      return aTime.localeCompare(bTime);
    });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-10 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md shadow-rose-950/40">
              Next 7 Days
            </span>
            <span className="text-xs text-rose-300/80 font-handwritten text-base">
              swipe to explore
            </span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1 flex items-center gap-2">
            <span>Happening Soon</span>
            <Flame className="w-5 h-5 text-[#ff2d55]" />
          </h3>
        </div>

        {/* Scroll Controls */}
        {upcomingEvents.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-[#15121b] border border-white/5 hover:border-white/10 text-neutral-300 hover:text-white transition-all shadow-md"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-[#15121b] border border-white/5 hover:border-white/10 text-neutral-300 hover:text-white transition-all shadow-md"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontally Scrollable Row or Empty State */}
      {upcomingEvents.length === 0 ? (
        <div className="py-8 px-6 text-center bg-[#131017] border border-dashed border-white/10 rounded-2xl">
          <p className="font-handwritten text-xl text-rose-300 mb-1">
            Nothing scheduled in the next 7 days ☕
          </p>
          <p className="text-xs text-neutral-400">
            Check out the Campus Discovery Board below or post an event using the + button!
          </p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto custom-scrollbar pb-6 pt-3 px-1 -mx-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {upcomingEvents.map((evt, idx) => (
            <div
              key={evt.id}
              className="shrink-0 w-72 sm:w-80"
              style={{ scrollSnapAlign: 'start' }}
            >
              <EventCard event={evt} rotationIndex={idx} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
