'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, ChevronUp, MapPin, CheckCircle2 } from 'lucide-react';

export const FloatingPlanWidget: React.FC = () => {
  const { user, isAuthenticated, events, goingEventIds, openEventDetail } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [todayDateString, setTodayDateString] = useState('');
  const [todayDayName, setTodayDayName] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    setTodayDateString(today.toISOString().split('T')[0]);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setTodayDayName(dayNames[today.getDay()]);
  }, []);

  // Removed early return for unauthenticated users
  // if (!isAuthenticated || !user) return null;

  // Compile timeline items
  const timelineItems: any[] = [];
  
  if (user) {
    for (const cls of user.academic_timetable || []) {
      if (cls.day === todayDayName) {
        timelineItems.push({
          id: cls.id,
          type: 'class',
          title: cls.courseName,
          timeStart: cls.timeStart,
          timeEnd: cls.timeEnd,
          location: cls.room || cls.venueZone || 'Academics',
          categoryOrCourse: 'Class',
        });
      }
    }
  }

  for (const goingId of goingEventIds) {
    const evt = events.find((e) => e.id === goingId);
    if (evt && evt.date === todayDateString) {
      const start = evt.time_start || evt.time_start_end.split('-')[0]?.trim() || '18:00';
      const end = evt.time_end || evt.time_start_end.split('-')[1]?.trim() || '20:00';
      timelineItems.push({
        id: evt.id,
        type: 'event',
        title: evt.event_name,
        timeStart: start,
        timeEnd: end,
        location: `${evt.venue_zone}${evt.room_specific ? ` · ${evt.room_specific}` : ''}`,
        categoryOrCourse: evt.category,
        originalEventId: evt.id,
      });
    }
  }

  timelineItems.sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''));

  // if (timelineItems.length === 0) return null; // Removed early return so user always sees the widget

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <div 
        className="relative bg-gradient-to-br from-[#fef5cd] to-[#f4e296] border border-[#e3ce84] text-amber-950 shadow-2xl transition-all duration-500 overflow-hidden"
        style={{ 
          width: isHovered ? '320px' : '64px',
          height: isHovered ? 'auto' : '64px',
          maxHeight: isHovered ? '600px' : '64px',
          borderTopRightRadius: '4px',
          borderTopLeftRadius: '0px',
          borderBottomRightRadius: '4px',
          borderBottomLeftRadius: '4px',
          transform: isHovered ? 'rotate(0deg)' : 'rotate(-5deg)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* Folded Corner (Dog Ear) */}
        <div 
          className={`absolute top-0 right-0 w-[30px] h-[30px] bg-[#d9c47c] transition-all duration-500 origin-top-right rounded-bl-sm z-10 ${
            isHovered ? 'opacity-0 scale-50 translate-x-2 -translate-y-2' : 'opacity-100 scale-100 shadow-[-3px_3px_5px_rgba(0,0,0,0.15)]'
          }`}
          style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
        />

        {/* Small "Sign" State when folded */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Calendar className="w-6 h-6 text-amber-800" />
          <span className="text-[9px] font-bold mt-0.5 text-amber-900 uppercase">Plan</span>
        </div>

        {/* Unfolded Content */}
        <div className={`p-4 transition-opacity duration-500 delay-100 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-3 border-b border-amber-700/20 pb-2">
            <div>
              <span className="text-xs text-amber-800 font-handwritten">today</span>
              <h4 className="font-editorial text-lg font-bold">Your Plan Today</h4>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {!isAuthenticated ? (
              <div className="text-center p-4 bg-amber-50/50 rounded border border-amber-200">
                <p className="text-xs font-bold text-amber-900 mb-1">Sign in required</p>
                <p className="text-[10px] text-amber-700">Sign in with your FLAME email to see your schedule.</p>
              </div>
            ) : timelineItems.length === 0 ? (
              <div className="text-center p-4 bg-amber-50/50 rounded border border-amber-200">
                <p className="text-xs font-bold text-amber-900 mb-1">Schedule Clear!</p>
                <p className="text-[10px] text-amber-700">No classes or events scheduled today.</p>
              </div>
            ) : (
              timelineItems.map((item, index) => (
                <div key={index} className="p-2 bg-white/60 border border-amber-200 rounded-xs flex gap-2">
                  <div className="text-[10px] font-mono font-bold text-amber-800 shrink-0 mt-0.5">
                    {item.timeStart}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold leading-tight">{item.title}</h5>
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 mt-1">
                      <MapPin className="w-2.5 h-2.5 text-red-600" />
                      <span className="truncate max-w-[150px]">{item.location}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      
      {/* Label pointing to widget */}
      {!isHovered && (
        <div className="absolute bottom-16 left-0 whitespace-nowrap animate-bounce-short pointer-events-none">
          <div className="bg-[#c93b2b] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md relative">
            Your Plan Today!
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#c93b2b] rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};
