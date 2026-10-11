'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AlertCircle, Clock, ExternalLink, Calendar, MapPin, Sparkles } from 'lucide-react';

export const DontForget: React.FC<{ eventsProp?: import('@/types').EventItem[] }> = ({ eventsProp }) => {
  const { events: contextEvents, openEventDetail } = useApp();
  const events = eventsProp || contextEvents;

  const [todayStr, setTodayStr] = React.useState('2026-10-11');
  const [nowTimestamp, setNowTimestamp] = React.useState(Date.now());

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

  // 3. Priority: event closing soonest. Fallback: upcoming event taking place soonest.
  const urgentEvent =
    eventsWithActiveDeadlines[0] ||
    [...activeUpcomingEvents].sort((a, b) => a.date.localeCompare(b.date))[0];

  if (!urgentEvent) return null;

  return (
    <div className="relative w-full my-6 select-none animate-fade-in">
      {/* Red paper-slip module with pinned edges */}
      <div 
        className="relative bg-gradient-to-r from-[#9e271a] via-[#b92b1b] to-[#c93b2b] text-amber-50 rounded-sm p-4 sm:p-5 shadow-2xl border-t-2 border-b-2 border-red-300/40 overflow-hidden"
        style={{
          boxShadow: '0 8px 24px rgba(185, 43, 27, 0.45)',
        }}
      >
        {/* Washi tape on left & right edges to affix paper slip */}
        <div 
          className="absolute -top-2 left-4 w-16 h-5 bg-[#f3da90]/80 shadow-xs rotate-[-3deg] pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />
        <div 
          className="absolute -top-2 right-4 w-16 h-5 bg-[#f3da90]/80 shadow-xs rotate-[3deg] pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left info block */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-300 text-neutral-950 font-black text-[10px] tracking-wider uppercase rounded-xs shadow-xs">
                Priority 1 · Don&apos;t Forget!
              </span>
              <span className="text-xs text-amber-200 font-handwritten text-base">
                most urgent deadline on campus
              </span>
            </div>

            <h3 
              onClick={() => openEventDetail(urgentEvent)}
              className="font-editorial text-xl sm:text-2xl font-black text-white hover:text-amber-200 cursor-pointer transition-colors leading-tight truncate"
            >
              {urgentEvent.event_name}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-amber-100/90 font-sans-ui">
              <div className="flex items-center gap-1 font-semibold text-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Closing: {urgentEvent.registration_deadline}</span>
              </div>
              <span className="opacity-40">|</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Event Date: {urgentEvent.date}</span>
              </div>
              <span className="opacity-40">|</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{urgentEvent.venue_zone}</span>
              </div>
            </div>
          </div>

          {/* Right Action Button: Direct CTA to Google registration */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => openEventDetail(urgentEvent)}
              className="px-3.5 py-2.5 bg-black/25 hover:bg-black/40 text-amber-200 text-xs font-semibold rounded-xs border border-amber-200/30 transition-colors"
            >
              Read Details
            </button>

            {urgentEvent.registration_link ? (
              <a
                href={urgentEvent.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-amber-300 hover:bg-amber-200 text-neutral-950 font-black text-xs sm:text-sm rounded-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Register Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={() => openEventDetail(urgentEvent)}
                className="px-5 py-2.5 bg-amber-300 hover:bg-amber-200 text-neutral-950 font-black text-xs sm:text-sm rounded-xs shadow-lg transition-transform active:scale-95"
              >
                View Registration Info
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
