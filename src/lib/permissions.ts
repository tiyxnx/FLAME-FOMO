import { EventItem } from '@/types';

// ==============================================================================
// 1. ADMIN ACCOUNTS (All permissions on the website)
// ==============================================================================
export const ADMIN_EMAILS: string[] = [
  'studentcouncil@flame.edu.in',
  'sportscommittee@flame.edu.in',
  'culturalcommittee@flame.edu.in',
  // Developer & platform owners
  'tiyana.shah@flame.edu.in',
  'tiyanashah21@gmail.com',
];

export const ADMIN_ORGANIZERS: Record<string, string> = {
  'studentcouncil@flame.edu.in': 'Student Council',
  'sportscommittee@flame.edu.in': 'Sports Committee',
  'culturalcommittee@flame.edu.in': 'Cultural Committee',
  'tiyana.shah@flame.edu.in': 'FLAME Admin & Moderator',
  'tiyanashah21@gmail.com': 'FLAME Platform Admin',
};

// ==============================================================================
// 2. VERIFIED CLUBS & COMMITTEES (Can add events, see feedback on their events, edit/delete their events)
// ==============================================================================
export const CLUB_ORGANIZERS: Record<string, string> = {
  // Cultural, Academic & Interest Clubs
  'danceclub@flame.edu.in': 'FLAME Dance Club',
  'fpc@flame.edu.in': 'FLAME Photography Club',
  'communityserviceclub@flame.edu.in': 'FLAME Community Service Club',
  'ellipsisclub@flame.edu.in': 'The Ellipsis: FLAME Writing & Oratory Club',
  'thecollective@flame.edu.in': 'The Queer Collective',
  'musicclub@flame.edu.in': 'FLAME Music Club',
  'environment.club@flame.edu.in': 'FLAME Environment Club',
  'fashionclub@flame.edu.in': 'FLAME Fashion Club',
  'philosophyclub@flame.edu.in': 'FLAME Philosophy Club',
  'artclub@flame.edu.in': 'FLAME Art Club',
  'astronomyclub@flame.edu.in': 'FLAME Astronomy Club',
  'munclub@flame.edu.in': 'FLAME MUN Club',
  'reading.initiative@flame.edu.in': 'The Reading Initiative',
  'flame.onboard@flame.edu.in': 'FLAME On Board',
  'naqaab.theatreclub@flame.edu.in': 'NAQAAB: FLAME Theatre Club',
  'economicsclub@flame.edu.in': 'FLAME Economics Club',
  'tsp@flame.edu.in': 'The Story Project',
  'fel@flame.edu.in': 'FLAME Entrepreneurship Lab',
  'comedyclub@flame.edu.in': 'FLAME University Comedy Club',
  'travelclub@flame.edu.in': 'FLAME Travel Club',
  'theroundtable@flame.edu.in': 'The Round Table: FLAME Networking Club',
  'thedebatesociety@flame.edu.in': 'FLAME Debate Society',
  'dotslash@flame.edu.in': 'Dotslash FLAME',
  'filmclub@flame.edu.in': 'The Front Row: FLAME Film Club',
  'collectivecooking@flame.edu.in': 'FLAME Cooking Collective',
  'markit.club@flame.edu.in': 'MARKiT: FLAME Marketing Club',
  'thepsychologyclub@flame.edu.in': 'The FLAME Psychology Club',
  'yearbook@flame.edu.in': 'FLAME Yearbook Committee',
  'animalwelfare@flame.edu.in': 'Animal Welfare Committee',
  'projectimpactclub@flame.edu.in': 'Project Impact',
  'sociologyclub@flame.edu.in': 'FLAME Sociology Club',
  'celc@flame.edu.in': 'FLAME Constitution & Electoral Literacy Club (CELC)',
  'flameitihaasclub@flame.edu.in': 'FLAME Itihaas Club',
  'theanimeclub@flame.edu.in': 'Anime Arcadia: FLAME Anime Club',
  'business.consultingclub@flame.edu.in': 'FLAME Business & Consulting Club',
  'forallx.mathclub@flame.edu.in': 'For All X: FLAME Math Club',
  'mann.wellbeingclub@flame.edu.in': 'MANN: FLAME Wellbeing Club',
  'flame.youthparliament@flame.edu.in': 'FLAME Youth Parliament',
  'ffic@flame.edu.in': 'FLAME Finance & Investment club',
  'glitch.designclub@flame.edu.in': 'Glitch: The Design Collective',
  'kurukshetra@flame.edu.in': 'FLAME Kurukshetra',
  'flamefest@flame.edu.in': 'FLAME Fest',
  'firstcut@flame.edu.in': 'FLAME FirstCut',
  'tedxflameuniversity@flame.edu.in': 'TEDxFLAME University',

  // Sports & Recreation Clubs
  'badmintonclub@flame.edu.in': 'Badminton Club',
  'basketballclub@flame.edu.in': 'Basketball Club',
  'billiardclub@flame.edu.in': 'Billiard Club',
  'chessclub@flame.edu.in': 'Chess Club',
  'cricketclub@flame.edu.in': 'Cricket Club',
  'esportsclub@flame.edu.in': 'E-Sports Club',
  'fitnessclub@flame.edu.in': 'Fitness Club',
  'footballclub@flame.edu.in': 'Football Club',
  'frisbeeclub@flame.edu.in': 'Frisbee Club',
  'handballclub@flame.edu.in': 'Handball Club',
  'padelclub@flame.edu.in': 'Padel Club',
  'pickleballclub@flame.edu.in': 'Pickleball Club',
  'runclub@flame.edu.in': 'Run Club',
  'squashclub@flame.edu.in': 'Squash Club',
  'swimmingclub@flame.edu.in': 'Swimming Club',
  'tabletennisclub@flame.edu.in': 'Table Tennis Club',
  'tennisclub@flame.edu.in': 'Tennis Club',
  'trekkingclub@flame.edu.in': 'Trekking Club',
  'volleyballclub@flame.edu.in': 'Volleyball Club',
  'yogaclub@flame.edu.in': 'Yoga Club',
  'zumbaclub@flame.edu.in': 'Zumba Club',
};

