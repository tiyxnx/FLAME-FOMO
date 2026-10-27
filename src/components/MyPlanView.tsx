'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { EventCard } from './EventCard';
import { EmptyStateScrapbook } from './EmptyStateScrapbook';
import { 
  Calendar, 
  CalendarPlus,
  Clock, 
  MapPin, 
  BookOpen, 
  CheckCircle2, 
  Map, 
  Compass, 
  Filter,
  Download,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { getGoogleCalendarUrl, generateIcsSchedule, downloadIcsFile } from '@/lib/googleCalendar';

export const MyPlanView: React.FC = () => {
  const { 
    user, 
    events, 
    goingEventIds, 
    openEventDetail, 
    setCurrentTab 
  } = useApp();

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');
  const [syncMessage, setSyncMessage] = useState<string>('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // All events user is going to
  const goingEvents = events.filter((e) => goingEventIds.includes(e.id));

  // Build daily combined plan
  const planByDay = days.map((day) => {
    // 1. Classes on this day
    const classes = (user?.academic_timetable || []).filter((c) => c.day === day);

    // 2. Events on this day
    const dayEvents = goingEvents.filter((evt) => {
      const d = new Date(evt.date);
      return dayNames[d.getDay()] === day;
    });

    return {
      day,
      classes,
      events: dayEvents,
      totalCount: classes.length + dayEvents.length,
    };
  });

  const displayedDays = selectedDayFilter === 'All' 
    ? planByDay 
    : planByDay.filter((p) => p.day === selectedDayFilter);

  const hasAnyCommitment = planByDay.some((p) => p.totalCount > 0);

  const handleExportToCalendar = () => {
    const ics = generateIcsSchedule(goingEvents, user?.academic_timetable || []);
    downloadIcsFile('flame_campus_schedule.ics', ics);
    setSyncMessage(
      'Downloaded flame_campus_schedule.ics! Open Google Calendar > Settings > Import to add your lectures and committed campus events in 1 click.'
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md shadow-rose-950/40">
              Personalized Timetable
            </span>
            <span className="text-xs text-rose-300/80 font-handwritten text-base">
              tactile weekly planner
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1">
            My Campus Plan
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans-ui mt-0.5">
            Your combined schedule of academic lectures and committed campus events.
          </p>
        </div>

        {/* Action Buttons: Sync to Google Calendar & Plot on Map */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportToCalendar}
            className="px-4 py-2 bg-[#171422] hover:bg-[#201a30] text-rose-200 border border-rose-500/30 rounded-full text-xs font-semibold flex items-center gap-2 shadow transition-all cursor-pointer"
            title="Export all going events & lectures as .ics for Google Calendar"
          >
            <CalendarPlus className="w-4 h-4 text-rose-400" />
            <span>Sync to Google Calendar</span>
          </button>

          <button
            onClick={() => setCurrentTab('campus-map')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 rounded-full text-xs font-semibold flex items-center gap-2 shadow transition-all"
          >
            <Map className="w-4 h-4 text-[#ff2d55]" />
            <span>Plot Stops on Campus Map</span>
          </button>
        </div>
      </div>

      {/* Sync feedback notification banner */}
      {syncMessage && (
        <div className="p-4 mb-6 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <a
            href="https://calendar.google.com/calendar/u/0/r/settings/export"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap shadow-xs"
          >
            <span>Open Google Calendar</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
        <button
          onClick={() => setSelectedDayFilter('All')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedDayFilter === 'All'
              ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white shadow-md shadow-rose-950/40'
              : 'bg-[#15121b] text-neutral-400 hover:text-white border border-white/5'
          }`}
        >
          All Week (Mon-Sun)
        </button>
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDayFilter(d)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDayFilter === d
                ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white shadow-md shadow-rose-950/40'
                : 'bg-[#15121b] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {!hasAnyCommitment ? (
        <EmptyStateScrapbook
          title="Your Planner is Empty"
          subtitle="You haven't committed to any campus events yet. Explore the bulletin board and click 'I'm Going' on events to build your plan!"
          actionButton={{
            label: "Explore Bulletin Board",
            onClick: () => setCurrentTab('explore'),
          }}
        />
      ) : (
        <div className="space-y-6">
          {displayedDays.map((plan) => (
            <div
              key={plan.day}
              className="relative bg-[#131017] border border-white/5 rounded-3xl p-5 sm:p-7 shadow-2xl"
            >
              {/* Day Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                    {plan.day}
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    ({plan.totalCount} {plan.totalCount === 1 ? 'item' : 'items'})
                  </span>
                </div>
              </div>

              {plan.totalCount === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500 font-sans-ui italic">
                  No lectures or committed events on {plan.day}. A great day to relax or visit the library!
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Classes */}
                  {plan.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-3.5 bg-[#171422] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-white/5 text-rose-300 border border-white/10 font-mono text-xs rounded-xl">
                          {cls.timeStart} - {cls.timeEnd}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                              Class Lecture
                            </span>
                          </div>
                          <h4 className="font-editorial text-sm font-bold text-white">
                            {cls.courseName}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{cls.room || cls.venueZone}</span>
                      </div>
                    </div>
                  ))}

                  {/* Going Events */}
                  {plan.events.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => openEventDetail(evt)}
                      className="p-3.5 bg-[#1a1523] border border-rose-500/25 hover:border-rose-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white font-mono text-xs font-bold rounded-xl shadow-xs">
                          {evt.time_start_end}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full uppercase">
                              {evt.category}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Going
                            </span>
                          </div>
                          <h4 className="font-editorial text-base font-bold text-white mt-0.5 hover:text-rose-300 transition-colors">
                            {evt.event_name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#ff2d55]" />
                          <span>{evt.venue_zone} {evt.room_specific ? `(${evt.room_specific})` : ''}</span>
                        </div>
                        <a
                          href={getGoogleCalendarUrl(evt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-rose-300 text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          title="Add this event to Google Calendar"
                        >
                          <CalendarPlus className="w-3 h-3 text-rose-400" />
                          <span className="hidden sm:inline">Add to Cal</span>
                        </a>
                        <span className="text-rose-400 hover:text-rose-300 text-xs font-semibold">
                          View &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
