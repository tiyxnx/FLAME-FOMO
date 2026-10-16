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

  // 1. Strictly exclude concluded events (event date must be today or future, status not Completed/Cancelled)
  const activeUpcomingEvents = events.filter((e) => {
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

      {/* 3 Slim Horizontal Rectangles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {topThree.map((item, index) => {
          const hasDeadline = Boolean(
            item.registration_deadline && parseDeadlineToTime(item.registration_deadline) >= nowTimestamp
          );
          const deadlineText = item.registration_deadline ? formatDeadline(item.registration_deadline) : '';

          return (
            <div
              key={item.id}
              className="relative bg-gradient-to-br from-[#271916] via-[#201412] to-[#17100e] border border-[#4d251f] hover:border-amber-500/70 rounded-xs p-3.5 shadow-lg transition-all group flex flex-col justify-between overflow-hidden"
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              }}
            >
              {/* Washi tape motif on top edge */}
              <div
                className={`absolute -top-2 ${
                  index === 0 ? 'left-6 rotate-[-2deg]' : index === 1 ? 'left-1/2 -translate-x-1/2 rotate-[1deg]' : 'right-6 rotate-[2deg]'
                } w-14 h-4 bg-[#f3da90]/75 shadow-2xs pointer-events-none`}
                style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
              />

              {/* Top Row: Urgency Pill */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                {hasDeadline ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-600/40 px-2 py-0.5 rounded-2xs">
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Deadline: {deadlineText}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-600/40 px-2 py-0.5 rounded-2xs">
                    <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Happening: {item.date}</span>
                  </div>
                )}

                <span className="text-[10px] text-[#a89b87] font-mono tracking-tight shrink-0">
                  #{index + 1}
                </span>
              </div>

              {/* Event Name */}
              <h4
                onClick={() => openEventDetail(item)}
                className="font-editorial text-sm sm:text-base font-bold text-white group-hover:text-amber-200 cursor-pointer line-clamp-1 transition-colors leading-snug my-2"
                title={item.event_name}
              >
                {item.event_name}
              </h4>

              {/* Bottom Row: Venue and Action Button */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#38201b]/80">
                <div className="flex items-center gap-1 text-[11px] text-[#b8ab96] truncate">
                  <MapPin className="w-3 h-3 text-[#c93b2b] shrink-0" />
                  <span className="truncate">{item.venue_zone}</span>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {item.registration_link ? (
                    <a
                      href={item.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[11px] rounded-2xs flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                    >
                      <span>Register</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => openEventDetail(item)}
                      className="px-2.5 py-1 bg-black/40 hover:bg-black/60 text-amber-200 font-bold text-[11px] rounded-2xs border border-amber-400/30 shadow-xs transition-transform active:scale-95"
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
