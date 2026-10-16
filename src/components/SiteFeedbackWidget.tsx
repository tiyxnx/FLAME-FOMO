'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  MessageSquare, 
  X, 
  Star, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Bug, 
  Lightbulb, 
  Heart, 
  CalendarPlus 
} from 'lucide-react';

type FeedbackCategory = 'suggestion' | 'bug' | 'missing_event' | 'love';

export const SiteFeedbackWidget: React.FC = () => {
  const { 
    isSiteFeedbackOpen, 
    openSiteFeedback, 
    closeSiteFeedback, 
    submitSiteFeedback, 
    user 
  } = useApp();

  const [isTabHovered, setIsTabHovered] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter your feedback or suggestions.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSiteFeedback({
        category,
        rating,
        message: message.trim(),
        user_email: email.trim() || user?.flame_email,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setMessage('');
        closeSiteFeedback();
      }, 1600);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Scrapbook Bookmark Tab pinned on the right edge above the plus button */}
      <div 
        className="fixed right-0 bottom-24 sm:bottom-28 z-40 select-none flex items-center pointer-events-none"
      >
        {/* Hover Tooltip / Teaser Banner on Desktop */}
        <div 
          className={`mr-2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#25211c] text-amber-200 text-xs font-semibold rounded-md shadow-xl border border-[#4a4033] whitespace-nowrap transition-all duration-300 pointer-events-none ${
            isTabHovered && !isSiteFeedbackOpen
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-3'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Feedback or bug report? Click to share!</span>
        </div>

        {/* The Tab Button itself - hover strictly triggers only when cursor is ON this button */}
        <button
          type="button"
          onClick={() => {
            if (isSiteFeedbackOpen) {
              closeSiteFeedback();
            } else {
              openSiteFeedback();
            }
          }}
          onMouseEnter={() => setIsTabHovered(true)}
          onMouseLeave={() => setIsTabHovered(false)}
          title="Share Website Feedback or Report a Bug"
          className="relative pointer-events-auto bg-gradient-to-l from-[#c93b2b] to-[#b02e20] text-amber-100 px-2.5 py-3 rounded-l-md shadow-2xl border-l-2 border-y-2 border-amber-300/40 hover:from-[#d94432] hover:to-[#c93b2b] transition-all duration-200 flex flex-col items-center gap-1.5 group active:scale-95 cursor-pointer"
        >
          {/* Scrapbook washi tape clip on tab */}
          <div 
            className="absolute -top-2.5 right-1 w-6 h-3 bg-[#f3da90]/90 rounded-2xs rotate-[-8deg] shadow-2xs pointer-events-none"
          />

          <MessageSquare className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />

          {/* Vertical rotated text */}
          <span 
            className="text-[10px] font-bold tracking-widest uppercase font-mono [writing-mode:vertical-rl] rotate-180 text-amber-100"
          >
            Feedback
          </span>

          {/* Active status pulse dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
        </button>
      </div>

      {/* Slide-out Feedback Drawer / Modal */}
      {isSiteFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-6 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeSiteFeedback} />

          <div className="relative w-full max-w-md bg-[#fbf8ee] border-2 border-[#d3ba6e] text-neutral-900 rounded-md shadow-2xl z-10 overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-right duration-300">
            {/* Washi tape header banner */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#f3da90]/90 shadow-xs backdrop-blur-2xs rotate-[-0.5deg] z-20 pointer-events-none"
              style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
            />

            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-[#e2d6b5] flex items-center justify-between bg-[#f7f2e1]/70 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-full bg-[#c93b2b] text-white">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
                    FLAME FOMO Campus Lab
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-neutral-900 leading-tight">
                    Website Feedback
                  </h3>
                </div>
              </div>
              <button
                onClick={closeSiteFeedback}
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-5 overflow-y-auto space-y-4">
              {isSubmitted ? (
                <div className="p-8 bg-emerald-50 border border-emerald-300 rounded-sm text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-editorial text-xl font-bold text-emerald-950">
                    Thank you! 💌
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Your feedback has been received. Thanks for helping make FLAME FOMO better!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Pill Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                      What is this about?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCategory('suggestion')}
                        className={`p-2 rounded-xs border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'suggestion'
                            ? 'bg-amber-300 border-amber-500 text-amber-950 shadow-xs'
                            : 'bg-white/80 border-neutral-300 text-neutral-700 hover:bg-amber-50'
                        }`}
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                        <span>💡 Suggestion</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('bug')}
                        className={`p-2 rounded-xs border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'bug'
                            ? 'bg-red-200 border-red-400 text-red-950 shadow-xs'
                            : 'bg-white/80 border-neutral-300 text-neutral-700 hover:bg-red-50'
                        }`}
                      >
                        <Bug className="w-3.5 h-3.5 text-red-700" />
                        <span>🐛 Bug Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('missing_event')}
                        className={`p-2 rounded-xs border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'missing_event'
                            ? 'bg-purple-200 border-purple-400 text-purple-950 shadow-xs'
                            : 'bg-white/80 border-neutral-300 text-neutral-700 hover:bg-purple-50'
                        }`}
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-purple-700" />
                        <span>📅 Missing Event</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('love')}
                        className={`p-2 rounded-xs border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'love'
                            ? 'bg-rose-200 border-rose-400 text-rose-950 shadow-xs'
                            : 'bg-white/80 border-neutral-300 text-neutral-700 hover:bg-rose-50'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                        <span>❤️ Love It!</span>
                      </button>
                    </div>
                  </div>

                  {/* Rating Satisfaction */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xs text-center">
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Rate your experience using FLAME FOMO:
                    </label>
                    <div className="flex items-center justify-center gap-1 my-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-120 transition-transform focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-neutral-300 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Your thoughts, ideas, or report:
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's working, what's broken, or what features would make campus life better..."
                      className="w-full p-2.5 bg-white border border-[#d3ba6e] rounded-xs text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none font-sans shadow-inner"
                      required
                    />
                  </div>

                  {/* Email row */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Your Email (Optional, if you&apos;d like a reply):
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={user?.flame_email || 'your.name@flame.edu.in'}
                      className="w-full p-2 bg-white border border-neutral-300 rounded-xs text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#c93b2b] hover:bg-[#b02e20] disabled:bg-neutral-400 text-amber-100 rounded-xs font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Feedback 📮'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
