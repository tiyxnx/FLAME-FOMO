export type AcademicYear = 'UG1' | 'UG2' | 'UG3' | 'UG4' | 'All';

export type EventCategory = 
  | 'Academic'
  | 'Clubs'
  | 'Sports'
  | 'Social'
  | 'Competitions'
  | 'Workshops'
  | 'Performances'
  | 'Career'
  | 'Talks/Lectures'
  | 'Other';

export type VenueZone = 
  | 'Academics'
  | 'Sports'
  | 'Eateries'
  | 'Flora & Fauna'
  | 'Shantiniketan/Recreational';

export type EventStatus = 'Upcoming' | 'Registration Closed' | 'Cancelled' | 'Tentative' | 'Completed';

export interface ClassScheduleItem {
  id: string;
  courseName: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeStart: string; // e.g., "09:00"
  timeEnd: string;   // e.g., "10:15"
  venueZone?: VenueZone;
  room?: string;
}

export interface UserProfile {
  flame_email: string; // Primary key strictly @flame.edu.in
  name: string;
  academic_year: AcademicYear;
  category_preferences: EventCategory[];
  academic_timetable: ClassScheduleItem[];
  saved_events: string[]; // Event IDs marked as "Save"
  going_events: string[]; // Event IDs marked as "I'm Going"
  favourite_events?: string[]; // Event IDs marked as "Favourite" (Star)
  favourite_categories?: EventCategory[];
  quiz_completed?: boolean;
  created_at?: string;
}

export interface EventItem {
  id: string;
  event_name: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time_start_end: string; // e.g. "17:00 - 18:30"
  time_start?: string; // "17:00"
  time_end?: string;   // "18:30"
  venue_zone: VenueZone;
  room_specific?: string;
  organizer: string;
  description: string;
  registration_deadline?: string; // YYYY-MM-DD HH:mm or YYYY-MM-DD
  registration_link?: string;
  requirements_eligibility?: string; // Target Student Year, e.g. "Open to All" or "UG1 & UG2"
  event_image?: string;
  status: EventStatus;
  is_tentative?: boolean;
  tentative_note?: string;
  registration_fee?: string; // e.g. "Free" or "₹200" or "₹3,540"
  submitted_by?: string; // user email if UGC
  ratings?: { email: string; score: number }[]; // Array of ratings
  feedback?: EventFeedbackItem[]; // Student reviews & feedback notes
  saved_users?: string[]; // Array of user emails who saved
  going_users?: string[]; // Array of user emails who clicked I'm Going
  favourite_users?: string[]; // Array of user emails who favourited
  saved_count?: number; // Total count of students who saved
  going_count?: number; // Total count of students attending
  favourite_count?: number; // Total count of students who favourited
  created_at?: string;
}

export interface EventFeedbackItem {
  id: string;
  email: string;
  author_email?: string; // Captured for moderator view only
  name?: string;
  score: number;
  comment?: string;
  tag?: string;
  createdAt: string;
}

export interface SiteFeedbackSubmission {
  id: string;
  user_email?: string;
  category: 'suggestion' | 'bug' | 'missing_event' | 'love';
  rating: number;
  message: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  eventId?: string;
  deadline?: string;
  type: 'urgent_deadline' | 'clash_warning' | 'new_event';
  read: boolean;
  timestamp: string;
}

export interface MapCoordinates {
  x: number; // percentage 0-100 from left
  y: number; // percentage 0-100 from top
}
