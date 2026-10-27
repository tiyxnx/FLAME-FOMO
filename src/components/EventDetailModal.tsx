'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  isEventCompletedOrDone,
  getEventSavedCount,
  getEventGoingCount,
  getEventFavouriteCount
} from '@/lib/constants';
import { 
  X, 
  Calendar, 
  CalendarPlus,
  Clock, 
  MapPin, 
  Star, 
  Bookmark, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Users, 
  Share2,
  Edit3,
  Trash2,
  AlertTriangle,
  Ticket,
  MessageSquare,
  Phone,
  Navigation
} from 'lucide-react';
import { getGoogleCalendarUrl } from '@/lib/googleCalendar';

export const EventDetailModal: React.FC = () => {
  const {
    selectedEventForDetail: event,
    closeEventDetail,
    isAuthenticated,
    user,
    savedEventIds,
    goingEventIds,
    favouriteEventIds,
    favouriteCategories,
    toggleSaveEvent,
    toggleGoingEvent,
    toggleFavouriteEvent,
    toggleFavouriteCategory,
    openAuthModal,
    openEditEvent,
    openEventFeedback,
    deleteEvent,
    setCurrentTab,
    updateEvent,
    isUserAuthor,
    canEditEvent,
  } = useApp();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!event) return null;

  const isSaved = savedEventIds.includes(event.id);
  const isGoing = goingEventIds.includes(event.id);
  const isFavourited = favouriteEventIds.includes(event.id);
  const isCancelled = event.status === 'Cancelled';
  const isCompleted = isEventCompletedOrDone(event);
  
  const averageRating = (event.ratings?.length || 0) > 0 
    ? (event.ratings!.reduce((sum: number, r: any) => sum + r.score, 0) / event.ratings!.length).toFixed(1)
    : null;
  const userRating = event.ratings?.find((r: any) => r.email === user?.flame_email)?.score || 0;

  const isTentative = Boolean(
    event.is_tentative || 
    event.time_start_end?.toLowerCase().includes('tentative') ||
    event.requirements_eligibility?.includes('[TENTATIVE]')
  );

  const feeFromTag = event.requirements_eligibility?.match(/\[FEE:\s*([^\]]+)\]/)?.[1];
  const pocNameFromTag = event.requirements_eligibility?.match(/\[POC_NAME:\s*([^\]]+)\]/)?.[1];
  const pocNumberFromTag = event.requirements_eligibility?.match(/\[POC_NUMBER:\s*([^\]]+)\]/)?.[1];
  const isApplication = event.item_type === 'application';
  const displayFee = event.registration_fee || feeFromTag;
  const displayPocName = event.poc_name || pocNameFromTag;
  const displayPocNumber = event.poc_number || pocNumberFromTag;

  const cleanEligibility = (event.requirements_eligibility || '')
    .replace('[TENTATIVE]', '')
    .replace(/\[FEE:\s*[^\]]+\]/g, '')
    .replace(/\[POC_NAME:\s*[^\]]+\]/g, '')
    .replace(/\[POC_NUMBER:\s*[^\]]+\]/g, '')
    .replace(/\[TYPE:\s*[^\]]+\]/g, '')
    .replace(/\[INTERVIEW:\s*[^\]]+\]/g, '')
    .replace(/\[HAS_INTERVIEW\]/g, '')
    .trim();

  // RBAC Permission: Admin can manage any event; Club can manage their own events; Student can manage none
  const isAuthor = isUserAuthor(event);
  const canManage = canEditEvent ? canEditEvent(event) : false;

  const savedCount = getEventSavedCount(event, savedEventIds);
  const goingCount = getEventGoingCount(event, goingEventIds);
  const favCount = getEventFavouriteCount(event, favouriteEventIds);

  const handleAction = (type: 'going' | 'save' | 'fav') => {
    if (!isAuthenticated) {
      openAuthModal('Sign in with your FLAME email to save this event and build your plan.');
      return;
    }
    if (type === 'going') toggleGoingEvent(event.id);
    if (type === 'save') toggleSaveEvent(event.id);
    if (type === 'fav') toggleFavouriteEvent(event.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#131017] text-[#f4f3f6] rounded-xl shadow-2xl border border-[#2b2438] p-5 sm:p-7"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Scrapbook washi tape at top */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#ff2d55]/80 shadow-[0_0_14px_rgba(255,45,85,0.4)] rotate-1 z-20 pointer-events-none"
          style={{ clipPath: 'polygon(2% 0%, 98% 3%, 100% 97%, 0% 95%)' }}
        />

        {/* Close Button */}
        <button
          onClick={closeEventDetail}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1e1926] hover:bg-[#2b2336] text-[#9d93a8] hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {isApplication ? (
            <span className="px-3 py-1 bg-purple-950/90 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
              <span>📋 Member / Committee Application</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-[#ff2d55]/15 border border-[#ff2d55]/40 text-[#ff758f] text-xs font-bold uppercase tracking-wider rounded-full">
              {event.category}
            </span>
          )}

          {event.has_interview && (
            <span className="px-2.5 py-0.5 bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-bold rounded-full flex items-center gap-1">
              <span>🎙️ Interview Stage</span>
            </span>
          )}

          {!isApplication && displayFee && (
            <span className="px-2.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
              <span>🎟️ {displayFee.toLowerCase() === 'free' ? 'Free Entry' : `Fee: ${displayFee}`}</span>
            </span>
          )}
          {isTentative && (
            <span className="px-2.5 py-0.5 bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase rounded-full flex items-center gap-1">
              <span>🗓️ Tentative Date</span>
            </span>
          )}
          <span className="text-xs text-[#9d93a8] font-handwritten text-base ml-1">
            organized by {event.organizer}
          </span>
          {event.submitted_by && (
            <span className="px-2 py-0.5 bg-[#1e1926] border border-[#2b2438] text-[#9d93a8] text-[10px] rounded-full font-mono" title="Posted by">
              {event.submitted_by}
            </span>
          )}
          {isCancelled && (
            <span className="px-2.5 py-0.5 bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold uppercase rounded-full">
              Application Closed
            </span>
          )}
          {isCompleted && (
            <span className="px-2.5 py-0.5 bg-[#1e1926] text-neutral-400 border border-[#2b2438] text-xs font-bold uppercase rounded-full">
              Closed
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
          {event.event_name}
        </h2>

        {/* Ratings & Feedback block ONLY for completed events */}
        {isCompleted && (
          <div className="mb-4 p-3 bg-[#181420] border border-[#2b2438] rounded-xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f4f3f6] text-xs sm:text-sm">
                Event Completed
              </span>
              <span className="text-neutral-600">|</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-amber-300">{averageRating || 'No ratings yet'}</span>
                <span className="text-xs text-[#9d93a8]">({event.ratings?.length || 0} reviews)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEventFeedback(event)}
                className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reviews &amp; Feedback</span>
              </button>
            </div>
          </div>
        )}

        {/* Tentative Schedule Banner */}
        {isTentative && (
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5 mb-4">
            <span className="text-base shrink-0">🗓️</span>
            <div>
              <p className="font-bold text-amber-300">Tentative Schedule (Subject to Confirmation)</p>
              <p className="text-amber-200/80 mt-0.5">
                {event.tentative_note || 'The date and time for this event are currently tentative and awaiting final room or time allocation.'}
              </p>
            </div>
          </div>
        )}

        {/* Organizer Management Bar (Edit & Delete) */}
        {canManage && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#181420] border border-[#2b2438] rounded-xl mb-4 text-xs font-sans-ui">
            <span className="font-semibold text-neutral-300 flex items-center gap-1">
              <span>🛠️ Organizer Controls:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  closeEventDetail();
                  openEditEvent(event);
                }}
                className="px-3 py-1.5 bg-[#221c2b] hover:bg-[#2e263a] text-neutral-200 border border-[#3b324a] rounded-lg font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              {event.status !== 'Completed' && (
                <button
                  onClick={() => updateEvent(event.id, { status: 'Completed' })}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark Completed</span>
                </button>
              )}

              {event.status !== 'Cancelled' && (
                <button
                  onClick={() => updateEvent(event.id, { status: 'Cancelled' })}
                  className="px-3 py-1.5 bg-[#221c2b] hover:bg-[#2e263a] text-neutral-300 border border-[#3b324a] rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cancel Event</span>
                </button>
              )}

              {showDeleteConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-950/80 p-1 rounded-lg border border-red-500/50 animate-fade-in">
                  <span className="text-[11px] text-red-200 font-bold">Delete permanently?</span>
                  <button
                    onClick={() => {
                      deleteEvent(event.id);
                      closeEventDetail();
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 bg-[#221c2b] text-neutral-300 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Creator Real-time Engagement & Feedback Dashboard */}
        {isAuthor && (
          <div className="mb-5 p-4 bg-[#181420] border border-[#ff2d55]/30 rounded-xl text-neutral-200 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="font-editorial text-[10px] font-bold uppercase tracking-wider bg-[#ff2d55] text-white px-2 py-0.5 rounded-full">
                  Event Stats
                </span>
                <h4 className="font-editorial text-sm font-bold text-white mt-1">
                  How your event is doing
                </h4>
              </div>
              <button
                type="button"
                onClick={() => openEventFeedback(event)}
                className="px-3 py-1.5 bg-[#221c2b] hover:bg-[#2e263a] border border-[#3b324a] text-neutral-200 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors w-fit"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#ff2d55]" />
                <span>{event.feedback?.length || 0} Reviews</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-[#0e0c12] p-2.5 rounded-lg border border-[#2b2438]">
                <span className="text-xl font-black text-emerald-400 block">{goingCount}</span>
                <span className="text-[11px] text-[#9d93a8] font-semibold">Going</span>
              </div>
              <div className="bg-[#0e0c12] p-2.5 rounded-lg border border-[#2b2438]">
                <span className="text-xl font-black text-[#ff2d55] block">{savedCount}</span>
                <span className="text-[11px] text-[#9d93a8] font-semibold">Saved</span>
              </div>
              <div className="bg-[#0e0c12] p-2.5 rounded-lg border border-[#2b2438]">
                <span className="text-xl font-black text-amber-400 block">{favCount}</span>
                <span className="text-[11px] text-[#9d93a8] font-semibold">Favourited</span>
              </div>
            </div>
          </div>
        )}

        {/* Visual photo if present */}
        {event.event_image && (
          <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden mb-5 border border-[#2b2438] shadow-md bg-[#0e0c12]">
            <img
              src={event.event_image}
              alt={event.event_name}
              className="w-full h-full object-cover"
            />
            {event.registration_deadline && !isCancelled && (
              <div className="absolute top-3 right-3">
                <span className="stamp-urgent text-xs">
                  Deadline: {event.registration_deadline}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Metadata Pill Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 bg-[#181420] border border-[#262030] rounded-xl font-sans-ui text-xs">
          <div className="flex items-center gap-2.5 text-neutral-200">
            <Calendar className="w-4 h-4 text-[#ff2d55] shrink-0" />
            <div>
              <span className="text-[#8a7f96] text-[10px] uppercase font-bold block">Date</span>
              <span className="font-semibold text-sm text-white">
                {event.date} {isTentative ? '(Tentative)' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-neutral-200">
            <Clock className="w-4 h-4 text-[#ff2d55] shrink-0" />
            <div>
              <span className="text-[#8a7f96] text-[10px] uppercase font-bold block">Time</span>
              <span className="font-semibold text-sm text-white">{event.time_start_end}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-neutral-200">
            <MapPin className="w-4 h-4 text-[#ff2d55] shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[#8a7f96] text-[10px] uppercase font-bold block">Venue</span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="font-semibold text-sm text-white">
                  {event.venue_zone} {event.room_specific ? `· ${event.room_specific}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    closeEventDetail();
                    setCurrentTab('campus-map');
                  }}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-[#ff2d55]/15 hover:bg-[#ff2d55]/25 text-[#ff758f] border border-[#ff2d55]/30 font-bold flex items-center gap-1 transition-colors"
                  title="View building and walking route on Campus Map"
                >
                  <Navigation className="w-2.5 h-2.5" />
                  <span>Campus Wayfinder</span>
                </button>
              </div>
            </div>
          </div>

          {/* Public Saved count */}
          <div className="flex items-center gap-2.5 text-neutral-200">
            <Bookmark className="w-4 h-4 text-[#ff2d55] shrink-0" />
            <div>
              <span className="text-[#8a7f96] text-[10px] uppercase font-bold block">Saved</span>
              <span className="font-semibold text-sm text-white">
                {savedCount} {savedCount === 1 ? 'student saved this' : 'students saved this'}
              </span>
            </div>
          </div>

          {displayFee && (
            <div className="flex items-center gap-2.5 text-neutral-200">
              <Ticket className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[#8a7f96] text-[10px] uppercase font-bold block">Registration Fee</span>
                <span className="font-semibold text-sm text-emerald-300">{displayFee}</span>
              </div>
            </div>
          )}

          {cleanEligibility && (
            <div className="flex items-center gap-2.5 text-neutral-200">
              <Users className="w-4 h-4 text-[#ff2d55] shrink-0" />
              <div>
                <span className="text-[#8a7f96] text-[10px] uppercase font-bold block">Eligibility</span>
                <span className="font-semibold text-sm text-white">{cleanEligibility}</span>
              </div>
            </div>
          )}

          {/* Person of Contact (POC) */}
          {(displayPocName || displayPocNumber) && (
            <div className="flex items-center gap-2.5 text-neutral-200 sm:col-span-2 p-2.5 bg-[#120f18] rounded-lg border border-[#2b2438]">
              <Phone className="w-4 h-4 text-[#ff2d55] shrink-0" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div>
                  <span className="text-[#8a7f96] text-[10px] uppercase font-bold block">
                    Person of Contact (POC)
                  </span>
                  <span className="font-semibold text-sm text-white">
                    {displayPocName || 'Event Coordinator'}
                  </span>
                </div>
                {displayPocNumber && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-neutral-500 hidden sm:inline">·</span>
                    <a
                      href={`tel:${displayPocNumber.replace(/[^0-9+]/g, '')}`}
                      className="px-2.5 py-1 bg-[#221c2b] hover:bg-[#2e263a] border border-[#3b324a] text-neutral-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                      title="Call POC"
                    >
                      <Phone className="w-3 h-3 text-amber-300" />
                      <span>{displayPocNumber}</span>
                    </a>
                    <a
                      href={`https://wa.me/${displayPocNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                      title="WhatsApp POC"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interview / Audition Stage Banner for Club Applications */}
        {isApplication && (event.has_interview || event.interview_details) && (
          <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-xl mb-5 font-sans-ui">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <span>🎙️ Interview / Audition Stage</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-purple-900/60 border border-purple-500/40 text-purple-200 font-semibold rounded">
                Next Steps
              </span>
            </div>
            <p className="text-xs text-purple-200/90 leading-relaxed">
              {event.interview_details || 'Shortlisted candidates will be invited for an interview / audition round after written applications are reviewed.'}
            </p>
          </div>
        )}

        {/* Description Body */}
        <div className="mb-6 font-sans-ui leading-relaxed text-sm text-[#d6cbdf] whitespace-pre-line">
          {event.description}
        </div>

        {/* Registration CTA banner */}
        {event.registration_link && !isCancelled && (
          <div className={`p-4 rounded-xl flex items-center justify-between gap-3 mb-6 font-sans-ui ${
            isApplication 
              ? 'bg-purple-950/40 border border-purple-500/40' 
              : 'bg-[#1e1424] border border-[#ff2d55]/40'
          }`}>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${
                isApplication ? 'text-purple-200' : 'text-[#ff758f]'
              }`}>
                {isApplication ? 'Official Application Form' : 'Registration Required'}
              </h4>
              <p className="text-xs text-[#b8ab96] mt-0.5">
                {isApplication 
                  ? 'Submit your member or committee application before the cutoff deadline.' 
                  : 'Official external registration via Google Form / RSVP link.'}
              </p>
            </div>
            <a
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap transition-transform active:scale-95 ${
                isApplication 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white hover:brightness-110 shadow-[0_0_15px_rgba(255,45,85,0.4)]'
              }`}
            >
              <span>{isApplication ? 'Fill Application Form' : 'Register Now'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#262030]">
          <div className="flex items-center gap-2">
            {/* Favourite Event */}
            <button
              onClick={() => handleAction('fav')}
              className={`p-2.5 rounded-full border transition-colors ${
                isFavourited
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                  : 'bg-[#181420] text-neutral-400 border-[#2b2438] hover:text-amber-400'
              }`}
              title={isFavourited ? 'Remove from Favourites' : 'Favourite Event (Keep on Board)'}
            >
              <Star className={`w-4 h-4 ${isFavourited ? 'fill-neutral-950' : ''}`} />
            </button>

            {/* Save (Only on upcoming events) */}
            {!isCompleted && (
              <button
                onClick={() => handleAction('save')}
                className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  isSaved
                    ? 'bg-[#ff2d55] text-white border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.4)]'
                    : 'bg-[#181420] text-neutral-200 border-[#2b2438] hover:border-[#ff2d55]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                <span>{isSaved ? 'Saved to Bookmarks' : 'Save for Later'}{savedCount > 0 ? ` (${savedCount})` : ''}</span>
              </button>
            )}

            {/* 1-Click Google Calendar Sync (Upcoming events) */}
            {!isCompleted && (
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full text-xs font-bold border border-[#2b2438] bg-[#181420] hover:bg-[#221c2b] text-neutral-200 hover:text-white transition-colors flex items-center gap-1.5"
                title="Add this event to your Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#4285F4]" />
                <span className="hidden sm:inline">Add to Google Calendar</span>
                <span className="sm:hidden">Calendar</span>
              </a>
            )}

            {/* Feedback / Review Option for ended events */}
            {isCompleted && (
              <button
                onClick={() => openEventFeedback(event)}
                className="px-3.5 py-2 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-neutral-950" />
                <span>Reviews &amp; Feedback</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Campus Map Shortcut */}
            {isGoing && !isCompleted && (
              <button
                onClick={() => {
                  closeEventDetail();
                  setCurrentTab('campus-map');
                }}
                className="px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-[#ff2d55]" />
                <span className="hidden sm:inline">Locate on Map</span>
              </button>
            )}

            {/* Primary Action */}
            {!isCompleted && (
              isApplication ? (
                event.registration_link ? (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleAction('save')}
                    className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md bg-purple-600 text-white"
                  >
                    <span>Track Application</span>
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleAction('going')}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 ${
                    isGoing
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white hover:brightness-110 shadow-[0_0_15px_rgba(255,45,85,0.4)]'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isGoing ? "You're Going!" : "I'm Going"}</span>
                </button>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
