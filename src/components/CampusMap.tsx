'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ALL_CAMPUS_LOCATIONS, 
  OFFICIAL_CAMPUS_BUILDINGS,
  OFFICIAL_ZONE_COLORS,
  calculateCampusRoute, 
  FLAME_CAMPUS_CENTER,
  OfficialBuilding
} from '@/lib/campusLocations';
import { 
  CampusLocation, 
  CampusRouteResult,
  EventItem 
} from '@/types';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Search, 
  ArrowLeftRight, 
  ExternalLink, 
  LocateFixed, 
  X,
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Footprints,
  Compass
} from 'lucide-react';

type MapRenderType = 'illustrated' | 'google-satellite';

/**
 * Helper to determine if an event has already ended.
 * Compares event date & end time against current local time.
 */
export function isEventEnded(evt: EventItem): boolean {
  if (evt.status === 'Completed') return true;
  if (!evt.date) return false;

  const now = new Date();
  const currentIsoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (evt.date < currentIsoDate) return true;
  if (evt.date > currentIsoDate) return false;

  // Event is today: check end time
  const endStr = evt.time_end || evt.time_start_end.split('-')[1]?.trim() || evt.time_start || '23:59';
  const parts = endStr.match(/(\d{1,2}):(\d{2})/);
  if (parts) {
    const endH = parseInt(parts[1], 10);
    const endM = parseInt(parts[2], 10);
    const curH = now.getHours();
    const curM = now.getMinutes();
    if (curH > endH || (curH === endH && curM >= endM)) {
      return true;
    }
  }
  return false;
}

/**
 * Match an event to its authoritative campus location
 */
function matchEventToCampusLocation(evt: EventItem): CampusLocation {
  const query = `${evt.room_specific || ''} ${evt.venue_zone || ''} ${evt.event_name || ''}`.toLowerCase();
  
  const matched = ALL_CAMPUS_LOCATIONS.find((loc) => {
    const nameMatch = query.includes(loc.name.toLowerCase());
    const buildingMatch = loc.building && query.includes(loc.building.toLowerCase());
    return nameMatch || buildingMatch;
  });

  if (matched) return matched;

  if (evt.venue_zone === 'Sports') {
    return ALL_CAMPUS_LOCATIONS.find((l) => l.id === 'sports-arjuna-complex-main') || ALL_CAMPUS_LOCATIONS[0];
  }
  if (evt.venue_zone === 'Shantiniketan/Recreational') {
    return ALL_CAMPUS_LOCATIONS.find((l) => l.id === 'hall-shantiniketan-auditorium') || ALL_CAMPUS_LOCATIONS[0];
  }
  if (evt.venue_zone === 'Eateries') {
    return ALL_CAMPUS_LOCATIONS.find((l) => l.id === 'other-aahar') || ALL_CAMPUS_LOCATIONS[0];
  }
  return ALL_CAMPUS_LOCATIONS.find((l) => l.id === 'room-apj001') || ALL_CAMPUS_LOCATIONS[0];
}

