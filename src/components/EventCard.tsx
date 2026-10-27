'use client';

import React from 'react';
import { EventItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Bookmark, 
  Check, 
  AlertCircle,
  ExternalLink,
  Users,
  Edit3,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { 
  getEventSavedCount, 
  getEventGoingCount, 
  getEventFavouriteCount 
} from '@/lib/constants';

interface EventCardProps {
  event: EventItem;
  rotationIndex?: number; // 0, 1, 2, 3 to produce subtle 1-3 deg organic collage tilt
}

export const EventCard: React.FC<EventCardProps> = ({ event, rotationIndex = 0 }) => {
  const {
    user,
    isAuthenticated,
    savedEventIds,
    goingEventIds,
    favouriteEventIds,
    favouriteCategories,
    toggleSaveEvent,
    toggleGoingEvent,
    toggleFavouriteEvent,
    toggleFavouriteCategory,
    openAuthModal,
    openEventDetail,
    openEditEvent,
    deleteEvent,
    openEventFeedback,
    isUserAuthor,
    canEditEvent,
  } = useApp();

  const isSaved = savedEventIds.includes(event.id);
  const isGoing = goingEventIds.includes(event.id);
  const isFavourited = favouriteEventIds.includes(event.id);
  const eventCategoryList = Array.isArray(event.categories) && event.categories.length > 0
    ? event.categories
    : (event.category ? event.category.split(',').map((c: string) => c.trim()) : []);
  const isFavCategory = eventCategoryList.some((c) => (favouriteCategories as string[]).includes(c));
  const isCancelled = event.status === 'Cancelled';

  const savedCount = getEventSavedCount(event, savedEventIds);
  const goingCount = getEventGoingCount(event, goingEventIds);
  const favCount = getEventFavouriteCount(event, favouriteEventIds);
  
  // RBAC Permission: Admin can edit any; Club can edit their own; Student can edit none
  const isAuthor = isUserAuthor(event);
  const canEdit = canEditEvent ? canEditEvent(event) : false;
  const isTentative = Boolean(
    event.is_tentative || 
    event.time_start_end?.toLowerCase().includes('tentative') ||
    event.requirements_eligibility?.includes('[TENTATIVE]')
  );

  const [todayStr, setTodayStr] = React.useState('');
  React.useEffect(() => {
    const today = new Date();
    // Adjust to local date string yyyy-mm-dd
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setTodayStr(`${year}-${month}-${day}`);
  }, []);

  const isDatePassed = todayStr ? event.date < todayStr : false;
  const isCompleted = event.status === 'Completed' || isDatePassed;
  const averageRating = (event.ratings?.length || 0) > 0 
    ? (event.ratings!.reduce((sum: number, r: any) => sum + r.score, 0) / event.ratings!.length).toFixed(1)
    : null;

  // Check if past deadline for Closed state
  const [isPastDeadline, setIsPastDeadline] = React.useState(false);

  React.useEffect(() => {
    if (event.registration_deadline) {
      const deadlineDate = new Date(event.registration_deadline);
      if (!isNaN(deadlineDate.getTime()) && deadlineDate < new Date()) {
        setIsPastDeadline(true);
      }
    }
  }, [event.registration_deadline]);

  const isRegistrationClosed = event.status === 'Registration Closed' || isPastDeadline;

  // Apply grayscale only for events that are over
  const applyGrayscaleFilter = isCompleted;

  // Determine tilt style
  const tiltClasses = ['tilt-1', 'tilt-n1', 'tilt-2', 'tilt-n2', 'tilt-1'];
  const tiltClass = tiltClasses[rotationIndex % tiltClasses.length];

  // Tape color motif rotation (Midnight Washi Tapes)
  const tapeStyles = [
    'bg-rose-500/25 border border-rose-500/30', // neon rose tape
    'bg-amber-400/25 border border-amber-400/30', // warm gold foil tape
    'bg-sky-400/20 border border-sky-400/30', // subtle cyan tape
    'bg-rose-600/30 border border-rose-500/40', // deep crimson tape
  ];
  const tapeBg = tapeStyles[rotationIndex % tapeStyles.length];


  const handleActionClick = (e: React.MouseEvent, actionType: 'favourite' | 'going' | 'save') => {
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal('Sign in with your FLAME email to save this event and build your plan.');
      return;
    }

    if (actionType === 'favourite') {
      toggleFavouriteEvent(event.id);
    } else if (actionType === 'going') {
      toggleGoingEvent(event.id);
    } else if (actionType === 'save') {
      toggleSaveEvent(event.id);
    }
  };

  return (
    <div
      onClick={() => openEventDetail(event)}
      className={`group relative polaroid-card ${tiltClass} p-3.5 sm:p-4 text-white cursor-pointer select-none transition-all duration-300 ${
        applyGrayscaleFilter ? 'filter grayscale contrast-90 opacity-70' : ''
      }`}
    >
      {/* Scrapbook Tape Motif */}
      <div 
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 ${tapeBg} shadow-sm backdrop-blur-xs rotate-[-1deg] clip-path-tape z-10 pointer-events-none rounded-2xs`}
        style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
      />

      {/* Cancelled Stamp Overlay */}
      {isCancelled && (
        <div className="stamp-cancelled">
          CANCELLED
        </div>
      )}

      {isCompleted && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center p-3 bg-black/75 rounded-xl backdrop-blur-md pointer-events-none rotate-[-5deg] border border-rose-500/30 shadow-2xl">
          <div className="flex items-center gap-1 mb-1">
            <Star className={`w-5 h-5 ${averageRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-400'}`} />
            {averageRating && <span className="text-white font-bold text-lg">{averageRating}</span>}
          </div>
          <span className="text-rose-200 text-[10px] font-bold uppercase tracking-widest">Completed</span>
        </div>
      )}

      {/* Polaroid Image Anchor or Paper Graphic Box */}
      <div className="relative w-full aspect-16/10 rounded-lg overflow-hidden bg-[#181420] border border-white/5 shadow-inner mb-3">
        {event.event_image ? (
          <img
            src={event.event_image}
            alt={event.event_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1724] to-[#110e17] p-4 text-center">
            <Calendar className="w-8 h-8 text-rose-500/40 mb-1" />
            <span className="font-editorial text-xs italic text-neutral-400">FLAME Campus Event</span>
          </div>
        )}

        {/* Registration Fee pinned to top-left of photo (if present) */}
        {event.registration_fee && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-tight rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm backdrop-blur-xs">
              {event.registration_fee.toLowerCase() === 'free' ? 'FREE' : `🎟️ ${event.registration_fee}`}
            </span>
          </div>
        )}

        {/* Tentative Badge pinned to top-right of photo */}
        {isTentative && !isCancelled && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 shadow-xs rounded-full">
              🗓️ Tentative
            </span>
          </div>
        )}

        {/* Registration Deadline Banner */}
        {event.registration_deadline && !isCancelled && !isTentative && (
          <div className="absolute bottom-2 right-2 z-10">
            {isPastDeadline ? (
              <span className="inline-block px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-black/70 text-neutral-300 border border-white/10 backdrop-blur-md rounded-full shadow-sm">
                Deadline Passed
              </span>
            ) : (
              <span className="stamp-urgent">
                <span>Deadline:</span>
                <span>{event.registration_deadline.split(' ')[0]}</span>
              </span>
            )}
          </div>
        )}

        {/* Hover/Tap Action Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-wrap items-center justify-center gap-2 p-2 z-20 backdrop-blur-xs">
          {/* Favourite (Star Icon) */}
          <button
            onClick={(e) => handleActionClick(e, 'favourite')}
            title={isFavourited ? 'Remove from Favourites' : 'Favourite Event (Keep on Board)'}
            className={`p-2 rounded-full transition-transform active:scale-90 shadow-md ${
              isFavourited
                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                : 'bg-white/15 text-white hover:bg-amber-400 hover:text-amber-950 border border-white/20'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavourited ? 'fill-amber-950' : ''}`} />
          </button>

          {/* I'm Going (Pill) */}
          {!isCompleted && (
            <button
              onClick={(e) => handleActionClick(e, 'going')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-90 shadow-md flex items-center gap-1.5 ${
                isGoing
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                  : 'bg-white/15 text-white hover:bg-emerald-500 hover:text-white border border-white/20'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isGoing ? "Going!" : "Going"}</span>
            </button>
          )}

          {/* Save (Pill) */}
          {!isCompleted && (
            <button
              onClick={(e) => handleActionClick(e, 'save')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-90 shadow-md flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white ring-2 ring-rose-400'
                  : 'bg-white/15 text-white hover:bg-[#ff2d55] hover:text-white border border-white/20'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}{savedCount > 0 ? ` (${savedCount})` : ''}</span>
            </button>
          )}

          {/* Feedback Option ONLY for events that are completed */}
          {isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEventFeedback(event);
              }}
              title="Rate & Review Completed Event"
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-90 shadow-md flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 ring-2 ring-amber-200/80 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-950" />
              <span>Rate Event</span>
            </button>
          )}

          {/* Quick Edit & Remove (Author or admin) */}
          {canEdit && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditEvent(event);
                }}
                title="Edit Your Event"
                className="p-2 rounded-full bg-amber-400 text-amber-950 hover:bg-amber-300 transition-transform active:scale-90 shadow-md cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to remove "${event.event_name}"?`)) {
                    deleteEvent(event.id);
                  }
                }}
                title="Remove Your Event"
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-transform active:scale-90 shadow-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Polaroid Text & Functional UI Metadata */}
      <div className="flex flex-col space-y-2">
        
        {/* Title in Editorial Serif */}
        <h3 className="font-editorial text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-rose-400 transition-colors">
          {event.event_name}
        </h3>

        {/* Date & Time line */}
        <div className="flex items-center gap-2 text-xs text-neutral-300 font-sans-ui">
          <div className="flex items-center gap-1.5 font-medium text-neutral-200">
            <Calendar className="w-3.5 h-3.5 text-[#ff2d55] shrink-0" />
            <span>{event.date}</span>
            {isTentative && (
              <span className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-semibold">
                TBD
              </span>
            )}
          </div>

          {event.time_start_end && (
            <>
              <span className="text-neutral-600">·</span>
              <div className="flex items-center gap-1 text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">{event.time_start_end}</span>
              </div>
            </>
          )}
        </div>

        {/* Venue Zone & Specific Room */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-sans-ui truncate">
          <MapPin className="w-3.5 h-3.5 text-[#ff2d55] shrink-0" />
          <span className="text-neutral-300 font-medium">{event.venue_zone}</span>
          {event.room_specific && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="truncate text-neutral-400">{event.room_specific}</span>
            </>
          )}
        </div>

        {/* Organizer annotation in handwritten font & clean status indicators */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
          <span 
            className="font-handwritten text-sm text-rose-300/85 truncate" 
            title={event.poc_name ? `POC: ${event.poc_name}` : undefined}
          >
            by {event.organizer}
          </span>

          {/* Clean minimal status chips without clutter */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isAuthor ? (
              <span className="text-[9px] font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Your Post
              </span>
            ) : isGoing ? (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Going
              </span>
            ) : isSaved ? (
              <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Bookmark className="w-2.5 h-2.5 fill-rose-400" /> Saved
              </span>
            ) : savedCount > 0 ? (
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-sans-ui">
                <Bookmark className="w-2.5 h-2.5 text-neutral-500" /> {savedCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

