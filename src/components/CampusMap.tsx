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
  Compass,
  ChevronDown
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
  // 1. Check custom map pin tag in requirements_eligibility: [MAP_PIN: x, y]
  const pinMatch = (evt.requirements_eligibility || '').match(/\[MAP_PIN:\s*([\d.]+),\s*([\d.]+)\]/);
  if (pinMatch) {
    const px = parseFloat(pinMatch[1]);
    const py = parseFloat(pinMatch[2]);
    return {
      id: `custom-pin-${evt.id}`,
      name: evt.room_specific || evt.event_name,
      category: 'Others',
      building: evt.room_specific || 'Custom Campus Location',
      floor: 'Campus Location',
      zone: evt.venue_zone || 'Academics',
      x: px,
      y: py,
      satX: px,
      satY: py,
      description: `Custom event location specified by event organizer: ${evt.room_specific || evt.event_name}`,
      hubNodeId: 'hub_flame_plaza',
    };
  }

  // 2. Check custom nearest location tag: [NEAREST_LOC: id]
  const nearestMatch = (evt.requirements_eligibility || '').match(/\[NEAREST_LOC:\s*([^\]]+)\]/);
  if (nearestMatch) {
    const foundNearest = ALL_CAMPUS_LOCATIONS.find((l) => l.id === nearestMatch[1].trim());
    if (foundNearest) {
      return {
        ...foundNearest,
        name: evt.room_specific ? `${evt.room_specific} (${foundNearest.name})` : foundNearest.name,
      };
    }
  }

  // 3. Match against ALL_CAMPUS_LOCATIONS by name or building
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
    goingEventIds
  } = useApp();

  // Rendering mode: Illustrated (2048px Retina) vs Satellite
  const [mapRenderType, setMapRenderType] = useState<MapRenderType>('illustrated');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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
    { label: 'West Housing', icon: '🏠', id: 'other-west-housing' },
    { label: 'Vivekananda Library', icon: '📚', id: 'other-vivekananda-library' },
    { label: 'Aahar Dining', icon: '🍽️', id: 'other-aahar' },
    { label: 'APJ Kalam', icon: '🏛️', id: 'room-apj001' },
    { label: 'Main Gate', icon: '🚪', id: 'other-main-entrance' },
  ];

  // Search filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_CAMPUS_LOCATIONS.filter((l) => 
      l.name.toLowerCase().includes(q) ||
      l.building.toLowerCase().includes(q) ||
      (l.insideBuilding || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6">
      
      {/* ============================================================ */}
      {/* 1. CLEAN MODERN TOP BAR                                      */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              FLAME Campus Wayfinder
            </span>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              54 Buildings &amp; Walking Routes
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">
            Campus Map &amp; Directions
          </h1>
        </div>

        {/* View Controls: Illustrated vs Satellite + Google Maps */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-neutral-900/90 border border-white/10 rounded-xl backdrop-blur-md text-xs font-medium">
            <button
              onClick={() => setMapRenderType('illustrated')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mapRenderType === 'illustrated'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Illustrated</span>
            </button>
            <button
              onClick={() => setMapRenderType('google-satellite')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mapRenderType === 'google-satellite'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
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
            className="p-2.5 bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs backdrop-blur-md"
            title="Open FLAME University in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] font-medium">Google Maps</span>
          </a>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. UNIFIED STREAMLINED ROUTE & NAVIGATION CARD               */}
      {/* ============================================================ */}
      <div className="bg-[#121016]/95 border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md mb-3 space-y-3">
        
        {/* Active Plan Events Strip (If User Has Events Saved) */}
        {planItemsWithLocations.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>My Saved Events ({planItemsWithLocations.length})</span>
              </span>
              <span className="text-xs text-neutral-400 truncate hidden md:inline">
                Tap an event to auto-route walking directions:
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {planItemsWithLocations.map((item, idx) => {
                const isSelected = selectedPlanItem?.event.id === item.event.id;
                return (
                  <button
                    key={`plan-quick-${item.event.id}`}
                    onClick={() => handleSelectPlanEvent(item.event.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                        : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 border border-white/5'
                    }`}
                  >
                    <span>⭐ #{idx + 1} {item.event.event_name.slice(0, 22)}{item.event.event_name.length > 22 ? '…' : ''}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-neutral-800 font-semibold' : 'text-neutral-400'}`}>
                      ({item.location.name})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Origin & Destination Selectors with Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-2.5 items-center">
          
          {/* Start Point */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                <span>Starting Point</span>
              </label>
              <span className="text-[10px] text-neutral-500 hidden sm:inline">Where you are now</span>
            </div>
            <div className="relative">
              <select
                value={originLocationId}
                onChange={(e) => setOriginLocationId(e.target.value)}
                className="w-full bg-neutral-900/90 border border-white/10 text-white text-xs sm:text-sm rounded-xl py-2.5 pl-3 pr-8 focus:outline-none focus:border-emerald-500 font-sans transition-colors appearance-none cursor-pointer"
              >
                <optgroup label="West Housing Residences (Blocks L to S)">
                  <option value="other-west-housing">🏠 West Housing (General / Blocks L–S)</option>
                  <option value="housing-west-block-l">🏠 West Housing - Block L</option>
                  <option value="housing-west-block-m">🏠 West Housing - Block M</option>
                  <option value="housing-west-block-n">🏠 West Housing - Block N</option>
                  <option value="housing-west-block-o">🏠 West Housing - Block O</option>
                  <option value="housing-west-block-p">🏠 West Housing - Block P</option>
                  <option value="housing-west-block-q">🏠 West Housing - Block Q</option>
                  <option value="housing-west-block-r">🏠 West Housing - Block R</option>
                  <option value="housing-west-block-s">🏠 West Housing - Block S</option>
                </optgroup>
                <optgroup label="Popular Campus Starting Spots">
                  <option value="other-vivekananda-library">📚 Vivekananda Library (#3)</option>
                  <option value="other-aahar">🍽️ Aahar Dining Quad (#25)</option>
                  <option value="room-apj001">🏛️ APJ Abdul Kalam (#2)</option>
                  <option value="other-main-entrance">🚪 Main Campus Entrance (#46)</option>
                  <option value="sports-arjuna-complex-main">🏆 Arjuna Sports Complex (#18)</option>
                  <option value="other-south-housing">🏠 South Housing Blocks (#42)</option>
                  <option value="other-juice-press">🥤 Juice Press (#28 West Housing)</option>
                </optgroup>
                <optgroup label="All Classrooms & Venues">
                  {ALL_CAMPUS_LOCATIONS.map((loc) => (
                    <option key={`orig-${loc.id}`} value={loc.id}>
                      {loc.name} · {loc.building} {loc.officialNumber ? `(#${loc.officialNumber})` : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1 md:my-0 md:pt-5">
            <button
              onClick={handleSwapRoute}
              title="Swap Start and Destination"
              className="p-2 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-full border border-white/10 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-400 ring-2 ring-red-400/30" />
                <span>Destination</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="text-[11px] text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <Search className="w-3 h-3" />
                <span>{showSearch ? 'Hide Search' : 'Search Room / Cafe'}</span>
              </button>
            </div>
            <div className="relative">
              <select
                value={destinationSelectValue}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className="w-full bg-neutral-900/90 border border-white/10 text-white text-xs sm:text-sm rounded-xl py-2.5 pl-3 pr-8 focus:outline-none focus:border-red-500 font-sans transition-colors appearance-none cursor-pointer"
              >
                {planItemsWithLocations.length > 0 && (
                  <optgroup label={`⭐ Events You're Going To (${planItemsWithLocations.length})`}>
                    {planItemsWithLocations.map((item, idx) => (
                      <option key={`dest-plan-${item.event.id}`} value={`plan-event:${item.event.id}`}>
                        ⭐ #{idx + 1}: {item.event.event_name} — {item.location.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Popular Destinations">
                  <option value="hall-shantiniketan-auditorium">🎭 Shantiniketan Auditorium (#49)</option>
                  <option value="other-vivekananda-library">📚 Vivekananda Library (#3)</option>
                  <option value="room-apj001">🏛️ APJ001 (#2 APJ Abdul Kalam)</option>
                  <option value="other-aahar">🍽️ Aahar Dining Quad (#25)</option>
                  <option value="sports-arjuna-complex-main">🏆 Arjuna Sports Complex (#18)</option>
                  <option value="other-juice-press">🥤 Juice Press (#28 West Housing)</option>
                  <option value="other-hashtag">🥐 Hashtag Cafe (#29 Chandragupta)</option>
                  <option value="sports-cricket-ground">🏏 Cricket Ground (#19)</option>
                  <option value="sports-football-field">⚽ Football Ground (#20)</option>
                  <option value="other-charlies">☕ Charlies Cafe (#33 in APJ #2)</option>
                </optgroup>
                <optgroup label="West Housing Residences (Blocks L to S)">
                  <option value="other-west-housing">🏠 West Housing (General / Blocks L–S)</option>
                  <option value="housing-west-block-l">🏠 West Housing - Block L</option>
                  <option value="housing-west-block-m">🏠 West Housing - Block M</option>
                  <option value="housing-west-block-n">🏠 West Housing - Block N</option>
                  <option value="housing-west-block-o">🏠 West Housing - Block O</option>
                  <option value="housing-west-block-p">🏠 West Housing - Block P</option>
                  <option value="housing-west-block-q">🏠 West Housing - Block Q</option>
                  <option value="housing-west-block-r">🏠 West Housing - Block R</option>
                  <option value="housing-west-block-s">🏠 West Housing - Block S</option>
                </optgroup>
                <optgroup label="All Campus Venues">
                  {ALL_CAMPUS_LOCATIONS.map((loc) => (
                    <option key={`dest-${loc.id}`} value={loc.id}>
                      {loc.name} {loc.officialNumber ? `(#${loc.officialNumber})` : ''} · {loc.building}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Collapsible Instant Search Bar */}
        {showSearch && (
          <div className="pt-2 border-t border-white/5 space-y-2 animate-fadeIn">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type any classroom (APJ001, ARB101), cafe (Juice Press, Charlies), or sports court..."
                className="w-full bg-neutral-900 border border-white/10 text-white text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-amber-400 placeholder-neutral-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Results */}
            {searchResults.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {searchResults.map((loc) => (
                  <button
                    key={`search-res-${loc.id}`}
                    onClick={() => {
                      setDestinationLocationId(loc.id);
                      setSearchQuery('');
                      setShowSearch(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-amber-300 border border-white/5 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span>{loc.name} {loc.officialNumber ? `(#${loc.officialNumber})` : ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Route Details & 1-Tap Quick Start Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-white/5">
          
          {/* Walking Time Stat Pill */}
          {activeRoute && (
            <div className="flex items-center gap-2.5">
              <div className="px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-amber-300">
                  ~{activeRoute.walkTimeMinutes} min walk
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  ({activeRoute.distanceMeters}m · ~{activeRoute.stepsCount} steps)
                </span>
              </div>

              <a
                href={activeRoute.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-medium border border-white/5 flex items-center gap-1 transition-colors"
                title="Open in Google Maps for live GPS"
              >
                <span>GPS Walk</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          )}

          {/* 1-Tap Quick Start Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
            <span className="text-[11px] text-neutral-500 font-medium shrink-0">Quick Start:</span>
            {quickCurrentSpots.map((spot) => (
              <button
                key={spot.id}
                onClick={() => setOriginLocationId(spot.id)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all text-xs font-medium flex items-center gap-1 shrink-0 ${
                  originLocationId === spot.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-white/5'
                }`}
              >
                <span>{spot.icon}</span>
                <span>{spot.label}</span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. HERO MAP CANVAS WITH CLEAN CONTROLS                       */}
      {/* ============================================================ */}
      <div className="relative bg-[#0d0b10] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Floating Canvas Top-Left Badge */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
          <div className="px-3 py-1.5 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>FLAME Master Plan</span>
            <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">Tap any dot to inspect</span>
          </div>
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute top-3 right-3 z-30 flex items-center bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            disabled={zoomLevel <= 1}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 rounded-lg transition-colors"
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
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {zoomLevel > 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-neutral-800 text-amber-400 rounded-lg ml-0.5 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Map Viewport */}
        <div 
          className="w-full overflow-auto max-h-[760px] relative transition-all"
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
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-neutral-900/95 backdrop-blur-md text-white text-xs rounded-xl border border-white/20 shadow-2xl z-50 pointer-events-none whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span 
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white"
                          style={{ backgroundColor: OFFICIAL_ZONE_COLORS[building.category]?.hex || '#F15A24' }}
                        >
                          #{building.number}
                        </span>
                        <span className="font-bold text-amber-200">{building.name}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block font-sans">
                        Zone: {building.category}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active Plan Event Pins */}
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
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-neutral-900/95 text-amber-200 text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap border border-amber-400/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-neutral-900/95 text-emerald-300 text-xs font-bold rounded-xl shadow-lg whitespace-nowrap border border-emerald-500 pointer-events-none">
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-neutral-900/95 text-red-300 text-xs font-bold rounded-xl shadow-lg whitespace-nowrap border border-red-500 pointer-events-none flex items-center gap-1.5">
                    <span>DEST: {activeRoute.toLocation.name}</span>
                    <span className="text-amber-300 font-mono text-[10px] bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/50">
                      🚶 ~{activeRoute.walkTimeMinutes} min
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Building Details Overlay Card */}
        {selectedBuilding && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-40 p-4 bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white"
                    style={{ backgroundColor: OFFICIAL_ZONE_COLORS[selectedBuilding.category]?.hex || '#F15A24' }}
                  >
                    #{selectedBuilding.number}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium font-sans">
                    Zone: {selectedBuilding.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedBuilding.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              {selectedBuilding.description}
            </p>

            {/* Inside Venues */}
            {selectedBuilding.insideVenues && selectedBuilding.insideVenues.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-white/10">
                <span className="text-[10px] text-amber-300 uppercase font-mono font-bold block mb-1">
                  Inside this facility:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedBuilding.insideVenues.map((v, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-neutral-800 text-neutral-300 border border-white/5"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={() => {
                  const match = ALL_CAMPUS_LOCATIONS.find((l) => l.officialNumber === selectedBuilding.number) || ALL_CAMPUS_LOCATIONS[0];
                  setOriginLocationId(match.id);
                  setSelectedBuilding(null);
                }}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate Here</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
