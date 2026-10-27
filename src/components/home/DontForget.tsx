'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, ExternalLink, Calendar, MapPin, Bookmark, AlertTriangle, ArrowRight } from 'lucide-react';
import { EventItem } from '@/types';

export const DontForget: React.FC<{ eventsProp?: EventItem[] }> = ({ eventsProp }) => {
  const { 
    events: contextEvents, 
    openEventDetail, 
    setCurrentTab, 
    savedEventIds, 
    toggleSaveEvent, 
    isAuthenticated, 
    openAuthModal 
  } = useApp();
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
    <div className="relative w-full mb-8 select-none animate-fade-in">
      {/* Section Header matching Image 2 */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white font-black text-xs tracking-wider uppercase rounded-full shadow-md shadow-rose-950/40 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 fill-white text-[#ff2d55]" />
            <span>DON&apos;T FORGET!</span>
          </span>
          <span className="text-xs text-neutral-400 font-sans-ui hidden sm:inline-block">
            closest deadlines &amp; registration links
          </span>
        </div>

        <button
          onClick={() => setCurrentTab('explore')}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
        >
          <span>View All Deadlines</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Priority Cards Stacked matching Image 2 */}
      <div className="flex flex-col gap-3">
        {topThree.map((item, index) => {
          const hasDeadline = Boolean(
            item.registration_deadline && parseDeadlineToTime(item.registration_deadline) >= nowTimestamp
          );
          const deadlineText = item.registration_deadline ? formatDeadline(item.registration_deadline) : '';
          const isSaved = savedEventIds.includes(item.id);
          const firstCat = Array.isArray(item.categories) && item.categories.length > 0
            ? item.categories[0]
            : item.category || 'Event';

          return (
            <div
              key={item.id}
              className="relative bg-[#141119] border border-white/5 border-l-4 border-l-[#ff2d55] hover:border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
            >
              {/* Scrapbook translucent tape on top corner */}
              <div
                className="absolute -top-1.5 right-12 w-14 h-3 bg-rose-500/20 rotate-[-1deg] shadow-2xs pointer-events-none rounded-xs"
                style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
              />

              {/* Left Side: Priority index, Urgency pill, Category, Title, and Venue */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  {/* # Index Pill matching Image 2 */}
                  <span className="w-7 h-7 flex items-center justify-center text-xs font-mono font-black text-rose-400 bg-rose-950/40 border border-rose-500/20 rounded-xl shadow-xs">
                    #{index + 1}
                  </span>

                  {/* Deadline or Date Badge */}
                  {hasDeadline ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="whitespace-nowrap">Deadline: {deadlineText}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                      <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="whitespace-nowrap">{item.date}</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <span className="hidden sm:inline-block text-[11px] font-medium text-neutral-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    {firstCat}
                  </span>
                </div>

                {/* Event Name & Venue */}
                <div className="min-w-0 flex-1">
                  <h4
                    onClick={() => openEventDetail(item)}
                    className="font-editorial text-sm sm:text-base font-bold text-white group-hover:text-rose-200 cursor-pointer truncate transition-colors leading-snug"
                    title={item.event_name}
                  >
                    {item.event_name}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate mt-0.5">
                    <MapPin className="w-3 h-3 text-[#ff2d55] shrink-0" />
                    <span className="truncate">{item.venue_zone}{item.room_specific ? ` · ${item.room_specific}` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Bookmark Button & Register CTA */}
              <div className="flex items-center justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                {/* Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      openAuthModal('Sign in with your FLAME email to save events.');
                      return;
                    }
                    toggleSaveEvent(item.id);
                  }}
                  title={isSaved ? 'Remove from Saved' : 'Save Event'}
                  className={`p-2 rounded-full border transition-all ${
                    isSaved
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                {/* Register Button */}
                {item.registration_link ? (
                  <a
                    href={item.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] hover:opacity-95 text-white font-semibold text-xs rounded-full flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all active:scale-95"
                  >
                    <span>Register</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => openEventDetail(item)}
                    className="px-4 py-2 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] hover:opacity-95 text-white font-semibold text-xs rounded-full flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all active:scale-95"
                  >
                    <span>Register</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

