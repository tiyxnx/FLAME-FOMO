'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  EventCategory, 
  VenueZone, 
  EventStatus, 
  EventItem 
} from '@/types';
import { 
  EVENT_CATEGORIES, 
  VENUE_ZONES, 
  VENUE_LOCATIONS_MAP 
} from '@/lib/constants';
import { 
  X, 
  Check,
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Link as LinkIcon, 
  Users, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  Wand2,
  RefreshCw,
  Trash2,
  AlertCircle,
  FileDown,
  Sparkles as SparklesIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseAnnouncement, ParseFieldStatus } from '@/lib/announcementParser';

const CURATED_PRESETS = [
  { label: '🎸 Live Music', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  { label: '💻 Tech / AI', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80' },
  { label: '☕ Coffee & Talk', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80' },
  { label: '⚽ Sports Match', url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=600&q=80' },
  { label: '🎨 Art Workshop', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80' },
  { label: '🎬 Film / Drama', url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80' },
  { label: '🌿 Nature Walk', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80' },
  { label: '🌌 Stargazing', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80' },
];

const COHORT_OPTIONS = [
  'Open to All Students',
  'UG1',
  'UG2',
  'UG3',
  'UG4',
  'PG1',
  'PG2',
  'UG Only (UG1 - UG4)',
  'PG Only (PG1 - PG2)',
];

export const CreateEventModal: React.FC = () => {
  const { 
    isCreateEventOpen, 
    closeCreateEvent, 
    createEvent, 
    checkUserPostLimit,
    updateEvent, 
    eventToEdit, 
    user 
  } = useApp();

  const [submitError, setSubmitError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [eventName, setEventName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>(['Workshop']);
  const [date, setDate] = useState('2026-10-08');
  const [isTentative, setIsTentative] = useState(false);
  const [tentativeNote, setTentativeNote] = useState('');
  const [timeStart, setTimeStart] = useState('17:00');
  const [timeEnd, setTimeEnd] = useState('18:30');
  const [venueZone, setVenueZone] = useState<VenueZone>('Academics');
  const [roomSpecific, setRoomSpecific] = useState('');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [organizer, setOrganizer] = useState('');
  const [description, setDescription] = useState('');
  const [registrationDeadlineDate, setRegistrationDeadlineDate] = useState('');
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState('23:59');
  const [registrationLink, setRegistrationLink] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [requirementsEligibility, setRequirementsEligibility] = useState('Open to All Students');
  const [eventImage, setEventImage] = useState('');
  const [status, setStatus] = useState<EventStatus>('Upcoming');

  const toggleCategorySelection = (cat: EventCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // Keep at least one selected
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // UI state for image picker
  const [imageTab, setImageTab] = useState<'ai' | 'upload' | 'preset' | 'url'>('ai');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Smart Auto-Fill from Announcement State
  const [rawPasteText, setRawPasteText] = useState('');
  const [parseResults, setParseResults] = useState<{ filledCount: number; statuses: ParseFieldStatus[] } | null>(null);
  const [isPasteSectionOpen, setIsPasteSectionOpen] = useState(!eventToEdit);

  // Pre-fill when editing or initialize fresh
  useEffect(() => {
    if (!isCreateEventOpen) return;

    if (eventToEdit) {
      setEventName(eventToEdit.event_name);
      if (eventToEdit.categories && eventToEdit.categories.length > 0) {
        setSelectedCategories(eventToEdit.categories as EventCategory[]);
      } else if (eventToEdit.category) {
        const parts = eventToEdit.category.split(',').map((c) => c.trim()).filter(Boolean) as EventCategory[];
        setSelectedCategories(parts.length > 0 ? parts : ['Workshop']);
      }
      setDate(eventToEdit.date);
      setTimeStart(eventToEdit.time_start || '17:00');
      setTimeEnd(eventToEdit.time_end || '18:30');
      setVenueZone(eventToEdit.venue_zone);
      setRoomSpecific(eventToEdit.room_specific || '');
      setOrganizer(eventToEdit.organizer);
      setDescription(eventToEdit.description);
      setRegistrationLink(eventToEdit.registration_link || '');
      setRegistrationFee(eventToEdit.registration_fee || '');
      setRequirementsEligibility(
        (eventToEdit.requirements_eligibility || '')
          .replace('[TENTATIVE]', '')
          .replace(/\[FEE:\s*[^\]]+\]/, '')
          .trim() || 'Open to All Students'
      );
      setEventImage(eventToEdit.event_image || '');
      setStatus(eventToEdit.status);

      const tentativeDetected = Boolean(
        eventToEdit.is_tentative || 
        eventToEdit.time_start_end?.toLowerCase().includes('tentative') ||
        eventToEdit.requirements_eligibility?.includes('[TENTATIVE]')
      );
      setIsTentative(tentativeDetected);
      setTentativeNote(eventToEdit.tentative_note || '');

      if (eventToEdit.registration_deadline) {
        const parts = eventToEdit.registration_deadline.split(' ');
        setRegistrationDeadlineDate(parts[0] || '');
        setRegistrationDeadlineTime(parts[1] || '23:59');
      } else {
        setRegistrationDeadlineDate('');
        setRegistrationDeadlineTime('23:59');
      }
    } else {
      // Default new event
      setEventName('');
      setSelectedCategories(['Workshop']);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      setIsTentative(false);
      setTentativeNote('');
      setTimeStart('17:00');
      setTimeEnd('18:30');
      setVenueZone('Academics');
      setRoomSpecific('');
      setOrganizer(user?.name ? `${user.name} / Student Org` : 'FLAME Student Initiative');
      setDescription('');
      setRegistrationDeadlineDate('');
      setRegistrationDeadlineTime('23:59');
      setRegistrationLink('');
      setRegistrationFee('');
      setRequirementsEligibility('Open to All Students');
      setEventImage('');
      setStatus('Upcoming');
      setImageTab('ai');
      setIsCustomRoom(false);
      setRawPasteText('');
      setParseResults(null);
    }
    setErrorMsg('');
  }, [eventToEdit, isCreateEventOpen, user]);

  const handleSmartAutoFill = () => {
    if (!rawPasteText.trim()) return;
    const result = parseAnnouncement(rawPasteText);

    if (result.data.eventName) setEventName(result.data.eventName);
    if (result.data.category) setSelectedCategories([result.data.category]);
    if (result.data.date) setDate(result.data.date);
    if (result.data.timeStart) setTimeStart(result.data.timeStart);
    if (result.data.timeEnd) setTimeEnd(result.data.timeEnd);
    if (result.data.venueZone) {
      setVenueZone(result.data.venueZone);
      if (result.data.roomSpecific) {
        setRoomSpecific(result.data.roomSpecific);
      }
    }
    if (result.data.organizer) setOrganizer(result.data.organizer);
    if (result.data.description) setDescription(result.data.description);
    if (result.data.registrationFee) setRegistrationFee(result.data.registrationFee);
    if (result.data.registrationLink) setRegistrationLink(result.data.registrationLink);
    if (result.data.registrationDeadlineDate) setRegistrationDeadlineDate(result.data.registrationDeadlineDate);
    if (result.data.registrationDeadlineTime) setRegistrationDeadlineTime(result.data.registrationDeadlineTime);
    if (result.data.requirementsEligibility) setRequirementsEligibility(result.data.requirementsEligibility);

    setParseResults({
      filledCount: result.filledCount,
      statuses: result.statuses,
    });

    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.45 } });
    } catch {}
  };

  if (!isCreateEventOpen) return null;

  // Handle AI Poster Generation based on subject line
  const handleGenerateAiPoster = () => {
    if (!eventName.trim()) {
      setErrorMsg('Please enter an Event Name above so the AI knows what poster to create!');
      return;
    }
    setErrorMsg('');
    setIsGeneratingAi(true);

    const safeTitle = eventName.trim().replace(/[^a-zA-Z0-9 ]/g, ' ');
    const prompt = `${safeTitle}, ${selectedCategories.join(', ')} university campus event, artistic aesthetic poster, warm film photography, polaroid style, beautiful cinematic lighting`;
    const randomSeed = Math.floor(Math.random() * 1000000);
    const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=500&nologo=true&seed=${randomSeed}`;
    
    setEventImage(aiUrl);
    setTimeout(() => {
      setIsGeneratingAi(false);
    }, 700);
  };

  // Handle File Upload from device (Phone / Laptop)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 1200x800 to keep stored payload compact and lightning-fast
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setEventImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!eventName.trim()) {
      setErrorMsg('Event Name is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Event Description is required.');
      return;
    }
    if (!organizer.trim()) {
      setErrorMsg('Organizer name is required.');
      return;
    }

    let timeStartEnd = `${timeStart} - ${timeEnd}`;
    if (isTentative) {
      timeStartEnd = tentativeNote ? `${timeStartEnd} (${tentativeNote})` : `${timeStartEnd} (Tentative)`;
    }

    const deadlineString = registrationDeadlineDate 
      ? `${registrationDeadlineDate} ${registrationDeadlineTime}`.trim()
      : undefined;

    let eligibilityWithFlag = requirementsEligibility.trim();
    if (isTentative && !eligibilityWithFlag.includes('[TENTATIVE]')) {
      eligibilityWithFlag = `${eligibilityWithFlag} [TENTATIVE]`.trim();
    }

    const fallbackImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80';

    if (selectedCategories.length === 0) {
      setErrorMsg('Please select at least one category.');
      return;
    }

    const primaryCategory = selectedCategories[0];
    const categoryString = selectedCategories.join(', ');

    if (eventToEdit) {
      // UPDATE EXISTING EVENT
      updateEvent(eventToEdit.id, {
        event_name: eventName.trim(),
        category: categoryString,
        categories: selectedCategories,
        date,
        time_start_end: timeStartEnd,
        time_start: timeStart,
        time_end: timeEnd,
        venue_zone: venueZone,
        room_specific: roomSpecific.trim() || undefined,
        organizer: organizer.trim(),
        description: description.trim(),
        registration_deadline: deadlineString,
        registration_link: registrationLink.trim() || undefined,
        requirements_eligibility: eligibilityWithFlag || undefined,
        event_image: eventImage.trim() || fallbackImage,
        status: isTentative && status === 'Upcoming' ? 'Upcoming' : status,
        is_tentative: isTentative,
        tentative_note: tentativeNote.trim() || undefined,
        registration_fee: registrationFee.trim() || undefined,
      });
    } else {
      // RATE LIMIT CHECK FOR NEW EVENTS
      const rateLimitCheck = checkUserPostLimit(user?.flame_email);
      if (!rateLimitCheck.allowed) {
        setSubmitError(rateLimitCheck.reason || 'Hourly posting limit reached.');
        return;
      }

      // CREATE NEW EVENT
      const res = createEvent({
        event_name: eventName.trim(),
        category: categoryString,
        categories: selectedCategories,
        date,
        time_start_end: timeStartEnd,
        time_start: timeStart,
        time_end: timeEnd,
        venue_zone: venueZone,
        room_specific: roomSpecific.trim() || undefined,
        organizer: organizer.trim(),
        description: description.trim(),
        registration_deadline: deadlineString,
        registration_link: registrationLink.trim() || undefined,
        requirements_eligibility: eligibilityWithFlag || undefined,
        event_image: eventImage.trim() || fallbackImage,
        status: isTentative && status === 'Upcoming' ? 'Upcoming' : status,
        is_tentative: isTentative,
        tentative_note: tentativeNote.trim() || undefined,
        registration_fee: registrationFee.trim() || undefined,
      });

      if (res && !res.success) {
        setSubmitError(res.error || 'Failed to publish event.');
        return;
      }
    }

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    closeCreateEvent();
  };

  const isEditing = Boolean(eventToEdit);
  const rateLimit = checkUserPostLimit(user?.flame_email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#fcfbf7] text-neutral-900 rounded-sm shadow-2xl border-4 border-[#e8dfc9] p-5 sm:p-8"
        style={{
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Washi tape header motif */}
        <div 
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#f3da90]/90 shadow-md backdrop-blur-xs rotate-[-1deg] pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        {/* Close Button */}
        <button
          onClick={closeCreateEvent}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs ${isEditing ? 'bg-amber-200 text-amber-900' : 'stamp-urgent'}`}>
              {isEditing ? '✏️ Edit Mode' : 'Student Bulletin'}
            </span>
            <span className="text-xs text-neutral-500 font-handwritten text-base">
              {isEditing ? 'update listing details' : 'post to campus'}
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
            {isEditing ? 'Edit Campus Event' : 'Submit a Campus Event'}
          </h2>
          <p className="text-xs text-neutral-600 font-sans-ui mt-0.5">
            {isEditing 
              ? 'Changes sync instantly to the main website and Supabase cloud for all students.'
              : 'Published events instantly appear on the discovery collage, planner, and interactive campus map.'}
          </p>

          {/* Rate Limit Banner */}
          {!isEditing && (
            <div className={`mt-3 px-3 py-2 rounded-xs border text-xs flex items-center justify-between ${
              rateLimit.isExempt
                ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                : !rateLimit.allowed
                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {rateLimit.isExempt ? '👑' : !rateLimit.allowed ? '⛔' : '⚡'}
                </span>
                <span>
                  {rateLimit.isExempt 
                    ? 'Organizer / Admin Access • Unlimited posting allowed' 
                    : !rateLimit.allowed
                      ? rateLimit.reason
                      : `Hourly quota: ${rateLimit.count} of 2 events created in the last hour`}
                </span>
              </div>
              {!rateLimit.isExempt && (
                <span className="text-[10px] font-mono opacity-75">
                  {rateLimit.allowed ? `${2 - rateLimit.count} slots left` : `Resets in ~${rateLimit.minutesLeft}m`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SMART PASTE / AUTO-FILL CARD */}
        {!isEditing && (
          <div className="mb-6 p-4 bg-gradient-to-r from-[#fdfbf6] via-[#faf5e8] to-[#f4eee0] border-2 border-dashed border-[#d4c5a5] rounded-sm shadow-xs font-sans-ui">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-amber-200/80 text-amber-900">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                    Smart Auto-Fill from Announcement
                  </h3>
                  <p className="text-[11px] text-neutral-600">
                    Paste an email or club notice — title, date, time, fee, links & details will auto-fill!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasteSectionOpen(!isPasteSectionOpen)}
                className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold underline"
              >
                {isPasteSectionOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {isPasteSectionOpen && (
              <div className="mt-3 space-y-2.5 animate-fade-in">
                <textarea
                  rows={4}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder="Paste email announcement or message here... (e.g. 'From: The Anime Club... Bunkasai on 23rd October 6:00 pm to 11:00 pm at Plaza... Price: Rs. 3540... Form: https://forms.gle/...')"
                  className="w-full p-2.5 bg-white border border-[#d6cbb0] rounded text-xs text-neutral-900 placeholder:text-neutral-400 font-sans-ui focus:outline-none focus:border-[#c93b2b]"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleSmartAutoFill}
                    disabled={!rawPasteText.trim()}
                    className="px-4 py-2 bg-[#c93b2b] hover:bg-[#b02e20] disabled:bg-neutral-300 disabled:text-neutral-500 text-white font-bold text-xs rounded shadow-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto-Fill Form</span>
                  </button>

                  {rawPasteText.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setRawPasteText('');
                        setParseResults(null);
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-800 underline"
                    >
                      Clear Text
                    </button>
                  )}
                </div>

                {/* Auto-fill field status breakdown */}
                {parseResults && (
                  <div className="mt-3 p-3 bg-white/95 border border-[#c9bfa7] rounded text-xs space-y-2 animate-fade-in shadow-2xs">
                    <div className="flex items-center justify-between border-b border-neutral-200/80 pb-1.5">
                      <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Auto-Fill Summary:</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {parseResults.filledCount} fields populated
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] pt-1">
                      {parseResults.statuses.map((st, i) => (
                        <div key={i} className="flex items-start gap-1.5 leading-snug">
                          {st.success ? (
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          ) : (
                            <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                          )}
                          <span className={st.success ? 'text-neutral-800' : 'text-amber-900 font-medium'}>
                            <strong className="text-neutral-700">{st.label}:</strong> {st.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans-ui text-sm">
          
          {/* 1. Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Event Title <span className="text-[#c93b2b]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Midnight Acoustic Jam or AI Prompt Battle"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d6cbb0] rounded-sm text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#c93b2b]"
              required
            />
          </div>

          {/* Categories: Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Categories <span className="text-[#c93b2b]">*</span>{' '}
                <span className="text-[11px] font-normal normal-case text-neutral-500">(choose all that apply)</span>
              </label>
              <span className="text-[11px] text-neutral-500 font-medium">
                {selectedCategories.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-[#fdfaf5] border border-[#d6cbb0] rounded-sm">
              {EVENT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategorySelection(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#c93b2b] text-white shadow-sm ring-1 ring-[#a82a1c]'
                        : 'bg-white text-neutral-700 border border-[#d6cbb0] hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected ? (
                      <span className="text-[11px] font-bold">✓</span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Date <span className="text-[#c93b2b]">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
                required
              />
            </div>
          </div>

          {/* 2b. Tentative Date / Schedule Flag */}
          <div className="p-3 bg-[#f6f2e6] border border-[#ded3bb] rounded-sm">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isTentative}
                onChange={(e) => setIsTentative(e.target.checked)}
                className="w-4 h-4 text-[#c93b2b] rounded border-neutral-300 focus:ring-[#c93b2b]"
              />
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                <span>🗓️ Date or Time is Tentative (TBD)</span>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-semibold px-2 py-0.5 rounded-full">
                  Subject to confirmation
                </span>
              </span>
            </label>

            {isTentative && (
              <div className="mt-2.5 pl-6 space-y-1.5 animate-fade-in">
                <input
                  type="text"
                  placeholder="e.g. Tentative: Late October or awaiting final slot approval"
                  value={tentativeNote}
                  onChange={(e) => setTentativeNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-800 placeholder:text-neutral-400"
                />
                <p className="text-[11px] text-neutral-500 font-sans-ui">
                  Highlights a warm <strong>&ldquo;Tentative Date&rdquo;</strong> sticker on the Polaroid cards so students know schedule details may shift.
                </p>
              </div>
            )}
          </div>

          {/* 3. Venue Zone & Specific Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Campus Zone <span className="text-[#c93b2b]">*</span>
              </label>
              <select
                value={venueZone}
                onChange={(e) => {
                  setVenueZone(e.target.value as VenueZone);
                  setRoomSpecific('');
                }}
                className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
              >
                {VENUE_ZONES.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Specific Room / Spot
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomRoom(!isCustomRoom)}
                  className="text-[11px] text-[#c93b2b] hover:underline font-semibold"
                >
                  {isCustomRoom ? 'Choose from list' : '+ Custom room'}
                </button>
              </div>

              {!isCustomRoom ? (
                <select
                  value={roomSpecific}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomRoom(true);
                      setRoomSpecific('');
                    } else {
                      setRoomSpecific(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 focus:outline-none focus:border-[#c93b2b]"
                >
                  <option value="">-- Select Specific Room / Area --</option>
                  {VENUE_LOCATIONS_MAP[venueZone]?.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="__custom__">✏️ Type another custom room...</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Kalidas Centre 304 or Amphitheatre Lawn"
                  value={roomSpecific}
                  onChange={(e) => setRoomSpecific(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 focus:outline-none focus:border-[#c93b2b]"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* 4. Organizer & Eligibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Organizer / Student Club <span className="text-[#c93b2b]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Student Council or Media Collective"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Cohort / Eligibility
              </label>
              <select
                value={requirementsEligibility}
                onChange={(e) => setRequirementsEligibility(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs font-semibold text-neutral-900 focus:outline-none focus:border-amber-500"
              >
                {!COHORT_OPTIONS.includes(requirementsEligibility) && requirementsEligibility && (
                  <option value={requirementsEligibility}>
                    {requirementsEligibility}
                  </option>
                )}
                {COHORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Description <span className="text-[#c93b2b]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="What makes this event exciting? Add instructions, vibe, gear to bring, or what to expect."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs sm:text-sm text-neutral-900 font-sans-ui"
              required
            />
          </div>

          {/* 6. Registration Deadline & External Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                Registration Deadline (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={registrationDeadlineDate}
                  onChange={(e) => setRegistrationDeadlineDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
                />
                <input
                  type="time"
                  value={registrationDeadlineTime}
                  onChange={(e) => setRegistrationDeadlineTime(e.target.value)}
                  className="w-28 px-2 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
                />
              </div>
              <p className="text-[10px] text-amber-800 mt-1">
                Triggers high-priority red stamp and notification radar
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                External RSVP / Google Form Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://forms.google.com/your-form"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
              />
              <p className="text-[10px] text-amber-800 mt-1">
                Direct link to Google Form / RSVP website
              </p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-amber-200/60">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                Registration Fee / Stall Price (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Free, or ₹200 (₹300 on-spot), or ₹3,540 (Business Stall)"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 placeholder:text-neutral-400"
              />
              <p className="text-[10px] text-amber-800 mt-1">
                Displays a prominent ticket/price badge on the event card (e.g. &ldquo;₹200&rdquo; or &ldquo;Free&rdquo;).
              </p>
            </div>
          </div>

          {/* 7. Image Studio: AI Generator, File Upload, Presets & URL */}
          <div className="p-3.5 bg-white border-2 border-[#e4d9c4] rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Event Poster / Visual Photo
              </label>
              {eventImage && (
                <button
                  type="button"
                  onClick={() => setEventImage('')}
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#f4eee0] rounded-sm border border-[#ded3bb]">
              <button
                type="button"
                onClick={() => setImageTab('ai')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 ${
                  imageTab === 'ai' 
                    ? 'bg-[#1c1917] text-amber-200 shadow-xs' 
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Poster Generator</span>
              </button>

              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 ${
                  imageTab === 'upload' 
                    ? 'bg-[#1c1917] text-amber-200 shadow-xs' 
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => setImageTab('preset')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 ${
                  imageTab === 'preset' 
                    ? 'bg-[#1c1917] text-amber-200 shadow-xs' 
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Aesthetic Presets</span>
              </button>

              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 ${
                  imageTab === 'url' 
                    ? 'bg-[#1c1917] text-amber-200 shadow-xs' 
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste Link</span>
              </button>
            </div>

            {/* TAB CONTENT 1: AI GENERATOR */}
            {imageTab === 'ai' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-sm space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#c93b2b]" />
                      <span>Generate AI Campus Poster</span>
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Creates an artistic film-photography poster tailored to &ldquo;{eventName || 'your event title'}&rdquo;.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiPoster}
                    disabled={isGeneratingAi}
                    className="px-3.5 py-2 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 text-xs font-bold rounded shadow-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 disabled:opacity-60"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{eventImage ? 'Regenerate Variation' : 'Generate Poster'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: FILE UPLOAD */}
            {imageTab === 'upload' && (
              <div className="p-4 bg-[#fcfaf4] border-2 border-dashed border-[#d6cbb0] rounded-sm text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-neutral-800">
                  Select an image from your laptop or phone
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Supports JPG, PNG, and WebP (auto-optimized for fast loading)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-100 text-xs font-semibold rounded shadow-sm"
                >
                  Choose Image File
                </button>
              </div>
            )}

            {/* TAB CONTENT 3: PRESETS */}
            {imageTab === 'preset' && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-neutral-600">
                  Click a campus aesthetic preset to instantly apply high-res photography:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CURATED_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setEventImage(preset.url)}
                      className={`p-2 border rounded text-xs font-medium text-left transition-all flex items-center gap-1.5 ${
                        eventImage === preset.url
                          ? 'border-[#c93b2b] bg-red-50 text-[#c93b2b] font-bold'
                          : 'border-[#dfd5c0] bg-white hover:bg-[#faf6ee] text-neutral-800'
                      }`}
                    >
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: URL */}
            {imageTab === 'url' && (
              <div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste image link"
                  value={eventImage}
                  onChange={(e) => setEventImage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
                />
              </div>
            )}

            {/* LIVE POLAROID IMAGE PREVIEW */}
            {eventImage && (
              <div className="relative mt-2 p-2 bg-[#f4eee0] border border-[#ded3bb] rounded-sm flex items-center gap-3">
                <div className="relative w-24 h-16 rounded overflow-hidden border border-neutral-300 shadow-sm shrink-0 bg-neutral-200">
                  <img
                    src={eventImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setErrorMsg('Failed to load image preview. Please try another image or generate with AI.')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Poster Attached</span>
                  </p>
                  <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                    {eventImage.startsWith('data:') ? 'Custom uploaded image (Ready)' : eventImage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 8. Status Selector (When Editing) */}
          {isEditing && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Event Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-sm text-xs font-semibold text-neutral-900"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Registration Closed">Registration Closed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed / Event Closed</option>
              </select>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#e2d5bd] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateEvent}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isEditing && !rateLimit.allowed}
              className="px-6 py-2.5 bg-[#c93b2b] hover:bg-[#b02e20] disabled:bg-neutral-400 disabled:cursor-not-allowed text-amber-100 text-xs sm:text-sm font-bold rounded-sm shadow-md transition-transform active:scale-95 flex items-center gap-2"
              title={!isEditing && !rateLimit.allowed ? rateLimit.reason : undefined}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isEditing 
                  ? 'Save Changes & Update Bulletin' 
                  : !rateLimit.allowed 
                    ? `Limit Reached (${rateLimit.count}/2/hr)` 
                    : 'Publish Event to Bulletin'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
