import { EventCategory, VenueZone, AcademicYear, EventItem, MapCoordinates, ClassScheduleItem } from '@/types';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Academic',
  'Clubs',
  'Sports',
  'Social',
  'Competitions',
  'Workshops',
  'Performances',
  'Career',
  'Talks/Lectures',
  'Other',
];

export const ACADEMIC_YEARS: AcademicYear[] = ['UG1', 'UG2', 'UG3', 'UG4', 'All'];

export const VENUE_ZONES: VenueZone[] = [
  'Academics',
  'Sports',
  'Eateries',
  'Flora & Fauna',
  'Shantiniketan/Recreational',
];

export const VENUE_LOCATIONS_MAP: Record<VenueZone, string[]> = {
  Academics: [
    'Vikram Sarabhai Centre - Room 101',
    'Vikram Sarabhai Centre - Room 102',
    'Vikram Sarabhai Centre - Room 201',
    'Vikram Sarabhai Centre - Room 204',
    'Vikram Sarabhai Centre - Lecture Hall A',
    'Vikram Sarabhai Centre - Lecture Hall B',
    'Vikram Sarabhai Centre - Conference Hall',
    'APJ Abdul Kalam - Innovation Hub / Lab',
    'APJ Abdul Kalam - Design Studio',
    'APJ Abdul Kalam - Room 105',
    'APJ Abdul Kalam - Room 202',
    'Kalidas Centre - Seminar Hall',
    'Kalidas Centre - Visual Arts Studio',
    'Kalidas Centre - Room 102',
    'Kalidas Centre - Room 205',
    'Chanakya - Hall 1',
    'Chanakya - Hall 2',
    'Chanakya - Room 201',
    'Chanakya - Room 202',
    'Aryabhatta - Computer Lab 1',
    'Aryabhatta - Computer Lab 2',
    'Aryabhatta - AI & Data Lab 3',
    'Aryabhatta - Classroom 101',
    'Vivekananda Library - Main Reading Hall',
    'Vivekananda Library - Discussion Room 1',
    'Vivekananda Library - Discussion Room 2',
    'Vivekananda Library - Digital Media Archive',
  ],
  Sports: [
    'Arjuna Centre for Sports - Indoor Badminton Arena',
    'Arjuna Centre for Sports - Gymnasium & Fitness Suite',
    'Arjuna Centre for Sports - Squash Courts',
    'Arjuna Centre for Sports - Table Tennis Room',
    'Cricket Ground - Main Pitch',
    'Cricket Ground - Pavilion',
    'Football Ground - Main Pitch',
    'Football Ground - Practice Turf',
    'Track & Field - 400m Running Track',
    'Tennis Courts - Court 1',
    'Tennis Courts - Court 2',
    'Basketball Courts - Floodlit Main Court',
    'Volleyball Court',
    'Swimming Pool Complex',
  ],
  Eateries: [
    'Aahar - Main Dining Hall',
    'Aahar - First Floor Mezzanine',
    'Rasoi - Food Court Counter',
    'Coffee Nation - Outdoor Patio',
    'Coffee Nation - Indoor Lounge',
    'Hashtag Cafe - Main Seating',
    'Blue Tokai Cafe - Mezzanine Lounge',
    'Blue Tokai Cafe - Ground Veranda',
    'Juice & Snacks Kiosk (Sports Complex)',
  ],
  'Flora & Fauna': [
    'Butterfly Garden - Central Walkway',
    'Butterfly Garden - Gazebo Lawn',
    'Nakshatra Garden - Eco Trail Path',
    'Botanical Garden - Bamboo Grove',
    'FLAME Lake - Sunset Viewing Deck',
  ],
  'Shantiniketan/Recreational': [
    'Auditorium - Main Stage & Hall',
    'Auditorium - Foyer Gallery',
    'FLAME Kund - Amphitheatre Steps',
    'FLAME Kund - Central Stage',
    'FLAME Plaza - Central Courtyard',
    'FLAME Plaza - Arts & Exhibition Kiosk',
    'FLAME Lounge - Student Common Room',
    'Music Society Jam Room',
    'Dance Club Rehearsal Studio',
  ],
};

