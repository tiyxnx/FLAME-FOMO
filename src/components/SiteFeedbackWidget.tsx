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
      {/* Floating Midnight Scrapbook Feedback Tab pinned on the right side matching Image 2 */}
      <div 
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none flex items-center pointer-events-none"
      >
        {/* Hover Tooltip / Teaser Banner on Desktop */}
        <div 
          className={`mr-2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#17141f] text-rose-200 text-xs font-semibold rounded-lg shadow-xl border border-rose-500/30 whitespace-nowrap transition-all duration-300 pointer-events-none ${
            isTabHovered && !isSiteFeedbackOpen
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-3'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Feedback or bug report? Click to share!</span>
        </div>

        {/* The Vertical Tab Button matching Image 2 */}
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
          className="relative pointer-events-auto bg-gradient-to-l from-[#e11d48] to-[#ff2d55] text-white px-2 sm:px-2.5 py-3 rounded-l-xl shadow-2xl shadow-rose-950/60 border-l border-y border-rose-400/40 hover:from-[#f43f5e] hover:to-[#ff2d55] transition-all duration-200 flex flex-col items-center gap-1.5 group active:scale-95 cursor-pointer"
        >
          {/* Scrapbook washi tape clip on tab */}
          <div 
            className="absolute -top-2.5 right-1 w-6 h-3 bg-amber-400/30 border border-amber-400/40 rounded-xs rotate-[-8deg] shadow-2xs pointer-events-none"
          />

          <MessageSquare className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />

          {/* Vertical rotated text */}
          <span 
            className="text-[10px] font-bold tracking-widest uppercase font-mono [writing-mode:vertical-rl] rotate-180 text-white"
          >
            FEEDBACK
          </span>

          {/* Active status pulse dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </button>
      </div>

      {/* Slide-out Feedback Drawer / Modal */}
      {isSiteFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeSiteFeedback} />

          <div className="relative w-full max-w-md bg-[#16131d] border border-white/10 text-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-right duration-300">
            {/* Washi tape header banner */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-6 bg-rose-500/25 border border-rose-500/30 shadow-xs backdrop-blur-xs rotate-[-0.5deg] z-20 pointer-events-none rounded-xs"
              style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
            />

            {/* Header */}
            <div className="px-5 pt-6 pb-3.5 border-b border-white/5 flex items-center justify-between bg-[#191522]/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#ff2d55] text-white shadow-md shadow-rose-950/40">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                    FLAME FOMO Campus Lab
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-white leading-tight">
                    Website Feedback
                  </h3>
                </div>
              </div>
              <button
                onClick={closeSiteFeedback}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-5 overflow-y-auto space-y-4">
              {isSubmitted ? (
                <div className="p-8 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-editorial text-xl font-bold text-white">
                    Thank you! 💌
                  </h4>
                  <p className="text-xs text-emerald-300">
                    Your feedback has been received. Thanks for helping make FLAME FOMO better!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Pill Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-rose-300 mb-2">
                      What is this about?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCategory('suggestion')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'suggestion'
                            ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] border-rose-400 text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                        <span>💡 Suggestion</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('bug')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'bug'
                            ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] border-rose-400 text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <Bug className="w-3.5 h-3.5 text-red-300" />
                        <span>🐛 Bug Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('missing_event')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'missing_event'
                            ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] border-rose-400 text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-purple-300" />
                        <span>📅 Missing Event</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('love')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === 'love'
                            ? 'bg-gradient-to-r from-[#e11d48] to-[#ff2d55] border-rose-400 text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
                        <span>❤️ Love It!</span>
                      </button>
                    </div>
                  </div>

                  {/* Rating Satisfaction */}
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
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
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-neutral-600 hover:text-amber-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Your thoughts, ideas, or report:
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's working, what's broken, or what features would make campus life better..."
                      className="w-full p-3 bg-[#191522] border border-white/10 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 resize-none font-sans shadow-inner"
                      required
                    />
                  </div>

                  {/* Email row */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                      Your Email (Optional, if you&apos;d like a reply):
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={user?.flame_email || 'your.name@flame.edu.in'}
                      className="w-full p-2.5 bg-[#191522] border border-white/10 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500/60"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#e11d48] to-[#ff2d55] hover:opacity-95 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all active:scale-98"
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
