'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { EventItem } from '@/types';

export const DontForget: React.FC<{ eventsProp?: EventItem[] }> = ({ eventsProp }) => {
  const { events: contextEvents, openEventDetail } = useApp();
  const events = eventsProp || contextEvents;

  const [todayStr, setTodayStr] = React.useState<string>('');
  const [nowTimestamp, setNowTimestamp] = React.useState<number>(0);

  React.useEffect(() => {
    const now = new Date();
    setTodayStr(now.toISOString().split('T')[0]);
    setNowTimestamp(now.getTime());
  }, []);

  const parseDeadlineToTime = (deadlineStr?: string): number => {
    if (!deadlineStr) return 0;
    const isoLike = deadlineStr.includes('T') ? deadlineStr : deadlineStr.replace(' ', 'T');
    const parsed = new Date(isoLike).getTime();
    if (!isNaN(parsed)) return parsed;
    const dateOnly = new Date(`${deadlineStr}T23:59:59`).getTime();
    return isNaN(dateOnly) ? 0 : dateOnly;
  };

  if (!todayStr || !nowTimestamp) return null;

  // 1. Strictly exclude applications & concluded events
  const activeUpcomingEvents = events.filter((e) => {
    if (e.item_type === 'application') return false;
    if (e.status === 'Completed' || e.status === 'Cancelled') return false;
    if (e.date < todayStr) return false;
    return true;
  });

  // 2. Find events with ACTIVE registration deadlines in the future or closing today
  const eventsWithActiveDeadlines = activeUpcomingEvents
    .filter((e) => {
      if (!e.registration_deadline) return false;
      const deadlineTime = parseDeadlineToTime(e.registration_deadline);
      return deadlineTime >= nowTimestamp;
    })
    .sort((a, b) => {
      const timeA = parseDeadlineToTime(a.registration_deadline);
      const timeB = parseDeadlineToTime(b.registration_deadline);
      return timeA - timeB;
    });

  // 3. Prioritize events: closest deadlines first, then closest upcoming events by date
  const prioritizedEvents: EventItem[] = [];

  for (const ev of eventsWithActiveDeadlines) {
    if (!prioritizedEvents.some((p) => p.id === ev.id)) {
      prioritizedEvents.push(ev);
    }
  }

  const sortedUpcoming = [...activeUpcomingEvents].sort((a, b) => a.date.localeCompare(b.date));
  for (const ev of sortedUpcoming) {
    if (!prioritizedEvents.some((p) => p.id === ev.id)) {
      prioritizedEvents.push(ev);
    }
  }

  // Top 3 closest deadlines/events
  const topThree = prioritizedEvents.slice(0, 3);

  if (topThree.length === 0) return null;

  // Format short deadline display
  const formatDeadline = (dl: string) => {
    // e.g. "2026-10-18 23:59" -> "18 Oct · 11:59 PM"
    try {
      const parts = dl.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '';
      const d = new Date(datePart);
      if (isNaN(d.getTime())) return dl;
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      return `${day} ${month}${timePart ? ` · ${timePart}` : ''}`;
    } catch {
      return dl;
    }
  };

  return (
    <div className="relative w-full my-6 select-none animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#c93b2b] text-white font-black text-[10px] tracking-wider uppercase rounded-2xs shadow-xs">
            Don&apos;t Forget!
          </span>
          <span className="text-xs text-[#c4b59b] font-handwritten text-base">
            closest deadlines &amp; events
          </span>
        </div>
      </div>

      {/* 3 Priority Notes Stacked One Below Another */}
      <div className="flex flex-col gap-2.5">
        {topThree.map((item, index) => {
          const hasDeadline = Boolean(
            item.registration_deadline && parseDeadlineToTime(item.registration_deadline) >= nowTimestamp
          );
          const deadlineText = item.registration_deadline ? formatDeadline(item.registration_deadline) : '';

          return (
            <div
              key={item.id}
              className="relative bg-gradient-to-r from-[#281815] via-[#201412] to-[#17100e] border border-[#4d251f] hover:border-amber-500/70 rounded-xs px-4 py-2.5 shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
              style={{
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Washi tape motif on left edge */}
              <div
                className="absolute -top-1.5 left-4 w-12 h-3.5 bg-[#f3da90]/75 rotate-[-2deg] shadow-2xs pointer-events-none"
                style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
              />

              {/* Left Side: Priority index, Urgency pill, Title, and Venue */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 flex-1 min-w-0 pt-0.5 sm:pt-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-black text-amber-300 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-2xs shadow-xs">
                    #{index + 1}
                  </span>

                  {hasDeadline ? (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-600/40 px-2 py-0.5 rounded-2xs">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="whitespace-nowrap">Deadline: {deadlineText}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-600/40 px-2 py-0.5 rounded-2xs">
                      <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="whitespace-nowrap">Happening: {item.date}</span>
                    </div>
                  )}
                </div>

                {/* Event Name */}
                <h4
                  onClick={() => openEventDetail(item)}
                  className="font-editorial text-sm sm:text-base font-bold text-white group-hover:text-amber-200 cursor-pointer truncate transition-colors leading-snug"
                  title={item.event_name}
                >
                  {item.event_name}
                </h4>

                {/* Venue (Desktop) */}
                <div className="hidden md:flex items-center gap-1 text-xs text-[#b8ab96] shrink-0 truncate max-w-[220px]">
                  <MapPin className="w-3 h-3 text-[#c93b2b] shrink-0" />
                  <span className="truncate">{item.venue_zone}{item.room_specific ? ` · ${item.room_specific}` : ''}</span>
                </div>
              </div>

              {/* Right Side: Venue on Mobile & Action Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[#38201b]/60">
                <div className="flex md:hidden items-center gap-1 text-[11px] text-[#b8ab96] truncate max-w-[180px]">
                  <MapPin className="w-3 h-3 text-[#c93b2b] shrink-0" />
                  <span className="truncate">{item.venue_zone}</span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {item.registration_link ? (
                    <a
                      href={item.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-2xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    >
                      <span>Register</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => openEventDetail(item)}
                      className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-amber-200 font-bold text-xs rounded-2xs border border-amber-400/30 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
