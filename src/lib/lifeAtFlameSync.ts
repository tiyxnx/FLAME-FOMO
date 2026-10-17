import { EventItem, EventCategory, VenueZone } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const LIFE_AT_FLAME_CALENDAR_API = 
  'https://script.google.com/macros/s/AKfycbyCGts22TVBODW4a-_QUQhItqhlXlvluQwuRUaM52wpMc9aQ3X7ZMRj0LQRDsatP8I/exec';

const LIFE_AT_FLAME_JOIN_CLUBS_URL = 
  'https://sites.google.com/flame.edu.in/lifeatflame/culturals-2025-26/join-clubs';

const LIFE_AT_FLAME_FLAGSHIP_URL = 
  'https://sites.google.com/flame.edu.in/lifeatflame/flagship-events';

// Map club / event names to best matching campus venue zone
function detectVenueZone(venueName?: string, clubName?: string): VenueZone {
  const v = (venueName || '').toLowerCase();
  const c = (clubName || '').toLowerCase();

  if (v.includes('arjuna') || v.includes('pool') || v.includes('court') || v.includes('pitch') || v.includes('turf') || v.includes('track') || v.includes('gym') || c.includes('sports') || c.includes('badminton') || c.includes('swimming') || c.includes('football') || c.includes('cricket') || c.includes('frisbee') || c.includes('volleyball') || c.includes('basketball') || c.includes('tennis') || c.includes('table tennis') || c.includes('run')) {
    return 'Sports';
  }
  if (v.includes('aahar') || v.includes('cafe') || v.includes('rasoi') || v.includes('tokai') || v.includes('hashtag') || v.includes('eateries')) {
    return 'Eateries';
  }
  if (v.includes('garden') || v.includes('butterfly') || v.includes('nakshatra') || v.includes('lake') || v.includes('flora')) {
    return 'Flora & Fauna';
  }
  if (v.includes('kund') || v.includes('amphi') || v.includes('plaza') || v.includes('lounge') || v.includes('auditorium') || c.includes('dance') || c.includes('music') || c.includes('theatre')) {
    return 'Shantiniketan/Recreational';
  }
  return 'Academics';
}

// Map club to standard category
function mapClubCategory(clubName: string): EventCategory {
  const c = clubName.toLowerCase();
  if (c.includes('service') || c.includes('impact') || c.includes('welfare') || c.includes('wellbeing') || c.includes('animal') || c.includes('mann')) {
    return 'Community welfare';
  }
  if (c.includes('dance') || c.includes('music') || c.includes('theatre') || c.includes('comedy') || c.includes('naqaab')) {
    return 'Performances';
  }
  if (c.includes('debate') || c.includes('mun') || c.includes('parliament') || c.includes('math') || c.includes('economics') || c.includes('psychology') || c.includes('sociology') || c.includes('philosophy') || c.includes('constitution') || c.includes('itihaas')) {
    return 'Academic';
  }
  if (c.includes('sports') || c.includes('badminton') || c.includes('swimming') || c.includes('frisbee') || c.includes('football') || c.includes('cricket') || c.includes('chess') || c.includes('clash') || c.includes('championship')) {
    return 'Competition';
  }
  if (c.includes('photography') || c.includes('art') || c.includes('fashion') || c.includes('design') || c.includes('glitch') || c.includes('exhibition')) {
    return 'Exhibition/stall';
  }
  return 'Workshop';
}

// Helper to safely fetch text with redirect support
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (LifeAtFLAME Sync; FLAME FOMO Campus Intelligence)',
        'Accept': 'text/html,application/json,*/*'
      },
      next: { revalidate: 300 } // Next.js cache 5 mins
    });
    clearTimeout(id);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return await res.text();
  } catch (err: any) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * 1. Life@FLAME Google Apps Script Sports & Campus Calendar
 * Life at FLAME is only informational and official registration links are not out.
 * Per specification: Do NOT use Life@FLAME for events.
 */
export async function fetchLifeAtFlameCalendarEvents(): Promise<EventItem[]> {
  // Disabled: Life@FLAME is informational only, not for official event registration
  return [];
}

/**
 * 2. Fetch live club recruitment applications from Life@FLAME
 * Only active, currently open applications submitted by clubs with verified forms will surface.
 */
export async function fetchLifeAtFlameClubApplications(): Promise<EventItem[]> {
  // General beginning-of-semester recruitment drives have closed.
  // Active applications submitted with live forms are handled via verified application entries.
  return [];
}

/**
 * 3. Flagship Campus Fests (Kurukshetra, FLAME Fest, Blaze, etc.)
 * Life at FLAME is purely informational for flagship events; official registration links
 * are not released yet.
 * Per specification: Do NOT use Life@FLAME for events.
 */
export async function fetchLifeAtFlameFlagshipEvents(): Promise<EventItem[]> {
  // Disabled: Flagship events on Life@FLAME are informational only (no official registration links yet)
  return [];
}

/**
 * 4. Master Sync Function:
 * Fetches all live items from Life@FLAME, merges them, and upserts to Supabase if configured.
 */
export async function syncLifeAtFlameAll(): Promise<{
  success: boolean;
  totalSynced: number;
  eventsCount: number;
  applicationsCount: number;
  items: EventItem[];
  error?: string;
}> {
  return {
    success: false,
    totalSynced: 0,
    eventsCount: 0,
    applicationsCount: 0,
    items: [],
    error: 'Life@FLAME sync has been disabled',
  };
}
