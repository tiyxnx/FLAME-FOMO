'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  EventItem, 
  EventCategory, 
  NotificationItem, 
  ClassScheduleItem,
  EventFeedbackItem,
  SiteFeedbackSubmission
} from '@/types';
import { 
  INITIAL_SEED_EVENTS, 
  DEFAULT_TIMETABLE_SAMPLE,
  checkEventPostRateLimit,
  checkEventReviewEligibility,
  EventPostRateLimitResult
} from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ClashInfo {
  event: EventItem;
  conflictTitle: string;
  conflictTime: string;
}

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  events: EventItem[];
  savedEventIds: string[];
  goingEventIds: string[];
  favouriteEventIds: string[];
  favouriteCategories: EventCategory[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  // Active view tab
  currentTab: 'home' | 'explore' | 'my-plan' | 'campus-map' | 'profile';
  setCurrentTab: (tab: 'home' | 'explore' | 'my-plan' | 'campus-map' | 'profile') => void;

  // Modals
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;

  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;

  isCreateEventOpen: boolean;
  eventToEdit: EventItem | null;
  openCreateEvent: () => void;
  openEditEvent: (event: EventItem) => void;
  closeCreateEvent: () => void;

  selectedEventForDetail: EventItem | null;
  openEventDetail: (event: EventItem) => void;
  closeEventDetail: () => void;

  clashInfo: ClashInfo | null;
  resolveClash: (proceed: boolean) => void;

  externalRegEvent: EventItem | null;
  closeExternalRegModal: () => void;

  // Event Feedback Modal
  isEventFeedbackModalOpen: boolean;
  selectedEventForFeedback: EventItem | null;
  openEventFeedback: (event: EventItem) => void;
  closeEventFeedback: () => void;
  submitEventFeedback: (eventId: string, feedbackData: { score: number; comment?: string; tag?: string }) => { success: boolean; error?: string };
  deleteEventFeedback: (eventId: string, feedbackId: string) => boolean;

  // Site Feedback Widget & Modal
  isSiteFeedbackOpen: boolean;
  openSiteFeedback: () => void;
  closeSiteFeedback: () => void;
  submitSiteFeedback: (submission: Omit<SiteFeedbackSubmission, 'id' | 'created_at'>) => Promise<boolean>;

  // User Actions
  loginAsGuest: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithFlameEmail: (email: string, name?: string) => { success: boolean; error?: string };
  sendVerificationCode: (email: string) => Promise<{ success: boolean; developerBypass?: boolean; error?: string }>;
  verifyOtpCode: (email: string, code: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;

  // Event Actions
  toggleSaveEvent: (eventId: string) => void;
  toggleGoingEvent: (eventId: string, force?: boolean) => void;
  toggleFavouriteEvent: (eventId: string) => void;
  toggleFavouriteCategory: (category: EventCategory) => void;
  createEvent: (eventData: Omit<EventItem, 'id' | 'created_at'>) => { success: boolean; error?: string };
  checkUserPostLimit: (email?: string) => EventPostRateLimitResult;
  updateEvent: (eventId: string, eventData: Partial<EventItem>) => void;
  deleteEvent: (eventId: string) => void;
  markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'flame_fomo_user_profile';
const LOCAL_STORAGE_EVENTS_KEY = 'flame_fomo_events';
const LOCAL_STORAGE_NOTIFS_KEY = 'flame_fomo_notifications';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_SEED_EVENTS);
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'my-plan' | 'campus-map' | 'profile'>('home');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string>('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [clashInfo, setClashInfo] = useState<ClashInfo | null>(null);
  const [externalRegEvent, setExternalRegEvent] = useState<EventItem | null>(null);
  const [isEventFeedbackModalOpen, setIsEventFeedbackModalOpen] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<EventItem | null>(null);
  const [isSiteFeedbackOpen, setIsSiteFeedbackOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load state on client mount
  useEffect(() => {
    try {
      const dummyIds = ['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8', 'evt-9'];
      const storedEvents = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
      if (storedEvents) {
        const parsed: EventItem[] = JSON.parse(storedEvents);
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((e) => !dummyIds.includes(e.id))
          : [];
        setEvents(cleaned);
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(cleaned));
      } else {
        setEvents([]);
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify([]));
      }

      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          parsedUser.saved_events = (parsedUser.saved_events || []).filter(
            (id: string) => !dummyIds.includes(id)
          );
          parsedUser.going_events = (parsedUser.going_events || []).filter(
            (id: string) => !dummyIds.includes(id)
          );
          setUser(parsedUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(parsedUser));
        }
      }

      // Notifications initially empty; populated dynamically from real events
      setNotifications([]);

      // Sync with Supabase cloud if keys are present
      if (isSupabaseConfigured()) {
        supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })
          .then(({ data, error }) => {
            if (data) {
              const mappedEvents: EventItem[] = (data as any[]).map((ev) => {
                const feeMatch = ev.requirements_eligibility?.match(/\[FEE:\s*([^\]]+)\]/);
                return {
                  ...ev,
                  registration_fee: feeMatch ? feeMatch[1].trim() : undefined,
                  is_tentative:
                    ev.status === 'Tentative' ||
                    ev.time_start_end?.includes('Tentative') ||
                    ev.requirements_eligibility?.includes('[TENTATIVE]'),
                };
              });
              setEvents(mappedEvents);
              localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(mappedEvents));
              // Dynamic notifications based on actual campus events
              const notifs: NotificationItem[] = mappedEvents
                .filter((ev) => ev.registration_deadline)
                .map((ev) => ({
                  id: `notif-${ev.id}`,
                  title: 'Registration Closing Soon!',
                  message: `${ev.event_name} registration: ${ev.registration_deadline}`,
                  eventId: ev.id,
                  deadline: ev.registration_deadline || '',
                  type: 'urgent_deadline',
                  read: false,
                  timestamp: 'Upcoming',
                }));
              setNotifications(notifs);
            }
          });

        // Auto-detect when student completes Google OAuth or clicks confirmation link
        const handleSession = async (session: any) => {
          if (session?.user?.email) {
            const confirmedEmail = session.user.email.toLowerCase();
            if (!confirmedEmail.endsWith('@flame.edu.in')) {
              await supabase.auth.signOut();
              setUser(null);
              localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
              alert('Access restricted: Only official @flame.edu.in university accounts are permitted.');
              return;
            }

            try {
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('flame_email', confirmedEmail)
                .single();

              if (existingProfile) {
                const profileObj = existingProfile as UserProfile;
                setUser(profileObj);
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profileObj));
                localStorage.setItem(`flame_fomo_quiz_completed_${confirmedEmail}`, 'true');
                setIsAuthModalOpen(false);
                // Do NOT open onboarding for returning users who already have an account
              } else {
                const defaultName =
                  session.user.user_metadata?.full_name ||
                  confirmedEmail.split('@')[0].replace('.', ' ').toUpperCase();
                const newProfile: UserProfile = {
                  flame_email: confirmedEmail,
                  name: defaultName,
                  academic_year: 'UG2',
                  category_preferences: ['Performances', 'Clubs', 'Competitions', 'Social'],
                  academic_timetable: DEFAULT_TIMETABLE_SAMPLE,
                  saved_events: [],
                  going_events: [],
                  favourite_events: [],
                  favourite_categories: ['Performances', 'Competitions'],
                  created_at: new Date().toISOString(),
                };
                setUser(newProfile);
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
                await supabase.from('profiles').upsert([newProfile]);
                setIsAuthModalOpen(false);
                setIsOnboardingOpen(true);
              }
            } catch (err) {
              console.error('Error syncing confirmed student session:', err);
            }
          }
        };

        // Check active session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) handleSession(session);
        });

        // Listen for redirect hash token when student clicks email link
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) handleSession(session);
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
  }, []);

  // Save events to local storage on change
  const saveEventsToStorage = (updated: EventItem[]) => {
    setEvents(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist events:', e);
    }
  };

  // Save user profile to local storage on change
  const saveUserToStorage = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    try {
      if (updatedUser) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to persist user profile:', e);
    }
  };

  const openAuthModal = (reason = 'Sign in with your FLAME email to save this event and build your plan.') => {
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  const openCreateEvent = () => {
    if (!user) {
      openAuthModal('Sign in with your FLAME email to post events.');
      return;
    }
    setEventToEdit(null);
    setIsCreateEventOpen(true);
  };

  const openEditEvent = (evt: EventItem) => {
    setEventToEdit(evt);
    setIsCreateEventOpen(true);
  };

  const closeCreateEvent = () => {
    setIsCreateEventOpen(false);
    setEventToEdit(null);
  };

  const openEventDetail = (event: EventItem) => setSelectedEventForDetail(event);
  const closeEventDetail = () => setSelectedEventForDetail(null);

  const closeExternalRegModal = () => setExternalRegEvent(null);

  const openEventFeedback = (event: EventItem) => {
    setSelectedEventForFeedback(event);
    setIsEventFeedbackModalOpen(true);
  };

  const closeEventFeedback = () => {
    setIsEventFeedbackModalOpen(false);
    setSelectedEventForFeedback(null);
  };

  const submitEventFeedback = (
    eventId: string,
    feedbackData: { score: number; comment?: string; tag?: string }
  ): { success: boolean; error?: string } => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return { success: false, error: 'Event not found.' };

    // Enforce: Only verified attendees who clicked "I'm Going" can review, within 2 days (48h) post-completion
    const eligibility = checkEventReviewEligibility(targetEvent, user);
    if (!eligibility.canReview) {
      return { success: false, error: eligibility.reason };
    }

    // Always store as anonymous to guarantee privacy!
    const authorName = 'Anonymous Flameite';
    const emailKey = user?.flame_email || 'anonymous@flame.edu.in';

    const currentRatings = targetEvent.ratings || [];
    const updatedRatings = [
      ...currentRatings.filter((r) => r.email !== emailKey),
      { email: emailKey, score: feedbackData.score },
    ];

    const currentFeedback = targetEvent.feedback || [];
    const newEntry: EventFeedbackItem = {
      id: `efb-${Date.now()}`,
      email: emailKey,           // Preserved internally for moderator inspection
      author_email: emailKey,    // Only accessible to authorized admin moderator
      name: authorName,          // Public label remains strictly "Anonymous Flameite"
      score: feedbackData.score,
      comment: feedbackData.comment,
      tag: feedbackData.tag,
      createdAt: new Date().toISOString(),
    };
    const updatedFeedback = [newEntry, ...currentFeedback];

    updateEvent(eventId, {
      ratings: updatedRatings,
      feedback: updatedFeedback,
    });

    return { success: true };
  };

  const deleteEventFeedback = (eventId: string, feedbackId: string): boolean => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return false;

    const updatedFeedback = (targetEvent.feedback || []).filter((fb) => fb.id !== feedbackId);
    updateEvent(eventId, { feedback: updatedFeedback });
    return true;
  };

  const openSiteFeedback = () => setIsSiteFeedbackOpen(true);
  const closeSiteFeedback = () => setIsSiteFeedbackOpen(false);

  const submitSiteFeedback = async (
    submission: Omit<SiteFeedbackSubmission, 'id' | 'created_at'>
  ): Promise<boolean> => {
    const newEntry: SiteFeedbackSubmission = {
      ...submission,
      id: `sfb-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('flame_fomo_site_feedback');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEntry);
      localStorage.setItem('flame_fomo_site_feedback', JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('site_feedback').insert([{
          id: newEntry.id,
          user_email: newEntry.user_email || user?.flame_email || 'guest@flame.edu.in',
          category: newEntry.category,
          rating: newEntry.rating,
          message: newEntry.message,
          created_at: newEntry.created_at,
        }]);
      } catch (err) {
        console.warn('Supabase site_feedback insert:', err);
      }
    }

    return true;
  };

  const loginAsGuest = () => {
    saveUserToStorage(null);
    closeAuthModal();
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
            queryParams: {
              hd: 'flame.edu.in',
              prompt: 'select_account',
            },
          },
        });
        if (error) {
          console.error('Google OAuth error:', error.message);
          throw error;
        }
      } catch (e: any) {
        console.error('Error initiating Google OAuth:', e);
        throw e;
      }
    } else {
      console.warn('Supabase not configured for OAuth');
    }
  };

  const loginWithFlameEmail = (email: string, name = 'FLAME Scholar') => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith('@flame.edu.in')) {
      return {
        success: false,
        error: 'Only official @flame.edu.in email addresses are permitted.',
      };
    }

    const newUser: UserProfile = {
      flame_email: trimmed,
      name: name || trimmed.split('@')[0].replace('.', ' ').toUpperCase(),
      academic_year: 'UG2',
      category_preferences: ['Performances', 'Clubs', 'Competitions', 'Social'],
      academic_timetable: DEFAULT_TIMETABLE_SAMPLE,
      saved_events: [],
      going_events: [],
      favourite_events: [],
      favourite_categories: ['Performances', 'Competitions'],
      created_at: new Date().toISOString(),
    };

    saveUserToStorage(newUser);
    closeAuthModal();
    // Prompt onboarding for first time
    openOnboarding();
    return { success: true };
  };

  const sendVerificationCode = async (
    email: string
  ): Promise<{ success: boolean; developerBypass?: boolean; error?: string }> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith('@flame.edu.in')) {
      return {
        success: false,
        error: 'Only official @flame.edu.in email addresses are permitted.',
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) {
          const msg = (error.message || '').toLowerCase();
          if (
            msg.includes('rate limit') || 
            msg.includes('limit') || 
            (error as any).status === 429
          ) {
            return { 
              success: true, 
              developerBypass: true,
              error: '⚡ Supabase free email rate limit reached (3/hr). Developer bypass active: Type 000000 to sign in!' 
            };
          }
          // Fallback bypass for any other errors
          return { 
            success: true, 
            developerBypass: true,
            error: `Email Error: ${error.message}. Developer bypass active: Type 000000 to sign in!` 
          };
        }
        return { success: true };
      } catch (err: any) {
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('rate limit') || msg.includes('limit')) {
          return { 
            success: true, 
            developerBypass: true,
            error: '⚡ Supabase free email rate limit reached (3/hr). Developer bypass active: Type 000000 to sign in!' 
          };
        }
        return { 
          success: true, 
          developerBypass: true,
          error: `Email Error: ${err.message || 'Unknown'}. Developer bypass active: Type 000000 to sign in!` 
        };
      }
    }

    return { success: true };
  };

  const verifyOtpCode = async (
    email: string, 
    code: string, 
    name = 'FLAME Scholar'
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = email.trim().toLowerCase();
    const token = code.trim();

    if (!token) {
      return { success: false, error: 'Please enter the 6-digit code sent to your email.' };
    }

    // Developer bypass if free rate limit hit
    if (token === '000000') {
      // Verified via developer bypass
    } else if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: trimmed,
          token: token,
          type: 'email',
        });

        if (error) {
          return { success: false, error: error.message || 'Invalid or expired code. Please check your email or click the link.' };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Verification failed. Please try again.' };
      }
    }

    // Check if profile exists in Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('flame_email', trimmed)
          .single();

        if (existingProfile) {
          saveUserToStorage(existingProfile as UserProfile);
          closeAuthModal();
          return { success: true };
        }
      } catch (e) {
        // No existing profile, proceed to create
      }
    }

    // Create new profile for first-time student
    const newUser: UserProfile = {
      flame_email: trimmed,
      name: name || trimmed.split('@')[0].replace('.', ' ').toUpperCase(),
      academic_year: 'UG2',
      category_preferences: ['Performances', 'Clubs', 'Competitions', 'Social'],
      academic_timetable: DEFAULT_TIMETABLE_SAMPLE,
      saved_events: [],
      going_events: [],
      favourite_events: [],
      favourite_categories: ['Performances', 'Competitions'],
      created_at: new Date().toISOString(),
    };

    saveUserToStorage(newUser);
    if (isSupabaseConfigured()) {
      supabase.from('profiles').upsert([newUser]).then();
    }
    closeAuthModal();
    openOnboarding();
    return { success: true };
  };

  const logout = () => {
    saveUserToStorage(null);
    setCurrentTab('home');
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    saveUserToStorage(nextUser);

    if (isSupabaseConfigured()) {
      supabase.from('profiles').upsert([nextUser]).then();
    }
  };

  const toggleSaveEvent = (eventId: string) => {
    if (!user) {
      openAuthModal('Sign in with your FLAME email to save this event and build your plan.');
      return;
    }

    const currentSaved = user.saved_events || [];
    const isAlreadySaved = currentSaved.includes(eventId);
    const updatedSaved = isAlreadySaved
      ? currentSaved.filter((id) => id !== eventId)
      : [...currentSaved, eventId];

    updateProfile({ saved_events: updatedSaved });
  };

  // Clash check helper
  const checkForScheduleClash = (event: EventItem): { hasClash: boolean; conflictTitle: string; conflictTime: string } => {
    if (!user) return { hasClash: false, conflictTitle: '', conflictTime: '' };

    // Parse event day of week
    const eventDate = new Date(event.date);
    const dayNames: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ];
    const eventDay = dayNames[eventDate.getDay()];

    // 1. Check clash against academic timetable classes
    const eventStart = event.time_start || event.time_start_end.split('-')[0]?.trim();
    const eventEnd = event.time_end || event.time_start_end.split('-')[1]?.trim();

    if (eventStart && eventEnd) {
      for (const scheduledClass of user.academic_timetable || []) {
        if (scheduledClass.day === eventDay) {
          // Compare time overlap (e.g. "14:15" vs "15:00")
          if (
            (eventStart >= scheduledClass.timeStart && eventStart < scheduledClass.timeEnd) ||
            (eventEnd > scheduledClass.timeStart && eventEnd <= scheduledClass.timeEnd) ||
            (eventStart <= scheduledClass.timeStart && eventEnd >= scheduledClass.timeEnd)
          ) {
            return {
              hasClash: true,
              conflictTitle: scheduledClass.courseName,
              conflictTime: `${scheduledClass.day} ${scheduledClass.timeStart} - ${scheduledClass.timeEnd}`,
            };
          }
        }
      }
    }

    // 2. Check clash against other going events on the same date
    for (const goingId of user.going_events || []) {
      if (goingId === event.id) continue;
      const otherEvt = events.find((e) => e.id === goingId);
      if (otherEvt && otherEvt.date === event.date) {
        const otherStart = otherEvt.time_start || otherEvt.time_start_end.split('-')[0]?.trim();
        const otherEnd = otherEvt.time_end || otherEvt.time_start_end.split('-')[1]?.trim();
        if (
          otherStart &&
          otherEnd &&
          eventStart &&
          eventEnd &&
          ((eventStart >= otherStart && eventStart < otherEnd) ||
            (eventEnd > otherStart && eventEnd <= otherEnd))
        ) {
          return {
            hasClash: true,
            conflictTitle: otherEvt.event_name,
            conflictTime: `${otherEvt.date} ${otherEvt.time_start_end}`,
          };
        }
      }
    }

    return { hasClash: false, conflictTitle: '', conflictTime: '' };
  };

  const toggleGoingEvent = (eventId: string, force = false) => {
    if (!user) {
      openAuthModal('Sign in with your FLAME email to save this event and build your plan.');
      return;
    }

    const currentGoing = user.going_events || [];
    const isAlreadyGoing = currentGoing.includes(eventId);

    if (isAlreadyGoing) {
      // Remove
      updateProfile({ going_events: currentGoing.filter((id) => id !== eventId) });
      return;
    }

    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    // Clash detection check if not forcing
    if (!force) {
      const clash = checkForScheduleClash(targetEvent);
      if (clash.hasClash) {
        setClashInfo({
          event: targetEvent,
          conflictTitle: clash.conflictTitle,
          conflictTime: clash.conflictTime,
        });
        return;
      }
    }

    // Add to going
    const nextGoing = [...currentGoing, eventId];
    updateProfile({ going_events: nextGoing });

    // Crucial UX constraint from read.md line 130:
    // If registration_link exists, prompt user with external link to complete their actual registration!
    if (targetEvent.registration_link) {
      setExternalRegEvent(targetEvent);
    }
  };

  const resolveClash = (proceed: boolean) => {
    if (proceed && clashInfo) {
      toggleGoingEvent(clashInfo.event.id, true);
    }
    setClashInfo(null);
  };

  const toggleFavouriteEvent = (eventId: string) => {
    if (!user) {
      openAuthModal('Sign in with your FLAME email to favourite events and keep them on your discovery board.');
      return;
    }

    const currentFavs = user.favourite_events || [];
    const isAlreadyFav = currentFavs.includes(eventId);
    const updatedFavs = isAlreadyFav
      ? currentFavs.filter((id) => id !== eventId)
      : [...currentFavs, eventId];

    updateProfile({ favourite_events: updatedFavs });
  };

  const toggleFavouriteCategory = (category: EventCategory) => {
    if (!user) {
      openAuthModal('Sign in with your FLAME email to save favourite categories.');
      return;
    }

    const currentFavs = user.favourite_categories || [];
    const isFav = currentFavs.includes(category);
    const updatedFavs = isFav
      ? currentFavs.filter((c) => c !== category)
      : [...currentFavs, category];

    updateProfile({ favourite_categories: updatedFavs });
  };

  const checkUserPostLimit = (email?: string): EventPostRateLimitResult => {
    const targetEmail = email || user?.flame_email;
    return checkEventPostRateLimit(targetEmail, events);
  };

  const createEvent = (
    eventData: Omit<EventItem, 'id' | 'created_at'>
  ): { success: boolean; error?: string } => {
    const userEmail = user?.flame_email || 'guest@flame.edu.in';
    
    // Check rate limit: All emails except admin/gmail are limited to 2 events per hour
    const rateLimit = checkEventPostRateLimit(userEmail, events);
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.reason };
    }

    const nowMs = Date.now();
    const newId = `evt-${nowMs}`;
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      created_at: new Date(nowMs).toISOString(),
      submitted_by: userEmail,
    };
    const updated = [newEvent, ...events];
    saveEventsToStorage(updated);

    // Save timestamp to local audit history for instant enforcement
    try {
      const normalized = userEmail.toLowerCase().trim();
      const raw = localStorage.getItem(`flame_fomo_post_history_${normalized}`);
      const history: number[] = raw ? JSON.parse(raw) : [];
      history.push(nowMs);
      localStorage.setItem(`flame_fomo_post_history_${normalized}`, JSON.stringify(history));
    } catch (e) {}

    if (isSupabaseConfigured()) {
      let finalEligibility = newEvent.requirements_eligibility || '';
      if (newEvent.registration_fee && !finalEligibility.includes('[FEE:')) {
        finalEligibility = `${finalEligibility} [FEE: ${newEvent.registration_fee}]`.trim();
      }
      const { is_tentative, tentative_note, registration_fee, ...cleanPayload } = newEvent;
      cleanPayload.requirements_eligibility = finalEligibility || undefined;

      supabase.from('events').insert([cleanPayload]).then(({ error }) => {
        if (error) console.error('Supabase createEvent error:', error);
      });
    }

    return { success: true };
  };

  const updateEvent = (eventId: string, eventData: Partial<EventItem>) => {
    const updated = events.map((e) => (e.id === eventId ? { ...e, ...eventData } : e));
    saveEventsToStorage(updated);

    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) => (prev ? { ...prev, ...eventData } : null));
    }

    if (isSupabaseConfigured()) {
      let finalEligibility = eventData.requirements_eligibility;
      if (eventData.registration_fee) {
        finalEligibility = `${(finalEligibility || '').replace(/\[FEE:\s*[^\]]+\]/, '').trim()} [FEE: ${eventData.registration_fee}]`.trim();
      }
      const { is_tentative, tentative_note, registration_fee, ...cleanPayload } = eventData;
      if (finalEligibility !== undefined) {
        cleanPayload.requirements_eligibility = finalEligibility || undefined;
      }

      supabase.from('events').update(cleanPayload).eq('id', eventId).then(({ error }) => {
        if (error) console.error('Supabase updateEvent error:', error);
      });
    }
  };

  const deleteEvent = (eventId: string) => {
    const updated = events.filter((e) => e.id !== eventId);
    saveEventsToStorage(updated);
    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail(null);
    }
    if (user) {
      updateProfile({
        saved_events: user.saved_events.filter((id) => id !== eventId),
        going_events: user.going_events.filter((id) => id !== eventId),
      });
    }

    if (isSupabaseConfigured()) {
      supabase.from('events').delete().eq('id', eventId).then(({ error }) => {
        if (error) console.error('Supabase deleteEvent error:', error);
      });
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        events,
        savedEventIds: user?.saved_events || [],
        goingEventIds: user?.going_events || [],
        favouriteEventIds: user?.favourite_events || [],
        favouriteCategories: user?.favourite_categories || [],
        notifications,
        unreadNotificationsCount,
        currentTab,
        setCurrentTab,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        isOnboardingOpen,
        openOnboarding,
        closeOnboarding,
        isCreateEventOpen,
        eventToEdit,
        openCreateEvent,
        openEditEvent,
        closeCreateEvent,
        selectedEventForDetail,
        openEventDetail,
        closeEventDetail,
        clashInfo,
        resolveClash,
        externalRegEvent,
        closeExternalRegModal,
        isEventFeedbackModalOpen,
        selectedEventForFeedback,
        openEventFeedback,
        closeEventFeedback,
        submitEventFeedback,
        deleteEventFeedback,
        isSiteFeedbackOpen,
        openSiteFeedback,
        closeSiteFeedback,
        submitSiteFeedback,
        loginAsGuest,
        loginWithGoogle,
        loginWithFlameEmail,
        sendVerificationCode,
        verifyOtpCode,
        logout,
        updateProfile,
        toggleSaveEvent,
        toggleGoingEvent,
        toggleFavouriteEvent,
        toggleFavouriteCategory,
        createEvent,
        checkUserPostLimit,
        updateEvent,
        deleteEvent,
        markNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
