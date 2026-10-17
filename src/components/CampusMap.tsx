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
    { label: '🏠 West Housing (Blocks L–S)', id: 'other-west-housing' },
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
    <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6">
      
      {/* ============================================================ */}
      {/* 1. CLEAN HEADER WITH VIEW TOGGLES                            */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#3d362b]">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-urgent text-[10px] bg-red-950/70 border-red-500 text-red-200 uppercase">
              Official FLAME Cartography
            </span>
            <span className="text-xs text-[#d6cbaf] font-mono hidden sm:inline">
              18.5233° N, 73.7317° E
            </span>
          </div>
          <h1 className="font-editorial text-xl sm:text-2xl font-black text-[#fbf7ee] mt-0.5 tracking-tight">
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
      {/* 2 & 3: SIDE-BY-SIDE: "MY PLAN" & "WAYFINDER CONTROLS"        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3 items-stretch">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: "MY PLAN" HERO CARD                             */}
        {/* ============================================================ */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#2a1c0d] via-[#1f1912] to-[#171410] border-2 border-amber-500/70 rounded-xl shadow-xl flex flex-col justify-between overflow-hidden min-w-0">
          <div>
            {/* Header row with event dropdown selector */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#3d3224]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-neutral-950 uppercase flex items-center gap-1 shadow-sm shrink-0">
                  <Sparkles className="w-3 h-3 text-neutral-950" />
                  <span>My Plan {planItemsWithLocations.length > 0 ? `(${planItemsWithLocations.length})` : ''}</span>
                </span>
                <span className="text-[11px] text-[#a89982] truncate hidden sm:inline">
                  Committed Stops
                </span>
              </div>

              {planItemsWithLocations.length > 0 && selectedPlanItem && (
                <div className="flex items-center gap-1 shrink-0">
                  <label htmlFor="plan-event-select" className="text-[11px] text-[#c7bc9f] font-medium shrink-0">
                    Switch:
                  </label>
                  <select
                    id="plan-event-select"
                    value={selectedPlanItem.event.id}
                    onChange={(e) => handleSelectPlanEvent(e.target.value)}
                    className="bg-[#14120e] border border-amber-500/60 text-amber-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400 font-sans-ui max-w-[170px] sm:max-w-[210px] truncate"
                  >
                    {planItemsWithLocations.map((item, idx) => (
                      <option key={`select-opt-${item.event.id}`} value={item.event.id}>
                        #{idx + 1}: {item.event.event_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Active Event Showcase or Empty Tip */}
            {selectedPlanItem ? (
              <div className="pt-2.5 space-y-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0 text-amber-300 shadow-sm mt-0.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#382b1c] text-amber-300 border border-amber-500/40 shrink-0">
                        Active Destination
                      </span>
                      <span className="text-[11px] text-amber-200/90 font-medium truncate">
                        {selectedPlanItem.event.date} · {selectedPlanItem.event.time_start_end}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#fdfaf3] mt-0.5 leading-snug line-clamp-2">
                      {selectedPlanItem.event.event_name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#b8ab96] mt-0.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate">
                        {selectedPlanItem.location.building} · {selectedPlanItem.location.name}
                        {selectedPlanItem.location.officialNumber ? ` (Map #${selectedPlanItem.location.officialNumber})` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dedicated Walk Time Badge & Pin Action */}
                <div className="flex items-center justify-between gap-2 p-2 bg-[#14110d]/90 rounded-lg border border-[#3a3023]">
                  {activeRoute && destinationLocationId === selectedPlanItem.location.id ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 truncate">
                      <Footprints className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">~{activeRoute.walkTimeMinutes} min walk ({activeRoute.distanceMeters}m)</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#a89982] truncate">
                      Tap to view walk time
                    </span>
                  )}
                  
                  <button
                    onClick={() => setDestinationLocationId(selectedPlanItem.location.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      destinationLocationId === selectedPlanItem.location.id
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{destinationLocationId === selectedPlanItem.location.id ? 'Pin Selected' : 'Show on Map'}</span>
                  </button>
                </div>

                {/* Quick event pills if multiple events */}
                {planItemsWithLocations.length > 1 && (
                  <div className="pt-2 border-t border-[#3d3224]">
                    <div className="text-[10px] text-[#8c7e68] font-medium mb-1">Your Events (Tap to switch):</div>
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-0.5">
                      {planItemsWithLocations.map((item, idx) => {
                        const isSelected = selectedPlanItem.event.id === item.event.id;
                        return (
                          <button
                            key={item.event.id}
                            onClick={() => handleSelectPlanEvent(item.event.id)}
                            className={`px-2 py-1 rounded text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                                : 'bg-[#16130f] hover:bg-[#282117] text-[#c9bca6] border border-[#3e3427]'
                            }`}
                          >
                            <span>#{idx + 1} {item.event.event_name.slice(0, 16)}...</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-4 text-xs text-[#b8ab96] leading-relaxed">
                <p>
                  No events added to your plan yet. Tap <strong>&ldquo;I&apos;m Going&rdquo;</strong> on any event in Explore, and its live walking directions will automatically appear here!
                </p>
                <button
                  onClick={() => {
                    setDestinationLocationId('hall-shantiniketan-auditorium');
                    setOriginLocationId('other-west-housing');
                  }}
                  className="mt-3 px-3 py-1.5 bg-[#251f16] hover:bg-[#332b20] text-amber-200 border border-[#4d402f] rounded-lg text-xs font-semibold"
                >
                  Set Route to Shantiniketan Auditorium
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: WALK TIME ESTIMATOR & PIN CONTROLS             */}
        {/* ============================================================ */}
        <div className="p-3.5 sm:p-4 bg-[#171410] border border-[#382f23] rounded-xl shadow-md flex flex-col justify-between overflow-hidden min-w-0">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d251a]">
              <span className="text-xs font-bold text-[#fbf7ee] flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-amber-400" />
                <span>Campus Walk Time Estimator</span>
              </span>
              <span className="text-[11px] text-[#8c7e6a]">Pedestrian Pace</span>
            </div>
            {/* Origin & Destination Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-2 items-center">
              
              {/* Origin */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Current Location (Start)</span>
                </label>
                <select
                  value={originLocationId}
                  onChange={(e) => setOriginLocationId(e.target.value)}
                  className="w-full bg-[#12100d] border border-[#473c2c] text-[#fbf7ee] text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-sans-ui"
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
                  <optgroup label="Popular Starting Locations">
                    <option value="other-vivekananda-library">📚 Vivekananda Library (#3)</option>
                    <option value="other-aahar">🍽️ Aahar Dining Hall (#25)</option>
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
              </div>

              {/* Swap Button */}
              <div className="flex sm:flex-col justify-center pt-2 sm:pt-4">
                <button
                  onClick={handleSwapRoute}
                  title="Swap Start & Destination"
                  className="p-1.5 bg-[#252019] hover:bg-[#362e24] text-amber-300 rounded-full border border-[#4d402f] transition-transform active:scale-90"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Destination (Going to)</span>
                </label>
                <select
                  value={destinationSelectValue}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full bg-[#12100d] border border-[#473c2c] text-[#fbf7ee] text-xs rounded-lg p-2 focus:outline-none focus:border-red-500 font-sans-ui"
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
                  <optgroup label="All Other Campus Venues">
                    {ALL_CAMPUS_LOCATIONS.map((loc) => (
                      <option key={`dest-${loc.id}`} value={loc.id}>
                        {loc.name} {loc.officialNumber ? `(#${loc.officialNumber})` : ''} · {loc.building}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* 1-Tap Quick Origin Chips */}
            <div className="mt-2 pt-1.5 border-t border-[#292218] flex items-center gap-1 overflow-x-auto text-[11px]">
              <span className="text-[#8c7e6a] shrink-0 font-medium text-[10px]">1-Tap:</span>
              {quickCurrentSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => setOriginLocationId(spot.id)}
                  className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors text-[10px] flex items-center gap-1 ${
                    originLocationId === spot.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-bold'
                      : 'bg-[#1e1a14] hover:bg-[#2b241c] text-[#c7bc9f] border border-[#3a3023]'
                  }`}
                >
                  <span>{spot.label}</span>
                </button>
              ))}
            </div>

            {/* Clean Walk Time & Distance Display */}
            {activeRoute && (
              <div className="mt-2.5 pt-2 border-t border-[#2d251a] space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-[#13100c] rounded-xl border border-amber-500/30 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/80 flex items-center justify-center shrink-0 text-amber-300">
                      <Footprints className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-amber-300">
                          ~{activeRoute.walkTimeMinutes} min walk
                        </span>
                        <span className="text-xs text-[#a89982] font-mono">
                          ({activeRoute.distanceMeters}m · ~{activeRoute.stepsCount} steps)
                        </span>
                      </div>
                      <p className="text-xs text-[#c7bc9f] mt-0.5 truncate">
                        {activeRoute.paceDescription}
                      </p>
                    </div>
                  </div>

                  <a
                    href={activeRoute.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-[#251f16] hover:bg-[#332a1e] text-amber-300 border border-[#4d402f] rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                    title="Open FLAME in Google Maps for live GPS"
                  >
                    <span className="hidden sm:inline">Google Maps</span>
                    <span className="sm:hidden">Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-[10px] text-[#8c7e6a] flex items-center gap-1.5 px-1">
                  <span>ℹ️</span>
                  <span>Estimated walking time along campus pathways. Walking across sports pitches is prohibited.</span>
                </div>
              </div>
            )}
          </div>
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-[#12100d]/95 text-red-300 text-xs font-bold rounded shadow-lg whitespace-nowrap border border-red-500 pointer-events-none flex items-center gap-1.5">
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
