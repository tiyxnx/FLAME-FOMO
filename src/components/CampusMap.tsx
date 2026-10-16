'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ZONE_COORDINATES, 
  SPECIFIC_VENUE_COORDINATES 
} from '@/lib/constants';
import { EventItem } from '@/types';
import { EmptyStateScrapbook } from './EmptyStateScrapbook';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Compass, 
  ExternalLink, 
  Info,
  Maximize2
} from 'lucide-react';

export const CampusMap: React.FC = () => {
  const { 
    events, 
    goingEventIds, 
    openEventDetail, 
    setCurrentTab 
  } = useApp();

  const [activePinEventId, setActivePinEventId] = useState<string | null>(null);

  // Requirement: ONLY events the user has marked as "I'm Going" render as numbered pins on the map image
  const goingEvents = events.filter((e) => e.item_type !== 'application' && goingEventIds.includes(e.id));

  // Compute map pin coordinate with smart sub-building matching and gentle jitter
  const getCoordinatesForEvent = (event: EventItem, index: number) => {
    let base = null;
    if (event.room_specific) {
      if (SPECIFIC_VENUE_COORDINATES[event.room_specific]) {
        base = SPECIFIC_VENUE_COORDINATES[event.room_specific];
      } else {
        // Match building name keyword in specific room string
        for (const [key, coords] of Object.entries(SPECIFIC_VENUE_COORDINATES)) {
          if (
            event.room_specific.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(event.room_specific.toLowerCase())
          ) {
            base = coords;
            break;
          }
        }
      }
    }

    if (!base) {
      base = ZONE_COORDINATES[event.venue_zone] || { x: 50, y: 50 };
    }

    // Small offset for overlapping events
    const jitterX = (index % 3 - 1) * 2.5;
    const jitterY = Math.floor(index / 3) * 2.5;

    return {
      x: Math.min(92, Math.max(8, base.x + jitterX)),
      y: Math.min(92, Math.max(8, base.y + jitterY)),
    };
  };

  if (goingEvents.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="text-center mb-6">
          <span className="stamp-urgent text-xs">Campus Cartography</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-100 mt-1">
            FLAME University Interactive Map
          </h2>
          <p className="text-xs sm:text-sm text-[#c7ba9f] mt-1 font-sans-ui">
            Events you mark as &ldquo;I&apos;m Going&rdquo; automatically pin here with room numbers and walking routes.
          </p>
        </div>

        <EmptyStateScrapbook
          title="No Campus Pins Yet!"
          subtitle="Your campus map is currently waiting for your first committed adventure. Mark 'I'm Going' on any upcoming talk, workshop, or match to pin its building."
          actionButton={{
            label: "Explore Upcoming Events",
            onClick: () => setCurrentTab('explore'),
          }}
        />

        {/* Map Preview Background */}
        <div className="relative mt-8 rounded-sm overflow-hidden border-4 border-[#383126] opacity-40 filter grayscale shadow-2xl">
          <img
            src="/campus-map.png"
            alt="FLAME University Campus Map Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b border-[#3d362b]">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-urgent text-xs bg-red-950/60 border-red-500 text-red-200">
              Personalized Plan View
            </span>
            <span className="text-xs text-[#b8aa93] font-handwritten text-base">
              strictly showing your committed stops
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-100 mt-1">
            FLAME Campus Map
          </h2>
          <p className="text-xs sm:text-sm text-[#b8aa93] font-sans-ui mt-0.5">
            Hover or tap any numbered pin to inspect the event name, room number, and start time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 bg-[#2a241b] text-amber-200 border border-[#4d402f] rounded-full">
            📍 {goingEvents.length} Active {goingEvents.length === 1 ? 'Destination' : 'Destinations'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2 Cols on lg): The Tactile Illustrated Campus Map */}
        <div className="lg:col-span-2 relative bg-[#1c1a17] rounded-sm p-2 sm:p-3 border-4 border-[#3a3227] shadow-2xl overflow-hidden select-none">
          
          {/* Washi tape accents on the map corners */}
          <div 
            className="absolute -top-3 left-6 w-24 h-6 bg-[#f3da90]/80 shadow-md rotate-[-3deg] z-20 pointer-events-none"
            style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
          />
          <div 
            className="absolute -top-3 right-6 w-24 h-6 bg-[#f4a9a3]/80 shadow-md rotate-[3deg] z-20 pointer-events-none"
            style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
          />

          {/* Map canvas container */}
          <div className="relative w-full overflow-hidden rounded-xs bg-[#24201a] border border-[#473d2f]">
            <img
              src="/campus-map.png"
              alt="FLAME Campus Illustrated Map"
              className="w-full h-auto block select-none"
            />

            {/* Interactive Numbered Pins */}
            {goingEvents.map((evt, idx) => {
              const coords = getCoordinatesForEvent(evt, idx);
              const pinNumber = idx + 1;
              const isActive = activePinEventId === evt.id;

              return (
                <div
                  key={evt.id}
                  style={{
                    position: 'absolute',
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="z-30"
                >
                  {/* Pin button */}
                  <button
                    onClick={() => setActivePinEventId(isActive ? null : evt.id)}
                    onMouseEnter={() => setActivePinEventId(evt.id)}
                    className={`group relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-black text-xs shadow-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-300 text-neutral-950 scale-125 ring-4 ring-red-500 z-40'
                        : 'bg-[#c93b2b] text-white hover:scale-110 ring-2 ring-amber-200/90'
                    }`}
                  >
                    {/* Pulsing radar ring */}
                    <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
                    <span className="relative z-10 font-mono font-bold">#{pinNumber}</span>
                  </button>

                  {/* Tooltip on Hover/Tap as required by read.md */}
                  {isActive && (
                    <div 
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 sm:w-72 p-3 bg-[#fcfbf7] text-neutral-900 rounded-sm shadow-2xl border-2 border-[#c93b2b] z-50 animate-fade-in"
                      style={{
                        boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                      }}
                    >
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#c93b2b]" />

                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-[#c93b2b] text-amber-100 text-[10px] font-bold rounded-xs uppercase">
                          Stop #{pinNumber}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">{evt.date}</span>
                      </div>

                      <h4 className="font-editorial text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
                        {evt.event_name}
                      </h4>

                      <div className="mt-1.5 space-y-0.5 text-xs text-neutral-700 font-sans-ui">
                        <div className="flex items-center gap-1 font-semibold text-[#c93b2b]">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{evt.venue_zone}</span>
                          {evt.room_specific && <span>· {evt.room_specific}</span>}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-600">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{evt.time_start_end}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openEventDetail(evt)}
                        className="mt-2.5 w-full py-1.5 bg-neutral-900 hover:bg-black text-amber-100 text-xs font-bold rounded-xs flex items-center justify-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-[#9b8d74]">
            <span className="font-handwritten text-base">Illustrated FLAME Campus layout</span>
            <span>Click any numbered badge to view room numbers</span>
          </div>
        </div>

        {/* Right Column: Interactive Itinerary Drawer */}
        <div className="bg-[#24201a] border border-[#3f3629] rounded-sm p-4 text-neutral-100 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#3a3227] mb-3">
            <h3 className="font-editorial text-lg font-bold text-amber-100">
              Campus Itinerary
            </h3>
            <span className="text-xs text-[#a89b87] font-mono">
              {goingEvents.length} Stops
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {goingEvents.map((evt, idx) => {
              const pinNumber = idx + 1;
              const isSelected = activePinEventId === evt.id;

              return (
                <div
                  key={evt.id}
                  onClick={() => setActivePinEventId(evt.id)}
                  className={`p-3 rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#362f25] border-amber-400/80 shadow-md translate-x-1'
                      : 'bg-[#1b1915] border-[#383126] hover:border-[#524634]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#c93b2b] text-white text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      #{pinNumber}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-editorial text-sm font-bold text-[#f5ebd7] leading-snug truncate">
                        {evt.event_name}
                      </h4>

                      <div className="flex items-center gap-1 text-[11px] text-amber-200/90 mt-1">
                        <MapPin className="w-3 h-3 text-[#e25845] shrink-0" />
                        <span className="truncate font-semibold">{evt.venue_zone}</span>
                        {evt.room_specific && (
                          <span className="truncate text-neutral-300">({evt.room_specific})</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                        <span className="font-mono">{evt.time_start_end}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEventDetail(evt);
                          }}
                          className="text-[#f3da90] hover:underline"
                        >
                          Details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#3a3227] text-center">
            <button
              onClick={() => setCurrentTab('explore')}
              className="text-xs text-amber-200 hover:text-amber-100 flex items-center justify-center gap-1 mx-auto"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover More Events to Pin</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
