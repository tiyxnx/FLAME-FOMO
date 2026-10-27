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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={closeEventFeedback} />

      {/* Midnight Scrapbook Card */}
      <div className="relative w-full max-w-lg bg-[#131017] border border-[#2b2438] text-[#f4f3f6] rounded-xl shadow-2xl z-10 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Washi Tape Header Accent */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-5 bg-[#ff2d55]/80 shadow-[0_0_12px_rgba(255,45,85,0.4)] rotate-[0.5deg] z-20 pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        {/* Modal Top Bar */}
        <div className="px-5 pt-5 pb-3 border-b border-[#26202e] flex items-center justify-between shrink-0 bg-[#181420]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#ff2d55]/15 text-[#ff758f]">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff758f] font-bold">
                Post-Event Reviews
              </span>
              <h3 className="font-editorial text-lg font-bold text-white leading-tight flex items-center gap-1.5">
                <span>Attendee Review &amp; Ratings</span>
                <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 bg-[#221c2b] text-neutral-300 rounded-full uppercase">
                  Anonymous
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={closeEventFeedback}
            className="p-1.5 rounded-full bg-[#1e1926] hover:bg-[#2b2336] text-[#9d93a8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Target Event Snippet */}
          <div className="p-3 bg-[#181420] border border-[#26202e] rounded-xl flex items-start gap-3 shadow-xs">
            {event.event_image ? (
              <img
                src={event.event_image}
                alt={event.event_name}
                className="w-14 h-14 object-cover rounded-lg border border-[#2b2438] shrink-0"
              />
            ) : (
              <div className="w-14 h-14 bg-[#1e1926] border border-[#2b2438] rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-[#ff2d55]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#ff2d55]/15 border border-[#ff2d55]/30 text-[#ff758f] uppercase">
                  {event.category}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#1e1926] text-neutral-400 uppercase">
                  Concluded
                </span>
                {averageRating && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 ml-auto">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {averageRating} ({event.ratings?.length} reviews)
                  </span>
                )}
              </div>
              <h4 className="font-editorial text-sm font-bold text-white truncate">
                {event.event_name}
              </h4>
              <p className="text-[11px] text-[#9d93a8] truncate mt-0.5">
                Organized by {event.organizer} • Concluded on {event.date}
              </p>
            </div>
          </div>

          {/* Submission Success State */}
          {isSubmitted ? (
            <div className="p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-editorial text-lg font-bold text-white">
                Review Submitted! 📌
              </h4>
              <p className="text-xs text-emerald-200">
                Thank you! Your feedback has been posted anonymously under <strong>&quot;Anonymous student&quot;</strong>.
              </p>
            </div>
          ) : eligibility.canReview ? (
            /* ELIGIBLE: Verified attendee within 48h post-event */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Anonymous Banner */}
              <div className="p-2.5 bg-[#181420] text-neutral-200 rounded-lg border border-[#2b2438] flex items-center gap-2 text-xs">
                <EyeOff className="w-4 h-4 text-[#ff2d55] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-[#ff758f]">100% Anonymous Review: </span>
                  Your name and email will be hidden. Fellow students and organizers will only see: <em>&quot;Anonymous student&quot;</em>.
                </div>
              </div>

              {/* Time Remaining in 48-Hour Review Window */}
              {eligibility.hoursLeft !== undefined && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Review window closes in: <strong>{eligibility.hoursLeft} hour(s)</strong></span>
                </div>
              )}

              {/* Star Rating Section */}
              <div className="p-3.5 bg-[#181420] border border-[#26202e] rounded-xl text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
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
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                              : 'text-neutral-600 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-amber-300 font-editorial min-h-[18px]">
                  {RATING_DESCRIPTIONS[hoverRating || rating]}
                </p>
              </div>

              {/* Quick Feedback Tags */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#ff2d55]" />
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
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          isSelected
                            ? 'bg-[#ff2d55] text-white border-[#ff2d55] font-bold shadow-[0_0_10px_rgba(255,45,85,0.4)]'
                            : 'bg-[#181420] text-neutral-300 border-[#2b2438] hover:border-[#ff2d55]/40'
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
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Share anonymous thoughts, tips, or feedback for the organizers:
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Loved the music and crowd vibes! Sound started 15 mins late but overall worth attending..."
                  className="w-full p-2.5 bg-[#0e0c12] border border-[#2b2438] rounded-xl text-xs text-white placeholder-[#6d6379] focus:outline-none focus:border-[#ff2d55] resize-none font-sans"
                />
              </div>

              {errorMessage && (
                <div className="p-2 bg-red-950/80 text-red-200 text-xs rounded-lg border border-red-500/40">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,45,85,0.4)] hover:brightness-110 transition-all active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Anonymous Review 🕵️</span>
              </button>
            </form>
          ) : (
            /* INELIGIBLE NOTICES */
            <div className="p-4 bg-[#181420] border border-[#2b2438] rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-editorial text-sm font-bold text-white">
                    Review Submission Restricted
                  </h5>
                  <p className="text-xs text-[#9d93a8] mt-1 leading-relaxed">
                    {eligibility.reason}
                  </p>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="pt-2 border-t border-[#26202e]">
                  <button
                    onClick={() => openAuthModal("Sign in to verify if you clicked 'I'm Going' for this event.")}
                    className="w-full py-2 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white rounded-full text-xs font-bold hover:brightness-110 transition-colors"
                  >
                    Sign In with FLAME Email
                  </button>
                </div>
              )}

              <div className="p-2.5 bg-[#120f18] rounded-lg text-[11px] text-[#9d93a8] space-y-1">
                <p className="font-bold text-white">Why these rules?</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Only attendees who marked <strong>&quot;I&apos;m Going&quot;</strong> can review to prevent fake reviews.</li>
                  <li>Reviews must be submitted within <strong>2 days (48h)</strong> of event conclusion while memories are fresh.</li>
                  <li>All reviews are posted <strong>completely anonymously</strong> to protect student privacy.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Past Student Reviews Feed */}
          {canViewEventFeedback(event) ? (
            event.feedback && event.feedback.length > 0 ? (
              <div className="pt-4 border-t border-[#26202e] space-y-2">
                <h5 className="font-editorial text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
                  <span>Student Feedback &amp; Reviews ({event.feedback.length})</span>
                  <span className="text-[10px] text-[#ff758f] font-mono">
                    {isModerator ? '🛡️ Admin Moderator View' : '🏛️ Club Organizer View'}
                  </span>
                </h5>

                {/* Moderator Alert Banner */}
                {isModerator && (
                  <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-start gap-2 shadow-2xs">
                    <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">🛡️ Moderator Visibility Active</span>
                        <span className="text-[9px] font-mono font-bold bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded-full uppercase">
                          Admin Only
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-300 mt-0.5 leading-snug">
                        Reviews appear as <em>&quot;Anonymous student&quot;</em> to all regular students. Real reviewer emails are visible strictly to you ({user?.flame_email}) for campus safety and moderation.
                      </p>
                    </div>
                  </div>
                )}

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {event.feedback.map((fb) => (
                  <div key={fb.id} className="p-3 bg-[#181420] border border-[#26202e] rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <EyeOff className="w-3 h-3 text-[#ff2d55]" />
                          <span>Anonymous student</span>
                        </span>
                        <div className="flex items-center ml-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${s <= fb.score ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'}`}
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
                            className="p-1 rounded-full hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 transition-colors ml-1"
                            title="Delete review (Moderator Action)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Moderator Badge */}
                    {isModerator && (
                      <div className="px-2 py-1 bg-purple-950/60 border border-purple-500/30 rounded-lg text-[10px] font-mono text-purple-200 flex items-center justify-between">
                        <div className="flex items-center gap-1 truncate">
                          <Shield className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="text-neutral-400">Reviewer:</span>
                          <span className="font-bold text-white truncate">{fb.author_email || fb.email || 'Unknown'}</span>
                        </div>
                        <span className="text-[9px] text-purple-300 font-sans uppercase font-bold shrink-0 ml-1">
                          Moderation Eye
                        </span>
                      </div>
                    )}

                    {fb.tag && (
                      <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {fb.tag}
                      </span>
                    )}
                    {fb.comment && (
                      <p className="text-xs text-[#d6cbdf] leading-snug">{fb.comment}</p>
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
