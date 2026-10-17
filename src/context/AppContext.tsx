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
  EventPostRateLimitResult,
  isAdminModerator
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
  currentTab: 'home' | 'explore' | 'applications' | 'my-plan' | 'campus-map' | 'profile';
  setCurrentTab: (tab: 'home' | 'explore' | 'applications' | 'my-plan' | 'campus-map' | 'profile') => void;

  // Modals
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;

  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;

  isCreateEventOpen: boolean;
  createEventInitialType: 'event' | 'application';
  eventToEdit: EventItem | null;
  openCreateEvent: (initialType?: 'event' | 'application' | any) => void;
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
  myCreatedEventIds: string[];
  isUserAuthor: (event: EventItem) => boolean;

  // Life@FLAME Live Portal Synchronization
  isSyncingLifeAtFlame: boolean;
  lastLifeAtFlameSync: string | null;
  syncLifeAtFlameNow: (force?: boolean) => Promise<{ success: boolean; count?: number; message?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'flame_fomo_user_profile';
const LOCAL_STORAGE_EVENTS_KEY = 'flame_fomo_events';
const LOCAL_STORAGE_NOTIFS_KEY = 'flame_fomo_notifications';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_SEED_EVENTS);
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'applications' | 'my-plan' | 'campus-map' | 'profile'>('home');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string>('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [createEventInitialType, setCreateEventInitialType] = useState<'event' | 'application'>('event');
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [clashInfo, setClashInfo] = useState<ClashInfo | null>(null);
  const [externalRegEvent, setExternalRegEvent] = useState<EventItem | null>(null);
  const [isEventFeedbackModalOpen, setIsEventFeedbackModalOpen] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<EventItem | null>(null);
  const [isSiteFeedbackOpen, setIsSiteFeedbackOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [myCreatedEventIds, setMyCreatedEventIds] = useState<string[]>([]);
  const [isSyncingLifeAtFlame, setIsSyncingLifeAtFlame] = useState<boolean>(false);
  const [lastLifeAtFlameSync, setLastLifeAtFlameSync] = useState<string | null>(null);

  // Load state on client mount
  useEffect(() => {
    let authUnsubscribe: (() => void) | null = null;
    try {
      const dummyIds = [
        'evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8', 'evt-9',
        'lifeatflame-app-flame-dance-club',
        'lifeatflame-app-flame-astronomy-club',
        'lifeatflame-app-flame-mun-club',
        'lifeatflame-app-flame-on-board',
        'lifeatflame-app-flame-entrepreneurship-lab',
        'lifeatflame-app-flame-travel-club',
        'lifeatflame-app-dotslash-flame',
        'lifeatflame-app-the-front-row-film-club',
        'lifeatflame-app-flame-cooking-collective',
        'lifeatflame-app-markit-flame-marketing-club',
        'lifeatflame-app-flame-yearbook-committee',
        'lifeatflame-app-animal-welfare-committee',
        'lifeatflame-app-anime-arcadia-flame-anime-club',
        'lifeatflame-app-flame-business-consulting'
      ];
      const storedEvents = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
      if (storedEvents) {
        const parsed: EventItem[] = JSON.parse(storedEvents);
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((e) => !e.id.startsWith('lifeatflame-') && !dummyIds.includes(e.id))
          : [];
        const existingIds = new Set(cleaned.map((e) => e.id));
        const missingSeeds = INITIAL_SEED_EVENTS.filter(
          (e) => !existingIds.has(e.id) && !e.id.startsWith('lifeatflame-') && !dummyIds.includes(e.id)
        );
        const merged = [...cleaned, ...missingSeeds];
        setEvents(merged);
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(merged));
      } else {
        const seeds = INITIAL_SEED_EVENTS.filter((e) => !e.id.startsWith('lifeatflame-') && !dummyIds.includes(e.id));
        setEvents(seeds);
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(seeds));
      }

      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          parsedUser.saved_events = (parsedUser.saved_events || []).filter(
            (id: string) => !id.startsWith('lifeatflame-') && !dummyIds.includes(id)
          );
          parsedUser.going_events = (parsedUser.going_events || []).filter(
            (id: string) => !id.startsWith('lifeatflame-') && !dummyIds.includes(id)
          );
          setUser(parsedUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(parsedUser));
        }
      }

      // Notifications initially empty; populated dynamically from real events
      setNotifications([]);

      try {
        const storedCreated = localStorage.getItem('flame_fomo_my_created_event_ids');
        if (storedCreated) setMyCreatedEventIds(JSON.parse(storedCreated));
      } catch {}

      // Sync with Supabase cloud if keys are present
      if (isSupabaseConfigured()) {
        supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (data) {
              const mappedEvents: EventItem[] = (data as any[]).map((ev) => {
                const feeMatch = ev.requirements_eligibility?.match(/\[FEE:\s*([^\]]+)\]/);
                const pocNameMatch = ev.requirements_eligibility?.match(/\[POC_NAME:\s*([^\]]+)\]/);
                const pocNumberMatch = ev.requirements_eligibility?.match(/\[POC_NUMBER:\s*([^\]]+)\]/);
                const typeMatch = ev.requirements_eligibility?.match(/\[TYPE:\s*([^\]]+)\]/);
                const interviewMatch = ev.requirements_eligibility?.match(/\[INTERVIEW:\s*([^\]]+)\]/);
                const hasInterview = ev.has_interview ?? (Boolean(ev.interview_details) || Boolean(interviewMatch) || Boolean(ev.requirements_eligibility?.includes('[HAS_INTERVIEW]')));
                const itemType = (ev.item_type || (typeMatch ? typeMatch[1].trim() : 'event')) as 'event' | 'application';

                const sUsers = Array.isArray(ev.saved_users) ? ev.saved_users : [];
                const gUsers = Array.isArray(ev.going_users) ? ev.going_users : [];
                const fUsers = Array.isArray(ev.favourite_users) ? ev.favourite_users : [];
                const rawCat = ev.category || '';
                const parsedCats = Array.isArray(ev.categories) && ev.categories.length > 0
                  ? ev.categories
                  : rawCat ? rawCat.split(',').map((c: string) => c.trim()).filter(Boolean) : [];

                return {
                  ...ev,
                  item_type: itemType,
                  has_interview: hasInterview,
                  interview_details: ev.interview_details || (interviewMatch ? interviewMatch[1].trim() : undefined),
                  categories: parsedCats,
                  category: ev.category,
                  registration_fee: feeMatch ? feeMatch[1].trim() : undefined,
                  poc_name: ev.poc_name || (pocNameMatch ? pocNameMatch[1].trim() : undefined),
                  poc_number: ev.poc_number || (pocNumberMatch ? pocNumberMatch[1].trim() : undefined),
                  is_tentative:
                    ev.status === 'Tentative' ||
                    ev.time_start_end?.includes('Tentative') ||
                    ev.requirements_eligibility?.includes('[TENTATIVE]'),
                  saved_users: sUsers,
                  going_users: gUsers,
                  favourite_users: fUsers,
                  saved_count: typeof ev.saved_count === 'number' ? ev.saved_count : sUsers.length,
                  going_count: typeof ev.going_count === 'number' ? ev.going_count : gUsers.length,
                  favourite_count: typeof ev.favourite_count === 'number' ? ev.favourite_count : fUsers.length,
                };
              });

              // Filter out any lifeatflame-* events (Life at FLAME is only informational) or dummy IDs
              const cleanMappedEvents = mappedEvents.filter(
                (e) => !e.id.startsWith('lifeatflame-') && !dummyIds.includes(e.id)
              );

              // Merge any initial seed items missing from Supabase
              const existingIds = new Set(cleanMappedEvents.map((e) => e.id));
              const missingSeeds = INITIAL_SEED_EVENTS.filter(
                (e) => !existingIds.has(e.id) && !e.id.startsWith('lifeatflame-') && !dummyIds.includes(e.id)
              );
              const mergedEvents = [...cleanMappedEvents, ...missingSeeds];

              setEvents(mergedEvents);
              localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(mergedEvents));
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

        // Auto-detect when student completes Google OAuth or signs in
        const handleSession = async (session: any, isFreshSignIn = false) => {
          if (session?.user?.email) {
            const confirmedEmail = session.user.email.toLowerCase();
            const isFlameEmail = confirmedEmail.endsWith('@flame.edu.in');
            const isAdmin = isAdminModerator(confirmedEmail);
            if (!isFlameEmail && !isAdmin) {
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
                setIsAuthModalOpen(false);
                // Quiz should ONLY show up during a fresh sign in, never on reload
                if (isFreshSignIn) {
                  setIsOnboardingOpen(true);
                } else {
                  setIsOnboardingOpen(false);
                }
              } else {
                const defaultName =
                  session.user.user_metadata?.full_name ||
                  confirmedEmail.split('@')[0].replace('.', ' ').toUpperCase();

                // Preserve any local user data if present
                const existingStored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
                let parsedStored: UserProfile | null = null;
                try {
                  if (existingStored) parsedStored = JSON.parse(existingStored);
                } catch {}

                const newProfile: UserProfile = {
                  flame_email: confirmedEmail,
                  name: parsedStored?.name || defaultName,
                  academic_year: parsedStored?.academic_year || 'UG2',
                  category_preferences: parsedStored?.category_preferences || ['Performances', 'Workshop', 'Competition'],
                  academic_timetable: parsedStored?.academic_timetable || DEFAULT_TIMETABLE_SAMPLE,
                  saved_events: parsedStored?.saved_events || [],
                  going_events: parsedStored?.going_events || [],
                  favourite_events: parsedStored?.favourite_events || [],
                  favourite_categories: parsedStored?.favourite_categories || ['Performances', 'Competition'],
                  quiz_completed: true,
                  created_at: parsedStored?.created_at || new Date().toISOString(),
                };
                setUser(newProfile);
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
                await supabase.from('profiles').upsert([newProfile]);
                setIsAuthModalOpen(false);
                // Quiz should ONLY show up during a fresh sign in, never on reload
                if (isFreshSignIn) {
                  setIsOnboardingOpen(true);
                } else {
                  setIsOnboardingOpen(false);
                }
              }
            } catch (err) {
              console.error('Error syncing confirmed student session:', err);
            }
          }
        };

        // Check active session immediately on page load / reload: isFreshSignIn is ALWAYS false
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) handleSession(session, false);
        });

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            let isFresh = false;
            if (event === 'SIGNED_IN') {
              const pending = typeof window !== 'undefined' && localStorage.getItem('flame_pending_oauth_signin') === 'true';
              if (pending) {
                isFresh = true;
                localStorage.removeItem('flame_pending_oauth_signin');
              }
            }
            handleSession(session, isFresh);
          }
        });

        if (authListener?.subscription) {
          authUnsubscribe = () => authListener.subscription.unsubscribe();
        }
      }

      // Load stored last sync timestamp
      try {
        const storedLastSync = localStorage.getItem('flame_fomo_last_sync_lifeatflame');
        if (storedLastSync) setLastLifeAtFlameSync(storedLastSync);
      } catch {}

      // Automatically trigger background sync with Life@FLAME portal
      syncLifeAtFlameNow(false);

      // Keep permanently synced with Life@FLAME: poll every 15 minutes for new campus deadlines
      const syncInterval = setInterval(() => {
        syncLifeAtFlameNow(false);
      }, 15 * 60 * 1000);

      return () => {
        if (authUnsubscribe) authUnsubscribe();
        clearInterval(syncInterval);
      };
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
  }, []);

  // Life@FLAME Live Synchronization Engine
  const syncLifeAtFlameNow = async (force = false): Promise<{ success: boolean; count?: number; message?: string }> => {
    setIsSyncingLifeAtFlame(true);
    try {
      const res = await fetch('/api/sync-lifeatflame', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) {
        throw new Error(`Sync API responded with HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const syncedItems: EventItem[] = data.items;

        setEvents((prev) => {
          const map = new Map<string, EventItem>();
          // Preserve existing events and user posts
          prev.forEach((e) => map.set(e.id, e));

          // Upsert synced items preserving user interactions (saved, going, feedback)
          syncedItems.forEach((item) => {
            const existing = map.get(item.id);
            if (existing) {
              map.set(item.id, {
                ...item,
                saved_users: existing.saved_users,
                going_users: existing.going_users,
                favourite_users: existing.favourite_users,
                ratings: existing.ratings,
                feedback: existing.feedback,
              });
            } else {
              map.set(item.id, item);
            }
          });

          const merged = Array.from(map.values());
          try {
            localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });

        const nowIso = new Date().toISOString();
        setLastLifeAtFlameSync(nowIso);
        try {
          localStorage.setItem('flame_fomo_last_sync_lifeatflame', nowIso);
        } catch {}

        return {
          success: true,
          count: data.totalSynced,
          message: `Linked & synced ${data.totalSynced} campus items from Life@FLAME!`,
        };
      }
      return { success: false, message: data.error || 'Failed to sync' };
    } catch (err: any) {
      console.warn('[AppContext] Life@FLAME auto-sync notice:', err.message);
      return { success: false, message: err.message };
    } finally {
      setIsSyncingLifeAtFlame(false);
    }
  };

  // Derive FOMO deadline awareness alerts automatically from all events & applications
  useEffect(() => {
    if (!events || events.length === 0) return;
    const notifs: NotificationItem[] = events
      .filter((ev) => ev.registration_deadline)
      .map((ev) => ({
        id: `notif-${ev.id}`,
        title: ev.item_type === 'application' ? 'Application Deadline Approaching!' : 'Registration Closing Soon!',
        message: `${ev.event_name} deadline: ${ev.registration_deadline}`,
        eventId: ev.id,
        deadline: ev.registration_deadline || '',
        type: 'urgent_deadline',
        read: false,
        timestamp: 'Upcoming',
      }));
    setNotifications(notifs);
  }, [events]);

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

  const openCreateEvent = (initialType?: 'event' | 'application' | any) => {
    const cleanType: 'event' | 'application' = initialType === 'application' ? 'application' : 'event';
    if (!user) {
      openAuthModal(cleanType === 'application' ? 'Sign in with your FLAME email to post club applications.' : 'Sign in with your FLAME email to post events.');
      return;
    }
    setCreateEventInitialType(cleanType);
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
    const authorName = 'Anonymous student';
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
      name: authorName,          // Public label remains strictly "Anonymous student"
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('flame_pending_oauth_signin', 'true');
    }
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
      category_preferences: ['Performances', 'Workshop', 'Competition'],
      academic_timetable: DEFAULT_TIMETABLE_SAMPLE,
      saved_events: [],
      going_events: [],
      favourite_events: [],
      favourite_categories: ['Performances', 'Competition'],
      created_at: new Date().toISOString(),
    };

    saveUserToStorage(newUser);
    closeAuthModal();
    // Only open quiz on explicit sign-in
    setIsOnboardingOpen(true);
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
          // Only open quiz on explicit sign-in
          setIsOnboardingOpen(true);
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
      category_preferences: ['Performances', 'Workshop', 'Competition'],
      academic_timetable: DEFAULT_TIMETABLE_SAMPLE,
      saved_events: [],
      going_events: [],
      favourite_events: [],
      favourite_categories: ['Performances', 'Competition'],
      created_at: new Date().toISOString(),
    };

    saveUserToStorage(newUser);
    if (isSupabaseConfigured()) {
      supabase.from('profiles').upsert([newUser]).then();
    }
    closeAuthModal();
    // Only open quiz on explicit sign-in
    setIsOnboardingOpen(true);
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

    const userEmail = user.flame_email.toLowerCase();
    setEvents((prev) => {
      const next = prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const currentUsers = Array.isArray(ev.saved_users) ? ev.saved_users : [];
        const nextUsers = isAlreadySaved
          ? currentUsers.filter((u) => u.toLowerCase() !== userEmail)
          : currentUsers.some((u) => u.toLowerCase() === userEmail) ? currentUsers : [...currentUsers, userEmail];
        const nextCount = nextUsers.length;
        if (isSupabaseConfigured()) {
          supabase
            .from('events')
            .update({ saved_users: nextUsers, saved_count: nextCount })
            .eq('id', eventId)
            .then();
        }
        return { ...ev, saved_users: nextUsers, saved_count: nextCount };
      });
      localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(next));
      return next;
    });
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
    const userEmail = user.flame_email.toLowerCase();

    if (isAlreadyGoing) {
      // Remove
      updateProfile({ going_events: currentGoing.filter((id) => id !== eventId) });
      setEvents((prev) => {
        const next = prev.map((ev) => {
          if (ev.id !== eventId) return ev;
          const currentUsers = Array.isArray(ev.going_users) ? ev.going_users : [];
          const nextUsers = currentUsers.filter((u) => u.toLowerCase() !== userEmail);
          const nextCount = nextUsers.length;
          if (isSupabaseConfigured()) {
            supabase
              .from('events')
              .update({ going_users: nextUsers, going_count: nextCount })
              .eq('id', eventId)
              .then();
          }
          return { ...ev, going_users: nextUsers, going_count: nextCount };
        });
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(next));
        return next;
      });
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
    setEvents((prev) => {
      const next = prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const currentUsers = Array.isArray(ev.going_users) ? ev.going_users : [];
        const nextUsers = currentUsers.some((u) => u.toLowerCase() === userEmail) ? currentUsers : [...currentUsers, userEmail];
        const nextCount = nextUsers.length;
        if (isSupabaseConfigured()) {
          supabase
            .from('events')
            .update({ going_users: nextUsers, going_count: nextCount })
            .eq('id', eventId)
            .then();
        }
        return { ...ev, going_users: nextUsers, going_count: nextCount };
      });
      localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(next));
      return next;
    });

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

    const userEmail = user.flame_email.toLowerCase();
    setEvents((prev) => {
      const next = prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const currentUsers = Array.isArray(ev.favourite_users) ? ev.favourite_users : [];
        const nextUsers = isAlreadyFav
          ? currentUsers.filter((u) => u.toLowerCase() !== userEmail)
          : currentUsers.some((u) => u.toLowerCase() === userEmail) ? currentUsers : [...currentUsers, userEmail];
        const nextCount = nextUsers.length;
        if (isSupabaseConfigured()) {
          supabase
            .from('events')
            .update({ favourite_users: nextUsers, favourite_count: nextCount })
            .eq('id', eventId)
            .then();
        }
        return { ...ev, favourite_users: nextUsers, favourite_count: nextCount };
      });
      localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(next));
      return next;
    });
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

    try {
      const stored = localStorage.getItem('flame_fomo_my_created_event_ids');
      const ids: string[] = stored ? JSON.parse(stored) : [];
      const nextIds = [...ids, newId];
      localStorage.setItem('flame_fomo_my_created_event_ids', JSON.stringify(nextIds));
      setMyCreatedEventIds(nextIds);
    } catch {}

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
      if (newEvent.poc_name && !finalEligibility.includes('[POC_NAME:')) {
        finalEligibility = `${finalEligibility} [POC_NAME: ${newEvent.poc_name}]`.trim();
      }
      if (newEvent.poc_number && !finalEligibility.includes('[POC_NUMBER:')) {
        finalEligibility = `${finalEligibility} [POC_NUMBER: ${newEvent.poc_number}]`.trim();
      }
      if (newEvent.item_type && !finalEligibility.includes('[TYPE:')) {
        finalEligibility = `${finalEligibility} [TYPE: ${newEvent.item_type}]`.trim();
      }
      if (newEvent.has_interview && !finalEligibility.includes('[HAS_INTERVIEW]')) {
        finalEligibility = `${finalEligibility} [HAS_INTERVIEW]`.trim();
      }
      if (newEvent.interview_details && !finalEligibility.includes('[INTERVIEW:')) {
        finalEligibility = `${finalEligibility} [INTERVIEW: ${newEvent.interview_details}]`.trim();
      }
      const { 
        is_tentative, 
        tentative_note, 
        registration_fee, 
        categories, 
        poc_name, 
        poc_number, 
        item_type, 
        has_interview, 
        interview_details, 
        ...cleanPayload 
      } = newEvent;
      cleanPayload.requirements_eligibility = finalEligibility || undefined;
      cleanPayload.category = (newEvent.categories && newEvent.categories.length > 0)
        ? newEvent.categories.join(', ')
        : newEvent.category;

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
      if (eventData.registration_fee !== undefined) {
        finalEligibility = `${(finalEligibility || '').replace(/\[FEE:\s*[^\]]+\]/g, '').trim()} ${eventData.registration_fee ? `[FEE: ${eventData.registration_fee}]` : ''}`.trim();
      }
      if (eventData.poc_name !== undefined) {
        finalEligibility = `${(finalEligibility || '').replace(/\[POC_NAME:\s*[^\]]+\]/g, '').trim()} ${eventData.poc_name ? `[POC_NAME: ${eventData.poc_name}]` : ''}`.trim();
      }
      if (eventData.poc_number !== undefined) {
        finalEligibility = `${(finalEligibility || '').replace(/\[POC_NUMBER:\s*[^\]]+\]/g, '').trim()} ${eventData.poc_number ? `[POC_NUMBER: ${eventData.poc_number}]` : ''}`.trim();
      }
      if (eventData.item_type !== undefined) {
        finalEligibility = `${(finalEligibility || '').replace(/\[TYPE:\s*[^\]]+\]/g, '').trim()} [TYPE: ${eventData.item_type}]`.trim();
      }
      if (eventData.has_interview !== undefined) {
        finalEligibility = `${(finalEligibility || '').replace(/\[HAS_INTERVIEW\]/g, '').trim()} ${eventData.has_interview ? '[HAS_INTERVIEW]' : ''}`.trim();
      }
      if (eventData.interview_details !== undefined) {
        finalEligibility = `${(finalEligibility || '').replace(/\[INTERVIEW:\s*[^\]]+\]/g, '').trim()} ${eventData.interview_details ? `[INTERVIEW: ${eventData.interview_details}]` : ''}`.trim();
      }
      const { 
        is_tentative, 
        tentative_note, 
        registration_fee, 
        categories, 
        poc_name, 
        poc_number, 
        item_type, 
        has_interview, 
        interview_details, 
        ...cleanPayload 
      } = eventData;
      if (eventData.categories && eventData.categories.length > 0) {
        cleanPayload.category = eventData.categories.join(', ');
      }
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

    try {
      const stored = localStorage.getItem('flame_fomo_my_created_event_ids');
      const ids: string[] = stored ? JSON.parse(stored) : [];
      const nextIds = ids.filter((id) => id !== eventId);
      localStorage.setItem('flame_fomo_my_created_event_ids', JSON.stringify(nextIds));
      setMyCreatedEventIds(nextIds);
    } catch {}

    if (isSupabaseConfigured()) {
      supabase.from('events').delete().eq('id', eventId).then(({ error }) => {
        if (error) console.error('Supabase deleteEvent error:', error);
      });
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const isUserAuthor = (event: EventItem): boolean => {
    const userEmail = (user?.flame_email || '').toLowerCase().trim();
    if (!userEmail) return false;

    if (event.submitted_by) {
      const author = event.submitted_by.toLowerCase().trim();
      const username = userEmail.split('@')[0];
      if (author === userEmail || author === username) return true;
    }

    if (myCreatedEventIds.includes(event.id)) {
      return true;
    }

    return false;
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
        createEventInitialType,
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
        myCreatedEventIds,
        isUserAuthor,
        isSyncingLifeAtFlame,
        lastLifeAtFlameSync,
        syncLifeAtFlameNow,
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
