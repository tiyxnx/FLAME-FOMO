import { EventCategory, VenueZone } from '@/types';
import { EVENT_CATEGORIES, VENUE_ZONES, VENUE_LOCATIONS_MAP } from './constants';

export interface ParsedAnnouncement {
  eventName?: string;
  category?: EventCategory;
  date?: string; // YYYY-MM-DD
  timeStart?: string; // HH:MM
  timeEnd?: string; // HH:MM
  venueZone?: VenueZone;
  roomSpecific?: string;
  organizer?: string;
  description?: string;
  registrationDeadlineDate?: string; // YYYY-MM-DD
  registrationDeadlineTime?: string; // HH:MM
  registrationLink?: string;
  registrationFee?: string;
  requirementsEligibility?: string;
  isTentative?: boolean;
}

export interface ParseFieldStatus {
  label: string;
  value: string;
  success: boolean;
}

export interface ParseResult {
  data: ParsedAnnouncement;
  statuses: ParseFieldStatus[];
  filledCount: number;
}

// Clean messy rich-text email pastes (e.g. CSS declarations like p.p1 { ... })
export function cleanRawText(raw: string): string {
  let cleaned = raw
    // Strip CSS blocks
    .replace(/[a-z0-9_.]+\s*\{[^}]*\}/gi, ' ')
    // Strip HTML tags if any
    .replace(/<[^>]+>/g, ' ')
    // Normalize excess whitespace while preserving line breaks
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return cleaned;
}

