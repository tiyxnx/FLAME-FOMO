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
  Users, 
  CheckCircle2,
  Upload,
  Trash2,
  AlertCircle,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [pocName, setPocName] = useState('');
  const [pocNumber, setPocNumber] = useState('');
  const [description, setDescription] = useState('');
  const [registrationDeadlineDate, setRegistrationDeadlineDate] = useState('');
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState('23:59');
  const [registrationLink, setRegistrationLink] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [requirementsEligibility, setRequirementsEligibility] = useState('Open to All Students');
  const [eventImage, setEventImage] = useState('');
  const [status, setStatus] = useState<EventStatus>('Upcoming');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleCategorySelection = (cat: EventCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // Keep at least one selected
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

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
      setPocName(eventToEdit.poc_name || '');
      setPocNumber(eventToEdit.poc_number || '');
      setDescription(eventToEdit.description);
      setRegistrationLink(eventToEdit.registration_link || '');
      setRegistrationFee(eventToEdit.registration_fee || '');
      setRequirementsEligibility(
        (eventToEdit.requirements_eligibility || '')
          .replace('[TENTATIVE]', '')
          .replace(/\[FEE:\s*[^\]]+\]/g, '')
          .replace(/\[POC_NAME:\s*[^\]]+\]/g, '')
          .replace(/\[POC_NUMBER:\s*[^\]]+\]/g, '')
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
      setPocName('');
      setPocNumber('');
      setDescription('');
      setRegistrationDeadlineDate('');
      setRegistrationDeadlineTime('23:59');
      setRegistrationLink('');
      setRegistrationFee('');
      setRequirementsEligibility('Open to All Students');
      setEventImage('');
      setStatus('Upcoming');
      setIsCustomRoom(false);
    }
    setErrorMsg('');
  }, [eventToEdit, isCreateEventOpen, user]);

  if (!isCreateEventOpen) return null;

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
        poc_name: pocName.trim() || undefined,
        poc_number: pocNumber.trim() || undefined,
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
        poc_name: pocName.trim() || undefined,
        poc_number: pocNumber.trim() || undefined,
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

          {/* 4b. Person of Contact (POC) */}
          <div className="p-3 bg-[#fdfaf4] border border-[#d6cbb0] rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c93b2b]" />
                <span>Event POC (Person of Contact)</span>
                <span className="text-[11px] font-normal normal-case text-neutral-500">(Optional)</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-sans-ui">
                Person handling this event
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  POC Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tiyana Shah"
                  value={pocName}
                  onChange={(e) => setPocName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#c93b2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  POC Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={pocNumber}
                  onChange={(e) => setPocNumber(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#c93b2b]"
                />
              </div>
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

          {/* 7. Event Poster / Flyer (File Upload Only) */}
          <div className="p-3.5 bg-white border-2 border-[#e4d9c4] rounded-sm space-y-3 font-sans-ui">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Event Poster / Visual Photo
                </label>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Upload an image file from your device (phone or laptop)
                </p>
              </div>
              {eventImage && (
                <button
                  type="button"
                  onClick={() => setEventImage('')}
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!eventImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 bg-[#fcfaf4] hover:bg-[#faf4e6] border-2 border-dashed border-[#d6cbb0] hover:border-neutral-400 rounded-sm text-center cursor-pointer transition-all active:scale-[0.99] group"
              >
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-[#c93b2b] mx-auto mb-2 transition-colors" />
                <p className="text-xs font-bold text-neutral-800">
                  Click to select image file
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Supports JPG, PNG, and WebP (auto-optimized for fast campus loading)
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-100 text-xs font-semibold rounded shadow-xs transition-colors"
                >
                  Upload File
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#f8f5ee] border border-[#ded3bb] rounded-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-20 h-16 rounded overflow-hidden border border-neutral-300 shadow-xs shrink-0 bg-neutral-200">
                    <img
                      src={eventImage}
                      alt="Uploaded poster preview"
                      className="w-full h-full object-cover"
                      onError={() => setErrorMsg('Failed to load image preview. Please choose another file.')}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Image Uploaded</span>
                    </p>
                    <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                      Ready to display on the polaroid card
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-semibold rounded shadow-2xs shrink-0 transition-colors cursor-pointer"
                >
                  Change File
                </button>
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