// Approximate zone positions on the 624x441 campus map image (percentage x, y)
export const ZONE_COORDINATES: Record<VenueZone, MapCoordinates> = {
  Academics: { x: 42, y: 38 },
  Sports: { x: 78, y: 28 },
  Eateries: { x: 34, y: 62 },
  'Flora & Fauna': { x: 18, y: 75 },
  'Shantiniketan/Recreational': { x: 58, y: 56 },
};

// Specific venue sub-coordinates on the illustrated campus map
export const SPECIFIC_VENUE_COORDINATES: Record<string, MapCoordinates> = {
  // Academics
  'Vikram Sarabhai Centre': { x: 40, y: 35 },
  'APJ Abdul Kalam': { x: 48, y: 32 },
  'Vivekananda Library': { x: 38, y: 44 },
  'Kalidas Centre': { x: 52, y: 40 },
  'Chanakya': { x: 45, y: 42 },
  'Aryabhatta': { x: 35, y: 33 },

  // Sports
  'Arjuna Centre for Sports': { x: 75, y: 24 },
  'Cricket Ground': { x: 84, y: 32 },
  'Football Ground': { x: 74, y: 36 },
  'Track & Field': { x: 80, y: 42 },
  'Tennis Courts': { x: 68, y: 22 },

  // Eateries
  'Aahar': { x: 32, y: 58 },
  'Rasoi': { x: 28, y: 64 },
  'Coffee Nation': { x: 37, y: 66 },
  'Hashtag': { x: 40, y: 58 },
  'Blue Tokai Cafe': { x: 30, y: 52 },

  // Flora & Fauna
  'Butterfly Garden': { x: 16, y: 72 },
  'Nakshatra Garden': { x: 24, y: 82 },
  'Botanical Garden': { x: 12, y: 65 },

  // Recreational
  'Auditorium': { x: 54, y: 48 },
  'FLAME Plaza': { x: 50, y: 58 },
  'FLAME Kund': { x: 60, y: 62 },
  'FLAME Lounge': { x: 65, y: 52 },
};

export const FREE_WILL_PROMPTS = [
  "Try a new iced caramel latte at Blue Tokai Cafe with a sketchbook.",
  "Go sit and watch the sunset unfold over the FLAME Kund steps.",
  "Pick up an unexpected poetry or philosophy book from Vivekananda Library.",
  "Take a peaceful, slow walk through the Butterfly Garden before dusk.",
  "Catch up with friends over hot cheese toast and chai at Hashtag.",
  "Stroll across the cricket pitch under the evening Pune breeze.",
  "Find a quiet corner at Kalidas Centre courtyard and journal your thoughts.",
  "Grab your guitar or earphones and hang out by the Nakshatra Garden path.",
];

export const DEFAULT_TIMETABLE_SAMPLE: ClassScheduleItem[] = [
  {
    id: 'class-1',
    courseName: 'Intro to Philosophy & Critical Thinking',
    day: 'Monday',
    timeStart: '09:00',
    timeEnd: '10:15',
    venueZone: 'Academics',
    room: 'Kalidas Centre 102',
  },
  {
    id: 'class-2',
    courseName: 'Data Visualization & Storytelling',
    day: 'Monday',
    timeStart: '10:30',
    timeEnd: '11:45',
    venueZone: 'Academics',
    room: 'Aryabhatta Lab 3',
  },
  {
    id: 'class-3',
    courseName: 'Contemporary South Asian Cinema',
    day: 'Wednesday',
    timeStart: '14:15',
    timeEnd: '15:30',
    venueZone: 'Academics',
    room: 'Vikram Sarabhai Centre 204',
  },
  {
    id: 'class-4',
    courseName: 'Macroeconomics for Global Markets',
    day: 'Wednesday',
    timeStart: '15:45',
    timeEnd: '17:00',
    venueZone: 'Academics',
    room: 'Chanakya Hall 1',
  },
  {
    id: 'class-5',
    courseName: 'Digital Media and Public Culture',
    day: 'Friday',
    timeStart: '11:00',
    timeEnd: '12:15',
    venueZone: 'Academics',
    room: 'APJ Abdul Kalam 105',
  },
];

// Clean slate for production: all events come dynamically from Supabase database
export const INITIAL_SEED_EVENTS: EventItem[] = [];

