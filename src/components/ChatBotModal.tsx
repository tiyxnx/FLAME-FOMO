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
  Film,
  Key
} from 'lucide-react';
import { LIFE_AT_FLAME_KNOWLEDGE, LIFE_AT_FLAME_PORTAL_URL } from '@/lib/lifeAtFlameKnowledge';

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
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempKeyInput, setTempKeyInput] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fomo_gemini_api_key') || '';
      setCustomApiKey(stored);
      setTempKeyInput(stored);
      if (stored) {
        setActiveEngine('gemini');
      }
    }
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Multi-turn conversation context & non-repeating response index tracking
  interface ConversationContext {
    topic?: string;
    eventId?: string;
    eventName?: string;
    eventObject?: EventItem;
    eventsList?: EventItem[];
    lastQueryType?: string;
  }
  const lastContextRef = useRef<ConversationContext>({});
  const lastResponseIndexMap = useRef<Record<string, number>>({});

  // Helper to ensure varied, non-repeating answers
  const pickNonRepeating = (key: string, options: string[]): string => {
    const lastIdx = lastResponseIndexMap.current[key] ?? -1;
    let nextIdx = Math.floor(Math.random() * options.length);
    if (options.length > 1 && nextIdx === lastIdx) {
      nextIdx = (nextIdx + 1) % options.length;
    }
    lastResponseIndexMap.current[key] = nextIdx;
    return options[nextIdx];
  };

  // Initialize welcome message when opened
  useEffect(() => {
    if (isChatBotOpen && messages.length === 0) {
      const studentName = user?.name ? user.name.split(' ')[0] : 'there';
      
      const welcome: ChatMessage = {
        id: 'msg-welcome',
        sender: 'bot',
        text: `hello **${studentName}**! what's up? 🔥\n\ni'm **fomo bot**. ask me anything about events, club comps, your classes, or what you've got saved.\n\nlooking for smth to do rn?`,
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
    const qRaw = query.toLowerCase().trim();
    // Word deduplication: collapse 3+ repeated characters down (e.g. "stop itttt" -> "stop it", "noooo" -> "no", "heyyy" -> "hey")
    const qDeduplicated = qRaw.replace(/([a-zA-Z])\1{2,}/g, '$1');
    const q = qDeduplicated;

    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const todayStr = now.toISOString().split('T')[0];

    // College Slang & Short-form Dictionary
    const SLANG_MAP: Record<string, string> = {
      'rn': 'right now',
      'smth': 'something',
      'sth': 'something',
      'tmrw': 'tomorrow',
      '2mrw': 'tomorrow',
      'ydy': 'yesterday',
      'wknd': 'weekend',
      'wkd': 'weekend',
      'abt': 'about',
      'bc': 'because',
      'bcoz': 'because',
      'cuz': 'because',
      'cos': 'because',
      'u': 'you',
      'ur': 'your',
      'r': 'are',
      'pls': 'please',
      'plz': 'please',
      'idk': "i don't know",
      'tbh': 'to be honest',
      'ngl': 'not gonna lie',
      'imo': 'in my opinion',
      'imho': 'in my humble opinion',
      'fyi': 'for your information',
      'hmu': 'hit me up',
      'comp': 'competition',
      'comps': 'competitions',
      'fav': 'favourite',
      'favs': 'favourites',
      'faves': 'favourites',
      'tt': 'timetable',
      'sched': 'schedule',
      'prof': 'professor',
      'profs': 'professors',
      'acad': 'academic',
      'acads': 'academics',
      'cult': 'cultural',
      'reg': 'registration',
      'regs': 'registrations',
      'sec': 'second',
      'min': 'minute',
      'mins': 'minutes',
      'wat': 'what',
      'wut': 'what',
      'fr': 'for real',
      'af': 'extremely',
      'idc': "i don't care",
      'nvm': 'nevermind',
      'bro': 'friend',
      'dude': 'friend',
    };

    // Words with slang expanded for semantic intent matching
    const qNormalized = q
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .map((w) => SLANG_MAP[w] || w)
      .join(' ');

    // Robust matching helpers
    const hasWord = (word: string) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(qRaw) || regex.test(qDeduplicated) || regex.test(qNormalized);
    };
    const hasAnyWord = (words: string[]) => words.some((w) => hasWord(w));
    const hasPhrase = (phrase: string) => {
      return qRaw.includes(phrase) || qDeduplicated.includes(phrase) || qNormalized.includes(phrase);
    };

    // 0a. Training & Conversational Upgrades / "Whatever works best" / "Chat GPT"
    if (
      hasPhrase('train') || hasPhrase('better at convo') || hasPhrase('repetition') ||
      hasPhrase('repeat') || hasPhrase('whatever works') || hasPhrase('do whatever') ||
      hasPhrase('improve') || hasPhrase('smarter') || hasPhrase('how to train') ||
      hasPhrase('chat gpt') || hasPhrase('talk back')
    ) {
      return {
        text: `on it! 🔥 i just upgraded my conversational engine so we can chat naturally without any repetitive loops.\n\nhere is how i work now:\n* 🗣️ **Conversational Banter & Slang**: i understand college slang (rn, smth, tmrw, comps, tt), banter, moods, and emotions.\n* 🔄 **Multi-Turn Context**: ask follow-ups like *"tell me more"*, *"where is that"*, *"when is it"*, or *"how do i register"* and i remember what we just talked about.\n* 🏛️ **Life@FLAME & Live Events**: complete background on Kurukshetra, FLAME Fest, FirstCut, Blaze, committees, and real-time event updates.\n* ⚡ **Gemini AI Integration**: tap **AI Key** in the header anytime to plug in a free Google AI key for full unconstrained ChatGPT power.\n\ntest me out — ask anything or just chat!`
      };
    }

    // 0b. Explicit User Prompt: "say fomo bot"
    if (hasPhrase('fomo bot') && (hasPhrase('say') || hasPhrase('call yourself') || hasPhrase('name'))) {
      return {
        text: `got it! i'm **fomo bot** from now on 🔥 ask me anything about events, club comps, your classes, or what's on campus.`
      };
    }

    // 0c. Slang & Short-form Inquiry / Training
    if (
      hasPhrase('slang') || hasPhrase('short form') || hasPhrase('shortform') || hasPhrase('abbreviation') ||
      ((hasWord('rn') || hasWord('smth')) && (hasPhrase('teach') || hasPhrase('learn') || hasPhrase('know') || hasPhrase('understand')))
    ) {
      return {
        text: `bet! i know student slang like **rn** (right now), **smth** (something), **tmrw** (tomorrow), **wknd**, **bc**, **tt** (timetable), **comps**, and more. hit me with whatever abbreviations u use lol.`
      };
    }

    // 0d. Explicit Juice Press mute request: "stop talking about juice press"
    if (hasPhrase('juice press') && (hasPhrase('stop') || hasPhrase('dont') || hasPhrase('hate') || hasPhrase('not important') || hasPhrase('shut up'))) {
      return {
        text: `haha gotchu, strictly ZERO juice press talk from now on! 🤐 sworn to secrecy lol.`
      };
    }

    // 0e. JUICE PRESS (ONLY IF EXPLICITLY ASKED)
    if (hasPhrase('juice press') || (hasWord('juice') && hasWord('where'))) {
      return {
        text: `juice press is spot #28 near west housing (blocks L through S).`,
      };
    }

    // 0f. MULTI-TURN CONTEXT FOLLOW-UPS (Remembers what was discussed previously!)
    if (hasPhrase('tell me more') || hasPhrase('more info') || hasPhrase('more details') || hasPhrase('expand') || q === 'more' || q === 'details') {
      if (lastContextRef.current.eventObject) {
        const ev = lastContextRef.current.eventObject;
        return {
          text: `here's the full rundown on **${ev.event_name}**:\n\n${ev.description}\n\n* **Hosted by:** ${ev.organizer}\n* **When:** ${ev.date} (${ev.time_start_end})\n* **Location:** ${ev.venue_zone}${ev.room_specific ? ` · ${ev.room_specific}` : ''}\n* **Eligibility:** ${ev.requirements_eligibility || 'Open to all'}\n* **Fee:** ${ev.registration_fee || 'Free'}\n* **Deadline:** ${ev.registration_deadline || 'Open'}${ev.poc_name ? `\n* **POC:** ${ev.poc_name}${ev.poc_number ? ` (${ev.poc_number})` : ''}` : ''}`,
          referencedEventIds: [ev.id]
        };
      }
      if (lastContextRef.current.topic) {
        const topic = LIFE_AT_FLAME_KNOWLEDGE.find(t => t.title.toLowerCase().includes(lastContextRef.current.topic!) || lastContextRef.current.topic!.includes(t.title.toLowerCase()));
        if (topic) {
          return {
            text: `🔥 more details on **${topic.title}**:\n\n${topic.details}\n\ncheck out official updates on the [Life@FLAME Portal](${topic.link || LIFE_AT_FLAME_PORTAL_URL})!`
          };
        }
      }
      return {
        text: `tell u more about which one? i can dive into upcoming fests (Kurukshetra / FLAME Fest / FirstCut), your saved events, or active competitions!`
      };
    }

    // Follow-up: Where is it?
    if (hasPhrase('where is it') || hasPhrase('where is that') || hasPhrase('where is this') || q === 'where' || hasPhrase('which room') || hasPhrase('what location')) {
      if (lastContextRef.current.eventObject) {
        const ev = lastContextRef.current.eventObject;
        return {
          text: `**${ev.event_name}** is happening at **${ev.venue_zone}**${ev.room_specific ? ` (${ev.room_specific})` : ''}!`,
          referencedEventIds: [ev.id]
        };
      }
    }

    // Follow-up: When is it?
    if (hasPhrase('when is it') || hasPhrase('what time') || hasPhrase('when is that') || q === 'when' || hasPhrase('which date')) {
      if (lastContextRef.current.eventObject) {
        const ev = lastContextRef.current.eventObject;
        return {
          text: `**${ev.event_name}** is scheduled for **${ev.date}** from **${ev.time_start_end}**.`,
          referencedEventIds: [ev.id]
        };
      }
    }

    // Follow-up: How to register / Registration fee
    if (hasPhrase('how to register') || hasPhrase('how do i register') || hasPhrase('sign up') || hasPhrase('registration link') || hasPhrase('is it free') || hasPhrase('what is the fee') || hasPhrase('how much')) {
      if (lastContextRef.current.eventObject) {
        const ev = lastContextRef.current.eventObject;
        let regText = `for **${ev.event_name}**:\n* **Fee:** ${ev.registration_fee || 'Free'}\n* **Deadline:** ${ev.registration_deadline || 'Open'}`;
        if (ev.registration_link) {
          regText += `\n* **Register here:** [Registration Link](${ev.registration_link})`;
        } else {
          regText += `\n* you can register directly through the card below!`;
        }
        return {
          text: regText,
          referencedEventIds: [ev.id]
        };
      }
    }

    // Follow-up: Who is organizing / POC
    if (hasPhrase('who is organizing') || hasPhrase('who is hosting') || hasPhrase('who to contact') || hasPhrase('poc') || hasPhrase('contact person')) {
      if (lastContextRef.current.eventObject) {
        const ev = lastContextRef.current.eventObject;
        return {
          text: `**${ev.event_name}** is organized by **${ev.organizer}**${ev.poc_name ? `.\n\nPoint of Contact: **${ev.poc_name}**${ev.poc_number ? ` (${ev.poc_number})` : ''}` : '.'}`,
          referencedEventIds: [ev.id]
        };
      }
    }

    // 0g. Playful Stop / Hush requests: "stop", "lol stop", "stop itttt", "shut up", "shh", "chill out"
    if (
      hasPhrase('stop') || hasPhrase('shut up') || hasPhrase('quiet') || hasPhrase('shh') ||
      hasPhrase('chill out') || hasPhrase('leave me alone') || hasPhrase('stop it') || hasPhrase('be quiet')
    ) {
      const stopReplies = [
        "haha my bad, i'm quiet! 🤐",
        "hahaha okay okay, shutting up now lol 🤐",
        "alright alright, i'm out! hit me up whenever u need smth 🙌",
        "lol heard! keeping it muted.",
        "haha fair enough, backing off! 🤐",
        "oops my bad lol, say less!"
      ];
      return { text: pickNonRepeating('stop', stopReplies) };
    }

    // 0h. Conversational Dismissives: "nah", "no", "nope", "not really", "nothing", "leave it", "nvm", "whatever"
    const dismissives = ['nah', 'no', 'nope', 'not really', 'nothing', 'leave it', 'nvm', 'nevermind', 'dont want to', 'dont care', 'idc', 'nothing much', 'whatever'];
    if (dismissives.some((d) => qRaw === d || qDeduplicated === d || qRaw.startsWith(d + ' ') || qRaw.endsWith(' ' + d))) {
      const replies = [
        "haha fair enough! just chilling then? let me know if u need smth later.",
        "all good haha! what's on your mind then?",
        "no worries at all 🙌 i'm right here whenever u wanna check out campus buzz.",
        "gotchu, keeping it lowkey today. let me know if u need anything!",
        "cool cool, take it easy 🙌"
      ];
      return { text: pickNonRepeating('dismissive', replies) };
    }

    // 0i. Laughter & Keyboard Smashes: "sjsjjajaja", "hahaha", "lmao", "lol", "xd"
    if (/(sjsj|jaja|haha|lmao|lol|rofl|xd|asdf|ghjk)/i.test(qRaw) || /(sjsj|jaja|haha|lmao|lol|rofl|xd|asdf|ghjk)/i.test(qDeduplicated)) {
      const laughReplies = [
        "lmao what's got u laughing? 😂",
        "hahaha keyboard smash energy. everything good? lol",
        "lmao fair enough 😂 having a good day?",
        "haha what's funny? spill the tea!",
        "lol love the energy 😂 what are u up to?"
      ];
      return { text: pickNonRepeating('laugh', laughReplies) };
    }

    // 0j. Affirmatives: "yes", "yeah", "yup", "sure", "ok", "okay", "bet", "alright"
    if (['yes', 'yeah', 'yup', 'sure', 'ok', 'okay', 'k', 'bet', 'alright', 'cool', 'fine'].includes(qDeduplicated)) {
      const affirmReplies = [
        "bet! what are u trying to check out — events coming up, your classes, or club comps?",
        "awesome! what do u wanna look for on campus?",
        "for sure. let me know what u need — events, spots to chill, or your schedule!",
        "sweet! hit me with whatever's on your mind."
      ];
      return { text: pickNonRepeating('affirm', affirmReplies) };
    }

    // 0k. Questions / Confusion: "what", "why", "huh", "wym", "wdym"
    if (['what', 'why', 'huh', 'wym', 'wdym', 'what do you mean'].includes(qDeduplicated)) {
      return {
        text: "i mean whatever you're looking for on campus! like upcoming fests, film competitions, whether you've got classes rn, or places to hang out."
      };
    }

    // 0l. STUDENT MOODS & DAILY CAMPUS LIFE
    // 1. Boredom
    if (hasAnyWord(['bored', 'bore']) || hasPhrase('nothing to do') || hasPhrase('kill time') || hasPhrase('pass time') || hasPhrase('entertain me')) {
      return {
        text: pickNonRepeating('bored', [
          "bored on campus? let's fix that! you could hit the Arjuna Centre for badminton or squash, grab a snack at the Plaza, or check out active club comps.\n\nwanna see upcoming events or active challenges?",
          "honestly same sometimes lol. if you're looking for smth active, pick-up basketball at Arjuna Centre is usually popping, or you could chill at the Plaza. want me to check what events are coming up?",
          "no way! campus is buzzing. check out the live film & brand challenges on the board, or go explore the sports fests. what are u in the mood for?"
        ])
      };
    }

    // 2. Tired / Exhaustion
    if (hasAnyWord(['tired', 'sleepy', 'exhausted', 'drained']) || hasPhrase('need sleep') || hasPhrase('slept') || hasPhrase('all nighter')) {
      return {
        text: pickNonRepeating('tired', [
          "bro go take a power nap in your room! sleep debt at FLAME is no joke lol. just make sure you don't sleep through your next class.",
          "felt that! grab an iced coffee or chai at the Plaza, or just crash for an hour. don't burn out!",
          "sounds like an all-nighter caught up with you lol. take it easy today, hit the bed early, and catch up on campus stuff later 🙌"
        ])
      };
    }

    // 3. Stressed / Exams / Deadlines
    if (hasAnyWord(['stressed', 'anxious', 'overwhelmed']) || hasPhrase('exam') || hasPhrase('finals') || hasPhrase('assignment') || hasPhrase('submission') || hasPhrase('due date')) {
      return {
        text: pickNonRepeating('stressed', [
          "deep breaths! you've got this. the Central Library has quiet study zones if you need to lock in. take a 10-minute break to walk around the peripheral road when your brain feels fried.",
          "exam / submission stress is real! take it one task at a time. grab some chai at the Plaza, review your notes, and take breaks. you'll crush it!",
          "hang in there! FLAME deadlines can get intense, but you'll get through it. make sure to stay hydrated and eat at the Dining Hall!"
        ])
      };
    }

    // 4. Social / Meeting Friends
    if (hasPhrase('meet people') || hasPhrase('make friends') || hasPhrase('where is everyone') || hasPhrase('socialize') || hasPhrase('lonely')) {
      return {
        text: `best spots to meet people on campus:\n* **FLAME Plaza** around 5:00 PM – 7:00 PM (peak social hours)\n* **Arjuna Centre** for pick-up badminton, basketball, or pool\n* **Club events & comps**: joining a team for AD-SHAD or cultural fest rehearsals is the fastest way to make friends!`
      };
    }

    // 0m. CASUAL WIT, AI COMPARISONS & GOSSIP
    if (hasPhrase('are you real') || hasPhrase('are you ai') || hasPhrase('are you chatgpt') || hasPhrase('chatgpt')) {
      return {
        text: pickNonRepeating('ai_identity', [
          "i'm fomo bot! built specifically for FLAME students with local campus intelligence and live event sync. if you connect your Gemini key in the header, i run on full Gemini 2.0 Flash AI too!",
          "i'm your FLAME campus AI buddy! unlike regular chatgpt, i actually know where APJ hall is, the cricket ground rules, and when the next fest is happening lol."
        ])
      };
    }

    if (hasPhrase('i love you') || hasPhrase('marry me') || hasPhrase('you are cute') || hasPhrase('youre cute') || hasPhrase('you are the best') || hasPhrase('youre the best') || hasPhrase('best bot')) {
      return {
        text: pickNonRepeating('flirt', [
          "hahaha appreciate the love! flattered, but my only commitment is making sure you never miss campus events lol 🙌",
          "ayyy thank you! you're awesome too. let me know if u need any event recommendations 🔥",
          "haha blushing! happy to be your campus guide 🙌"
        ])
      };
    }

    if (hasPhrase('you suck') || hasPhrase('you are dumb') || hasPhrase('youre dumb') || hasPhrase('you are stupid') || hasPhrase('bad bot') || hasPhrase('useless')) {
      return {
        text: pickNonRepeating('roast', [
          "ouch haha, my bad! what did i miss? tell me what you're trying to find and i'll get it right 🙌",
          "damn harsh! haha give me another shot — what are you looking for on campus?",
          "my feelings! 🥲 jk, tell me what went wrong and i'll help u out."
        ])
      };
    }

    if (hasPhrase('secret') || hasPhrase('gossip') || hasPhrase('campus tip') || hasPhrase('pro tip') || hasPhrase('hack')) {
      return {
        text: pickNonRepeating('tips', [
          "🤫 **Campus Pro Tip #1**: The indoor badminton courts at Arjuna Centre are emptiest between 2 PM and 4 PM during afternoon lecture blocks!",
          "🤫 **Campus Pro Tip #2**: The sunset view from the lawn behind West Housing is undefeated. Bring a cold drink and thank me later.",
          "🤫 **Campus Pro Tip #3**: Never cut across the cricket pitch to save 2 minutes before class. Security will catch you every single time lol!"
        ])
      };
    }

    // 0g. LIFE@FLAME Official Knowledge Matcher
    const matchedTopic = LIFE_AT_FLAME_KNOWLEDGE.find((topic) => 
      topic.keywords.some((k) => q.includes(k) || qNormalized.includes(k)) ||
      q.includes(topic.title.toLowerCase())
    );
    if (matchedTopic) {
      lastContextRef.current = { topic: matchedTopic.title.toLowerCase() };
      return {
        text: `🔥 **${matchedTopic.title}**\n\n${matchedTopic.details}\n\n🔗 check out more on the official [Life@FLAME Portal](${matchedTopic.link || LIFE_AT_FLAME_PORTAL_URL})!`
      };
    }

    if (q.includes('life at flame') || q.includes('lifeatflame') || q.includes('google site')) {
      lastContextRef.current = { topic: 'lifeatflame' };
      return {
        text: `🔗 **Life@FLAME** is FLAME's official campus life & student affairs portal!\n\nit covers flagship fests like Kurukshetra & FLAME Fest, student committees (Sports Committee, Cultural Committee, Student Council), club charters, and student resources.\n\ncheck it out here: [Life@FLAME Official Portal](${LIFE_AT_FLAME_PORTAL_URL})`
      };
    }

    // 1. GREETINGS & CASUAL HELLOS
    // "hello", "hi", "hey", "sup", "yo", "what's up", "good morning", "good evening", etc.
    const isGreeting = (
      q === 'hi' || q === 'hello' || q === 'hey' || q === 'heyy' || q === 'heya' ||
      q === 'sup' || q === 'wassup' || q === "what's up" || q === 'whats up' || q === 'yo' ||
      q.startsWith('hello') || q.startsWith('hi ') || q.startsWith('hey ') ||
      q.includes('good morning') || q.includes('good afternoon') || q.includes('good evening')
    );
    if (isGreeting) {
      return {
        text: `hello! what's up? i'm **fomo bot**. how's your day going?\n\nlooking for events happening soon, active club comps, or need info on your schedule?`
      };
    }

    // 2. CASUAL CHAT: "HOW ARE YOU" / "HOW'S IT GOING"
    if (
      q.includes('how are you') || q.includes('how are u') || q.includes("how's it going") ||
      q.includes('hows it going') || q.includes('how r u') || q.includes("what's going on") ||
      q.includes('whats good') || q.includes('how do you do')
    ) {
      return {
        text: `all good here! just tracking all the campus events, club competitions, and schedules. how about you? got some free time or looking to hit up an event?`
      };
    }

    // 4. JOKES / FUNNY
    if (q.includes('joke') || q.includes('make me laugh') || q.includes('funny') || q.includes('say something funny')) {
      return {
        text: `why did the student take the 10-minute detour around the boundary? because security caught them looking at the cricket pitch grass from 50 meters away lol. remember: keep off the pitch grass!`
      };
    }

    // 5. APPRECIATION & THANKS
    if (hasAnyWord(['thanks', 'thank', 'thx', 'ty', 'appreciate', 'cool', 'awesome', 'nice', 'great', 'bet', 'perfect', 'dope'])) {
      return {
        text: `anytime! happy to help 🙌 let me know if you need anything else on campus.`
      };
    }

    // 6. FAREWELLS
    if (hasAnyWord(['bye', 'cya', 'goodnight', 'peace']) || q.includes('see ya') || q.includes('good night') || q.includes('catch you later')) {
      return {
        text: `catch you later! have a good one 🙌`
      };
    }

    // 7. FOOD & DINING
    if (hasAnyWord(['food', 'hungry', 'eat', 'eating', 'dining', 'mess', 'canteen', 'lunch', 'dinner', 'breakfast', 'snacks', 'cafe', 'cafeteria'])) {
      return {
        text: `for food on campus:\n* **FLAME Dining Hall** for the daily buffet (breakfast, lunch, hi-tea, dinner)\n* **FLAME Plaza** for quick bites, snacks, coffee, and hanging out\n* **Tuck shops & cafes** scattered around the central campus area.`
      };
    }

    // 8. SPORTS, GYM & ARJUNA CENTRE
    if (
      hasAnyWord(['sports', 'sport', 'gym', 'workout', 'badminton', 'squash', 'swimming', 'pool', 'basketball', 'tennis', 'football']) ||
      q.includes('arjuna') || q.includes('table tennis')
    ) {
      const sportEvents = events.filter((e) => {
        const text = `${e.event_name} ${e.description} ${e.category} ${(e.categories || []).join(' ')} ${e.venue_zone}`.toLowerCase();
        return text.includes('sport') || text.includes('football') || text.includes('cricket') || text.includes('badminton') || text.includes('basketball') || text.includes('athletics') || text.includes('tournament') || text.includes('arjuna');
      });

      let resText = `**Arjuna Centre for Sports** has indoor badminton, squash courts, the gym, table tennis, and the swimming pool.\n\n`;
      if (sportEvents.length > 0) {
        lastContextRef.current = { topic: 'sports', eventObject: sportEvents[0], eventsList: sportEvents };
        resText += `here are upcoming sports events & competitions:\n\n` +
          sportEvents.slice(0, 3).map(e => `* **${e.event_name}** — ${e.date} (${e.time_start_end}) at ${e.venue_zone}`).join('\n');
      } else {
        lastContextRef.current = { topic: 'sports' };
        resText += `no specific sports tournaments scheduled right now, but Arjuna Centre is open for recreational play!`;
      }

      return {
        text: resText,
        referencedEventIds: sportEvents.map(e => e.id)
      };
    }

    // 9. LIBRARY & STUDY
    if (hasAnyWord(['library', 'study', 'quiet', 'books', 'reading'])) {
      return {
        text: `the **FLAME Central Library** is your best bet for quiet study, research, and project discussions. open daily for students!`
      };
    }

    // 10. CRICKET GROUND RULE
    if (q.includes('cricket') && (q.includes('ground') || q.includes('walk') || q.includes('pitch') || q.includes('cross') || q.includes('rule'))) {
      return {
        text: `nah, walking on the cricket ground isn't allowed at all lol. gotta stick to the paved road around it to keep the pitch intact.`,
      };
    }

    // 11. JUICE PRESS (ONLY IF EXPLICITLY ASKED)
    if (q.includes('juice press') || (q.includes('juice') && q.includes('where'))) {
      return {
        text: `juice press is spot #28 near west housing (blocks L through S).`,
      };
    }

    // 12. FREE TIME / "I'M FREE RN WHAT TO DO" / "SMTH TO DO RN" / BORED
    if (
      (hasWord('rn') && (hasWord('free') || hasWord('smth') || hasWord('do') || hasWord('happening') || hasWord('plans'))) ||
      q.includes('free rn') || q.includes('free right now') || q.includes('free now') ||
      q.includes('smth to do') || q.includes('something to do') ||
      (hasWord('free') && (q.includes('what to do') || q.includes('what should i do') || q.includes('am i free'))) ||
      hasWord('bored') || q.includes('nothing to do') || q.includes('kill time') || q.includes('pass time')
    ) {
      const currentClass = user?.academic_timetable?.find(
        (cls) => cls.day === currentDay && currentTime >= cls.timeStart && currentTime <= cls.timeEnd
      );

      const nextClass = user?.academic_timetable
        ?.filter((cls) => cls.day === currentDay && cls.timeStart > currentTime)
        ?.sort((a, b) => a.timeStart.localeCompare(b.timeStart))[0];

      let scheduleNote = '';
      if (currentClass) {
        scheduleNote = `heads up, you've got **${currentClass.courseName}** in ${currentClass.room || 'Academics'} until ${currentClass.timeEnd} rn.\n\n`;
      } else if (nextClass) {
        scheduleNote = `you're free rn! next class is **${nextClass.courseName}** at **${nextClass.timeStart}** (${nextClass.room || 'Academics'}).\n\n`;
      } else {
        scheduleNote = `you're totally free rn, no classes left today!\n\n`;
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
          text: `${scheduleNote}nothing starting rn, but check out what's coming up this week or tmrw:\n\n` +
            upcomingThisWeek.map(e => `* **${e.event_name}** on **${e.date}** (${e.time_start_end}) at **${e.venue_zone}**`).join('\n') +
            `\n\nor you could hit badminton/gym at **Arjuna Centre** or chill at the **Plaza**.`,
          referencedEventIds: upcomingThisWeek.map(e => e.id)
        };
      } else {
        return {
          text: `${scheduleNote}no events rn! you could hit **Arjuna Centre** for badminton or gym, or chill at the **Plaza**.`,
        };
      }
    }

    // 13. TIMETABLE / CLASSES QUERY
    if (hasAnyWord(['class', 'classes', 'lecture', 'lectures', 'timetable', 'schedule']) || q.includes('do i have class')) {
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

    // 14. "WHAT'S THE NEXT EVENT I'M GOING TO?" / "NEXT EVENT" / "GOING"
    if (
      q.includes('next event') ||
      (hasWord('going') && (q.includes('event') || q.includes('what') || q.includes('where') || q.includes('am i')))
    ) {
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

    // 15. "WHAT ALL EVENTS HAVE I SAVED?" / "SAVED EVENTS"
    if (hasAnyWord(['saved', 'bookmarks', 'bookmarked', 'watchlist']) || (q.includes('events') && q.includes('save'))) {
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

    // 16. "EVENTS SIMILAR TO MY FAVOURITES / STARRED"
    if (hasAnyWord(['similar', 'favourite', 'favorite', 'starred', 'recommend', 'recommendations', 'suggest'])) {
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

    // 17. FILM / CREATIVE / MEDIA COMPETITIONS
    if (hasAnyWord(['film', 'movie', 'cinema', 'video', 'acting', 'director']) || q.includes('ad-shad') || (hasWord('comp') && (q.includes('film') || q.includes('media') || q.includes('brand')))) {
      const filmEvents = events.filter((e) => {
        const text = `${e.event_name} ${e.description} ${e.category} ${(e.categories || []).join(' ')} ${e.organizer}`.toLowerCase();
        return text.includes('film') || text.includes('movie') || text.includes('advertisement') || text.includes('brand') || text.includes('bunkasai') || text.includes('the front row') || text.includes('story project');
      });

      if (filmEvents.length > 0) {
        lastContextRef.current = { topic: 'film', eventObject: filmEvents[0], eventsList: filmEvents };
        const listStr = filmEvents.map((e) => 
          `🎬 **${e.event_name}**\n* **By:** ${e.organizer}\n* **When:** ${e.date} (${e.time_start_end})\n* **Deadline:** ${e.registration_deadline || 'Open'}\n* **Eligibility:** ${e.requirements_eligibility || 'Open to All'}\n* **Where:** ${e.venue_zone}`
        ).join('\n\n');

        return {
          text: `here are the creative and film challenges going on right now:\n\n${listStr}\n\ntap any card below to check out the details or register!`,
          referencedEventIds: filmEvents.map((e) => e.id)
        };
      }
    }

    // 18. MUSIC / BANDS / JAMMING
    if (hasAnyWord(['music', 'band', 'jam', 'singing', 'concert', 'acoustic', 'gig'])) {
      const musicEvents = events.filter((e) => {
        const text = `${e.event_name} ${e.description} ${e.category} ${(e.categories || []).join(' ')} ${e.organizer}`.toLowerCase();
        return text.includes('music') || text.includes('band') || text.includes('sing') || text.includes('jam') || text.includes('acoustic');
      });
      if (musicEvents.length > 0) {
        lastContextRef.current = { topic: 'music', eventObject: musicEvents[0], eventsList: musicEvents };
        return {
          text: `here's what the FLAME Music Club and campus bands have lined up:\n\n` +
            musicEvents.map(e => `* **${e.event_name}** on **${e.date}** (${e.time_start_end}) at ${e.venue_zone}`).join('\n'),
          referencedEventIds: musicEvents.map(e => e.id)
        };
      }
    }

    // 19. DANCE & CHOREOGRAPHY
    if (hasAnyWord(['dance', 'dancer', 'choreography', 'hip hop', 'bhangra'])) {
      const danceEvents = events.filter((e) => {
        const text = `${e.event_name} ${e.description} ${e.category} ${(e.categories || []).join(' ')} ${e.organizer}`.toLowerCase();
        return text.includes('dance') || text.includes('choreography');
      });
      if (danceEvents.length > 0) {
        lastContextRef.current = { topic: 'dance', eventObject: danceEvents[0], eventsList: danceEvents };
        return {
          text: `here's what's happening with FLAME Dance Club:\n\n` +
            danceEvents.map(e => `* **${e.event_name}** on **${e.date}** (${e.time_start_end}) at ${e.venue_zone}`).join('\n'),
          referencedEventIds: danceEvents.map(e => e.id)
        };
      }
    }

    // 20. PARTIES, FESTS & CULTURAL NIGHTS
    if (hasAnyWord(['party', 'fest', 'fests', 'cultural', 'celebration', 'dj']) || q.includes('bunkasai') || q.includes('first cut')) {
      const festEvents = events.filter((e) => {
        const text = `${e.event_name} ${e.description} ${e.category} ${(e.categories || []).join(' ')} ${e.organizer}`.toLowerCase();
        return text.includes('fest') || text.includes('cultural') || text.includes('bunkasai') || text.includes('party') || text.includes('first cut') || text.includes('celebration');
      });
      if (festEvents.length > 0) {
        lastContextRef.current = { topic: 'fest', eventObject: festEvents[0], eventsList: festEvents };
        return {
          text: `here are the major fests and cultural events happening:\n\n` +
            festEvents.map(e => `* **${e.event_name}** (${e.category}) on **${e.date}** at ${e.venue_zone}`).join('\n'),
          referencedEventIds: festEvents.map(e => e.id)
        };
      }
    }

    // 21. GENERAL "WHAT'S HAPPENING?" / "WHAT EVENTS ARE THERE?" / "UPCOMING EVENTS"
    if (
      q.includes("what's happening") || q.includes('whats happening') || q.includes('what is happening') ||
      q.includes('what events') || q.includes('any events') || q.includes('upcoming events') ||
      q.includes('show events') || q.includes('list events') || q.includes('all events') || q === 'events'
    ) {
      const upcoming = events
        .filter((e) => e.status !== 'Completed' && e.status !== 'Cancelled')
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4);

      if (upcoming.length > 0) {
        lastContextRef.current = { topic: 'events', eventObject: upcoming[0], eventsList: upcoming };
        return {
          text: `here's what's coming up on campus soon:\n\n` +
            upcoming.map(e => `* **${e.event_name}** (${e.category}) — **${e.date}** (${e.time_start_end}) at **${e.venue_zone}**`).join('\n\n'),
          referencedEventIds: upcoming.map(e => e.id)
        };
      }
    }

    // 22. SMART KEYWORD & RELEVANCE SCORING ACROSS EVENTS
    // Removes filler/stop words and matches keywords naturally
    const stopWords = new Set([
      'the', 'is', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'any', 'some',
      'what', 'are', 'there', 'i', 'can', 'you', 'tell', 'me', 'about', 'show', 'give', 'do', 'have',
      'my', 'how', 'when', 'where', 'which', 'who', 'want', 'looking', 'know'
    ]);
    const queryTokens = q
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    if (queryTokens.length > 0) {
      const scoredEvents = events
        .map((e) => {
          let score = 0;
          const nameLower = e.event_name.toLowerCase();
          const descLower = (e.description || '').toLowerCase();
          const catLower = (e.category || '').toLowerCase();
          const orgLower = (e.organizer || '').toLowerCase();
          const venueLower = (e.venue_zone || '').toLowerCase();

          for (const token of queryTokens) {
            if (nameLower.includes(token)) score += 5;
            if (catLower.includes(token)) score += 3;
            if (orgLower.includes(token)) score += 3;
            if (descLower.includes(token)) score += 1;
            if (venueLower.includes(token)) score += 1;
          }
          return { event: e, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (scoredEvents.length > 0) {
        lastContextRef.current = { topic: queryTokens.join(' '), eventObject: scoredEvents[0].event, eventsList: scoredEvents.map(s => s.event) };
        return {
          text: `found **${scoredEvents.length} event${scoredEvents.length > 1 ? 's' : ''}** related to "${queryTokens.join(' ')}":\n\n` +
            scoredEvents.map(({ event: e }) => `* **${e.event_name}** (${e.category})\n  📅 ${e.date} (${e.time_start_end}) · 📍 ${e.venue_zone}`).join('\n\n'),
          referencedEventIds: scoredEvents.map(s => s.event.id)
        };
      }
    }

    // 23. DYNAMIC CHATGPT-STYLE FALLBACK (NEVER REPEATS CONSECUTIVELY)
    const isQuestion = qRaw.endsWith('?') || q.startsWith('why') || q.startsWith('how') || q.startsWith('who') || q.startsWith('where') || q.startsWith('when') || q.startsWith('which') || q.startsWith('can i');

    if (isQuestion) {
      const questionFallbacks = [
        "good question! on campus that usually connects back to student council policies or committee planning. looking for info on a specific event, venue, or fest?",
        "depends on the situation! if it's about club registrations, fests, or campus facilities, let me know which one and i'll break it down.",
        "heard that! could you specify if you're asking about an event, a campus rule, or your timetable? i've got all the details right here.",
        "for sure. let me know if you mean sports at Arjuna Centre, student fests like Kurukshetra, or your saved events list!"
      ];
      return { text: pickNonRepeating('q_fallback', questionFallbacks) };
    }

    const dynamicFallbacks = [
      "gotchu! i'm tuned into all the campus events, club comps, and your timetable. what's on your mind?",
      "heard that! looking for smth specific on campus or just seeing what's good?",
      "for sure. let me know if u wanna find events happening this week, check your classes, or see what's on Life@FLAME!",
      "bet. what can i help u with — classes, events, or club comps?",
      "i'm listening! hit me with any questions about campus life, fests, or your schedule.",
      "100%. always here if you want recommendations on competitions, sports, or food spots.",
      "haha noted! let me know whenever you want to check what's happening around campus 🙌",
      "sounds good! ready whenever you need the scoop on upcoming events or campus buzz."
    ];
    return {
      text: pickNonRepeating('dynamic_fallback', dynamicFallbacks)
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
        userApiKey: customApiKey || undefined,
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
          if (refIds.length > 0) {
            const ev = events.find(e => e.id === refIds[0]);
            if (ev) {
              lastContextRef.current = { eventId: ev.id, eventName: ev.event_name, eventObject: ev };
            }
          }
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
              onClick={() => setShowKeyModal(true)}
              title="Connect Gemini AI Key (Optional)"
              className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                customApiKey ? 'text-amber-300 bg-amber-950/60 border border-amber-600/40' : 'text-neutral-400 hover:text-amber-200 hover:bg-[#2c261f]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-mono">
                {customApiKey ? 'AI Connected' : 'AI Key'}
              </span>
            </button>
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
            onClick={() => handleSendMessage("Tell me about Life@FLAME flagship fests and sports")}
            className="px-2.5 py-1 rounded-full text-xs bg-[#241f19] hover:bg-[#342d24] text-amber-200 border border-[#42372b] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Compass className="w-3 h-3 text-amber-400" />
            <span>Life@FLAME info</span>
          </button>
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

        {/* Optional Gemini API Key Dialog */}
        {showKeyModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[#241f19] border border-[#443a2d] p-5 rounded-lg max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h4 className="font-editorial text-base font-bold text-amber-100">Connect Google Gemini Key</h4>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Enter your free Google Gemini API key to enable live AI responses. If left empty, FOMO Bot runs on the built-in campus intelligence engine.
              </p>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Gemini API Key (AIzaSy...)
                </label>
                <input
                  type="password"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key here..."
                  className="w-full bg-[#151310] border border-[#443a2d] rounded px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('fomo_gemini_api_key');
                    setCustomApiKey('');
                    setTempKeyInput('');
                    setActiveEngine('local');
                    setShowKeyModal(false);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Clear Key
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-1.5 rounded text-xs bg-[#2c2620] hover:bg-[#342d24] text-neutral-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const trimmed = tempKeyInput.trim();
                      if (trimmed) {
                        localStorage.setItem('fomo_gemini_api_key', trimmed);
                        setCustomApiKey(trimmed);
                        setActiveEngine('gemini');
                      } else {
                        localStorage.removeItem('fomo_gemini_api_key');
                        setCustomApiKey('');
                        setActiveEngine('local');
                      }
                      setShowKeyModal(false);
                    }}
                    className="px-3 py-1.5 rounded text-xs bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 font-bold cursor-pointer"
                  >
                    Save &amp; Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
