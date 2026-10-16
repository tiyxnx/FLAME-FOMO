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
 * 1. Fetch live events from Life@FLAME Google Apps Script Sports & Campus Calendar
 */
export async function fetchLifeAtFlameCalendarEvents(): Promise<EventItem[]> {
  try {
    const raw = await fetchWithTimeout(LIFE_AT_FLAME_CALENDAR_API);
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    const events: EventItem[] = data.map((item: any, idx: number) => {
      const title = (item.title || 'Campus Event').trim();
      const club = (item.club || 'FLAME Sports Department').trim();
      const venue = (item.venue || 'Arjuna Sports Complex').trim();
      const rawDate = item.date ? item.date.split('T')[0] : '2026-10-25';
      const timeStart = item.start ? String(item.start).trim() : '17:00';
      const timeEnd = item.end ? String(item.end).trim() : '19:00';
      const timeStr = `${timeStart} - ${timeEnd}`;

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
      const id = `lifeatflame-sports-${slug}-${rawDate}`;

      const category = mapClubCategory(club);
      const venueZone = detectVenueZone(venue, club);

      return {
        id,
        item_type: 'event' as const,
        event_name: title,
        category,
        categories: [category, 'Competition'],
        date: rawDate,
        time_start_end: timeStr,
        time_start: timeStart,
        time_end: timeEnd,
        venue_zone: venueZone,
        room_specific: venue,
        organizer: club,
        description: `Official campus fixture organised by ${club} at ${venue}. Listed on the Life@FLAME Campus Portal.`,
        registration_deadline: `${rawDate} ${timeStart}`,
        registration_link: 'https://sites.google.com/flame.edu.in/lifeatflame/sports-2025-26/calendar',
        requirements_eligibility: 'Open to All [SOURCE: Life@FLAME Portal]',
        status: 'Upcoming' as const,
        submitted_by: 'lifeatflame@flame.edu.in',
        event_image: 'https://lh3.googleusercontent.com/d/1N5RxUBQBv1N1fB3o2moX407xP5ZZNYGO',
        created_at: new Date().toISOString()
      };
    });

    return events;
  } catch (err) {
    console.warn('[LifeAtFlameSync] Failed to fetch calendar API:', err);
    return [];
  }
}

/**
 * 2. Fetch live club recruitment applications from Life@FLAME Join Clubs page
 */
export async function fetchLifeAtFlameClubApplications(): Promise<EventItem[]> {
  try {
    const rawHtml = await fetchWithTimeout(LIFE_AT_FLAME_JOIN_CLUBS_URL);
    const unescaped = rawHtml
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    // Match each club card: <a href="FORM_URL" ... class="club-card"> ... <img src="LOGO"> ... <div class="club-name">NAME</div>
    const cardRegex = /<a[^>]+href="([^"]+)"[^>]*class="club-card"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    const applications: EventItem[] = [];

    // Fallback regex if class ordering differs
    const altRegex = /<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<div class="club-name">([^<]+)<\/div>[\s\S]*?<\/a>/gi;

    let matches = [...unescaped.matchAll(cardRegex)];
    if (matches.length === 0) {
      matches = [...unescaped.matchAll(altRegex)];
    }

    // Default upcoming recruitment deadline (rolling / semester onboarding)
    const defaultDeadline = '2026-10-31 23:59';
    const defaultDate = '2026-10-31';

    for (const match of matches) {
      const formUrl = match[1].trim();
      const body = match[2];

      // Extract club name
      const nameMatch = body.match(/class="club-name">([^<]+)<\/div>/i);
      const clubName = nameMatch ? nameMatch[1].trim() : (typeof match[2] === 'string' && !match[2].includes('<') ? match[2].trim() : '');
      if (!clubName || clubName.length < 3) continue;

      // Extract logo image if present
      const imgMatch = body.match(/src="([^"]+)"/i);
      const logoUrl = imgMatch ? imgMatch[1].trim() : undefined;

      // If formUrl is not external (e.g. redirected internal page), ensure full url
      let finalFormUrl = formUrl;
      if (finalFormUrl.startsWith('/')) {
        finalFormUrl = `https://sites.google.com${finalFormUrl}`;
      }

      const slug = clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35);
      const id = `lifeatflame-app-${slug}`;
      const category = mapClubCategory(clubName);

      // Determine interview requirement
      const hasInterview = [
        'dance', 'theatre', 'naqaab', 'music', 'debate', 'mun', 'round table', 
        'entrepreneurship', 'markit', 'design', 'glitch'
      ].some(k => clubName.toLowerCase().includes(k));

      applications.push({
        id,
        item_type: 'application' as const,
        event_name: `${clubName}: Member Recruitment & Auditions`,
        category,
        categories: [category, 'Academic'],
        date: defaultDate,
        time_start_end: 'Rolling Applications & Review',
        time_start: '10:00',
        time_end: '18:00',
        venue_zone: 'Academics',
        room_specific: 'Kalidas & APJ Abdul Kalam Studios / Online',
        organizer: clubName,
        description: `Official student member recruitment drive for ${clubName}. Apply now to join active project teams, plan flagship initiatives, and represent FLAME. Published on the Life@FLAME Cultural Portal. Guidelines recommend applying to 3-4 clubs max.`,
        registration_deadline: defaultDeadline,
        registration_link: finalFormUrl,
        requirements_eligibility: `Open to UG & PG Students [SOURCE: Life@FLAME] [TYPE: application]${hasInterview ? ' [HAS_INTERVIEW]' : ''}`,
        has_interview: hasInterview,
        interview_details: hasInterview 
          ? 'Shortlisted candidates will be contacted via email/WhatsApp for auditions or personal interviews.' 
          : undefined,
        status: 'Upcoming' as const,
        submitted_by: 'lifeatflame@flame.edu.in',
        event_image: logoUrl,
        created_at: new Date().toISOString()
      });
    }

    return applications;
  } catch (err) {
    console.warn('[LifeAtFlameSync] Failed to fetch join-clubs page:', err);
    return [];
  }
}

