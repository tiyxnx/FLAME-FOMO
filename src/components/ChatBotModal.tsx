'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { EventItem } from '@/types';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Compass, 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  Bookmark, 
  ExternalLink, 
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  Film
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  referencedEventIds?: string[];
  suggestedAction?: {
    type: 'map' | 'events' | 'profile' | 'detail';
    label: string;
    payload?: any;
  };
}

export const ChatBotModal: React.FC = () => {
  const { 
    isChatBotOpen, 
    closeChatBot, 
    user, 
    isAuthenticated, 
    events, 
    savedEventIds, 
    goingEventIds, 
    favouriteEventIds,
    openEventDetail,
    setCurrentTab
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngine] = useState<'gemini' | 'local'>('local');
  const [geminiStatus, setGeminiStatus] = useState<string>('Ready');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message when opened
  useEffect(() => {
    if (isChatBotOpen && messages.length === 0) {
      const studentName = user?.name ? user.name.split(' ')[0] : 'there';
      
      const welcome: ChatMessage = {
        id: 'msg-welcome',
        sender: 'bot',
        text: `yo **${studentName}**! what's up? 🔥\n\ni'm the campus bot. ask me anything about events, club comps, your classes, or what you've got saved.\n\nwhat are you looking for?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcome]);
    }
  }, [isChatBotOpen, user, messages.length]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isChatBotOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isChatBotOpen]);

  if (!isChatBotOpen) return null;

  // ---------------------------------------------------------------------------
  // SMART LOCAL CAMPUS REASONING ENGINE (Casual & Chill)
  // Handles all specific queries instantly with 0ms latency and 100% accuracy
  // ---------------------------------------------------------------------------
  const answerWithLocalEngine = (query: string): { text: string; referencedEventIds?: string[] } => {
    const q = query.toLowerCase().trim();
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const todayStr = now.toISOString().split('T')[0];

    // 1. "I'm free rn what to do?" / "free right now" / "free rn" / "what to do"
    if (q.includes('free rn') || q.includes('free right now') || q.includes('free now') || (q.includes('free') && q.includes('what to do')) || q.includes('bored')) {
      const currentClass = user?.academic_timetable?.find(
        (cls) => cls.day === currentDay && currentTime >= cls.timeStart && currentTime <= cls.timeEnd
      );

      const nextClass = user?.academic_timetable
        ?.filter((cls) => cls.day === currentDay && cls.timeStart > currentTime)
        ?.sort((a, b) => a.timeStart.localeCompare(b.timeStart))[0];

      let scheduleNote = '';
      if (currentClass) {
        scheduleNote = `heads up, you've got **${currentClass.courseName}** in ${currentClass.room || 'Academics'} until ${currentClass.timeEnd}.\n\n`;
      } else if (nextClass) {
        scheduleNote = `you're free right now! next class is **${nextClass.courseName}** at **${nextClass.timeStart}** (${nextClass.room || 'Academics'}).\n\n`;
      } else {
        scheduleNote = `you're totally free right now, no classes left today!\n\n`;
      }

      // Check events happening today or soon
      const todayEvents = events.filter((e) => e.item_type !== 'application' && e.date === todayStr && e.status !== 'Completed' && e.status !== 'Cancelled');
      const upcomingThisWeek = events.filter((e) => e.item_type !== 'application' && e.date >= todayStr && e.status !== 'Completed' && e.status !== 'Cancelled').slice(0, 3);

      if (todayEvents.length > 0) {
        return {
          text: `${scheduleNote}here's what's happening around campus today:\n\n` +
            todayEvents.map(e => `* **${e.event_name}** at ${e.time_start_end} in **${e.venue_zone}${e.room_specific ? ` · ${e.room_specific}` : ''}** (${e.category})`).join('\n'),
          referencedEventIds: todayEvents.map(e => e.id)
        };
      } else if (upcomingThisWeek.length > 0) {
        return {
          text: `${scheduleNote}nothing starting right this second, but check out what's coming up this week:\n\n` +
            upcomingThisWeek.map(e => `* **${e.event_name}** on **${e.date}** (${e.time_start_end}) at **${e.venue_zone}**`).join('\n') +
            `\n\nor you could hit badminton/gym at **Arjuna Centre** or chill at the **Plaza**.`,
          referencedEventIds: upcomingThisWeek.map(e => e.id)
        };
      } else {
        return {
          text: `${scheduleNote}no events right now! you could hit **Arjuna Centre** for badminton or gym, or chill at the **Plaza**.`,
        };
      }
    }

    // 2. Film competitions / creative / media
    if (q.includes('film') || q.includes('movie') || (q.includes('comp') && (q.includes('film') || q.includes('media') || q.includes('acting') || q.includes('ad')))) {
      const filmEvents = events.filter((e) => {
        const text = `${e.event_name} ${e.description} ${e.category} ${(e.categories || []).join(' ')} ${e.organizer}`.toLowerCase();
        return text.includes('film') || text.includes('movie') || text.includes('advertisement') || text.includes('brand') || text.includes('bunkasai') || text.includes('the front row') || text.includes('story project');
      });

      if (filmEvents.length > 0) {
        const listStr = filmEvents.map((e) => 
          `🎬 **${e.event_name}**\n* **By:** ${e.organizer}\n* **When:** ${e.date} (${e.time_start_end})\n* **Deadline:** ${e.registration_deadline || 'Open'}\n* **Eligibility:** ${e.requirements_eligibility || 'Open to All'}\n* **Where:** ${e.venue_zone}`
        ).join('\n\n');

        return {
          text: `here are the creative and film challenges going on right now:\n\n${listStr}\n\ntap any card below to check out the details or register!`,
          referencedEventIds: filmEvents.map((e) => e.id)
        };
      }
    }

    // 3. "What's the next event I'm going to?" / "next event" / "going"
    if (q.includes('next event') || (q.includes('going') && (q.includes('event') || q.includes('what') || q.includes('where')))) {
      if (!isAuthenticated || !user) {
        return {
          text: `sign in with your @flame.edu.in email first so i can see your personal rsvp list!`
        };
      }

      const goingEvts = events
        .filter((e) => goingEventIds.includes(e.id) && e.status !== 'Completed' && e.status !== 'Cancelled')
        .sort((a, b) => a.date.localeCompare(b.date));

      if (goingEvts.length === 0) {
        return {
          text: `you haven't marked "I'm Going" on any upcoming events yet! tap **Going** on any event card on the board to add it to your plan.`
        };
      }

      const nextEvt = goingEvts[0];
      const othersCount = goingEvts.length - 1;

      return {
        text: `📍 your next event is **${nextEvt.event_name}** on **${nextEvt.date}** at **${nextEvt.time_start_end}** in **${nextEvt.venue_zone}**${nextEvt.room_specific ? ` (${nextEvt.room_specific})` : ''} by ${nextEvt.organizer}.${othersCount > 0 ? `\n\nyou've also got **${othersCount} more event${othersCount > 1 ? 's' : ''}** on your going list.` : ''}`,
        referencedEventIds: [nextEvt.id]
      };
    }

    // 4. "What all events have I saved?" / "saved events"
    if (q.includes('saved') || q.includes('bookmark') || (q.includes('events') && q.includes('save'))) {
      if (!isAuthenticated || !user) {
        return {
          text: `sign in with your flame email to check your saved bookmarks!`
        };
      }

      const savedEvts = events.filter((e) => savedEventIds.includes(e.id));

      if (savedEvts.length === 0) {
        return {
          text: `you don't have any saved events right now. hit the **Bookmark / Save** icon on any card to save it for later.`
        };
      }

      return {
        text: `you've saved **${savedEvts.length} event${savedEvts.length > 1 ? 's' : ''}**:\n\n` +
          savedEvts.map((e) => `* **${e.event_name}** (${e.category}) — ${e.date} at ${e.venue_zone}${e.registration_deadline ? ` (deadline: ${e.registration_deadline.split(' ')[0]})` : ''}`).join('\n'),
        referencedEventIds: savedEvts.map((e) => e.id)
      };
    }

    // 5. "Events similar to my favourites / starred"
    if (q.includes('similar') || q.includes('favourite') || q.includes('favorite') || q.includes('starred') || q.includes('recommend')) {
      const favEvents = events.filter((e) => favouriteEventIds.includes(e.id));

      if (favEvents.length === 0) {
        const userPrefs = user?.category_preferences || [];
        if (userPrefs.length > 0) {
          const matchedByPref = events.filter((e) => 
            e.status !== 'Completed' && e.status !== 'Cancelled' && 
            userPrefs.some((p) => (e.category || '').toLowerCase().includes(p.toLowerCase()))
          ).slice(0, 4);

          return {
            text: `you haven't starred any events yet, but based on your **interests (${userPrefs.join(', ')})**, check these out:\n\n` +
              matchedByPref.map(e => `* **${e.event_name}** (${e.category}) on ${e.date}`).join('\n'),
            referencedEventIds: matchedByPref.map(e => e.id)
          };
        }

        return {
          text: `you haven't starred any events with the ⭐ icon yet! star things you like on the board and i'll suggest similar ones.`
        };
      }

      const favCategories = new Set<string>();
      favEvents.forEach((e) => {
        if (e.category) favCategories.add(e.category.toLowerCase());
        if (e.categories) e.categories.forEach(c => favCategories.add(c.toLowerCase()));
      });

      const similarEvents = events.filter((e) => {
        if (favouriteEventIds.includes(e.id)) return false;
        if (e.status === 'Completed' || e.status === 'Cancelled') return false;
        const eCats = `${e.category} ${(e.categories || []).join(' ')}`.toLowerCase();
        return Array.from(favCategories).some((c) => eCats.includes(c));
      }).slice(0, 4);

      if (similarEvents.length > 0) {
        return {
          text: `based on what you starred (*${favEvents.map(e => e.event_name).slice(0, 2).join(', ')}*), you might like these:\n\n` +
            similarEvents.map(e => `* **${e.event_name}** (${e.category}) on **${e.date}** at **${e.venue_zone}**`).join('\n'),
          referencedEventIds: similarEvents.map(e => e.id)
        };
      } else {
        return {
          text: `you've starred **${favEvents.length} event${favEvents.length > 1 ? 's' : ''}** (${favEvents.map(e => e.event_name).join(', ')})! you're already caught up on all matching events in those categories.`
        };
      }
    }

    // 6. Timetable / classes query
    if (q.includes('class') || q.includes('timetable') || q.includes('schedule')) {
      const todayClasses = user?.academic_timetable?.filter(c => c.day === currentDay) || [];
      if (todayClasses.length === 0) {
        return {
          text: `you don't have any classes on **${currentDay}**! you're totally free.`
        };
      }
      return {
        text: `here are your classes for today (**${currentDay}**):\n\n` +
          todayClasses.map(c => `* **${c.courseName}** — ${c.timeStart} to ${c.timeEnd} (${c.room || 'Academics'})`).join('\n')
      };
    }

    // 7. Cricket ground rule
    if (q.includes('cricket') || q.includes('ground') || q.includes('pitch')) {
      return {
        text: `nah, walking on the cricket ground isn't allowed at all lol. gotta stick to the paved road around it to keep the pitch intact.`,
      };
    }

    // 8. Juice Press (only if specifically asked)
    if (q.includes('juice press') || (q.includes('juice') && q.includes('where'))) {
      return {
        text: `juice press is spot #28 near west housing (blocks L through S).`,
      };
    }

    // 9. General search across all events
    const matchedEvents = events.filter((e) => {
      const fullText = `${e.event_name} ${e.description} ${e.category} ${e.organizer} ${e.venue_zone}`.toLowerCase();
      return fullText.includes(q);
    }).slice(0, 3);

    if (matchedEvents.length > 0) {
      return {
        text: `found **${matchedEvents.length} event${matchedEvents.length > 1 ? 's' : ''}** for "${query}":\n\n` +
          matchedEvents.map(e => `* **${e.event_name}** (${e.category})\n  📅 ${e.date} (${e.time_start_end}) · 📍 ${e.venue_zone}`).join('\n\n'),
        referencedEventIds: matchedEvents.map(e => e.id)
      };
    }

    // 10. Default friendly fallback
    return {
      text: `hit me with whatever you need: events coming up, club comps, your classes, or what's on your schedule.`
    };
  };

  // ---------------------------------------------------------------------------
  // SEND MESSAGE HANDLER
  // Attempts Gemini Cloud AI first, falls back instantly to local engine
  // ---------------------------------------------------------------------------
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare rich student and campus payload for Gemini
      const payload = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        })),
        userContext: {
          isAuthenticated,
          name: user?.name,
          email: user?.flame_email,
          cohort: user?.academic_year,
          interests: user?.category_preferences,
          timetable: user?.academic_timetable,
          savedEventIds,
          goingEventIds,
          favouriteEventIds,
        },
        eventsCatalog: events.slice(0, 25).map((e) => ({
          id: e.id,
          event_name: e.event_name,
          category: String(e.category),
          categories: e.categories,
          date: e.date,
          time_start_end: e.time_start_end,
          time_start: e.time_start,
          time_end: e.time_end,
          venue_zone: e.venue_zone,
          room_specific: e.room_specific,
          organizer: e.organizer,
          description: e.description,
          registration_deadline: e.registration_deadline,
          registration_link: e.registration_link,
          registration_fee: e.registration_fee,
          requirements_eligibility: e.requirements_eligibility,
          status: e.status,
          poc_name: e.poc_name,
          poc_number: e.poc_number,
        })),
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          setActiveEngine('gemini');
          setGeminiStatus('Gemini 2.0 Flash');
          
          // Extract any [EVENT: id] tags from answer
          const eventMatches = Array.from(data.answer.matchAll(/\[EVENT:\s*([a-zA-Z0-9_-]+)\]/g)) as RegExpMatchArray[];
          const refIds = eventMatches.map((m) => m[1]);
          const cleanedText = data.answer.replace(/\[EVENT:\s*([a-zA-Z0-9_-]+)\]/g, '').trim();

          const botMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'bot',
            text: cleanedText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            referencedEventIds: refIds.length > 0 ? refIds : undefined,
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini cloud call error or key unavailable, falling back to instant local engine:', e);
    }

    // Local engine fallback
    setTimeout(() => {
      setActiveEngine('local');
      setGeminiStatus('Campus Engine');
      const localResult = answerWithLocalEngine(text);
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: localResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedEventIds: localResult.referencedEventIds,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      
      {/* Scrapbook Chat Container */}
      <div 
        className="relative w-full max-w-2xl h-[90vh] max-h-[720px] bg-[#1a1714] border-2 border-[#3b3226] rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #201c18 0%, #171512 100%)',
        }}
      >
        {/* Top Washi Tape Clip */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#f3da90]/85 rounded-xs rotate-[-1deg] shadow-sm pointer-events-none z-20"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#3b3226] bg-[#221e19]/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c93b2b] to-[#991b1b] flex items-center justify-center border border-amber-300/40 shadow-md">
              <Flame className="w-5 h-5 text-amber-200 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-lg font-bold text-amber-100">
                  FOMO Bot
                </h3>
                <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-600/50 px-2 py-0.2 rounded-full font-mono flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>{activeEngine === 'gemini' ? 'Gemini 2.0 Flash' : 'Campus Engine'}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#a89b87] font-sans-ui">
                your campus buddy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              title="Clear Conversation"
              className="p-1.5 rounded text-neutral-400 hover:text-amber-200 hover:bg-[#2c261f] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={closeChatBot}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#1a1713] border-b border-[#332a20] flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <span className="text-[10px] font-bold text-[#8c7e68] uppercase tracking-wider shrink-0 font-mono">
            Ask:
          </span>
          <button
            onClick={() => handleSendMessage("I'm free rn what to do?")}
            className="px-2.5 py-1 rounded-full text-xs bg-[#241f19] hover:bg-[#342d24] text-amber-200 border border-[#42372b] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>free rn what to do?</span>
          </button>
          <button
            onClick={() => handleSendMessage("I wanna take part in some film comp soon what are my options?")}
            className="px-2.5 py-1 rounded-full text-xs bg-[#241f19] hover:bg-[#342d24] text-amber-200 border border-[#42372b] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Film className="w-3 h-3 text-amber-400" />
            <span>any film comps soon?</span>
          </button>
          <button
            onClick={() => handleSendMessage("What's the next event I'm going to?")}
            className="px-2.5 py-1 rounded-full text-xs bg-[#241f19] hover:bg-[#342d24] text-amber-200 border border-[#42372b] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>next event i&apos;m going to</span>
          </button>
          <button
            onClick={() => handleSendMessage("What all events have I saved?")}
            className="px-2.5 py-1 rounded-full text-xs bg-[#241f19] hover:bg-[#342d24] text-amber-200 border border-[#42372b] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Bookmark className="w-3 h-3 text-amber-400" />
            <span>events i saved</span>
          </button>
          <button
            onClick={() => handleSendMessage("Are there any events similar to the ones I've favourited/starred?")}
            className="px-2.5 py-1 rounded-full text-xs bg-[#241f19] hover:bg-[#342d24] text-amber-200 border border-[#42372b] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Star className="w-3 h-3 text-amber-400" />
            <span>similar to what i starred</span>
          </button>
          <button
            onClick={() => handleSendMessage("Do I have any classes today?")}
            className="px-2.5 py-1 rounded-full text-xs bg-[#241f19] hover:bg-[#342d24] text-amber-200 border border-[#42372b] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>my classes today</span>
          </button>
        </div>

        {/* Chat Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#c93b2b] flex items-center justify-center shrink-0 border border-amber-300/40 shadow-xs mt-1">
                    <Flame className="w-4 h-4 text-amber-200" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-lg p-3.5 text-xs sm:text-sm leading-relaxed shadow-md whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[#c93b2b] text-amber-50 font-sans-ui rounded-tr-none border border-red-500/40'
                        : 'bg-[#25201a] text-neutral-200 font-sans-ui rounded-tl-none border border-[#42372a]'
                    }`}
                  >
                    {/* Render message body with basic bold markdown */}
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="font-editorial text-base font-bold text-amber-200 mt-2 mb-1">{line.replace('### ', '')}</h4>;
                      }
                      
                      // Format **bold**
                      const parts = line.split(/(\*\*[^*]+\*\*)/g);
                      const formattedLine = parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return (
                            <strong key={pIdx} className={isUser ? "font-bold text-white" : "font-bold text-amber-200"}>
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      });

                      return (
                        <div key={idx} className={line.startsWith('* ') ? 'pl-2 text-neutral-300' : ''}>
                          {formattedLine}
                        </div>
                      );
                    })}

                    {/* Interactive Event Snippet Cards */}
                    {msg.referencedEventIds && msg.referencedEventIds.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#3d3326] space-y-2">
                        <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">
                          Linked Campus Events:
                        </div>
                        {msg.referencedEventIds.map((evtId) => {
                          const ev = events.find((e) => e.id === evtId);
                          if (!ev) return null;
                          return (
                            <div
                              key={ev.id}
                              className="p-2.5 bg-[#171410] border border-[#3e3427] rounded-sm hover:border-amber-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs group"
                            >
                              <div>
                                <h5 className="font-editorial text-xs sm:text-sm font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                                  {ev.event_name}
                                </h5>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                                  <span>{ev.date} ({ev.time_start_end})</span>
                                  <span>·</span>
                                  <span className="text-amber-200/90">{ev.venue_zone}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    closeChatBot();
                                    openEventDetail(ev);
                                  }}
                                  className="px-2.5 py-1 rounded-xs bg-[#2e261e] hover:bg-[#c93b2b] text-amber-100 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <span>View</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                {ev.registration_link && (
                                  <a
                                    href={ev.registration_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 rounded-xs bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-colors flex items-center gap-1"
                                  >
                                    <span>Register</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-neutral-500 mt-1 block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-[#c93b2b] flex items-center justify-center shrink-0 border border-amber-300/40">
                <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
              </div>
              <div className="bg-[#25201a] border border-[#42372a] rounded-lg rounded-tl-none p-3 shadow-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-neutral-400 ml-2 font-mono">Consulting campus guide...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-[#201c17] border-t border-[#3b3226]">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g., 'Free rn what to do?' or 'Next event I'm going to')..."
              className="flex-1 bg-[#151310] border border-[#443a2d] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                inputMessage.trim() && !isTyping
                  ? 'bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 active:scale-95'
                  : 'bg-[#2c2620] text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2 px-1">
            <span>Powered by FLAME Campus Knowledge &amp; Gemini AI</span>
            <span className="font-mono">Press Enter to send</span>
          </div>
        </div>

      </div>

    </div>
  );
};
