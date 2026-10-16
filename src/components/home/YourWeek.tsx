'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, BookOpen, Sparkles, ChevronRight } from 'lucide-react';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const YourWeek: React.FC<{ eventsProp?: import('@/types').EventItem[] }> = ({ eventsProp }) => {
  const { user, isAuthenticated, events: contextEvents, goingEventIds, setCurrentTab } = useApp();
  const events = eventsProp || contextEvents;

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const [currentDayName, setCurrentDayName] = useState('Wednesday');

  useEffect(() => {
    const today = new Date();
    setCurrentDayName(dayNames[today.getDay()]);
  }, []);

  // Compute counts per day
  const getCountsForDay = (dayName: string) => {
    let classCount = 0;
    let eventCount = 0;

    if (isAuthenticated && user) {
      // Classes
      classCount = (user.academic_timetable || []).filter((c) => c.day === dayName).length;

      // Going Events: determine day of week for going events
      for (const goingId of goingEventIds) {
        const evt = events.find((e) => e.id === goingId);
        if (evt) {
          const evtDate = new Date(evt.date);
          const evtDay = dayNames[evtDate.getDay()];
          if (evtDay === dayName) {
            eventCount++;
          }
        }
      }
    } else {
      // Sample preview for guest
      classCount = dayName === 'Monday' || dayName === 'Wednesday' ? 2 : 1;
      eventCount = dayName === 'Wednesday' || dayName === 'Friday' ? 1 : 0;
    }

    return { classCount, eventCount };
  };

  return (
    <div className="bg-[#201c18] border border-[#3b3327] rounded-sm p-5 sm:p-6 shadow-xl mb-10 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#383025] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#d49942] text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xs">
              Weekly Overview
            </span>
            <span className="text-xs text-[#a89a83] font-handwritten text-base">
              Monday to Sunday
            </span>
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#f5ebd7] mt-0.5">
            Your Week at FLAME
          </h3>
        </div>

        <button
          onClick={() => setCurrentTab('my-plan')}
          className="text-xs font-semibold text-amber-200 hover:text-amber-100 flex items-center gap-1"
        >
          <span>View your schedule</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Monday - Sunday Compact Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
        {days.map((day) => {
          const { classCount, eventCount } = getCountsForDay(day);
          const isToday = currentDayName === day;

          return (
            <div
              key={day}
              onClick={() => setCurrentTab('my-plan')}
              className={`p-3.5 rounded-sm border cursor-pointer transition-all text-center ${
                isToday
                  ? 'bg-[#33291e] border-amber-400/90 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-[#1b1915] border-[#383126] hover:border-[#574934]'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="font-editorial text-sm font-bold text-neutral-200">{day.slice(0, 3)}</span>
                {isToday && (
                  <span className="px-1 py-0.2 bg-[#c93b2b] text-white text-[9px] font-bold rounded-xs">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs px-1 text-blue-200/90">
                  <span className="text-[11px] text-neutral-400">Classes:</span>
                  <span className="font-mono font-bold">{classCount}</span>
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-amber-200/90">
                  <span className="text-[11px] text-neutral-400">Events:</span>
                  <span className="font-mono font-bold">{eventCount}</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/5 text-[10px] text-neutral-400 font-sans-ui">
                {classCount + eventCount} total {classCount + eventCount === 1 ? 'item' : 'items'}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
