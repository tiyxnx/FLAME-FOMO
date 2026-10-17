'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ALL_CAMPUS_LOCATIONS, 
  calculateCampusRoute, 
  FLAME_CAMPUS_CENTER,
  CAMPUS_HUB_NODES
} from '@/lib/campusLocations';
import { 
  CampusLocation, 
  CampusVenueCategory, 
  CampusRouteResult, 
  EventItem 
} from '@/types';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Clock, 
  Search, 
  ArrowLeftRight, 
  ExternalLink, 
  CheckCircle2, 
  Building2, 
  Coffee, 
  Dumbbell, 
  GraduationCap, 
  Music, 
  LocateFixed, 
  Info, 
  X,
  Layers,
  ChevronRight,
  Footprints,
  Sparkles
} from 'lucide-react';

type MapViewMode = 'wayfinder' | 'directory' | 'my-events';
type MapRenderType = 'illustrated' | 'google-satellite';

export const CampusMap: React.FC = () => {
  const { 
    events, 
    goingEventIds, 
    openEventDetail, 
    setCurrentTab 
  } = useApp();

  // Mode & Rendering state
  const [activeTabMode, setActiveTabMode] = useState<MapViewMode>('wayfinder');
  const [mapRenderType, setMapRenderType] = useState<MapRenderType>('illustrated');

  // Search & Filtering
  const [selectedCategory, setSelectedCategory] = useState<CampusVenueCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Wayfinding Origin & Destination
  const [originLocationId, setOriginLocationId] = useState<string>('other-south-housing'); // Default: South Housing (Hostels)
  const [destinationLocationId, setDestinationLocationId] = useState<string>('room-apj001'); // Default: APJ001

  // Active / Selected Pin Details
  const [selectedPinLocation, setSelectedPinLocation] = useState<CampusLocation | null>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);

  // Events user has marked "Going"
  const goingEvents = useMemo(() => {
    return events.filter((e) => e.item_type !== 'application' && goingEventIds.includes(e.id));
  }, [events, goingEventIds]);

  // Map going events to best matching campus locations
  const eventsWithLocations = useMemo(() => {
    return goingEvents.map((evt) => {
      const query = (evt.room_specific || evt.venue_zone || '').toLowerCase();
      const matched = ALL_CAMPUS_LOCATIONS.find((loc) => 
        query.includes(loc.name.toLowerCase()) || 
        loc.name.toLowerCase().includes(query) ||
        (loc.building && query.includes(loc.building.toLowerCase()))
      ) || ALL_CAMPUS_LOCATIONS[0];

      return {
        event: evt,
        location: matched,
      };
    });
  }, [goingEvents]);

  // Compute calculated walking route between Origin and Destination
  const activeRoute: CampusRouteResult | null = useMemo(() => {
    if (!originLocationId || !destinationLocationId) return null;
    return calculateCampusRoute(originLocationId, destinationLocationId);
  }, [originLocationId, destinationLocationId]);

  // Filtered locations for Directory
  const filteredLocations = useMemo(() => {
    return ALL_CAMPUS_LOCATIONS.filter((loc) => {
      // Category filter
      if (selectedCategory !== 'All' && loc.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesBuilding = loc.building.toLowerCase().includes(q);
        const matchesFloor = (loc.floor || '').toLowerCase().includes(q);
        const matchesCategory = loc.category.toLowerCase().includes(q);
        const matchesDesc = (loc.description || '').toLowerCase().includes(q);
        return matchesName || matchesBuilding || matchesFloor || matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    return {
      All: ALL_CAMPUS_LOCATIONS.length,
      Classrooms: ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Classrooms').length,
      'Auditoriums / Halls': ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Auditoriums / Halls').length,
      Sports: ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Sports').length,
      Others: ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Others').length,
    };
  }, []);

  // Handler to swap start & destination
  const handleSwapRoute = () => {
    const temp = originLocationId;
    setOriginLocationId(destinationLocationId);
    setDestinationLocationId(temp);
  };

  // Handler to set current pin as origin or destination
  const handleSetAsOrigin = (loc: CampusLocation) => {
    setOriginLocationId(loc.id);
    setActiveTabMode('wayfinder');
  };

  const handleSetAsDestination = (loc: CampusLocation) => {
    setDestinationLocationId(loc.id);
    setActiveTabMode('wayfinder');
  };

  // Quick origins chips
  const quickOrigins = [
    { label: '🏠 South Housing', id: 'other-south-housing' },
    { label: '🍽️ Aahar Dining', id: 'other-aahar' },
    { label: '📚 Library', id: 'other-vivekananda-library' },
    { label: '☕ Charlies', id: 'other-charlies' },
    { label: '🏆 Arjuna Complex', id: 'sports-arjuna-complex-main' },
  ];

  // Helper for Category icons
  const getCategoryIcon = (category: CampusVenueCategory) => {
    switch (category) {
      case 'Classrooms':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-400" />;
      case 'Auditoriums / Halls':
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      case 'Sports':
        return <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Others':
        return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-5 px-3 sm:px-6">
      
      {/* ============================================================ */}
      {/* 1. EDITORIAL HEADER & CAMPUS MAP CONTROLS                    */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#3d362b]">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-urgent text-[11px] bg-red-950/70 border-red-500 text-red-200">
              Campus Cartography &amp; Wayfinding
            </span>
            <span className="text-xs text-[#d6cbaf] font-mono">
              FLAME University Pune (18.5233° N, 73.7317° E)
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-[#fbf7ee] mt-1 tracking-tight">
            Campus Wayfinder &amp; <span className="text-amber-400 font-serif italic">Interactive Map</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#b8ab96] font-sans-ui mt-0.5 max-w-2xl">
            Input where you are to calculate walking time, step-by-step route directions, and room locations across all 75+ classrooms, auditoriums, sports arenas, and eateries.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-[#1c1a17] border border-[#473d2f] rounded-full text-xs font-medium">
            <button
              onClick={() => setActiveTabMode('wayfinder')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                activeTabMode === 'wayfinder'
                  ? 'bg-[#c93b2b] text-white shadow-sm font-bold'
                  : 'text-[#d6cbaf] hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Wayfinder</span>
            </button>

            <button
              onClick={() => setActiveTabMode('directory')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                activeTabMode === 'directory'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm font-bold'
                  : 'text-[#d6cbaf] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Directory ({ALL_CAMPUS_LOCATIONS.length})</span>
            </button>

            <button
              onClick={() => setActiveTabMode('my-events')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                activeTabMode === 'my-events'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-[#d6cbaf] hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>My Plan Stops ({goingEvents.length})</span>
            </button>
          </div>

          {/* Map Layer Toggle (Illustrated vs Google Satellite) */}
          <div className="flex items-center p-1 bg-[#24201a] border border-[#473d2f] rounded-full text-xs">
            <button
              onClick={() => setMapRenderType('illustrated')}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] transition-all ${
                mapRenderType === 'illustrated'
                  ? 'bg-[#3b3327] text-amber-200 font-semibold'
                  : 'text-[#9b8d74] hover:text-[#d6cbaf]'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Illustrated Map</span>
            </button>
            <button
              onClick={() => setMapRenderType('google-satellite')}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] transition-all ${
                mapRenderType === 'google-satellite'
                  ? 'bg-[#3b3327] text-amber-200 font-semibold'
                  : 'text-[#9b8d74] hover:text-[#d6cbaf]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Google Maps</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. WAYFINDER QUICK-BAR: ORIGIN -> DESTINATION                */}
      {/* ============================================================ */}
      {activeTabMode === 'wayfinder' && (
        <div className="mb-6 p-4 sm:p-5 bg-[#24201a] border border-[#4d402f] rounded-sm shadow-xl animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* From -> To Selectors */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              
              {/* Origin Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Where are you now? (Current Location)</span>
                  </label>
                </div>
                <div className="relative">
                  <select
                    value={originLocationId}
                    onChange={(e) => setOriginLocationId(e.target.value)}
                    className="w-full bg-[#1b1814] border border-[#4d402f] text-[#fbf7ee] text-xs sm:text-sm rounded p-2.5 pr-8 focus:outline-none focus:border-emerald-500 font-sans-ui"
                  >
                    <optgroup label="Popular Starting Points">
                      <option value="other-south-housing">🏠 South Housing Area (Hostels)</option>
                      <option value="other-s-block">🏢 S-Block Hostel</option>
                      <option value="other-aahar">🍽️ Aahar Main Dining Hall</option>
                      <option value="other-vivekananda-library">📚 Vivekananda Library</option>
                      <option value="other-charlies">☕ Charlies & Convenience Plaza</option>
                      <option value="sports-arjuna-complex-main">🏆 Arjuna Sports Complex</option>
                    </optgroup>
                    <optgroup label="Classrooms & Academic Blocks">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Classrooms').map((loc) => (
                        <option key={`orig-${loc.id}`} value={loc.id}>
                          {loc.name} · {loc.building} ({loc.floor || 'Ground'})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Auditoriums & Halls">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Auditoriums / Halls').map((loc) => (
                        <option key={`orig-${loc.id}`} value={loc.id}>
                          {loc.name} · {loc.building}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Sports Facilities">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Sports').map((loc) => (
                        <option key={`orig-${loc.id}`} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Eateries & Others">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Others').map((loc) => (
                        <option key={`orig-${loc.id}`} value={loc.id}>
                          {loc.name} · {loc.building}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Destination Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-red-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Where do you want to go? (Destination)</span>
                  </label>
                  <button
                    onClick={handleSwapRoute}
                    title="Swap Start & Destination"
                    className="p-1 hover:bg-[#383125] text-amber-300 rounded flex items-center gap-1 text-[11px]"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={destinationLocationId}
                    onChange={(e) => setDestinationLocationId(e.target.value)}
                    className="w-full bg-[#1b1814] border border-[#4d402f] text-[#fbf7ee] text-xs sm:text-sm rounded p-2.5 pr-8 focus:outline-none focus:border-red-500 font-sans-ui"
                  >
                    <optgroup label="Classrooms (APJ, Aryabhatta, Chandragupta, etc.)">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Classrooms').map((loc) => (
                        <option key={`dest-${loc.id}`} value={loc.id}>
                          {loc.name} · {loc.building} ({loc.floor || 'Ground'})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Auditoriums & Halls">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Auditoriums / Halls').map((loc) => (
                        <option key={`dest-${loc.id}`} value={loc.id}>
                          {loc.name} · {loc.building}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Sports Facilities">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Sports').map((loc) => (
                        <option key={`dest-${loc.id}`} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Eateries, Living & Hubs">
                      {ALL_CAMPUS_LOCATIONS.filter((l) => l.category === 'Others').map((loc) => (
                        <option key={`dest-${loc.id}`} value={loc.id}>
                          {loc.name} · {loc.building}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

            </div>

            {/* Live Walking Metrics Card */}
            {activeRoute && (
              <div className="flex items-center gap-4 bg-[#1a1713] p-3 px-4 rounded border border-[#3d3326] shrink-0">
                <div className="text-center">
                  <span className="text-[10px] text-[#a89b87] uppercase font-mono block">Estimated Walk</span>
                  <div className="flex items-baseline justify-center gap-1 text-amber-300 font-editorial font-black text-2xl">
                    <Clock className="w-4 h-4 text-amber-400 self-center" />
                    <span>{activeRoute.walkTimeMinutes}</span>
                    <span className="text-xs font-sans-ui text-neutral-300">min{activeRoute.walkTimeMinutes > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-[#3d3326]" />

                <div className="text-center">
                  <span className="text-[10px] text-[#a89b87] uppercase font-mono block">Distance</span>
                  <div className="flex items-baseline justify-center gap-1 text-neutral-100 font-mono font-bold text-base">
                    <span>{activeRoute.distanceMeters}</span>
                    <span className="text-xs text-[#a89b87]">meters</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-[#3d3326] hidden sm:block" />

                <div className="text-center hidden sm:block">
                  <span className="text-[10px] text-[#a89b87] uppercase font-mono block">Steps</span>
                  <div className="flex items-baseline justify-center gap-1 text-neutral-100 font-mono font-bold text-base">
                    <Footprints className="w-3.5 h-3.5 text-emerald-400 self-center" />
                    <span>~{activeRoute.stepsCount}</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-[#3d3326]" />

                {/* External Google Maps Button */}
                <a
                  href={activeRoute.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#2a241c] hover:bg-[#362e24] text-amber-200 border border-[#4d402f] hover:border-amber-400/80 rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Open live navigation in Google Maps app"
                >
                  <Navigation className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#a89b87]" />
                </a>
              </div>
            )}
          </div>

          {/* Quick Origin Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#312b23] text-xs">
            <span className="text-[11px] text-[#a89b87] mr-1">Quick Start:</span>
            {quickOrigins.map((q) => (
              <button
                key={q.id}
                onClick={() => setOriginLocationId(q.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-sans-ui transition-all ${
                  originLocationId === q.id
                    ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-[#1e1b16] border border-[#383126] text-[#c7ba9f] hover:text-[#fbf7ee] hover:bg-[#2e281f]'
                }`}
              >
                {q.label}
              </button>
            ))}
            {activeRoute && (
              <span className="ml-auto text-xs text-amber-300/90 font-medium hidden md:inline">
                {activeRoute.paceDescription}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN MAP WORKSPACE: INTERACTIVE CANVAS + ROUTE DRAWER     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: The Visual Map Canvas */}
        <div className="lg:col-span-2 relative bg-[#1c1a17] rounded-sm p-2 sm:p-3 border-4 border-[#3a3227] shadow-2xl overflow-hidden select-none">
          
          {/* Header overlay badge on map */}
          <div className="flex items-center justify-between mb-2 px-1 text-xs text-[#d6cbaf]">
            <div className="flex items-center gap-2">
              <span className="font-editorial text-sm font-bold text-amber-100">
                FLAME University Campus Cartography
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2a241c] border border-[#4d402f] text-neutral-300 font-mono">
                {mapRenderType === 'illustrated' ? 'Illustrated Master Layout' : 'Google Satellite Feed'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#a89b87] font-mono hidden sm:inline">
                Click any venue to route or inspect
              </span>
            </div>
          </div>

          {/* Conditional View: Google Satellite Embed OR Illustrated Canvas */}
          {mapRenderType === 'google-satellite' ? (
            <div className="relative w-full h-[480px] sm:h-[550px] rounded-xs overflow-hidden border border-[#473d2f] bg-[#1a1714]">
              <iframe
                title="Google Maps FLAME University Satellite"
                src="https://maps.google.com/maps?q=FLAME+University+Lavale+Pune&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
              <div className="absolute bottom-3 left-3 bg-[#1c1a17]/95 p-3 rounded-sm border border-[#4a3e31] text-xs text-neutral-100 shadow-xl max-w-sm">
                <p className="font-bold text-amber-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>FLAME University Pune Coordinates</span>
                </p>
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                  Latitude: 18.5233078° N · Longitude: 73.7317384° E
                </p>
                <a
                  href={FLAME_CAMPUS_CENTER.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-300 hover:underline font-semibold"
                >
                  <span>Open Full Screen in Google Maps App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            /* Illustrated Campus Canvas with SVG Route & Pins */
            <div className="relative w-full overflow-hidden rounded-xs bg-[#24201a] border border-[#473d2f]">
              <img
                src="/campus-map.png"
                alt="FLAME Campus Illustrated Map Layout"
                className="w-full h-auto block select-none pointer-events-none"
              />

              {/* Campus Major Zone Watermark Labels on Canvas (Aligned with Real Satellite Layout) */}
              <div className="absolute top-[20%] left-[53%] -translate-x-1/2 pointer-events-none opacity-50 text-amber-200 text-[10px] font-mono tracking-widest uppercase font-bold drop-shadow">
                VKS (Vikram Sarabhai)
              </div>
              <div className="absolute top-[37%] left-[68%] -translate-x-1/2 pointer-events-none opacity-50 text-purple-300 text-[10px] font-mono tracking-widest uppercase font-bold drop-shadow">
                Shantiniketan
              </div>
              <div className="absolute top-[55%] left-[62%] -translate-x-1/2 pointer-events-none opacity-50 text-amber-300 text-[10px] font-mono tracking-widest uppercase font-bold drop-shadow">
                Academic Spine (APJ &amp; ARB)
              </div>
              <div className="absolute top-[56%] left-[44%] -translate-x-1/2 pointer-events-none opacity-50 text-emerald-300 text-[10px] font-mono tracking-widest uppercase font-bold drop-shadow">
                Football &amp; Sports Complex
              </div>
              <div className="absolute top-[70%] left-[63%] -translate-x-1/2 pointer-events-none opacity-50 text-blue-200 text-[10px] font-mono tracking-widest uppercase font-bold drop-shadow">
                Chandragupta
              </div>
              <div className="absolute top-[90%] left-[47%] -translate-x-1/2 pointer-events-none opacity-50 text-neutral-200 text-[10px] font-mono tracking-widest uppercase font-bold drop-shadow">
                South Housing &amp; Dining
              </div>

              {/* ============================================================ */}
              {/* SVG ROUTE LINE LAYER: Turn-by-Turn Path Traced Across Campus */}
              {/* ============================================================ */}
              {activeTabMode === 'wayfinder' && activeRoute && activeRoute.pathCoordinates.length > 1 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#f59e0b" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {/* Base Glow Path */}
                  <polyline
                    points={activeRoute.pathCoordinates.map((pt) => `${pt.x},${pt.y}`).join(' ')}
                    fill="none"
                    stroke="#1c1917"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Animated Dashed Route Line */}
                  <polyline
                    points={activeRoute.pathCoordinates.map((pt) => `${pt.x},${pt.y}`).join(' ')}
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2, 1.5"
                    className="animate-pulse"
                    filter="url(#glow)"
                  />

                  {/* Waypoint Nodes along the Path */}
                  {activeRoute.pathCoordinates.map((pt, idx) => {
                    const isStart = idx === 0;
                    const isEnd = idx === activeRoute.pathCoordinates.length - 1;
                    if (isStart || isEnd) return null;
                    return (
                      <circle
                        key={`wp-${idx}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="0.8"
                        fill="#fef3c7"
                        stroke="#b45309"
                        strokeWidth="0.3"
                      />
                    );
                  })}
                </svg>
              )}

              {/* ============================================================ */}
              {/* CAMPUS PINS LAYER                                            */}
              {/* ============================================================ */}
              {/* Wayfinder Mode: Origin & Destination Pins */}
              {activeTabMode === 'wayfinder' && activeRoute && (
                <>
                  {/* Origin Pin (Green 'A') */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${activeRoute.fromLocation.x}%`,
                      top: `${activeRoute.fromLocation.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="z-30 pointer-events-auto"
                  >
                    <button
                      onClick={() => setSelectedPinLocation(activeRoute.fromLocation)}
                      className="group relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-neutral-950 font-black text-xs shadow-2xl ring-4 ring-emerald-300/60 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
                      <span className="relative z-10 font-mono font-black text-white">A</span>
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-[#1a1713]/90 text-emerald-300 text-[10px] font-mono font-bold rounded shadow-md whitespace-nowrap pointer-events-none border border-emerald-500/40">
                      START: {activeRoute.fromLocation.name}
                    </div>
                  </div>

                  {/* Destination Pin (Red 'B') */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${activeRoute.toLocation.x}%`,
                      top: `${activeRoute.toLocation.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="z-30 pointer-events-auto"
                  >
                    <button
                      onClick={() => setSelectedPinLocation(activeRoute.toLocation)}
                      className="group relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 text-white font-black text-xs shadow-2xl ring-4 ring-red-400/70 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <span className="absolute -inset-1.5 rounded-full bg-red-500/50 animate-ping pointer-events-none" />
                      <span className="relative z-10 font-mono font-black">B</span>
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-[#1a1713]/90 text-red-300 text-[10px] font-mono font-bold rounded shadow-md whitespace-nowrap pointer-events-none border border-red-500/40">
                      DEST: {activeRoute.toLocation.name}
                    </div>
                  </div>
                </>
              )}

              {/* Directory Mode: Filtered Venue Markers */}
              {activeTabMode === 'directory' && (
                filteredLocations.map((loc) => {
                  const isHovered = hoveredLocationId === loc.id;
                  const isSelected = selectedPinLocation?.id === loc.id;

                  return (
                    <div
                      key={`dir-pin-${loc.id}`}
                      style={{
                        position: 'absolute',
                        left: `${loc.x}%`,
                        top: `${loc.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="z-25"
                    >
                      <button
                        onClick={() => setSelectedPinLocation(loc)}
                        onMouseEnter={() => setHoveredLocationId(loc.id)}
                        onMouseLeave={() => setHoveredLocationId(null)}
                        className={`group relative flex items-center justify-center transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'w-6 h-6 rounded-full bg-amber-300 text-neutral-950 scale-125 ring-2 ring-red-500 z-40 shadow-xl'
                            : isHovered
                            ? 'w-5 h-5 rounded-full bg-amber-400 text-neutral-900 scale-110 ring-1 ring-white z-35 shadow-md'
                            : 'w-3.5 h-3.5 rounded-full bg-[#c93b2b] text-white opacity-85 hover:opacity-100 hover:scale-125 ring-1 ring-amber-200/60'
                        }`}
                        title={`${loc.name} (${loc.building})`}
                      >
                        <span className="text-[9px] font-mono font-bold leading-none">
                          {isSelected ? '📍' : ''}
                        </span>
                      </button>

                      {/* Mini Tooltip on Hover */}
                      {(isHovered || isSelected) && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#1a1713] text-[#fbf7ee] text-[11px] font-medium rounded shadow-xl border border-amber-400/80 whitespace-nowrap z-50 pointer-events-none">
                          <span className="font-bold text-amber-300">{loc.name}</span>
                          <span className="text-[#a89b87] ml-1">· {loc.building}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* My Events Mode: Numbered Itinerary Pins */}
              {activeTabMode === 'my-events' && (
                eventsWithLocations.map(({ event, location }, idx) => {
                  const pinNumber = idx + 1;
                  const isSelected = selectedPinLocation?.id === location.id;

                  return (
                    <div
                      key={`evt-pin-${event.id}`}
                      style={{
                        position: 'absolute',
                        left: `${location.x}%`,
                        top: `${location.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="z-30"
                    >
                      <button
                        onClick={() => setSelectedPinLocation(location)}
                        className={`group relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs shadow-2xl transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-300 text-neutral-950 scale-125 ring-4 ring-red-500 z-40'
                            : 'bg-[#c93b2b] text-white hover:scale-110 ring-2 ring-amber-200'
                        }`}
                      >
                        <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
                        <span className="relative z-10 font-mono font-bold">#{pinNumber}</span>
                      </button>

                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-[#1a1713]/90 text-amber-200 text-[10px] font-mono font-bold rounded shadow-md whitespace-nowrap pointer-events-none border border-[#4d402f]">
                        #{pinNumber} {event.event_name.slice(0, 18)}...
                      </div>
                    </div>
                  );
                })
              )}

            </div>
          )}

          {/* Footer bar below canvas */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2 text-[11px] text-[#9b8d74]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Start (Origin)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Destination
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Hub Node
              </span>
            </div>
            <span>Scale: ~80 meters per walking minute across pedestrian spine</span>
          </div>
        </div>

        {/* Right Col: Dynamic Context Drawer (Route Itinerary / Directory / Event Details) */}
        <div className="space-y-4">
          
          {/* ============================================================ */}
          {/* TAB A: WAYFINDER TURN-BY-TURN INSTRUCTIONS                   */}
          {/* ============================================================ */}
          {activeTabMode === 'wayfinder' && activeRoute && (
            <div className="bg-[#24201a] border border-[#3f3629] rounded-sm p-4 text-neutral-100 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#3a3227] mb-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Campus Walking Guide
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-amber-100">
                    Route Directions
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#1a1713] text-amber-300 font-mono text-xs border border-[#4d402f]">
                  ⏱️ {activeRoute.walkTimeMinutes} min walk
                </span>
              </div>

              {/* Destination Highlight Box */}
              <div className="p-3 bg-[#1c1915] border border-[#4d402f] rounded-xs mb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#a89b87] uppercase font-mono block">Arriving at:</span>
                    <h4 className="font-editorial text-base font-bold text-[#fbf7ee]">
                      {activeRoute.toLocation.name}
                    </h4>
                    <p className="text-xs text-amber-300 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-red-400 shrink-0" />
                      <span>{activeRoute.toLocation.building}</span>
                      {activeRoute.toLocation.floor && <span>· {activeRoute.toLocation.floor}</span>}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/70 border border-red-500/40 text-red-300 font-mono">
                    {activeRoute.toLocation.category}
                  </span>
                </div>
                {activeRoute.toLocation.description && (
                  <p className="text-[11px] text-[#b8aa93] mt-2 font-sans-ui leading-relaxed border-t border-[#312b23] pt-2">
                    {activeRoute.toLocation.description}
                  </p>
                )}
              </div>

              {/* Turn-by-Turn Steps */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {activeRoute.steps.map((st, index) => {
                  const isFirst = index === 0;
                  const isLast = index === activeRoute.steps.length - 1;

                  return (
                    <div
                      key={`step-${index}`}
                      className="flex items-start gap-2.5 text-xs font-sans-ui p-2 rounded bg-[#1b1814] border border-[#332b21]"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono font-bold ${
                        isFirst
                          ? 'bg-emerald-500 text-neutral-950'
                          : isLast
                          ? 'bg-red-500 text-white'
                          : 'bg-[#3b3227] text-amber-200'
                      }`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`leading-snug ${isLast ? 'font-bold text-amber-200' : 'text-[#e5dcce]'}`}>
                          {st.instruction}
                        </p>
                        {st.distanceMeters > 0 && (
                          <span className="text-[10px] text-[#8c7e68] font-mono mt-0.5 block">
                            ~{st.distanceMeters}m leg
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#3a3227] flex items-center gap-2">
                <a
                  href={activeRoute.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Start Live Google Route</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => setSelectedPinLocation(activeRoute.toLocation)}
                  className="px-3 py-2 bg-[#2a241b] hover:bg-[#383126] text-[#d6cbaf] hover:text-white rounded text-xs border border-[#4d402f] transition-colors"
                >
                  Inspect Venue
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB B: CAMPUS DIRECTORY & SEARCH                             */}
          {/* ============================================================ */}
          {activeTabMode === 'directory' && (
            <div className="bg-[#24201a] border border-[#3f3629] rounded-sm p-4 text-neutral-100 shadow-xl animate-fade-in">
              <div className="pb-3 border-b border-[#3a3227] mb-3">
                <h3 className="font-editorial text-lg font-bold text-amber-100">
                  Campus Venue Directory
                </h3>
                <p className="text-xs text-[#a89b87] mt-0.5">
                  Showing {filteredLocations.length} of {ALL_CAMPUS_LOCATIONS.length} mapped campus places
                </p>

                {/* Instant Search Bar */}
                <div className="relative mt-2.5">
                  <Search className="w-4 h-4 text-[#8c7e68] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by room, hall, sport or building..."
                    className="w-full bg-[#1b1814] border border-[#4d402f] text-neutral-100 text-xs rounded pl-9 pr-8 py-2 focus:outline-none focus:border-amber-400 placeholder-[#7c6f5d]"
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

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {(['All', 'Classrooms', 'Auditoriums / Halls', 'Sports', 'Others'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded text-[11px] font-sans-ui transition-all ${
                        selectedCategory === cat
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                          : 'bg-[#1b1814] border border-[#3f3629] text-[#c7ba9f] hover:text-white'
                      }`}
                    >
                      {cat} ({categoryCounts[cat]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Directory List */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredLocations.map((loc) => {
                  const isSelected = selectedPinLocation?.id === loc.id;

                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedPinLocation(loc)}
                      className={`p-2.5 rounded border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#362f25] border-amber-400 shadow-md'
                          : 'bg-[#1b1814] border-[#362e24] hover:border-[#524634]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(loc.category)}
                            <h4 className="font-editorial text-sm font-bold text-[#f5ebd7] truncate">
                              {loc.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#a89b87] mt-1 font-sans-ui">
                            <span className="truncate text-amber-200/90 font-medium">{loc.building}</span>
                            {loc.floor && <span>· {loc.floor}</span>}
                          </div>
                        </div>

                        {/* Quick Route Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetAsDestination(loc);
                          }}
                          className="px-2 py-1 bg-[#2e271e] hover:bg-[#c93b2b] text-amber-200 hover:text-white rounded text-[10px] font-bold border border-[#4a3e31] transition-colors shrink-0 flex items-center gap-1"
                          title="Calculate route to this venue"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>Route</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB C: MY EVENTS COMMITTED STOPS                             */}
          {/* ============================================================ */}
          {activeTabMode === 'my-events' && (
            <div className="bg-[#24201a] border border-[#3f3629] rounded-sm p-4 text-neutral-100 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#3a3227] mb-3">
                <h3 className="font-editorial text-lg font-bold text-amber-100">
                  Committed Campus Stops
                </h3>
                <span className="text-xs text-[#a89b87] font-mono">
                  {goingEvents.length} Pins
                </span>
              </div>

              {goingEvents.length === 0 ? (
                <div className="text-center py-8 px-4 bg-[#1b1814] rounded border border-dashed border-[#473d2f]">
                  <Compass className="w-8 h-8 text-[#8c7e68] mx-auto mb-2 opacity-60" />
                  <p className="font-editorial text-sm font-bold text-amber-200">
                    No Campus Stops Yet!
                  </p>
                  <p className="text-xs text-[#a89b87] mt-1">
                    Mark &ldquo;I&apos;m Going&rdquo; on talks, matches, or club meetings to pin them here automatically.
                  </p>
                  <button
                    onClick={() => setCurrentTab('explore')}
                    className="mt-3 px-3 py-1.5 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 rounded text-xs font-bold shadow-sm"
                  >
                    Discover Events to Pin
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {eventsWithLocations.map(({ event, location }, idx) => {
                    const pinNumber = idx + 1;
                    const isSelected = selectedPinLocation?.id === location.id;

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedPinLocation(location)}
                        className={`p-3 rounded-sm border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#362f25] border-amber-400 shadow-md'
                            : 'bg-[#1b1814] border-[#383126] hover:border-[#524634]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#c93b2b] text-white text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            #{pinNumber}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-editorial text-sm font-bold text-[#f5ebd7] leading-snug truncate">
                              {event.event_name}
                            </h4>

                            <div className="flex items-center gap-1 text-[11px] text-amber-200/90 mt-1">
                              <MapPin className="w-3 h-3 text-[#e25845] shrink-0" />
                              <span className="truncate font-semibold">{location.name}</span>
                              <span className="truncate text-neutral-300">({location.building})</span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2e271f] text-[10px]">
                              <span className="font-mono text-neutral-400">{event.time_start_end}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetAsDestination(location);
                                  }}
                                  className="text-amber-300 hover:underline flex items-center gap-0.5 font-bold"
                                >
                                  <Navigation className="w-2.5 h-2.5" />
                                  <span>Route Here</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEventDetail(event);
                                  }}
                                  className="text-neutral-400 hover:text-white"
                                >
                                  Details &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* INSPECTED VENUE MODAL / POPUP DETAILS                        */}
          {/* ============================================================ */}
          {selectedPinLocation && (
            <div className="bg-[#1e1b16] border-2 border-amber-400/90 rounded-sm p-4 text-neutral-100 shadow-2xl animate-fade-in relative">
              <button
                onClick={() => setSelectedPinLocation(null)}
                className="absolute top-2.5 right-2.5 p-1 text-[#8c7e68] hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#c93b2b] text-amber-100">
                  {selectedPinLocation.category}
                </span>
                <span className="text-[11px] font-mono text-[#a89b87]">
                  Zone: {selectedPinLocation.zone}
                </span>
              </div>

              <h4 className="font-editorial text-lg font-bold text-[#fbf7ee]">
                {selectedPinLocation.name}
              </h4>

              <div className="mt-1 space-y-1 text-xs text-[#d6cbaf] font-sans-ui">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold">{selectedPinLocation.building}</span>
                  {selectedPinLocation.floor && <span>· {selectedPinLocation.floor}</span>}
                </div>
                {selectedPinLocation.description && (
                  <p className="text-[11px] text-[#b8aa93] mt-2 leading-relaxed bg-[#151310] p-2.5 rounded border border-[#362e24]">
                    {selectedPinLocation.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-3 border-t border-[#3a3227] grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSetAsOrigin(selectedPinLocation)}
                  className="py-1.5 bg-[#2a241b] hover:bg-[#362e24] text-emerald-300 border border-emerald-500/40 rounded text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>Set as Start (I&apos;m here)</span>
                </button>

                <button
                  onClick={() => handleSetAsDestination(selectedPinLocation)}
                  className="py-1.5 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 rounded text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Navigate Here</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