export const CampusMap: React.FC = () => {
  const { 
    events, 
    goingEventIds, 
    openEventDetail 
  } = useApp();

  // Rendering mode: Illustrated (2048px Retina) vs Satellite
  const [mapRenderType, setMapRenderType] = useState<MapRenderType>('illustrated');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Active un-ended events from the user's plan (Ended events are strictly excluded!)
  const activePlanEvents = useMemo(() => {
    return events
      .filter((e) => e.item_type !== 'application' && goingEventIds.includes(e.id))
      .filter((e) => !isEventEnded(e))
      .sort((a, b) => {
        const dateComp = (a.date || '').localeCompare(b.date || '');
        if (dateComp !== 0) return dateComp;
        const aStart = a.time_start || a.time_start_end.split('-')[0]?.trim() || '';
        const bStart = b.time_start || b.time_start_end.split('-')[0]?.trim() || '';
        return aStart.localeCompare(bStart);
      });
  }, [events, goingEventIds]);

  // Map each active plan event to its physical campus location
  const planItemsWithLocations = useMemo(() => {
    return activePlanEvents.map((evt) => ({
      event: evt,
      location: matchEventToCampusLocation(evt),
    }));
  }, [activePlanEvents]);

  // Selected plan event ID (enables selecting ANY event you are going to)
  const [selectedPlanEventId, setSelectedPlanEventId] = useState<string | null>(null);

  // Sync selectedPlanEventId when plan items change
  useEffect(() => {
    if (planItemsWithLocations.length > 0) {
      if (!selectedPlanEventId || !planItemsWithLocations.some((p) => p.event.id === selectedPlanEventId)) {
        setSelectedPlanEventId(planItemsWithLocations[0].event.id);
      }
    } else {
      setSelectedPlanEventId(null);
    }
  }, [planItemsWithLocations, selectedPlanEventId]);

  // The actively chosen plan event (or fallback to the first one)
  const selectedPlanItem = useMemo(() => {
    if (!planItemsWithLocations.length) return null;
    return planItemsWithLocations.find((p) => p.event.id === selectedPlanEventId) || planItemsWithLocations[0];
  }, [planItemsWithLocations, selectedPlanEventId]);

  // Origin (Where the student is right now) & Destination
  const [originLocationId, setOriginLocationId] = useState<string>('other-west-housing');
  const [destinationLocationId, setDestinationLocationId] = useState<string>(() => {
    return planItemsWithLocations[0]?.location.id || 'hall-shantiniketan-auditorium';
  });

  // Automatically sync destination when selectedPlanItem changes
  useEffect(() => {
    if (selectedPlanItem) {
      setDestinationLocationId(selectedPlanItem.location.id);
    }
  }, [selectedPlanItem?.event.id]);

  // Handle switching plan event
  const handleSelectPlanEvent = (eventId: string) => {
    const item = planItemsWithLocations.find((p) => p.event.id === eventId);
    if (item) {
      setSelectedPlanEventId(item.event.id);
      setDestinationLocationId(item.location.id);
    }
  };

  // Handle destination select change
  const handleDestinationChange = (val: string) => {
    if (val.startsWith('plan-event:')) {
      const evtId = val.replace('plan-event:', '');
      handleSelectPlanEvent(evtId);
      return;
    }
    setDestinationLocationId(val);
    const matchPlan = planItemsWithLocations.find((p) => p.location.id === val);
    if (matchPlan) {
      setSelectedPlanEventId(matchPlan.event.id);
    }
  };

  // Value for the destination select box
  const destinationSelectValue = useMemo(() => {
    if (selectedPlanItem && destinationLocationId === selectedPlanItem.location.id) {
      return `plan-event:${selectedPlanItem.event.id}`;
    }
    return destinationLocationId;
  }, [selectedPlanItem, destinationLocationId]);

  // Selected building details modal / card
  const [selectedBuilding, setSelectedBuilding] = useState<OfficialBuilding | null>(null);
  const [hoveredBuildingNum, setHoveredBuildingNum] = useState<number | null>(null);

  // Calculate walking route
  const activeRoute: CampusRouteResult | null = useMemo(() => {
    if (!originLocationId || !destinationLocationId) return null;
    return calculateCampusRoute(originLocationId, destinationLocationId);
  }, [originLocationId, destinationLocationId]);

  // Swap origin and destination
  const handleSwapRoute = () => {
    const temp = originLocationId;
    setOriginLocationId(destinationLocationId);
    setDestinationLocationId(temp);
  };

  // Quick 1-tap origins
  const quickCurrentSpots = [
    { label: '🏠 West Housing (My Room)', id: 'other-west-housing' },
    { label: '📚 Vivekananda Library', id: 'other-vivekananda-library' },
    { label: '🍽️ Aahar Dining Quad', id: 'other-aahar' },
    { label: '🏛️ APJ Abdul Kalam', id: 'room-apj001' },
    { label: '🚪 Main Entrance Gate', id: 'other-main-entrance' },
  ];

  // Search filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_CAMPUS_LOCATIONS.filter((l) => 
      l.name.toLowerCase().includes(q) ||
      l.building.toLowerCase().includes(q) ||
      (l.insideBuilding || '').toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto py-5 px-3 sm:px-6">
      
      {/* ============================================================ */}
      {/* 1. CLEAN HEADER WITH VIEW TOGGLES                            */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#3d362b]">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-urgent text-[10px] bg-red-950/70 border-red-500 text-red-200 uppercase">
              Official FLAME Cartography
            </span>
            <span className="text-xs text-[#d6cbaf] font-mono hidden sm:inline">
              18.5233° N, 73.7317° E
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-black text-[#fbf7ee] mt-0.5 tracking-tight">
            Campus Wayfinder &amp; <span className="text-amber-400 font-serif italic">Master Map</span>
          </h1>
        </div>

        {/* View Controls: Illustrated vs Satellite */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#1c1a17] border border-[#473d2f] rounded-full text-xs font-medium">
            <button
              onClick={() => setMapRenderType('illustrated')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                mapRenderType === 'illustrated'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm font-bold'
                  : 'text-[#d6cbaf] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Illustrated Map</span>
            </button>
            <button
              onClick={() => setMapRenderType('google-satellite')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                mapRenderType === 'google-satellite'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-[#d6cbaf] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
          </div>

          <a
            href={FLAME_CAMPUS_CENTER.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-[#252019] hover:bg-[#332c22] border border-[#4d402f] text-amber-300 rounded-full transition-colors flex items-center gap-1 text-xs"
            title="Open FLAME University in Google Maps App"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. "MY PLAN" HERO BANNER: SELECT ANY EVENT YOU'RE GOING TO   */}
      {/* ============================================================ */}
      {planItemsWithLocations.length > 0 && selectedPlanItem ? (
        <div className="mb-4 p-3.5 sm:p-4 bg-gradient-to-r from-[#2a1c0d] via-[#1f1912] to-[#171410] border-2 border-amber-500/70 rounded-xl shadow-xl">
          {/* Header row with event dropdown selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#3d3224]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-neutral-950 uppercase flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-neutral-950" />
                <span>My Plan ({planItemsWithLocations.length} Events)</span>
              </span>
              <span className="text-xs text-[#a89982] hidden sm:inline">
                Select any event to chart walking route:
              </span>
            </div>

            {/* Quick dropdown to pick ANY event */}
            <div className="flex items-center gap-2">
              <label htmlFor="plan-event-select" className="text-[11px] text-[#c7bc9f] font-medium shrink-0">
                Switch Event:
              </label>
              <select
                id="plan-event-select"
                value={selectedPlanItem.event.id}
                onChange={(e) => handleSelectPlanEvent(e.target.value)}
                className="bg-[#14120e] border border-amber-500/60 text-amber-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-sans-ui max-w-[280px] truncate"
              >
                {planItemsWithLocations.map((item, idx) => (
                  <option key={`select-opt-${item.event.id}`} value={item.event.id}>
                    #{idx + 1}: {item.event.event_name} ({item.event.time_start || item.event.time_start_end})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Event Showcase */}
          <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0 text-amber-300 shadow-md">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#382b1c] text-amber-300 border border-amber-500/40">
                    Active Destination
                  </span>
                  <span className="text-xs text-amber-200/90 font-medium">
                    {selectedPlanItem.event.date} · {selectedPlanItem.event.time_start_end}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#fdfaf3] mt-0.5 leading-snug">
                  {selectedPlanItem.event.event_name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#b8ab96] mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>
                    {selectedPlanItem.location.building} · {selectedPlanItem.location.name}
                    {selectedPlanItem.location.officialNumber ? ` (Map #${selectedPlanItem.location.officialNumber})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Walking summary pill & Action */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {activeRoute && destinationLocationId === selectedPlanItem.location.id && (
                <div className="px-3 py-1.5 bg-amber-950/80 border border-amber-400/60 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{activeRoute.walkTimeMinutes} min walk ({activeRoute.distanceMeters}m)</span>
                </div>
              )}
              <button
                onClick={() => setDestinationLocationId(selectedPlanItem.location.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  destinationLocationId === selectedPlanItem.location.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{destinationLocationId === selectedPlanItem.location.id ? 'Route Active' : 'Show Route'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Event Cards: Click ANY event you're going to! */}
          {planItemsWithLocations.length > 1 && (
            <div className="mt-3.5 pt-3 border-t border-[#3d3224]">
              <div className="text-[11px] text-[#a89982] font-semibold mb-2 flex items-center justify-between">
                <span>All Events You&apos;re Going To (Tap any to route):</span>
                <span className="font-mono text-[10px] text-amber-400">
                  {planItemsWithLocations.findIndex((p) => p.event.id === selectedPlanItem.event.id) + 1} of {planItemsWithLocations.length} active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {planItemsWithLocations.map((item, idx) => {
                  const isSelected = selectedPlanItem.event.id === item.event.id;
                  return (
                    <button
                      key={item.event.id}
                      onClick={() => handleSelectPlanEvent(item.event.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all flex items-start gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#332617] border-amber-400 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-[#181511] hover:bg-[#251f18] border-[#382f23] text-neutral-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-400 text-neutral-950' : 'bg-[#2b251d] text-[#a89982]'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-[#fbf7ee] truncate">
                          {item.event.event_name}
                        </div>
                        <div className="text-[10px] text-amber-200/80 truncate mt-0.5">
                          {item.location.name} {item.location.officialNumber ? `(#${item.location.officialNumber})` : ''} · {item.event.time_start || item.event.time_start_end}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.5 rounded shrink-0">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 p-3 bg-[#1c1813] border border-[#3d3427] rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#b8ab96]">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>
              Tip: Tap <strong>&ldquo;I&apos;m Going&rdquo;</strong> on any event in Explore, and it will appear here so you can select and route directly to it!
            </span>
          </div>
          <button
            onClick={() => {
              setDestinationLocationId('hall-shantiniketan-auditorium');
              setOriginLocationId('other-vivekananda-library');
            }}
            className="px-2.5 py-1 rounded bg-[#2a241b] hover:bg-[#383023] text-amber-200 border border-[#4d402f] font-medium shrink-0"
          >
            Explore Campus Axis
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. SIMPLE WAYFINDING ROUTE CONTROLS                          */}
      {/* ============================================================ */}
      <div className="mb-4 p-3.5 bg-[#171410] border border-[#382f23] rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr,auto] gap-2.5 items-center">
          
          {/* Origin: Current Location */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Where are you right now? (Current Location)</span>
            </label>
            <select
              value={originLocationId}
              onChange={(e) => setOriginLocationId(e.target.value)}
              className="w-full bg-[#12100d] border border-[#473c2c] text-[#fbf7ee] text-xs rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 font-sans-ui"
            >
              <optgroup label="Popular Starting Locations">
                <option value="other-west-housing">🏠 West Housing (My Room / Blocks 41)</option>
                <option value="other-vivekananda-library">📚 Vivekananda Library (#3)</option>
                <option value="other-aahar">🍽️ Aahar Dining Hall (#25)</option>
                <option value="room-apj001">🏛️ APJ Abdul Kalam (#2)</option>
                <option value="other-main-entrance">🚪 Main Campus Entrance (#46)</option>
                <option value="sports-arjuna-complex-main">🏆 Arjuna Sports Complex (#18)</option>
                <option value="other-south-housing">🏠 South Housing Blocks (#42)</option>
                <option value="other-juice-press">🥤 Juice Press (#28 West Housing)</option>
              </optgroup>
              <optgroup label="Classrooms & Halls">
                {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Classrooms').map((loc) => (
                  <option key={`orig-${loc.id}`} value={loc.id}>
                    {loc.name} · {loc.building} {loc.officialNumber ? `(#${loc.officialNumber})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Other Campus Venues">
                {ALL_CAMPUS_LOCATIONS.filter((l) => l.category !== 'Classrooms').map((loc) => (
                  <option key={`orig-all-${loc.id}`} value={loc.id}>
                    {loc.name} {loc.officialNumber ? `(#${loc.officialNumber})` : ''} · {loc.building}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Swap Button */}
          <div className="hidden md:flex justify-center pt-4">
            <button
              onClick={handleSwapRoute}
              title="Swap Start & Destination"
              className="p-2 bg-[#252019] hover:bg-[#362e24] text-amber-300 rounded-full border border-[#4d402f] transition-transform active:scale-90"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination: Where are you going */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Where do you want to go? (Destination)</span>
            </label>
            <select
              value={destinationSelectValue}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full bg-[#12100d] border border-[#473c2c] text-[#fbf7ee] text-xs rounded-lg p-2.5 focus:outline-none focus:border-red-500 font-sans-ui"
            >
              {planItemsWithLocations.length > 0 && (
                <optgroup label={`⭐ Events You're Going To (${planItemsWithLocations.length})`}>
                  {planItemsWithLocations.map((item, idx) => (
                    <option key={`dest-plan-${item.event.id}`} value={`plan-event:${item.event.id}`}>
                      ⭐ #{idx + 1}: {item.event.event_name} — {item.location.name} ({item.event.time_start || item.event.time_start_end})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Popular Destinations">
                <option value="hall-shantiniketan-auditorium">🎭 Shantiniketan Auditorium (#49)</option>
                <option value="other-vivekananda-library">📚 Vivekananda Library (#3)</option>
                <option value="room-apj001">🏛️ APJ001 (#2 APJ Abdul Kalam)</option>
                <option value="other-aahar">🍽️ Aahar Dining Hall (#25)</option>
                <option value="sports-arjuna-complex-main">🏆 Arjuna Sports Complex (#18)</option>
                <option value="other-juice-press">🥤 Juice Press (#28 West Housing)</option>
                <option value="other-hashtag">🥐 Hashtag Cafe (#29 Chandragupta)</option>
                <option value="sports-cricket-ground">🏏 Cricket Ground (#19)</option>
                <option value="sports-football-field">⚽ Football Ground (#20)</option>
                <option value="other-charlies">☕ Charlies Cafe (#33 in APJ #2)</option>
              </optgroup>
              <optgroup label="Classrooms & Academic Blocks">
                {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Classrooms').map((loc) => (
                  <option key={`dest-${loc.id}`} value={loc.id}>
                    {loc.name} · {loc.building} {loc.officialNumber ? `(#${loc.officialNumber})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Other Campus Venues">
                {ALL_CAMPUS_LOCATIONS.filter((l) => l.category !== 'Classrooms').map((loc) => (
                  <option key={`dest-all-${loc.id}`} value={loc.id}>
                    {loc.name} {loc.officialNumber ? `(#${loc.officialNumber})` : ''} · {loc.building}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Simple Walking Summary Pill */}
          <div className="flex items-center gap-2 pt-2 md:pt-4">
            {activeRoute && (
              <div className="w-full sm:w-auto px-3.5 py-2.5 bg-[#251f16] border border-amber-500/40 rounded-lg text-amber-200 text-xs font-bold flex items-center justify-between sm:justify-start gap-2 whitespace-nowrap shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-amber-400" />
                  <span>{activeRoute.walkTimeMinutes} min walk ({activeRoute.distanceMeters}m)</span>
                </div>
                <a
                  href={activeRoute.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 ml-1 flex items-center gap-0.5 text-[11px] underline"
                  title="Open in Google Maps"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 1-Tap Quick Origin Chips */}
        <div className="mt-2.5 pt-2 border-t border-[#292218] flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-[#8c7e6a] shrink-0 font-medium">1-Tap Location:</span>
          {quickCurrentSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setOriginLocationId(spot.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                originLocationId === spot.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-bold'
                  : 'bg-[#1e1a14] hover:bg-[#2b241c] text-[#c7bc9f] border border-[#3a3023]'
              }`}
            >
              <span>{spot.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. HIGH-RESOLUTION MASTER PLAN MAP CANVAS                    */}
      {/* ============================================================ */}
      <div className="relative bg-[#12100d] rounded-2xl border-2 border-[#3d3427] overflow-hidden shadow-2xl">
        
        {/* Canvas Toolbar Controls */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
          <div className="px-3 py-1 bg-[#14120e]/90 backdrop-blur-md rounded-lg border border-[#3d3427] text-xs font-bold text-[#fbf7ee] flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>FLAME University Master Plan</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 z-30 flex items-center bg-[#14120e]/90 backdrop-blur-md border border-[#3d3427] rounded-lg p-1 shadow-md">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            disabled={zoomLevel <= 1}
            className="p-1 hover:bg-[#2b251d] text-neutral-300 disabled:opacity-40 rounded"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-amber-300 px-2 select-none">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, +(z + 0.25).toFixed(2)))}
            disabled={zoomLevel >= 2.0}
            className="p-1 hover:bg-[#2b251d] text-neutral-300 disabled:opacity-40 rounded"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {zoomLevel > 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-[#2b251d] text-amber-400 rounded ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Map Viewport */}
        <div 
          className="w-full overflow-auto max-h-[750px] relative transition-all"
          style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
        >
          <div 
            className="relative min-w-full origin-top-left transition-transform duration-200 ease-out"
            style={{ 
              transform: `scale(${zoomLevel})`,
              width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%' 
            }}
          >
            {/* High-Resolution 2048px Retina Campus Map Image */}
            <img
              src={mapRenderType === 'illustrated' ? '/campus-map-illustrated.jpg' : '/campus-map-satellite.png'}
              alt="FLAME University Official Illustrated Master Plan"
              className="w-full h-auto block select-none pointer-events-none"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
              draggable={false}
            />

            {/* SVG Walking Route Layer */}
            {activeRoute && activeRoute.pathCoordinates.length > 1 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#f59e0b" floodOpacity="0.85" />
                  </filter>
                </defs>

                {/* Base Shadow Line */}
                <polyline
                  points={activeRoute.pathCoordinates.map((pt) => `${pt.x},${pt.y}`).join(' ')}
                  fill="none"
                  stroke="#12100d"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Animated Glowing Walking Route */}
                <polyline
                  points={activeRoute.pathCoordinates.map((pt) => `${pt.x},${pt.y}`).join(' ')}
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2.2, 1.4"
                  className="animate-pulse"
                  filter="url(#routeGlow)"
                />

                {/* Path Nodes */}
                {activeRoute.pathCoordinates.map((pt, idx) => {
                  if (idx === 0 || idx === activeRoute.pathCoordinates.length - 1) return null;
                  return (
                    <circle
                      key={`wp-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="0.75"
                      fill="#fef3c7"
                      stroke="#b45309"
                      strokeWidth="0.25"
                    />
                  );
                })}
              </svg>
            )}

            {/* Interactive Building Hotspots (1–54) */}
            {mapRenderType === 'illustrated' && OFFICIAL_CAMPUS_BUILDINGS.map((building) => {
              const isSelected = selectedBuilding?.number === building.number;
              const isHovered = hoveredBuildingNum === building.number;

              return (
                <div
                  key={`bldg-hotspot-${building.number}`}
                  style={{
                    position: 'absolute',
                    left: `${building.x}%`,
                    top: `${building.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="z-25"
                >
                  <button
                    onClick={() => setSelectedBuilding(building)}
                    onMouseEnter={() => setHoveredBuildingNum(building.number)}
                    onMouseLeave={() => setHoveredBuildingNum(null)}
                    className={`group relative flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      isSelected || isHovered
                        ? 'w-6 h-6 rounded-full scale-125 z-40 shadow-xl'
                        : 'w-4 h-4 rounded-full opacity-35 hover:opacity-100 hover:scale-125 z-20'
                    }`}
                    style={{
                      backgroundColor: isSelected || isHovered 
                        ? OFFICIAL_ZONE_COLORS[building.category]?.hex || '#F15A24' 
                        : 'transparent',
                      border: isSelected || isHovered 
                        ? '2px solid #ffffff' 
                        : '1.5px solid rgba(255,255,255,0.6)',
                    }}
                    title={`#${building.number}: ${building.name} (${building.category})`}
                  >
                    {(isSelected || isHovered) && (
                      <span className="text-[9px] font-mono font-black text-white leading-none">
                        {building.number}
                      </span>
                    )}
                  </button>

                  {/* Tooltip on hover */}
                  {isHovered && !selectedBuilding && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[#171410]/95 text-neutral-100 text-xs rounded-lg border border-amber-400 shadow-2xl z-50 pointer-events-none whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span 
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white"
                          style={{ backgroundColor: OFFICIAL_ZONE_COLORS[building.category]?.hex || '#F15A24' }}
                        >
                          #{building.number}
                        </span>
                        <span className="font-bold text-amber-200">{building.name}</span>
                      </div>
                      <span className="text-[10px] text-[#a89982] block font-sans-ui">
                        Zone: {building.category}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active Plan Event Pins (Events that ended are REMOVED!) */}
            {planItemsWithLocations.map((item, idx) => {
              const isSelected = selectedPlanItem?.event.id === item.event.id;
              return (
                <div
                  key={`plan-pin-${item.event.id}`}
                  style={{
                    position: 'absolute',
                    left: `${item.location.x}%`,
                    top: `${item.location.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="z-30 pointer-events-auto"
                >
                  <button
                    onClick={() => handleSelectPlanEvent(item.event.id)}
                    className={`group relative flex items-center justify-center rounded-full font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'w-7 h-7 sm:w-8 sm:h-8 bg-amber-400 text-neutral-950 text-xs shadow-2xl ring-4 ring-amber-300 ring-offset-2 ring-offset-black scale-110 z-40'
                        : 'w-6 h-6 bg-amber-500/90 hover:bg-amber-400 text-neutral-950 text-[10px] shadow-lg ring-2 ring-amber-200 hover:scale-125 z-30'
                    }`}
                    title={`Plan Event #${idx + 1}: ${item.event.event_name}`}
                  >
                    <span>⭐{idx + 1}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-[#12100d]/95 text-amber-200 text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap border border-amber-400/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      <div className="text-white font-extrabold flex items-center gap-1">
                        <span>#{idx + 1}: {item.event.event_name}</span>
                        {isSelected && <span className="text-[9px] text-emerald-400 font-mono">(Active)</span>}
                      </div>
                      <div className="text-[10px] text-amber-300 font-medium">
                        {item.location.name} {item.location.officialNumber ? `(#${item.location.officialNumber})` : ''} · {item.event.time_start || item.event.time_start_end}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Origin Pin (Green 'A') */}
            {activeRoute && (
              <div
                style={{
                  position: 'absolute',
                  left: `${activeRoute.fromLocation.x}%`,
                  top: `${activeRoute.fromLocation.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="z-35 pointer-events-auto"
              >
                <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-neutral-950 font-black text-xs shadow-2xl ring-4 ring-emerald-300/60 hover:scale-110 transition-transform">
                  <span>A</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#12100d]/95 text-emerald-300 text-xs font-bold rounded shadow-lg whitespace-nowrap border border-emerald-500 pointer-events-none">
                    YOU: {activeRoute.fromLocation.name}
                  </div>
                </div>
              </div>
            )}

            {/* Destination Pin (Red 'B') */}
            {activeRoute && (
              <div
                style={{
                  position: 'absolute',
                  left: `${activeRoute.toLocation.x}%`,
                  top: `${activeRoute.toLocation.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="z-35 pointer-events-auto"
              >
                <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 text-white font-black text-xs shadow-2xl ring-4 ring-red-300/60 hover:scale-110 transition-transform">
                  <span>B</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-[#12100d]/95 text-red-300 text-xs font-bold rounded shadow-lg whitespace-nowrap border border-red-500 pointer-events-none">
                    DEST: {activeRoute.toLocation.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Building Details Overlay */}
        {selectedBuilding && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-40 p-4 bg-[#171410]/95 backdrop-blur-md rounded-xl border border-amber-500/70 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white"
                    style={{ backgroundColor: OFFICIAL_ZONE_COLORS[selectedBuilding.category]?.hex || '#F15A24' }}
                  >
                    #{selectedBuilding.number}
                  </span>
                  <span className="text-[11px] text-[#a89982] font-medium font-sans-ui">
                    Zone: {selectedBuilding.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#fbf7ee]">
                  {selectedBuilding.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-1 text-[#8c7e68] hover:text-neutral-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#b8ab96] mt-2 leading-relaxed">
              {selectedBuilding.description}
            </p>

            {/* Inside Venues */}
            {selectedBuilding.insideVenues && selectedBuilding.insideVenues.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[#2e261c]">
                <span className="text-[10px] text-amber-300 uppercase font-mono font-bold block mb-1">
                  Inside:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedBuilding.insideVenues.map((v, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded text-[10px] bg-[#241f17] text-[#d6cbaf] border border-[#3e3427]"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 pt-2.5 border-t border-[#2e261c] flex items-center gap-2">
              <button
                onClick={() => {
                  const match = ALL_CAMPUS_LOCATIONS.find((l) => l.officialNumber === selectedBuilding.number) || ALL_CAMPUS_LOCATIONS[0];
                  setOriginLocationId(match.id);
                  setSelectedBuilding(null);
                }}
                className="flex-1 py-1.5 bg-[#251f16] hover:bg-[#332a1e] text-emerald-300 border border-emerald-500/40 rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>I&apos;m Here (Start)</span>
              </button>
              <button
                onClick={() => {
                  const match = ALL_CAMPUS_LOCATIONS.find((l) => l.officialNumber === selectedBuilding.number) || ALL_CAMPUS_LOCATIONS[0];
                  setDestinationLocationId(match.id);
                  setSelectedBuilding(null);
                }}
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate Here</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. QUICK CAMPUS SEARCH                                       */}
      {/* ============================================================ */}
      <div className="mt-4 p-3 bg-[#171410] border border-[#382f23] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8c7e68] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any room (APJ001, ARB101), cafe (Juice Press #28, Hashtag), or sports facility..."
            className="w-full bg-[#12100d] border border-[#473c2c] text-[#fbf7ee] text-xs rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-amber-400 placeholder-[#7c6f5d]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c7e68] hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Venue Pills on Search */}
        {searchResults.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {searchResults.map((loc) => (
              <button
                key={`search-res-${loc.id}`}
                onClick={() => {
                  setDestinationLocationId(loc.id);
                  setSearchQuery('');
                }}
                className="px-2.5 py-1 rounded bg-[#251f16] hover:bg-[#382e20] text-amber-200 border border-amber-600/30 whitespace-nowrap text-[11px] font-medium flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-red-400" />
                <span>{loc.name} {loc.officialNumber ? `(#${loc.officialNumber})` : ''}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