export function parseAnnouncement(raw: string): ParseResult {
  const text = cleanRawText(raw);
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const lowerText = text.toLowerCase();

  const data: ParsedAnnouncement = {};
  const statuses: ParseFieldStatus[] = [];

  // ===========================================================================
  // 1. EXTRACT REGISTRATION LINK
  // ===========================================================================
  const urlMatches = text.match(/https?:\/\/[^\s<>"'()]+/gi);
  if (urlMatches && urlMatches.length > 0) {
    // Prioritize forms.gle or google forms or flame registration links
    const formUrl = urlMatches.find(
      (u) =>
        u.includes('forms.gle') ||
        u.includes('google.com/forms') ||
        u.includes('flameprogramoffice') ||
        u.includes('registration')
    ) || urlMatches[0];

    data.registrationLink = formUrl.replace(/[.,;!?]+$/, '');
  }

  // ===========================================================================
  // 2. EXTRACT ORGANIZER
  // ===========================================================================
  // e.g. "From: The Anime Club <theanimeclub@flame.edu.in>"
  const fromMatch = text.match(/From:\s*([^<\n]+)(?:<([^>]+)>)?/i);
  if (fromMatch && fromMatch[1]) {
    data.organizer = fromMatch[1].replace(/^(?:NAQAAB:|FLAME\s*)/i, '').trim();
  } else {
    // Check signature lines: "Regards,\nNAQAAB: FLAME Theatre Club"
    const regardsMatch = text.match(/Regards,?\s*\n+([^\n]+)/i);
    if (regardsMatch && regardsMatch[1]) {
      data.organizer = regardsMatch[1].trim();
    } else if (lowerText.includes('anime club') || lowerText.includes('anime arcadia')) {
      data.organizer = 'The Anime Club (Anime Arcadia)';
    } else if (lowerText.includes('naqaab') || lowerText.includes('theatre club')) {
      data.organizer = 'Naqaab Theatre Club';
    } else if (lowerText.includes('sports committee') || lowerText.includes('flame sports')) {
      data.organizer = 'FLAME Sports Committee';
    }
  }

  // ===========================================================================
  // 3. EXTRACT CATEGORY
  // ===========================================================================
  if (
    lowerText.includes('yoga') ||
    lowerText.includes('football') ||
    lowerText.includes('basketball') ||
    lowerText.includes('cricket') ||
    lowerText.includes('badminton') ||
    lowerText.includes('kurukshetra') ||
    lowerText.includes('sports') ||
    lowerText.includes('athletics') ||
    lowerText.includes('tournament') ||
    lowerText.includes('match')
  ) {
    data.category = 'Competition';
  } else if (
    lowerText.includes('theatre') ||
    lowerText.includes('drama') ||
    lowerText.includes('play') ||
    lowerText.includes('audition') ||
    lowerText.includes('auditions') ||
    lowerText.includes('performance') ||
    lowerText.includes('haunted house') ||
    lowerText.includes('concert') ||
    lowerText.includes('dance') ||
    lowerText.includes('music band')
  ) {
    data.category = 'Performances';
  } else if (
    lowerText.includes('stall') ||
    lowerText.includes('exhibition') ||
    lowerText.includes('artist alley') ||
    lowerText.includes('bunkasai') ||
    lowerText.includes('flea') ||
    lowerText.includes('kiosk') ||
    lowerText.includes('booth')
  ) {
    data.category = 'Exhibition/stall';
  } else if (
    lowerText.includes('masterclass') ||
    lowerText.includes('workshop') ||
    lowerText.includes('bootcamp') ||
    lowerText.includes('hands-on')
  ) {
    data.category = 'Workshop';
  } else if (
    lowerText.includes('competition') ||
    lowerText.includes('hackathon') ||
    lowerText.includes('contest') ||
    lowerText.includes('quiz') ||
    lowerText.includes('debate') ||
    lowerText.includes('tournament')
  ) {
    data.category = 'Competition';
  } else if (
    lowerText.includes('lecture') ||
    lowerText.includes('guest lecture') ||
    lowerText.includes('speaker') ||
    lowerText.includes('talk')
  ) {
    data.category = 'Lecture';
  } else if (
    lowerText.includes('welfare') ||
    lowerText.includes('community') ||
    lowerText.includes('charity') ||
    lowerText.includes('volunteer') ||
    lowerText.includes('donation')
  ) {
    data.category = 'Community welfare';
  } else if (
    lowerText.includes('symposium') ||
    lowerText.includes('colloquium') ||
    lowerText.includes('academic') ||
    lowerText.includes('seminar')
  ) {
    data.category = 'Academic';
  } else if (
    lowerText.includes('performance') ||
    lowerText.includes('music') ||
    lowerText.includes('concert') ||
    lowerText.includes('dance') ||
    lowerText.includes('acoustic') ||
    lowerText.includes('open mic')
  ) {
    data.category = 'Performances';
  } else {
    data.category = 'Workshop';
  }

  // ===========================================================================
  // 4. EXTRACT EVENT TITLE
  // ===========================================================================
  // Look for subject line, or all-caps lines, or bold headline lines
  const subjectMatch = text.match(/(?:Subject|Title|Event):\s*([^\n]+)/i);
  if (subjectMatch && subjectMatch[1]) {
    data.eventName = subjectMatch[1].trim();
  } else {
    // Look for lines that look like headlines (e.g. "KURUKSHETRA 2027", "A SUMMON FROM THE OTHER SIDE", "Bunkasai")
    const candidateLines = lines.filter((l) => {
      const lower = l.toLowerCase();
      if (lower.startsWith('from:') || lower.startsWith('to:') || lower.startsWith('inbox')) return false;
      if (lower.startsWith('date') || lower.startsWith('location') || lower.startsWith('price') || lower.startsWith('deadline')) return false;
      if (lower.startsWith('regards') || lower.startsWith('with love') || lower.startsWith('note:')) return false;
      if (l.length < 4 || l.length > 80) return false;
      return true;
    });

    if (candidateLines.length > 0) {
      // Pick first headline
      data.eventName = candidateLines[0].replace(/[|!]+$/, '').trim();
    }
  }

  // ===========================================================================
  // 5. EXTRACT DATE
  // ===========================================================================
  const months: Record<string, string> = {
    january: '01', jan: '01',
    february: '02', feb: '02',
    march: '03', mar: '03',
    april: '04', apr: '04',
    may: '05',
    june: '06', jun: '06',
    july: '07', jul: '07',
    august: '08', aug: '08',
    september: '09', sep: '09', sept: '09',
    october: '10', oct: '10',
    november: '11', nov: '11',
    december: '12', dec: '12',
  };

  // e.g. "23rd October", "Friday, 9th October 2026", "10th October"
  const dateRegex = /(?:(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{4}))?)|(?:(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?)/i;
  
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    let day = dateMatch[1] || dateMatch[5];
    let monthName = (dateMatch[2] || dateMatch[4] || '').toLowerCase();
    let year = dateMatch[3] || dateMatch[6] || '2026';

    if (day && monthName && months[monthName]) {
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = months[monthName];
      data.date = `${year}-${paddedMonth}-${paddedDay}`;
    }
  }

  // If no date found, check "tomorrow" or "today"
  if (!data.date) {
    if (lowerText.includes('today')) {
      data.date = '2026-10-07';
    } else if (lowerText.includes('tomorrow')) {
      data.date = '2026-10-08';
    }
  }

  // ===========================================================================
  // 6. EXTRACT TIME START & END
  // ===========================================================================
  // Helper to convert "6:00 pm" or "18:00" or "6 pm" to "18:00"
  function normalizeTime(tStr: string): string {
    const clean = tStr.trim().toLowerCase();
    const isPm = clean.includes('pm');
    const isAm = clean.includes('am');
    const parts = clean.replace(/[ap]m/g, '').trim().split(':');
    let hours = parseInt(parts[0], 10);
    let minutes = parts[1] ? parseInt(parts[1], 10) : 0;

    if (isNaN(hours)) return '17:00';

    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // e.g. "6:00 pm to 11:00 pm", "7:00 PM - 8:00 PM", "6:30 AM - 7:30 AM", "16:00 - 20:00"
  const timeRangeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to|–)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const timeMatch = text.match(timeRangeRegex);

  if (timeMatch) {
    data.timeStart = normalizeTime(timeMatch[1]);
    data.timeEnd = normalizeTime(timeMatch[2]);
  }

  // ===========================================================================
  // 7. EXTRACT VENUE (ZONE & SPECIFIC ROOM)
  // ===========================================================================
  // Check against FLAME campus venues
  if (lowerText.includes('plaza') || lowerText.includes('central courtyard')) {
    data.venueZone = 'Shantiniketan/Recreational';
    data.roomSpecific = 'FLAME Plaza - Central Courtyard';
  } else if (lowerText.includes('auditorium')) {
    data.venueZone = 'Shantiniketan/Recreational';
    data.roomSpecific = 'Auditorium - Main Stage & Hall';
  } else if (lowerText.includes('kund') || lowerText.includes('amphitheatre')) {
    data.venueZone = 'Shantiniketan/Recreational';
    data.roomSpecific = 'FLAME Kund - Amphitheatre Steps';
  } else if (lowerText.includes('football field') || lowerText.includes('football ground')) {
    data.venueZone = 'Sports';
    data.roomSpecific = 'Football Ground - Main Pitch';
  } else if (lowerText.includes('basketball court')) {
    data.venueZone = 'Sports';
    data.roomSpecific = 'Basketball Courts - Floodlit Main Court';
  } else if (lowerText.includes('badminton')) {
    data.venueZone = 'Sports';
    data.roomSpecific = 'Arjuna Centre for Sports - Indoor Badminton Arena';
  } else if (lowerText.includes('cricket')) {
    data.venueZone = 'Sports';
    data.roomSpecific = 'Cricket Ground - Main Pitch';
  } else if (lowerText.includes('arjuna')) {
    data.venueZone = 'Sports';
    data.roomSpecific = 'Arjuna Centre for Sports - Gymnasium & Fitness Suite';
  } else if (lowerText.includes('library') || lowerText.includes('vivekananda')) {
    data.venueZone = 'Academics';
    data.roomSpecific = 'Vivekananda Library - Main Reading Hall';
  } else if (lowerText.includes('kalidas')) {
    data.venueZone = 'Academics';
    data.roomSpecific = 'Kalidas Centre - Visual Arts Studio';
  } else if (lowerText.includes('chanakya')) {
    data.venueZone = 'Academics';
    data.roomSpecific = 'Chanakya - Hall 1';
  } else if (lowerText.includes('coffee nation')) {
    data.venueZone = 'Eateries';
    data.roomSpecific = 'Coffee Nation - Outdoor Patio';
  } else if (lowerText.includes('blue tokai')) {
    data.venueZone = 'Eateries';
    data.roomSpecific = 'Blue Tokai Cafe - Mezzanine Lounge';
  } else if (lowerText.includes('aahar')) {
    data.venueZone = 'Eateries';
    data.roomSpecific = 'Aahar - Main Dining Hall';
  }

  // ===========================================================================
  // 8. EXTRACT REGISTRATION FEE
  // ===========================================================================
  // e.g. "Price : Rs. 3540/-", "Pre-registration: ₹200", "₹300", "No fees required", "Free"
  if (lowerText.includes('no business registration nor fees required') || lowerText.includes('no fees required') || lowerText.includes('free entry') || lowerText.includes('free')) {
    data.registrationFee = 'Free';
  }
  
  const feeRegex = /(?:Price|Fee|Cost|Pre-registration|Registration)\s*[:=-]?\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\/-)?)/i;
  const feeMatch = text.match(feeRegex);
  if (feeMatch && feeMatch[1]) {
    data.registrationFee = `₹${feeMatch[1].replace('/-', '').trim()}`;
  } else {
    const symbolFeeMatch = text.match(/(?:₹|Rs\.?)\s*([\d,]+)/i);
    if (symbolFeeMatch && symbolFeeMatch[1]) {
      data.registrationFee = `₹${symbolFeeMatch[1].trim()}`;
    }
  }

  // ===========================================================================
  // 9. EXTRACT REGISTRATION DEADLINE
  // ===========================================================================
  // e.g. "Last Day to Register : SUNDAY, 11th October, 11:59 pm"
  // "Deadline: 9th October, 12:00 PM"
  // "Registration closes TODAY, 7th October at 11:59 PM"
  const deadlineRegex = /(?:Last Day to Register|Deadline|Registration closes|Closes)\s*[:\-]?\s*([^\n\r.]+)/i;
  const deadlineMatch = text.match(deadlineRegex);

  if (deadlineMatch && deadlineMatch[1]) {
    const dSnippet = deadlineMatch[1].trim();
    // Try to extract date from the snippet
    const dDateMatch = dSnippet.match(dateRegex);
    if (dDateMatch) {
      let dDay = dDateMatch[1] || dDateMatch[5];
      let dMonth = (dDateMatch[2] || dDateMatch[4] || '').toLowerCase();
      let dYear = dDateMatch[3] || dDateMatch[6] || '2026';
      if (dDay && dMonth && months[dMonth]) {
        data.registrationDeadlineDate = `${dYear}-${months[dMonth]}-${dDay.padStart(2, '0')}`;
      }
    } else if (dSnippet.toLowerCase().includes('today')) {
      data.registrationDeadlineDate = '2026-10-07';
    }

    // Try to extract time from deadline snippet
    const dTimeMatch = dSnippet.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (dTimeMatch) {
      data.registrationDeadlineTime = normalizeTime(dTimeMatch[1]);
    } else {
      data.registrationDeadlineTime = '23:59';
    }
  }

  // ===========================================================================
  // 10. EXTRACT REQUIREMENTS / ELIGIBILITY
  // ===========================================================================
  const reqMatch = text.match(/(?:Requirements?|Eligibility|Keep in mind that|Mandatory|Attendance Boost)\s*[:\-]?\s*([^\n\r.]+)/i);
  if (reqMatch && reqMatch[1]) {
    data.requirementsEligibility = reqMatch[1].trim();
  } else if (lowerText.includes('open to all')) {
    data.requirementsEligibility = 'Open to All Students';
  } else if (lowerText.includes('freshers')) {
    data.requirementsEligibility = 'Open to Freshers & Returning Students';
  }

  // ===========================================================================
  // 11. DESCRIPTION
  // ===========================================================================
  // Store the cleaned text as the description
  data.description = text;

  // ===========================================================================
  // 12. COMPILE STATUS AND RESULTS
  // ===========================================================================
  let count = 0;

  // Title
  if (data.eventName) {
    count++;
    statuses.push({ label: 'Event Title', value: data.eventName, success: true });
  } else {
    statuses.push({ label: 'Event Title', value: 'Empty (Please enter title)', success: false });
  }

  // Category
  if (data.category) {
    count++;
    statuses.push({ label: 'Category', value: data.category, success: true });
  } else {
    statuses.push({ label: 'Category', value: 'Defaults to Clubs', success: true });
  }

  // Date
  if (data.date) {
    count++;
    statuses.push({ label: 'Date', value: data.date, success: true });
  } else {
    statuses.push({ label: 'Date', value: 'Empty (Please pick a date)', success: false });
  }

  // Time
  if (data.timeStart && data.timeEnd) {
    count++;
    statuses.push({ label: 'Time', value: `${data.timeStart} - ${data.timeEnd}`, success: true });
  } else {
    statuses.push({ label: 'Time', value: 'Defaults to 17:00 - 18:30', success: false });
  }

  // Location / Venue
  if (data.venueZone && data.roomSpecific) {
    count++;
    statuses.push({ label: 'Location', value: `${data.venueZone} (${data.roomSpecific})`, success: true });
  } else {
    statuses.push({ label: 'Location', value: 'Empty / Not detected (Please select from dropdown)', success: false });
  }

  // Organizer
  if (data.organizer) {
    count++;
    statuses.push({ label: 'Organizer', value: data.organizer, success: true });
  } else {
    statuses.push({ label: 'Organizer', value: 'Empty (Enter club/student org)', success: false });
  }

  // Registration Fee
  if (data.registrationFee) {
    count++;
    statuses.push({ label: 'Fee', value: data.registrationFee, success: true });
  } else {
    statuses.push({ label: 'Fee', value: 'Optional (None detected)', success: true });
  }

  // Registration Link
  if (data.registrationLink) {
    count++;
    statuses.push({ label: 'Reg Link', value: data.registrationLink, success: true });
  } else {
    statuses.push({ label: 'Reg Link', value: 'None detected (Optional)', success: true });
  }

  // Registration Deadline
  if (data.registrationDeadlineDate) {
    count++;
    statuses.push({
      label: 'Deadline',
      value: `${data.registrationDeadlineDate} ${data.registrationDeadlineTime || '23:59'}`,
      success: true,
    });
  }

  // Image is always empty from text paste as requested by user
  statuses.push({
    label: 'Poster Image',
    value: 'Empty (Generate with AI or upload below)',
    success: false,
  });

  return {
    data,
    statuses,
    filledCount: count,
  };
}
