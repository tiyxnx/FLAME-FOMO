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
  const { events: contextEvents, goingEventIds, openEventDetail, setCurrentTab } = useApp();
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

  // Filter out club applications and cancelled events for this campus overview
  const campusEvents = (rawEvents || []).filter(
    (e) => e.item_type !== 'application' && e.status !== 'Cancelled'
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

      // Find events matching this exact date
      const matchingEvents = campusEvents
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

  // Date range label for header
  const weekStartFormatted = weekDays[0]?.formattedDate || '';
  const weekEndFormatted = weekDays[6]?.formattedDate || '';

  const toggleExpandDay = (dateStr: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  return (
    <div className="bg-[#201c18] border border-[#3b3327] rounded-sm p-5 sm:p-6 shadow-xl mb-10 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#383025] mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-[#d49942] text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xs">
              Weekly Overview
            </span>
            <span className="text-xs text-[#a89a83] font-handwritten text-base">
              Monday to Sunday
            </span>

            {/* Week navigation buttons */}
            <div className="inline-flex items-center gap-1 ml-1 sm:ml-3 bg-[#161411] px-2 py-0.5 rounded-xs border border-[#383126]">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-0.5 text-neutral-400 hover:text-amber-200 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-amber-200/90 px-1 font-semibold">
                {weekStartFormatted} – {weekEndFormatted}
              </span>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-0.5 text-neutral-400 hover:text-amber-200 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="text-[10px] px-2 py-0.5 bg-[#2d251a] hover:bg-[#3a2f21] text-amber-300 border border-amber-500/30 rounded-xs font-semibold transition-all"
              >
                Jump to This Week
              </button>
            )}
          </div>

          <h3 className="font-editorial text-2xl font-bold text-[#f5ebd7] mt-1">
            Your Week at FLAME
          </h3>
          <p className="text-xs text-[#a89b87] font-sans-ui mt-0.5">
            Campus events scheduled day by day
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('explore')}
          className="text-xs font-semibold text-amber-200 hover:text-amber-100 flex items-center gap-1 group self-start md:self-auto"
        >
          <span>Explore all events</span>
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
              className={`p-3 rounded-sm border transition-all flex flex-col min-h-[220px] ${
                isToday
                  ? 'bg-[#2a2217] border-amber-400/90 shadow-lg ring-1 ring-amber-400/30'
                  : 'bg-[#1b1915] border-[#383126] hover:border-[#524430]'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-sm font-bold text-neutral-200">
                    {day.dayName}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {day.formattedDate}
                  </span>
                </div>

                {isToday && (
                  <span className="px-1.5 py-0.2 bg-[#c93b2b] text-white text-[9px] font-bold rounded-xs tracking-wider uppercase">
                    Today
                  </span>
                )}
              </div>

              {/* Event Counter Badge */}
              <div className="pt-1.5 pb-2 text-[10px] font-mono flex items-center justify-between">
                <span className={hasEvents ? 'text-amber-300 font-medium' : 'text-neutral-500'}>
                  {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Day's Event List */}
              <div className="space-y-2 flex-1 flex flex-col">
                {!hasEvents ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-3 text-center rounded-xs border border-dashed border-[#2e271f] bg-[#161411]/50">
                    <span className="text-[11px] text-neutral-500 font-sans-ui italic">
                      No events
                    </span>
                  </div>
                ) : (
                  <>
                    {displayedDayEvents.map((evt) => {
                      const isGoing = goingEventIds.includes(evt.id);

                      return (
                        <div
                          key={evt.id}
                          onClick={() => openEventDetail(evt)}
                          className="p-2 rounded-xs bg-[#241f19] hover:bg-[#2e261d] border border-[#3e3427] hover:border-amber-400/70 transition-all text-left cursor-pointer group shadow-xs hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="text-[11px] font-bold text-[#f5ebd7] group-hover:text-amber-200 line-clamp-2 leading-tight transition-colors">
                              {evt.event_name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-amber-200/90 font-mono mt-1">
                            <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span className="truncate">
                              {evt.time_start_end || evt.time_start || 'TBD'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-white/5 text-[9px]">
                            <span className="text-[#a89b87] truncate font-sans-ui max-w-[80px]" title={evt.room_specific || evt.venue_zone}>
                              {evt.room_specific || evt.venue_zone}
                            </span>
                            <span className="px-1 py-0.2 bg-[#332b21] text-amber-200/90 rounded-xs border border-[#4a3e2e] shrink-0 font-medium truncate max-w-[75px]">
                              {evt.category}
                            </span>
                          </div>

                          {isGoing && (
                            <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Going ✓</span>
                            </div>
                          )}
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
                        className="w-full text-center py-1 text-[10px] font-medium text-amber-300 hover:text-amber-200 bg-[#282118] hover:bg-[#332a1f] border border-[#403527] rounded-xs transition-colors"
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