export type UserRole = 'admin' | 'club' | 'student';

export function normalizeEmail(email?: string): string {
  return (email || '').toLowerCase().trim();
}

/**
 * Determine role from signed in email address:
 * - 'admin': Student Council, Sports/Cultural Committees, Platform Admins
 * - 'club': Official verified FLAME clubs & fest accounts
 * - 'student': Everyone else (Normal student sign in)
 */
export function getUserRole(email?: string): UserRole {
  if (!email) return 'student';
  const clean = normalizeEmail(email);
  if (ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean)) {
    return 'admin';
  }
  if (clean in CLUB_ORGANIZERS) {
    return 'club';
  }
  return 'student';
}

/**
 * Check if user is an Administrator
 */
export function isUserAdmin(email?: string): boolean {
  return getUserRole(email) === 'admin';
}

/**
 * Check if user is a Club / Committee organizer
 */
export function isUserClubOrganizer(email?: string): boolean {
  return getUserRole(email) === 'club';
}

/**
 * Permission to add/post events and applications:
 * Allowed ONLY for:
 * - Admin
 * - Clubs and committees
 * Strictly DENIED for normal students.
 */
export function canUserCreateEvents(email?: string): boolean {
  const role = getUserRole(email);
  return role === 'admin' || role === 'club';
}

/**
 * Permission to edit an event:
 * - Admins can edit ANY event.
 * - Clubs can edit events they've added or that belong to their club.
 * - Normal students CANNOT edit any events.
 */
export function canUserEditEvent(
  email: string | undefined, 
  event: EventItem, 
  isLocallyCreated = false
): boolean {
  if (!email) return false;
  const role = getUserRole(email);
  if (role === 'admin') return true;
  
  if (role === 'club') {
    const clean = normalizeEmail(email);
    const author = normalizeEmail(event.submitted_by);
    if (author === clean || isLocallyCreated) return true;

    // Check if event organizer string matches the club name
    const clubName = (CLUB_ORGANIZERS[clean] || '').toLowerCase();
    const eventOrg = (event.organizer || '').toLowerCase();
    if (clubName && (eventOrg.includes(clubName) || clubName.includes(eventOrg))) {
      return true;
    }
  }

  // Normal students have no edit permissions
  return false;
}

/**
 * Permission to delete an event:
 * - Admins can delete ANY event.
 * - Clubs can delete events they've added or that belong to their club.
 * - Normal students CANNOT delete any events.
 */
export function canUserDeleteEvent(
  email: string | undefined, 
  event: EventItem, 
  isLocallyCreated = false
): boolean {
  return canUserEditEvent(email, event, isLocallyCreated);
}

/**
 * Permission to view feedback / reviews on an event:
 * - Admins can see all feedback on the website.
 * - Clubs can see feedback on the events they've added.
 * - Normal students can only submit feedback for events they attended (personal viewing only).
 */
export function canUserViewEventFeedback(email: string | undefined, event: EventItem): boolean {
  if (!email) return false;
  const role = getUserRole(email);
  if (role === 'admin') return true;
  if (role === 'club') {
    return canUserEditEvent(email, event);
  }
  return false;
}

/**
 * Look up official club / committee display name from club email
 */
export function getClubNameForEmail(email?: string): string | undefined {
  if (!email) return undefined;
  return CLUB_ORGANIZERS[normalizeEmail(email)];
}

/**
 * Get official default organizer display name for either Admin or Club
 */
export function getOrganizerDefaultName(email?: string): string | undefined {
  if (!email) return undefined;
  const clean = normalizeEmail(email);
  return ADMIN_ORGANIZERS[clean] || CLUB_ORGANIZERS[clean] || undefined;
}
