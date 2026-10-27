'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { EventItem } from '@/types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

interface DayColumnInfo {
  dayName: string;
  fullName: string;
  dateStr: string;
  formattedDate: string;
  isToday: boolean;
  events: EventItem[];
}

export const YourWeek: React.FC<{ eventsProp?: EventItem[] }> = ({ eventsProp }) => {
  const { 
    events: contextEvents, 
    goingEventIds, 
    openEventDetail, 
    setCurrentTab,
    isAuthenticated,
    openAuthModal 
  } = useApp();
  
  const rawEvents = eventsProp || contextEvents;

  // Week offset: 0 is current week, 1 is next week, -1 is previous week
  const [weekOffset, setWeekOffset] = useState(0);
  const [baseDate, setBaseDate] = useState<Date>(() => new Date(2026, 9, 18));
  const [todayIsoDate, setTodayIsoDate] = useState('2026-10-18');
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const today = new Date();
    setBaseDate(today);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setTodayIsoDate(`${y}-${m}-${d}`);
  }, []);

  // ONLY SHOW EVENTS IF THE USER HAS PUT "I'M GOING"
  const myGoingEvents = (rawEvents || []).filter(
    (e) => goingEventIds.includes(e.id) && e.item_type !== 'application' && e.status !== 'Cancelled'
  );

  // Compute the 7 days of the week starting from Monday
  const getWeekDays = (base: Date, offsetWeeks: number): DayColumnInfo[] => {
    const currentDayOfWeek = base.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    // In a Mon-Sun week, distance to Monday:
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + diffToMonday + offsetWeeks * 7
    );

    const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayFulls = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const days: DayColumnInfo[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;

      // Only match events that the student has marked "I'm Going" to
      const matchingEvents = myGoingEvents
        .filter((e) => e.date === dateStr)
        .sort((a, b) => {
          const timeA = a.time_start || a.time_start_end.split('-')[0]?.trim() || '';
          const timeB = b.time_start || b.time_start_end.split('-')[0]?.trim() || '';
          return timeA.localeCompare(timeB);
        });

      days.push({
        dayName: dayShorts[i],
        fullName: dayFulls[i],
        dateStr,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: dateStr === todayIsoDate,
        events: matchingEvents,
      });
    }

    return days;
  };

  const weekDays = getWeekDays(baseDate, weekOffset);

  // Total going events this specific week
  const totalEventsThisWeek = weekDays.reduce((acc, d) => acc + d.events.length, 0);

  // Date range label for header
  const weekStartFormatted = weekDays[0]?.formattedDate || '';
  const weekEndFormatted = weekDays[6]?.formattedDate || '';

  // Check if there are other going events in next week when current week is empty
  const hasGoingNextWeek = weekOffset === 0 && totalEventsThisWeek === 0 && myGoingEvents.some((e) => {
    return e.date > (weekDays[6]?.dateStr || '');
  });

  const toggleExpandDay = (dateStr: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  return (
    <div className="bg-[#131017] border border-white/5 rounded-3xl p-5 sm:p-7 shadow-2xl mb-10 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-white/5 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md shadow-rose-950/40">
              Weekly Overview
            </span>
            <span className="text-xs text-rose-300/80 font-handwritten text-base">
              Monday to Sunday
            </span>

            {/* Week navigation buttons */}
            <div className="inline-flex items-center gap-1.5 ml-1 sm:ml-3 bg-[#181422] px-2.5 py-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-rose-200 px-1 font-semibold">
                {weekStartFormatted} – {weekEndFormatted}
              </span>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="text-[10px] px-2.5 py-1 bg-white/5 hover:bg-white/10 text-rose-300 border border-rose-500/30 rounded-full font-semibold transition-all cursor-pointer"
              >
                Jump to This Week
              </button>
            )}

            {hasGoingNextWeek && (
              <button
                type="button"
                onClick={() => setWeekOffset(1)}
                className="text-[10px] px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-full font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>View next week&apos;s RSVPs →</span>
              </button>
            )}
          </div>

          <h3 className="font-editorial text-2xl font-bold text-white mt-2">
            Your Week at FLAME
          </h3>
          <p className="text-xs text-neutral-400 font-sans-ui mt-0.5">
            Events you&apos;ve marked &ldquo;I&apos;m Going&rdquo; to
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('my-plan')}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group self-start md:self-auto cursor-pointer transition-colors"
        >
          <span>View your full plan</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Monday - Sunday 7-Day Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const isToday = day.isToday;
          const hasEvents = day.events.length > 0;
          const isExpanded = !!expandedDays[day.dateStr];
          const displayedDayEvents = isExpanded ? day.events : day.events.slice(0, 3);
          const remainingCount = day.events.length - 3;

          return (
            <div
              key={day.dateStr}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col min-h-[220px] ${
                isToday
                  ? 'bg-[#1b1422] border-rose-500/50 shadow-xl shadow-rose-950/30 ring-1 ring-rose-500/30'
                  : 'bg-[#16131c] border-white/5 hover:border-white/10'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-sm font-bold text-white">
                    {day.dayName}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {day.formattedDate}
                  </span>
                </div>

                {isToday && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white text-[9px] font-bold rounded-full tracking-wider uppercase shadow-xs">
                    Today
                  </span>
                )}
              </div>

              {/* Event Counter Badge */}
              <div className="pt-1.5 pb-2 text-[10px] font-mono flex items-center justify-between">
                <span className={hasEvents ? 'text-rose-300 font-medium' : 'text-neutral-500'}>
                  {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Day's Event List */}
              <div className="space-y-2 flex-1 flex flex-col">
                {!hasEvents ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-3 text-center rounded-xl border border-dashed border-white/5 bg-[#120f18]/50">
                    <span className="text-[11px] text-neutral-500 font-sans-ui italic">
                      No events
                    </span>
                  </div>
                ) : (
                  <>
                    {displayedDayEvents.map((evt) => {
                      return (
                        <div
                          key={evt.id}
                          onClick={() => openEventDetail(evt)}
                          className="p-2.5 rounded-xl bg-[#1d1826] hover:bg-[#251e30] border border-rose-500/20 hover:border-rose-500/50 transition-all text-left cursor-pointer group shadow-xs hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="text-[11px] font-bold text-white group-hover:text-rose-300 line-clamp-2 leading-tight transition-colors">
                              {evt.event_name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-rose-300/90 font-mono mt-1">
                            <Clock className="w-2.5 h-2.5 text-[#ff2d55] shrink-0" />
                            <span className="truncate">
                              {evt.time_start_end || evt.time_start || 'TBD'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-white/5 text-[9px]">
                            <span 
                              className="text-neutral-400 truncate font-sans-ui max-w-[80px]" 
                              title={evt.room_specific || evt.venue_zone}
                            >
                              {evt.room_specific || evt.venue_zone}
                            </span>
                            <span className="px-1.5 py-0.5 bg-white/5 text-rose-300 rounded-md border border-white/10 shrink-0 font-medium truncate max-w-[75px]">
                              {evt.category}
                            </span>
                          </div>

                          <div className="mt-1.5 pt-1 border-t border-white/5 flex items-center gap-1 text-[8px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Going ✓</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* View more toggle if > 3 events */}
                    {remainingCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandDay(day.dateStr);
                        }}
                        className="w-full text-center py-1 text-[10px] font-medium text-rose-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Show less' : `+${remainingCount} more`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