/**
 * 3. Fetch Flagship Campus Fests (Kurukshetra, FLAME Fest, Blaze, etc.)
 */
export async function fetchLifeAtFlameFlagshipEvents(): Promise<EventItem[]> {
  try {
    const rawHtml = await fetchWithTimeout(LIFE_AT_FLAME_FLAGSHIP_URL);
    const unescaped = rawHtml
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const regex = /<a[^>]+href="([^"]+)"[^>]*class="event-card"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    const flagshipEvents: EventItem[] = [];

    const matches = [...unescaped.matchAll(regex)];
    for (const match of matches) {
      const link = match[1].trim();
      const body = match[2];
      const titleM = body.match(/class="event-title">([^<]+)<\/div>/i);
      const imgM = body.match(/src="([^"]+)"/i);

      const title = titleM ? titleM[1].trim() : 'Flagship Fest';
      const img = imgM ? imgM[1].trim() : undefined;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35);
      const id = `lifeatflame-fest-${slug}`;

      flagshipEvents.push({
        id,
        item_type: 'event' as const,
        event_name: title,
        category: 'Performances' as const,
        categories: ['Performances', 'Competition'],
        date: '2026-11-15',
        time_start_end: 'All Day Flagship Event',
        time_start: '09:00',
        time_end: '22:00',
        venue_zone: 'Shantiniketan/Recreational',
        room_specific: 'FLAME Campus & Amphitheatre',
        organizer: 'FLAME Student Council & Cultural Committee',
        description: `${title} is one of FLAME University's premier annual flagship events, bringing together students, artists, and competitors from across the country. Check the official Life@FLAME page for sub-event schedules and passes.`,
        registration_deadline: '2026-11-10 23:59',
        registration_link: link.startsWith('/') ? `https://sites.google.com${link}` : link,
        requirements_eligibility: 'Open to All Students [SOURCE: Life@FLAME]',
        status: 'Upcoming' as const,
        submitted_by: 'lifeatflame@flame.edu.in',
        event_image: img,
        created_at: new Date().toISOString()
      });
    }

    return flagshipEvents;
  } catch (err) {
    console.warn('[LifeAtFlameSync] Failed to fetch flagship events:', err);
    return [];
  }
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
  try {
    const [calEvents, clubApps, flagships] = await Promise.all([
      fetchLifeAtFlameCalendarEvents(),
      fetchLifeAtFlameClubApplications(),
      fetchLifeAtFlameFlagshipEvents(),
    ]);

    const allItems: EventItem[] = [...calEvents, ...flagships, ...clubApps];

    // If Supabase is configured, upsert each item into Supabase events table
    if (isSupabaseConfigured() && allItems.length > 0) {
      try {
        const records = allItems.map((item) => ({
          id: item.id,
          event_name: item.event_name,
          category: item.category,
          date: item.date,
          time_start_end: item.time_start_end,
          time_start: item.time_start || null,
          time_end: item.time_end || null,
          venue_zone: item.venue_zone,
          room_specific: item.room_specific || null,
          organizer: item.organizer,
          description: item.description,
          registration_deadline: item.registration_deadline || null,
          registration_link: item.registration_link || null,
          requirements_eligibility: item.requirements_eligibility || null,
          event_image: item.event_image || null,
          status: item.status,
          submitted_by: item.submitted_by || 'lifeatflame-sync',
          poc_name: item.poc_name || null,
          poc_number: item.poc_number || null,
        }));

        const { error } = await supabase
          .from('events')
          .upsert(records, { onConflict: 'id' });

        if (error) {
          console.warn('[LifeAtFlameSync] Supabase upsert error (continuing with client sync):', error.message);
        }
      } catch (dbErr: any) {
        console.warn('[LifeAtFlameSync] Supabase write failed:', dbErr.message);
      }
    }

    const eventsCount = calEvents.length + flagships.length;
    const applicationsCount = clubApps.length;

    return {
      success: true,
      totalSynced: allItems.length,
      eventsCount,
      applicationsCount,
      items: allItems,
    };
  } catch (err: any) {
    return {
      success: false,
      totalSynced: 0,
      eventsCount: 0,
      applicationsCount: 0,
      items: [],
      error: err.message || 'Unknown sync error',
    };
  }
}