// ==============================================================================
// POST-EVENT COMPLETION & TIMESTAMPS
// ==============================================================================
export const getEventEndTimestamp = (event: EventItem): number => {
  const dateStr = event.date;
  let endHour = 23;
  let endMinute = 59;

  if (event.time_end) {
    const parts = event.time_end.split(':');
    if (parts.length >= 2) {
      endHour = parseInt(parts[0], 10) || 23;
      endMinute = parseInt(parts[1], 10) || 59;
    }
  } else if (event.time_start_end && event.time_start_end.includes('-')) {
    const endPart = event.time_start_end.split('-')[1]?.trim();
    if (endPart) {
      const match = endPart.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        endHour = parseInt(match[1], 10) || 23;
        endMinute = parseInt(match[2], 10) || 59;
      }
    }
  }

  const d = new Date(`${dateStr}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`);
  return isNaN(d.getTime()) ? new Date(dateStr).getTime() + (24 * 60 * 60 * 1000) : d.getTime();
};

export const isEventCompletedOrDone = (event: EventItem): boolean => {
  if (event.status === 'Completed') return true;
  return Date.now() >= getEventEndTimestamp(event);
};

/**
 * Evaluates whether an event remains active on the public discovery feeds.
 * Rules:
 * 1. If the user has FAVOURITED the event, it ALWAYS remains on their discovery board,
 *    even after 48 hours of it ending.
 * 2. If the user unfavourites it (or hasn't favourited it), it is removed from the discovery
 *    board after 48 hours (2 days) post-completion.
 */
export const isEventActive = (
  event: EventItem,
  favouriteEventIds: string[] = []
): boolean => {
  // If the user favourited this event, it ALWAYS remains on their discovery board!
  if (favouriteEventIds.includes(event.id)) {
    return true;
  }

  if (!event.date) return true;

  const endMs = getEventEndTimestamp(event);
  const twoDaysMs = 48 * 60 * 60 * 1000; // 48 hours (2 days) post-completion
  const expirationTimestamp = endMs + twoDaysMs;

  return Date.now() <= expirationTimestamp;
};

// ==============================================================================
// RATE LIMITING & EXEMPTIONS
// ==============================================================================
export const ADMIN_EXEMPT_EMAILS = [
  'tiyanashah21@gmail.com',
  'tiyana.shah@flame.edu.in',
];

export const isAdminModerator = (email?: string): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  if (normalized.includes('tiyana')) return true;
  return ADMIN_EXEMPT_EMAILS.some((admin) => admin.toLowerCase() === normalized);
};

export const isExemptFromEventPostRateLimit = (email?: string): boolean => {
  return isAdminModerator(email);
};

export const EVENT_POST_RATE_LIMIT = 2; // Maximum 2 events per hour for non-exempt accounts
export const EVENT_POST_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface EventPostRateLimitResult {
  allowed: boolean;
  count: number;
  minutesLeft: number;
  reason?: string;
  isExempt: boolean;
}

