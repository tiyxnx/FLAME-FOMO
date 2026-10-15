import { EventItem, ClassScheduleItem } from '@/types';

/**
 * Parses time string (e.g., "17:00 - 18:30", "7:00 PM - 9:00 PM", "18:00")
 * and date string ("YYYY-MM-DD") into UTC Date objects assuming Indian Standard Time (IST = UTC+5:30).
 */
export function parseEventDateTimeRange(dateStr: string, timeRangeStr?: string): { start: Date; end: Date } {
  // Default date
  const [year, month, day] = (dateStr || '').split('-').map(Number);
  
  const parseHourMinute = (str: string): { hour: number; minute: number } => {
    const clean = str.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const numericPart = clean.replace(/[^\d:]/g, '');
    const parts = numericPart.split(':');
    let hour = parseInt(parts[0], 10) || 0;
    const minute = parseInt(parts[1], 10) || 0;

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    return { hour, minute };
  };

  let startHour = 10;
  let startMinute = 0;
  let endHour = 11;
  let endMinute = 0;

  if (timeRangeStr) {
    const parts = timeRangeStr.split(/[-–—to]/i);
    if (parts.length >= 2) {
      const s = parseHourMinute(parts[0]);
      const e = parseHourMinute(parts[1]);
      startHour = s.hour;
      startMinute = s.minute;
      endHour = e.hour;
      endMinute = e.minute;
    } else if (parts.length === 1 && parts[0].trim()) {
      const s = parseHourMinute(parts[0]);
      startHour = s.hour;
      startMinute = s.minute;
      endHour = (startHour + 1) % 24;
      endMinute = startMinute;
    }
  }

  // Construct Dates in IST (UTC+05:30)
  // Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30))
  const y = year || new Date().getFullYear();
  const m = (month || 1) - 1;
  const d = day || 1;

  // IST is UTC + 5h 30m. To get UTC: subtract 5 hours 30 mins
  const startUtc = new Date(Date.UTC(y, m, d, startHour, startMinute) - (5.5 * 60 * 60 * 1000));
  const endUtc = new Date(Date.UTC(y, m, d, endHour, endMinute) - (5.5 * 60 * 60 * 1000));

  return { start: startUtc, end: endUtc };
}

/**
 * Format a Date object to Google Calendar UTC ISO string: YYYYMMDDTHHmmssZ
 */
export function formatToGoogleUtcIso(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate a 1-click "Add to Google Calendar" URL for an event
 */
export function getGoogleCalendarUrl(event: EventItem): string {
  const { start, end } = parseEventDateTimeRange(event.date, event.time_start_end);
  const startStr = formatToGoogleUtcIso(start);
  const endStr = formatToGoogleUtcIso(end);

  const title = encodeURIComponent(event.event_name);
  const dates = `${startStr}/${endStr}`;
  
  const venue = `${event.venue_zone}${event.room_specific ? ', ' + event.room_specific : ''}, FLAME University, Pune`;
  const location = encodeURIComponent(venue);

  const detailsText = [
    event.description || '',
    '',
    `Organizer: ${event.organizer || 'FLAME University'}`,
    event.registration_link ? `Registration / RSVP: ${event.registration_link}` : '',
    event.requirements_eligibility ? `Eligibility: ${event.requirements_eligibility}` : '',
    '',
    'Added via FLAME FOMO Campus Planner (https://flamefomo-jade.vercel.app)'
  ].filter(Boolean).join('\n');

  const details = encodeURIComponent(detailsText);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) string for a list of events and/or classes
 */
export function generateIcsSchedule(events: EventItem[], classes: ClassScheduleItem[] = []): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FLAME FOMO//Campus Event Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FLAME FOMO Campus Schedule',
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  // Add Campus Events
  for (const event of events) {
    const { start, end } = parseEventDateTimeRange(event.date, event.time_start_end);
    const startIso = formatToGoogleUtcIso(start);
    const endIso = formatToGoogleUtcIso(end);
    const uid = `flame-fomo-${event.id}-${start.getTime()}@flame.edu.in`;

    const summary = event.event_name.replace(/[,;]/g, ' ');
    const location = `${event.venue_zone}${event.room_specific ? ' - ' + event.room_specific : ''}, FLAME University`.replace(/[,;]/g, ' ');
    const description = (event.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, ' ');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${startIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${summary}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  // Add Recurring Classes (Academic Timetable)
  const dayMap: Record<string, string> = {
    Sunday: 'SU',
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
    Saturday: 'SA',
  };

  const dayNumbers: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const today = new Date();
  for (const cls of classes) {
    const targetDayNum = dayNumbers[cls.day] ?? 1;
    const currentDayNum = today.getDay();
    let daysUntil = (targetDayNum - currentDayNum + 7) % 7;
    if (daysUntil === 0) daysUntil = 7; // start next week if today already passed

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    const dateStr = targetDate.toISOString().split('T')[0];

    const { start, end } = parseEventDateTimeRange(dateStr, `${cls.timeStart} - ${cls.timeEnd}`);
    const startIso = formatToGoogleUtcIso(start);
    const endIso = formatToGoogleUtcIso(end);
    const uid = `flame-class-${cls.id}-${start.getTime()}@flame.edu.in`;
    const byDay = dayMap[cls.day] || 'MO';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${startIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
      `SUMMARY:${cls.courseName.replace(/[,;]/g, ' ')} (Lecture)`,
      `LOCATION:${(cls.room || 'Academics') + ', FLAME University'}`.replace(/[,;]/g, ' '),
      'DESCRIPTION:FLAME University Academic Timetable Lecture',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger client download of an .ics file
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
