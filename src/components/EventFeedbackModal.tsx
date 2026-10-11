'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Star, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Calendar, 
  MapPin, 
  User as UserIcon,
  Send
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
    user,
    isAuthenticated,
    openAuthModal
  } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isEventFeedbackModalOpen && selectedEventForFeedback) {
      // Pre-fill user existing rating if already rated
      const existingUserRating = selectedEventForFeedback.ratings?.find(
        (r) => r.email === user?.flame_email
      )?.score;
      if (existingUserRating) {
        setRating(existingUserRating);
      } else {
        setRating(5);
      }
      setSelectedTag('');
      setComment('');
      setIsSubmitted(false);
    }
  }, [isEventFeedbackModalOpen, selectedEventForFeedback, user]);

  if (!isEventFeedbackModalOpen || !selectedEventForFeedback) return null;

  const event = selectedEventForFeedback;
  const isCompleted = event.status === 'Completed';
  
  const averageRating = (event.ratings?.length || 0) > 0
    ? (event.ratings!.reduce((sum: number, r: any) => sum + r.score, 0) / event.ratings!.length).toFixed(1)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      alert('Please select a star rating between 1 and 5.');
      return;
    }

    submitEventFeedback(event.id, {
      score: rating,
      comment: comment.trim(),
      tag: selectedTag || undefined,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      closeEventFeedback();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={closeEventFeedback} />

      {/* Scrapbook Kraft Paper Card */}
      <div className="relative w-full max-w-lg bg-[#fbf8ee] border-2 border-[#d3ba6e] text-neutral-900 rounded-sm shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Washi Tape Header Accent */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#f3da90]/90 shadow-xs backdrop-blur-2xs rotate-[0.5deg] z-20 pointer-events-none"
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
                Student Feedback & Ratings
              </span>
              <h3 className="font-editorial text-lg font-bold text-neutral-900 leading-tight">
                {isCompleted ? 'Rate & Review Event' : 'Event Feedback'}
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
                {averageRating && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {averageRating} ({event.ratings?.length} reviews)
                  </span>
                )}
              </div>
              <h4 className="font-editorial text-sm font-bold text-neutral-900 truncate">
                {event.event_name}
              </h4>
              <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                Organized by {event.organizer} • {event.date}
              </p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-sm text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-editorial text-lg font-bold text-emerald-950">
                Feedback Pinned! 📌
              </h4>
              <p className="text-xs text-emerald-800">
                Thank you for contributing to campus life! Your rating has been recorded for {event.event_name}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Section */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-sm text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                  How was your experience?
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
                  Leave a note or tip for organizers & students:
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Loved the energy! Make sure to grab seats 10 mins early next time..."
                  className="w-full p-2.5 bg-white border border-[#d3ba6e] rounded-sm text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none font-sans shadow-inner"
                />
              </div>

              {/* Identity Note */}
              <div className="p-2 bg-neutral-100/80 rounded-xs border border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600">
                <div className="flex items-center gap-1.5 truncate">
                  <UserIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">
                    Posting as: <strong className="text-neutral-800">{user?.name || user?.flame_email || 'FLAME Student (Anonymous)'}</strong>
                  </span>
                </div>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('Sign in with your FLAME email to verify your feedback.')}
                    className="text-amber-800 font-bold hover:underline shrink-0 ml-2"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pin Feedback 📌</span>
              </button>
            </form>
          )}

          {/* Past Student Reviews & Feedback Feed */}
          {event.feedback && event.feedback.length > 0 && (
            <div className="pt-4 border-t border-[#e2d6b5] space-y-2">
              <h5 className="font-editorial text-xs font-bold uppercase tracking-wider text-amber-900">
                Community Reviews ({event.feedback.length})
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {event.feedback.map((fb) => (
                  <div key={fb.id} className="p-2.5 bg-white border border-[#e5dcbf] rounded-xs shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-neutral-900">{fb.name || 'Student'}</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${s <= fb.score ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(fb.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
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
          )}

        </div>
      </div>
    </div>
  );
};