export const checkEventPostRateLimit = (
  userEmail: string | undefined,
  events: EventItem[] = []
): EventPostRateLimitResult => {
  if (!userEmail) {
    return { 
      allowed: false, 
      count: 0, 
      minutesLeft: 0, 
      reason: 'Please sign in with your FLAME email to post events.',
      isExempt: false 
    };
  }

  const normalizedEmail = userEmail.toLowerCase().trim();
  if (isExemptFromEventPostRateLimit(normalizedEmail)) {
    return { allowed: true, count: 0, minutesLeft: 0, isExempt: true };
  }

  const now = Date.now();
  const windowStart = now - EVENT_POST_WINDOW_MS;

  // 1. Gather timestamps from live events posted by this user
  const recentEvents = events.filter((e) => {
    if (!e.submitted_by) return false;
    if (e.submitted_by.toLowerCase().trim() !== normalizedEmail) return false;
    if (!e.created_at) return false;
    const createdMs = new Date(e.created_at).getTime();
    return !isNaN(createdMs) && createdMs > windowStart;
  });

  // 2. Gather timestamps from local audit storage
  let localTimestamps: number[] = [];
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`flame_fomo_post_history_${normalizedEmail}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localTimestamps = parsed.filter((t) => typeof t === 'number' && t > windowStart);
        }
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  // Combine unique timestamps
  const allTimestamps = Array.from(new Set([
    ...recentEvents.map((e) => new Date(e.created_at!).getTime()),
    ...localTimestamps,
  ])).sort((a, b) => a - b);

  const count = allTimestamps.length;

  if (count >= EVENT_POST_RATE_LIMIT) {
    const oldestInWindow = allTimestamps[0];
    const msLeft = (oldestInWindow + EVENT_POST_WINDOW_MS) - now;
    const minutesLeft = Math.max(1, Math.ceil(msLeft / (60 * 1000)));
    return {
      allowed: false,
      count,
      minutesLeft,
      reason: `Hourly posting limit reached: You can post up to 2 events per hour. Please wait ${minutesLeft} minute(s) before posting again.`,
      isExempt: false,
    };
  }

  return { allowed: true, count, minutesLeft: 0, isExempt: false };
};

// ==============================================================================
// POST-EVENT REVIEW ELIGIBILITY (2 DAYS POST-COMPLETION FOR "I'M GOING" ATTENDEES)
// ==============================================================================

export interface EventReviewEligibilityResult {
  isDone: boolean;
  isWithin48h: boolean;
  isUserGoing: boolean;
  canReview: boolean;
  reason?: string;
  hoursLeft?: number;
}

export const checkEventReviewEligibility = (
  event: EventItem,
  user: { flame_email?: string; going_events?: string[] } | null
): EventReviewEligibilityResult => {
  const isDone = isEventCompletedOrDone(event);
  const endMs = getEventEndTimestamp(event);
  const twoDaysMs = 48 * 60 * 60 * 1000;
  const now = Date.now();
  const isWithin48h = isDone && now <= endMs + twoDaysMs;
  const isUserGoing = Boolean(user && user.going_events && user.going_events.includes(event.id));

  const msLeft = (endMs + twoDaysMs) - now;
  const hoursLeft = Math.max(0, Math.ceil(msLeft / (60 * 60 * 1000)));

  if (!isDone) {
    return {
      isDone: false,
      isWithin48h: false,
      isUserGoing,
      canReview: false,
      reason: 'Reviews are only open after the event has taken place.',
      hoursLeft: 0,
    };
  }

  if (!isWithin48h) {
    return {
      isDone: true,
      isWithin48h: false,
      isUserGoing,
      canReview: false,
      reason: 'The 48-hour review window has closed. Reviews are accepted within 2 days of event completion.',
      hoursLeft: 0,
    };
  }

  if (!user || !user.flame_email) {
    return {
      isDone: true,
      isWithin48h: true,
      isUserGoing: false,
      canReview: false,
      reason: 'Please sign in with your FLAME email to verify your event attendance.',
      hoursLeft,
    };
  }

  if (!isUserGoing) {
    return {
      isDone: true,
      isWithin48h: true,
      isUserGoing: false,
      canReview: false,
      reason: "Verified attendees only: You can only review events you marked as \"I'm Going\".",
      hoursLeft,
    };
  }

  return {
    isDone: true,
    isWithin48h: true,
    isUserGoing: true,
    canReview: true,
    hoursLeft,
  };
};

/**
 * Calculates total saved count for an event, considering saved_users array,
 * direct saved_count field, and locally saved events.
 */
export const getEventSavedCount = (event: EventItem, savedEventIds: string[] = []): number => {
  const usersCount = Array.isArray(event.saved_users) ? event.saved_users.length : 0;
  const directCount = typeof event.saved_count === 'number' ? event.saved_count : 0;
  const count = Math.max(usersCount, directCount);
  if (savedEventIds.includes(event.id) && count === 0) return 1;
  return count;
};

/**
 * Calculates total going count for an event, considering going_users array,
 * direct going_count field, and locally marked going events.
 */
export const getEventGoingCount = (event: EventItem, goingEventIds: string[] = []): number => {
  const usersCount = Array.isArray(event.going_users) ? event.going_users.length : 0;
  const directCount = typeof event.going_count === 'number' ? event.going_count : 0;
  const count = Math.max(usersCount, directCount);
  if (goingEventIds.includes(event.id) && count === 0) return 1;
  return count;
};

/**
 * Calculates total favourite count for an event, considering favourite_users array,
 * direct favourite_count field, and locally marked favourite events.
 */
export const getEventFavouriteCount = (event: EventItem, favEventIds: string[] = []): number => {
  const usersCount = Array.isArray(event.favourite_users) ? event.favourite_users.length : 0;
  const directCount = typeof event.favourite_count === 'number' ? event.favourite_count : 0;
  const count = Math.max(usersCount, directCount);
  if (favEventIds.includes(event.id) && count === 0) return 1;
  return count;
};

