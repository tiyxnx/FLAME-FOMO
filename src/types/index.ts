export type AcademicYear = 
  | 'UG1' | 'UG2' | 'UG3' | 'UG4'
  | 'BDes 1' | 'BDes 2' | 'BDes 3' | 'BDes 4'
  | 'PGB1' | 'PGB2' | 'PGC1' | 'PGC2' | 'PGPEI'
  | 'MSc 1' | 'MSc 2'
  | 'PG1' | 'PG2'
  | 'All';

export type EventCategory = 
  | 'Exhibition/stall'
  | 'Workshop'
  | 'Lecture'
  | 'Competition'
  | 'Academic'
  | 'Performances'
  | 'Community welfare';

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

export type UserRole = 'admin' | 'club' | 'student';

export interface UserProfile {
  flame_email: string; // Primary key strictly @flame.edu.in
  name: string;
  role?: UserRole; // 'admin' | 'club' | 'student'
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
  item_type?: 'event' | 'application'; // 'event' (default) or 'application' (club recruitment)
  event_name: string;
  category: EventCategory | string;
  categories?: string[];
  date: string; // YYYY-MM-DD (start date / single date)
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  start_date?: string; // DB compatibility alias
  end_date?: string;   // DB compatibility alias
  time_start_end: string; // e.g. "17:00 - 18:30"
  time_start?: string; // "17:00"
  time_end?: string;   // "18:30"
  venue_zone: VenueZone;
  room_specific?: string;
  organizer: string;
  poc_name?: string; // Person of Contact handling the event
  poc_number?: string; // Contact phone / WhatsApp of POC
  description: string;
  registration_deadline?: string; // YYYY-MM-DD HH:mm or YYYY-MM-DD
  registration_link?: string;
  requirements_eligibility?: string; // Target Student Year, e.g. "Open to All" or "UG1 & UG2"
  has_interview?: boolean; // Whether club application involves interview / audition round
  interview_details?: string; // Timeline, venue, or format for interviews
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

export type CampusVenueCategory = 'Classrooms' | 'Auditoriums / Halls' | 'Sports' | 'Others';

export type OfficialCampusCategory = 
  | 'Academics'
  | 'Sports'
  | 'Eateries'
  | 'Flora & Fauna'
  | 'Housing'
  | 'Recreational'
  | 'Common Areas'
  | 'Shantiniketan';

export interface CampusLocation {
  id: string;
  name: string;
  category: CampusVenueCategory;
  officialCategory?: OfficialCampusCategory;
  building: string;
  floor?: string;
  zone: VenueZone;
  x: number; // 0-100% on illustrated map
  y: number; // 0-100% on illustrated map
  description?: string;
  hubNodeId: string; // anchor node for campus walkway graph
  officialNumber?: number; // Official 1-54 campus map number
  satX?: number; // 0-100% on Google satellite map
  satY?: number; // 0-100% on Google satellite map
  insideBuilding?: string; // Clear description of interior placement (e.g. "Inside APJ Abdul Kalam (#2), Right Wing")
}

export interface CampusRouteStep {
  instruction: string;
  landmark?: string;
  distanceMeters: number;
}

export interface CampusRouteResult {
  fromLocation: CampusLocation;
  toLocation: CampusLocation;
  distanceMeters: number;
  walkTimeMinutes: number;
  stepsCount: number;
  paceDescription: string;
  steps: CampusRouteStep[];
  pathCoordinates: { x: number; y: number }[];
  googleMapsUrl: string;
}

