'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { checkEventReviewEligibility, isAdminModerator } from '@/lib/constants';
import { 
  X, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Tag, 
  Calendar, 
  Lock,
  Clock,
  Send,
  EyeOff,
  UserCheck,
  Shield,
  ShieldAlert,
  Trash2
} from 'lucide-react';

const FEEDBACK_TAGS = [
  '🔥 Electric Crowd',
  '🎵 Superb Music/Sound',
  '⏰ Punctual Start',
  '📍 Great Venue Setup',
  '🍿 Good Refreshments',
  '💡 Informative & Well Run',
  '⚠️ Overcrowded',
  '🔊 Audio / AV Glitches'
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Needs Work 😕',
  2: 'It Was Okay 😐',
  3: 'Good Campus Event 🙂',
  4: 'Really Loved It! 😊',
  5: 'Absolute Peak FOMO! 🔥'
};

export const EventFeedbackModal: React.FC = () => {
  const {
    isEventFeedbackModalOpen,
    selectedEventForFeedback,
    closeEventFeedback,
    submitEventFeedback,
    deleteEventFeedback,
    user,
    isAuthenticated,
    openAuthModal,
    canViewEventFeedback,
    isAdmin,
  } = useApp();

  const isModerator = isAdmin;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isEventFeedbackModalOpen && selectedEventForFeedback) {
      setRating(5);
      setSelectedTag('');
      setComment('');
      setIsSubmitted(false);
      setErrorMessage('');
    }
  }, [isEventFeedbackModalOpen, selectedEventForFeedback, user]);

  if (!isEventFeedbackModalOpen || !selectedEventForFeedback) return null;

  const event = selectedEventForFeedback;
  
  // Calculate verified attendee eligibility & 48h post-event window
  const eligibility = checkEventReviewEligibility(event, user);

  const averageRating = (event.ratings?.length || 0) > 0
    ? (event.ratings!.reduce((sum: number, r: any) => sum + r.score, 0) / event.ratings!.length).toFixed(1)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!rating) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    const res = submitEventFeedback(event.id, {
      score: rating,
      comment: comment.trim(),
      tag: selectedTag || undefined,
    });

    if (res && !res.success) {
      setErrorMessage(res.error || 'Failed to submit review.');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      closeEventFeedback();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={closeEventFeedback} />

      {/* Scrapbook Kraft Paper Card */}
      <div className="relative w-full max-w-lg bg-[#fbf8ee] border-2 border-[#d3ba6e] text-neutral-900 rounded-sm shadow-2xl z-10 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Washi Tape Header Accent */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#f3da90]/90 shadow-xs backdrop-blur-2xs rotate-[0.5deg] z-20 pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        {/* Modal Top Bar */}
        <div className="px-5 pt-5 pb-3 border-b border-[#e2d6b5] flex items-center justify-between shrink-0 bg-[#f7f2e1]/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-amber-200/80 text-amber-900">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
                Post-Event Reviews
              </span>
              <h3 className="font-editorial text-lg font-bold text-neutral-900 leading-tight flex items-center gap-1.5">
                <span>Attendee Review & Ratings</span>
                <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 bg-neutral-900 text-amber-200 rounded-xs uppercase">
                  Anonymous
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={closeEventFeedback}
            className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Target Event Snippet */}
          <div className="p-3 bg-white/70 border border-[#e5dcbf] rounded-sm flex items-start gap-3 shadow-xs">
            {event.event_image ? (
              <img
                src={event.event_image}
                alt={event.event_name}
                className="w-14 h-14 object-cover rounded-xs border border-neutral-300 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 bg-amber-100/70 border border-amber-300 rounded-xs flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-amber-800" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-2xs bg-amber-200/80 text-amber-950 uppercase">
                  {event.category}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-2xs bg-neutral-800 text-neutral-200 uppercase">
                  Concluded
                </span>
                {averageRating && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 ml-auto">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {averageRating} ({event.ratings?.length} reviews)
                  </span>
                )}
              </div>
              <h4 className="font-editorial text-sm font-bold text-neutral-900 truncate">
                {event.event_name}
              </h4>
              <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                Organized by {event.organizer} • Concluded on {event.date}
              </p>
            </div>
          </div>

          {/* Submission Success State */}
          {isSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-sm text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-editorial text-lg font-bold text-emerald-950">
                Review Submitted! 📌
              </h4>
              <p className="text-xs text-emerald-800">
                Thank you! Your feedback has been posted anonymously under <strong>&quot;Anonymous student&quot;</strong>.
              </p>
            </div>
          ) : eligibility.canReview ? (
            /* ELIGIBLE: Verified attendee within 48h post-event */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Anonymous Banner */}
              <div className="p-2.5 bg-neutral-900 text-amber-100 rounded-xs border border-neutral-700 flex items-center gap-2 text-xs">
                <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-amber-300">100% Anonymous Review: </span>
                  Your name and email will be hidden. Fellow students and organizers will only see: <em>&quot;Anonymous student&quot;</em>.
                </div>
              </div>

              {/* Time Remaining in 48-Hour Review Window */}
              {eligibility.hoursLeft !== undefined && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-2xs border border-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Review window closes in: <strong>{eligibility.hoursLeft} hour(s)</strong></span>
                </div>
              )}

              {/* Star Rating Section */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-sm text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                  How was your experience attending?
                </label>
                
                <div className="flex items-center justify-center gap-1.5 my-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                              : 'text-neutral-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-amber-800 font-editorial min-h-[18px]">
                  {RATING_DESCRIPTIONS[hoverRating || rating]}
                </p>
              </div>

              {/* Quick Feedback Tags */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span>Highlight a key takeaway (Optional)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TAGS.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(isSelected ? '' : tag)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-amber-950 border-amber-500 font-bold shadow-xs scale-102'
                            : 'bg-white/80 text-neutral-700 border-neutral-300 hover:bg-amber-100 hover:border-amber-300'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment / Review Box */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Share anonymous thoughts, tips, or feedback for the organizers:
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Loved the music and crowd vibes! Sound started 15 mins late but overall worth attending..."
                  className="w-full p-2.5 bg-white border border-[#d3ba6e] rounded-sm text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none font-sans shadow-inner"
                />
              </div>

              {errorMessage && (
                <div className="p-2 bg-red-100 text-red-900 text-xs rounded border border-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Anonymous Review 🕵️</span>
              </button>
            </form>
          ) : (
            /* INELIGIBLE NOTICES */
            <div className="p-4 bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-editorial text-sm font-bold text-amber-950">
                    Review Submission Restricted
                  </h5>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    {eligibility.reason}
                  </p>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="pt-2 border-t border-amber-200">
                  <button
                    onClick={() => openAuthModal("Sign in to verify if you clicked 'I'm Going' for this event.")}
                    className="w-full py-2 bg-[#c93b2b] text-amber-100 rounded text-xs font-bold hover:bg-[#b02e20] transition-colors"
                  >
                    Sign In with FLAME Email
                  </button>
                </div>
              )}

              <div className="p-2.5 bg-white/70 rounded-xs text-[11px] text-neutral-600 space-y-1">
                <p className="font-bold text-neutral-800">Why these rules?</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Only attendees who marked <strong>&quot;I&apos;m Going&quot;</strong> can review to prevent fake reviews.</li>
                  <li>Reviews must be submitted within <strong>2 days (48h)</strong> of event conclusion while memories are fresh.</li>
                  <li>All reviews are posted <strong>completely anonymously</strong> to protect student privacy.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Past Student Reviews Feed (Strictly restricted to Admin and the Event's Organizing Club) */}
          {canViewEventFeedback(event) ? (
            event.feedback && event.feedback.length > 0 ? (
              <div className="pt-4 border-t border-[#e2d6b5] space-y-2">
                <h5 className="font-editorial text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
                  <span>Student Feedback &amp; Reviews ({event.feedback.length})</span>
                  <span className="text-[10px] text-amber-700 font-mono">
                    {isModerator ? '🛡️ Admin Moderator View' : '🏛️ Club Organizer View'}
                  </span>
                </h5>

                {/* Moderator Alert Banner (Only shown to admin) */}
                {isModerator && (
                  <div className="p-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-sm text-xs text-purple-950 flex items-start gap-2 shadow-2xs">
                    <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900">🛡️ Moderator Visibility Active</span>
                        <span className="text-[9px] font-mono font-bold bg-purple-200/90 text-purple-900 px-1.5 py-0.5 rounded-2xs uppercase">
                          Admin Only
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800 mt-0.5 leading-snug">
                        Reviews appear as <em>&quot;Anonymous student&quot;</em> to all regular students. Real reviewer emails are visible strictly to you ({user?.flame_email}) for campus safety and moderation.
                      </p>
                    </div>
                  </div>
                )}

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {event.feedback.map((fb) => (
                  <div key={fb.id} className="p-2.5 bg-white border border-[#e5dcbf] rounded-xs shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                          <EyeOff className="w-3 h-3 text-neutral-500" />
                          <span>Anonymous student</span>
                        </span>
                        <div className="flex items-center ml-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${s <= fb.score ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(fb.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        {isModerator && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove review by ${fb.author_email || fb.email} for moderation?`)) {
                                deleteEventFeedback(event.id, fb.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-rose-100 text-neutral-400 hover:text-rose-600 transition-colors ml-1"
                            title="Delete review (Moderator Action)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Moderator Badge: Revealed strictly to admin */}
                    {isModerator && (
                      <div className="px-2 py-1 bg-purple-50/90 border border-purple-200 rounded-2xs text-[10px] font-mono text-purple-900 flex items-center justify-between">
                        <div className="flex items-center gap-1 truncate">
                          <Shield className="w-3 h-3 text-purple-700 shrink-0" />
                          <span className="text-neutral-500">Reviewer:</span>
                          <span className="font-bold text-purple-950 truncate">{fb.author_email || fb.email || 'Unknown'}</span>
                        </div>
                        <span className="text-[9px] text-purple-700 font-sans uppercase font-bold shrink-0 ml-1">
                          Moderation Eye
                        </span>
                      </div>
                    )}

                    {fb.tag && (
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-2xs bg-amber-100 text-amber-900 border border-amber-200">
                        {fb.tag}
                      </span>
                    )}
                    {fb.comment && (
                      <p className="text-xs text-neutral-700 leading-snug">{fb.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null) : null}

        </div>
      </div>
    </div>
  );
};
