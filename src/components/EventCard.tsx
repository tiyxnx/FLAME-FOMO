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
    openEventFeedback,
  } = useApp();

  const isSaved = savedEventIds.includes(event.id);
  const isGoing = goingEventIds.includes(event.id);
  const isFavourited = favouriteEventIds.includes(event.id);
  const isFavCategory = favouriteCategories.includes(event.category);
  const isCancelled = event.status === 'Cancelled';

  const savedCount = getEventSavedCount(event, savedEventIds);
  const goingCount = getEventGoingCount(event, goingEventIds);
  const favCount = getEventFavouriteCount(event, favouriteEventIds);
  const isAdmin = Boolean(
    isAuthenticated && 
    user?.flame_email && 
    user.flame_email.toLowerCase().trim() === 'tiyana.shah@flame.edu.in'
  );
  const isAuthor = Boolean(
    isAuthenticated &&
    user?.flame_email &&
    event.submitted_by &&
    event.submitted_by.toLowerCase().trim() === user.flame_email.toLowerCase().trim()
  );
  const canEdit = isAuthor || isAdmin;
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

  // Tape color motif rotation
  const tapeStyles = [
    'bg-[#f3da90]/80', // kraft gold
    'bg-[#f5afa8]/80', // soft rose
    'bg-[#a2d9ce]/80', // seafoam green
    'bg-[#e2cbb0]/80', // parchment
  ];
  const tapeBg = tapeStyles[rotationIndex % tapeStyles.length];

  // Category tone styling
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Performances':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Competitions':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Sports':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Academic':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Clubs':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Social':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Workshops':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Career':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Talks/Lectures':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

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
      className={`group relative polaroid-card ${tiltClass} p-3.5 sm:p-4 text-neutral-900 cursor-pointer select-none transition-all duration-300 ${
        applyGrayscaleFilter ? 'filter grayscale contrast-90 opacity-80' : ''
      }`}
    >
      {/* Scrapbook Tape / Pinned Edge Motif */}
      <div 
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 ${tapeBg} shadow-sm backdrop-blur-xs rotate-[-1deg] clip-path-tape z-10 pointer-events-none`}
        style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
      />
      <div className="push-pin" />

      {/* Cancelled Stamp Overlay */}
      {isCancelled && (
        <div className="stamp-cancelled">
          CANCELLED
        </div>
      )}

      {isCompleted && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center p-3 bg-black/60 rounded backdrop-blur-sm pointer-events-none rotate-[-5deg] border border-neutral-700 shadow-xl">
          <div className="flex items-center gap-1 mb-1">
            <Star className={`w-5 h-5 ${averageRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-400'}`} />
            {averageRating && <span className="text-white font-bold text-lg">{averageRating}</span>}
          </div>
          <span className="text-neutral-200 text-[10px] font-bold uppercase tracking-widest">Completed</span>
        </div>
      )}

      {/* Polaroid Image Anchor or Paper Graphic Box */}
      <div className="relative w-full aspect-16/10 rounded-sm overflow-hidden bg-[#ebe4d1] border border-neutral-300 shadow-inner mb-3">
        {event.event_image ? (
          <img
            src={event.event_image}
            alt={event.event_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f5eb] to-[#e4dcc7] p-4 text-center">
            <Calendar className="w-8 h-8 text-[#9b8d74] mb-1" />
            <span className="font-editorial text-xs italic text-[#7a6e57]">FLAME Campus Event</span>
          </div>
        )}

        {/* Category Badge & Registration Fee pinned to top-left of photo */}
        <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1 max-w-[75%]">
          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border shadow-sm ${getCategoryBadgeColor(event.category)}`}>
            {event.category}
          </span>
          {event.registration_fee && (
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-tight rounded-xs bg-emerald-900/90 text-emerald-100 border border-emerald-600/60 shadow-sm backdrop-blur-2xs">
              {event.registration_fee.toLowerCase() === 'free' ? 'FREE' : `🎟️ ${event.registration_fee}`}
            </span>
          )}
        </div>

        {/* Tentative Badge pinned to top-right of photo */}
        {isTentative && !isCancelled && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#f3da90] text-[#5c3e0a] border border-[#d3ba6e] shadow-xs rounded-xs">
              🗓️ Tentative
            </span>
          </div>
        )}

        {/* Registration Deadline Banner / Stamp */}
        {event.registration_deadline && !isCancelled && !isTentative && (
          <div className="absolute bottom-2 right-2 z-10">
            {isPastDeadline ? (
              <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-900/90 text-neutral-400 border border-neutral-700 backdrop-blur-xs rounded-xs transform rotate-[-2deg]">
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
        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-wrap items-center justify-center gap-1.5 p-2 z-20 backdrop-blur-xs">
          {/* Favourite (Star Icon) - KEPT ALWAYS */}
          <button
            onClick={(e) => handleActionClick(e, 'favourite')}
            title={isFavourited ? 'Remove from Favourites' : 'Favourite Event (Keep on Board)'}
            className={`p-2 rounded-full transition-transform active:scale-90 shadow-md ${
              isFavourited
                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                : 'bg-white/90 text-neutral-800 hover:bg-white hover:text-amber-500'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavourited ? 'fill-amber-950' : ''}`} />
          </button>

          {/* I'm Going (Pill) - REMOVED WHEN EVENT HAS ENDED */}
          {!isCompleted && (
            <button
              onClick={(e) => handleActionClick(e, 'going')}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-90 shadow-md flex items-center gap-1.5 ${
                isGoing
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                  : 'bg-white/90 text-neutral-900 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isGoing ? "Going!" : "Going"}</span>
            </button>
          )}

          {/* Save (Pill) - REMOVED WHEN EVENT HAS ENDED */}
          {!isCompleted && (
            <button
              onClick={(e) => handleActionClick(e, 'save')}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-90 shadow-md flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-[#c93b2b] text-white ring-2 ring-red-300'
                  : 'bg-white/90 text-neutral-900 hover:bg-[#c93b2b] hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}{savedCount > 0 ? ` (${savedCount})` : ''}</span>
            </button>
          )}

          {/* Feedback Option ONLY for events that are completed / done */}
          {isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEventFeedback(event);
              }}
              title="Rate & Review Completed Event (Verified Attendees)"
              className="px-2.5 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-90 shadow-md flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 ring-2 ring-amber-200/80 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-950" />
              <span>Rate Event</span>
            </button>
          )}

          {/* Quick Edit (Only shown to event author or admin) */}
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditEvent(event);
              }}
              title="Edit Your Event"
              className="p-2 rounded-full bg-amber-400 text-amber-950 hover:bg-amber-300 transition-transform active:scale-90 shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Polaroid Text & Functional UI Metadata */}
      <div className="flex flex-col space-y-1.5">
        
        {/* Title in Editorial Serif */}
        <h3 className="font-editorial text-base sm:text-lg font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-[#c93b2b] transition-colors">
          {event.event_name}
        </h3>

        {/* Date & Time line */}
        <div className="flex items-center gap-3 text-xs text-neutral-700 font-sans-ui pt-0.5">
          <div className="flex items-center gap-1 text-neutral-800 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#c93b2b]" />
            <span>{event.date}</span>
            {isTentative && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded-2xs font-bold">
                TBD
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-neutral-700">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>{event.time_start_end}</span>
          </div>
        </div>

        {/* Venue Zone & Specific Room */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-sans-ui truncate">
          <MapPin className="w-3.5 h-3.5 text-[#c93b2b] shrink-0" />
          <span className="font-semibold text-neutral-800">{event.venue_zone}</span>
          {event.room_specific && (
            <>
              <span className="text-neutral-400">·</span>
              <span className="truncate text-neutral-600">{event.room_specific}</span>
            </>
          )}
        </div>

        {/* Organizer annotation in handwritten font & student metrics */}
        <div className="flex flex-col pt-1 border-t border-neutral-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-handwritten text-xs text-neutral-500 truncate">
                by {event.organizer}
              </span>
              {isAuthor && (
                <span className="text-[9px] font-bold text-amber-900 bg-amber-200/90 border border-amber-400/80 px-1.5 py-0.2 rounded-2xs uppercase tracking-tight">
                  Your Post
                </span>
              )}
            </div>

            {/* Status indicators and public Saved count */}
            <div className="flex items-center gap-1 shrink-0">
              {isGoing && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> Added
                </span>
              )}
              {isSaved ? (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Bookmark className="w-2.5 h-2.5 fill-amber-800" /> Saved {savedCount > 0 ? `(${savedCount})` : ''}
                </span>
              ) : savedCount > 0 ? (
                <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100/90 border border-neutral-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title={`${savedCount} students saved this event`}>
                  <Bookmark className="w-2.5 h-2.5 text-[#c93b2b]" /> {savedCount} saved
                </span>
              ) : null}
            </div>
          </div>

          {/* Author Real-time Engagement Ribbon */}
          {isAuthor && (
            <div className="mt-1.5 pt-1 border-t border-dashed border-amber-400/70 flex items-center justify-between text-[10px] font-medium text-amber-950 bg-amber-50/80 px-2 py-1 rounded-2xs">
              <span className="font-bold text-[#c93b2b] uppercase text-[9px]">Post Stats:</span>
              <div className="flex items-center gap-2">
                <span title="Students attending">👥 {goingCount} going</span>
                <span title="Students saved">🔖 {savedCount} saved</span>
                <span title="Students favourited">⭐ {favCount}</span>
                {Boolean(event.feedback && event.feedback.length > 0) && (
                  <span title="Student feedback reviews" className="font-bold text-[#c93b2b]">💬 {event.feedback!.length}</span>
                )}
              </div>
            </div>
          )}

          {event.submitted_by && !isAuthor && (
            <span className="text-[9px] text-neutral-400 font-sans-ui mt-0.5 truncate">
              Posted by: {event.submitted_by}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
