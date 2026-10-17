import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  EventCategory, 
  VenueZone, 
  EventStatus, 
  EventItem,
  CampusLocation
} from '@/types';
import { 
  EVENT_CATEGORIES, 
  VENUE_ZONES, 
  VENUE_LOCATIONS_MAP,
  ALL_COHORTS,
  UG_COHORTS,
  BDES_COHORTS,
  PG_COHORTS,
  MSC_COHORTS,
} from '@/lib/constants';
import { 
  ALL_CAMPUS_LOCATIONS, 
  OFFICIAL_CAMPUS_BUILDINGS,
  OfficialBuilding
} from '@/lib/campusLocations';
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
  Phone,
  Search,
  ChevronDown,
  Compass,
  Navigation,
  LocateFixed
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreateEventModal: React.FC = () => {
  const { 
    isCreateEventOpen, 
    closeCreateEvent, 
    createEvent, 
    checkUserPostLimit,
    updateEvent, 
    eventToEdit, 
    user,
    createEventInitialType,
    defaultOrganizerName,
    canCreateEvents,
  } = useApp();

  const [submitError, setSubmitError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [itemType, setItemType] = useState<'event' | 'application'>('event');
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

  // Searchable Campus Location & Custom Mapping
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedCampusLocId, setSelectedCampusLocId] = useState<string | null>(null);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [nearestLandmarkId, setNearestLandmarkId] = useState<string>('room-apj001');
  const [customMapPin, setCustomMapPin] = useState<{ x: number; y: number } | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [locationCategoryFilter, setLocationCategoryFilter] = useState<string>('All');
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const [organizer, setOrganizer] = useState('');
  const [pocName, setPocName] = useState('');
  const [pocNumber, setPocNumber] = useState('');
  const [hasInterview, setHasInterview] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState('');
  const [description, setDescription] = useState('');
  const [registrationDeadlineDate, setRegistrationDeadlineDate] = useState('');
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState('23:59');
  const [registrationLink, setRegistrationLink] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>(['All']);
  const [customEligibilityNote, setCustomEligibilityNote] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [status, setStatus] = useState<EventStatus>('Upcoming');
  const [errorMsg, setErrorMsg] = useState('');

  const isAllSelected = selectedCohorts.includes('All') || (ALL_COHORTS.length > 0 && ALL_COHORTS.every((c) => selectedCohorts.includes(c)));
  const isUGSelected = UG_COHORTS.every((c) => selectedCohorts.includes(c));
  const isBDesSelected = BDES_COHORTS.every((c) => selectedCohorts.includes(c));
  const isPGSelected = PG_COHORTS.every((c) => selectedCohorts.includes(c));
  const isMScSelected = MSC_COHORTS.every((c) => selectedCohorts.includes(c));

  const toggleAllCohorts = () => {
    if (isAllSelected) {
      setSelectedCohorts([]);
    } else {
      setSelectedCohorts(['All']);
    }
  };

  const toggleBundle = (bundle: readonly string[]) => {
    let current = isAllSelected ? [...ALL_COHORTS] : selectedCohorts.filter((c) => c !== 'All');
    const allInBundlePresent = bundle.every((c) => current.includes(c));

    let next: string[];
    if (allInBundlePresent) {
      next = current.filter((c) => !bundle.includes(c));
    } else {
      const toAdd = bundle.filter((c) => !current.includes(c));
      next = [...current, ...toAdd];
    }

    if (ALL_COHORTS.every((c) => next.includes(c))) {
      setSelectedCohorts(['All']);
    } else {
      setSelectedCohorts(next);
    }
  };

  const toggleSingleCohort = (cohort: string) => {
    let current = isAllSelected ? [...ALL_COHORTS] : selectedCohorts.filter((c) => c !== 'All');
    let next: string[];
    if (current.includes(cohort)) {
      next = current.filter((c) => c !== cohort);
    } else {
      next = [...current, cohort];
    }

    if (ALL_COHORTS.every((c) => next.includes(c))) {
      setSelectedCohorts(['All']);
    } else {
      setSelectedCohorts(next);
    }
  };

  const getFormattedEligibility = (): string => {
    let base = 'Open to All Students';
    if (!isAllSelected && selectedCohorts.length > 0) {
      const sorted = ALL_COHORTS.filter((c) => selectedCohorts.includes(c));
      base = sorted.join(', ');
    } else if (!isAllSelected && selectedCohorts.length === 0) {
      base = 'Open to All Students';
    }
    if (customEligibilityNote.trim()) {
      return `${base} (${customEligibilityNote.trim()})`;
    }
    return base;
  };

  const toggleCategorySelection = (cat: EventCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // Keep at least one selected
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Close location autocomplete when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered official campus locations for autocomplete
  const filteredCampusLocations = useMemo(() => {
    let list = ALL_CAMPUS_LOCATIONS;
    if (locationCategoryFilter !== 'All') {
      if (locationCategoryFilter === 'Academics') {
        list = list.filter((l) => l.officialCategory === 'Academics');
      } else if (locationCategoryFilter === 'Sports') {
        list = list.filter((l) => l.officialCategory === 'Sports');
      } else if (locationCategoryFilter === 'Eateries') {
        list = list.filter((l) => l.officialCategory === 'Eateries');
      } else if (locationCategoryFilter === 'Housing') {
        list = list.filter((l) => l.officialCategory === 'Housing');
      } else if (locationCategoryFilter === 'Flora & Fauna') {
        list = list.filter((l) => l.officialCategory === 'Flora & Fauna');
      } else if (locationCategoryFilter === 'Shantiniketan') {
        list = list.filter((l) => l.officialCategory === 'Shantiniketan' || l.officialCategory === 'Common Areas' || l.officialCategory === 'Recreational');
      }
    }

    if (!locationSearch.trim()) {
      return list.slice(0, 45);
    }

    const q = locationSearch.toLowerCase().trim();
    return list.filter((l) => 
      l.name.toLowerCase().includes(q) ||
      l.building.toLowerCase().includes(q) ||
      (l.insideBuilding || '').toLowerCase().includes(q) ||
      (l.officialNumber ? `#${l.officialNumber}`.includes(q) || `${l.officialNumber}` === q : false) ||
      l.zone.toLowerCase().includes(q) ||
      (l.officialCategory || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [locationSearch, locationCategoryFilter]);

  // Handlers for Location Selection & Custom Map Placement
  const handleSelectLocation = (loc: CampusLocation) => {
    setRoomSpecific(loc.name);
    setLocationSearch(loc.name);
    setVenueZone(loc.zone);
    setSelectedCampusLocId(loc.id);
    setIsCustomLocation(false);
    setCustomMapPin(null);
    setIsLocationDropdownOpen(false);
  };

  const handleEnableCustomLocation = (customName?: string) => {
    const nameToUse = (customName !== undefined ? customName : locationSearch).trim();
    setIsCustomLocation(true);
    setRoomSpecific(nameToUse);
    setLocationSearch(nameToUse);
    setIsLocationDropdownOpen(false);
    if (!nearestLandmarkId) {
      setNearestLandmarkId('room-apj001');
    }
  };

  const handleNearestLandmarkChange = (locId: string) => {
    setNearestLandmarkId(locId);
    const matched = ALL_CAMPUS_LOCATIONS.find((l) => l.id === locId);
    if (matched) {
      setVenueZone(matched.zone);
      if (!customMapPin) {
        setCustomMapPin({ x: matched.x, y: matched.y });
      }
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    const roundedX = +(clickX.toFixed(1));
    const roundedY = +(clickY.toFixed(1));
    setCustomMapPin({ x: roundedX, y: roundedY });

    // Find nearest building
    let closestBldg = OFFICIAL_CAMPUS_BUILDINGS[0];
    let minDist = 999999;
    OFFICIAL_CAMPUS_BUILDINGS.forEach((b) => {
      const d = Math.hypot(b.x - roundedX, b.y - roundedY);
      if (d < minDist) {
        minDist = d;
        closestBldg = b;
      }
    });

    if (closestBldg) {
      const matchLoc = ALL_CAMPUS_LOCATIONS.find((l) => l.officialNumber === closestBldg.number) || ALL_CAMPUS_LOCATIONS[0];
      setNearestLandmarkId(matchLoc.id);
      if (closestBldg.category === 'Sports') setVenueZone('Sports');
      else if (closestBldg.category === 'Eateries') setVenueZone('Eateries');
      else if (closestBldg.category === 'Flora & Fauna') setVenueZone('Flora & Fauna');
      else if (closestBldg.category === 'Academics') setVenueZone('Academics');
      else setVenueZone('Shantiniketan/Recreational');
    }
  };

  // Pre-fill when editing or initialize fresh
  useEffect(() => {
    if (!isCreateEventOpen) return;

    if (eventToEdit) {
      setItemType(eventToEdit.item_type || 'event');
      setHasInterview(Boolean(eventToEdit.has_interview || eventToEdit.interview_details || eventToEdit.requirements_eligibility?.includes('[HAS_INTERVIEW]')));
      setInterviewDetails(
        eventToEdit.interview_details || 
        eventToEdit.requirements_eligibility?.match(/\[INTERVIEW:\s*([^\]]+)\]/)?.[1] || 
        ''
      );
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
      setLocationSearch(eventToEdit.room_specific || '');

      const pinMatch = (eventToEdit.requirements_eligibility || '').match(/\[MAP_PIN:\s*([\d.]+),\s*([\d.]+)\]/);
      if (pinMatch) {
        setCustomMapPin({ x: parseFloat(pinMatch[1]), y: parseFloat(pinMatch[2]) });
        setIsCustomLocation(true);
      } else {
        setCustomMapPin(null);
      }

      const nearMatch = (eventToEdit.requirements_eligibility || '').match(/\[NEAREST_LOC:\s*([^\]]+)\]/);
      if (nearMatch) {
        setNearestLandmarkId(nearMatch[1].trim());
        setIsCustomLocation(true);
      } else {
        setNearestLandmarkId('room-apj001');
      }

      if (!pinMatch && !nearMatch) {
        const found = ALL_CAMPUS_LOCATIONS.find(
          (l) => l.name.toLowerCase() === (eventToEdit.room_specific || '').toLowerCase()
        );
        if (found) {
          setSelectedCampusLocId(found.id);
          setIsCustomLocation(false);
        } else if (eventToEdit.room_specific) {
          setIsCustomLocation(true);
        } else {
          setIsCustomLocation(false);
          setSelectedCampusLocId(null);
        }
      }

      setOrganizer(eventToEdit.organizer);
      setPocName(eventToEdit.poc_name || '');
      setPocNumber(eventToEdit.poc_number || '');
      setDescription(eventToEdit.description);
      setRegistrationLink(eventToEdit.registration_link || '');
      const cleanReq = (eventToEdit.requirements_eligibility || '')
        .replace('[TENTATIVE]', '')
        .replace(/\[FEE:\s*[^\]]+\]/g, '')
        .replace(/\[POC_NAME:\s*[^\]]+\]/g, '')
        .replace(/\[POC_NUMBER:\s*[^\]]+\]/g, '')
        .replace(/\[MAP_PIN:\s*[^\]]+\]/g, '')
        .replace(/\[NEAREST_LOC:\s*[^\]]+\]/g, '')
        .replace(/\[TYPE:\s*[^\]]+\]/g, '')
        .replace(/\[INTERVIEW:\s*[^\]]+\]/g, '')
        .replace(/\[HAS_INTERVIEW\]/g, '')
        .trim();

      if (!cleanReq || cleanReq.toLowerCase().includes('open to all') || cleanReq.toLowerCase() === 'all') {
        setSelectedCohorts(['All']);
        setCustomEligibilityNote('');
      } else if (cleanReq.toLowerCase().includes('ug only')) {
        setSelectedCohorts([...UG_COHORTS]);
        setCustomEligibilityNote('');
      } else if (cleanReq.toLowerCase().includes('pg only')) {
        setSelectedCohorts([...PG_COHORTS]);
        setCustomEligibilityNote('');
      } else {
        const found = ALL_COHORTS.filter((c) => 
          new RegExp(`\\b${c.replace(' ', '\\s*')}\\b`, 'i').test(cleanReq) ||
          cleanReq.toLowerCase().includes(c.toLowerCase())
        );
        if (found.length > 0) {
          setSelectedCohorts(found);
          const noteMatch = cleanReq.match(/\(([^)]+)\)/);
          setCustomEligibilityNote(noteMatch ? noteMatch[1].trim() : '');
        } else {
          setSelectedCohorts(['All']);
          setCustomEligibilityNote(cleanReq);
        }
      }
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
      // Default new item
      setItemType(createEventInitialType || 'event');
      setHasInterview(false);
      setInterviewDetails('');
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
      setLocationSearch('');
      setSelectedCampusLocId(null);
      setIsCustomLocation(false);
      setNearestLandmarkId('room-apj001');
      setCustomMapPin(null);
      setIsMapPickerOpen(false);
      setLocationCategoryFilter('All');
      setOrganizer(defaultOrganizerName || (user?.name ? `${user.name} / Student Org` : 'FLAME Student Initiative'));
      setPocName('');
      setPocNumber('');
      setDescription('');
      setRegistrationDeadlineDate('');
      setRegistrationDeadlineTime('23:59');
      setRegistrationLink('');
      setRegistrationFee('');
      setSelectedCohorts(['All']);
      setCustomEligibilityNote('');
      setEventImage('');
      setStatus('Upcoming');
      setIsCustomRoom(false);
    }
    setErrorMsg('');
  }, [eventToEdit, isCreateEventOpen, user, createEventInitialType, defaultOrganizerName]);

  if (!isCreateEventOpen || !canCreateEvents) return null;

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

    if (!roomSpecific.trim() && !locationSearch.trim()) {
      setErrorMsg('Please choose or specify an event location.');
      return;
    }

    const finalRoomSpecific = isCustomLocation 
      ? (roomSpecific.trim() || locationSearch.trim() || 'Custom Campus Location')
      : (roomSpecific.trim() || locationSearch.trim());

    let timeStartEnd = `${timeStart} - ${timeEnd}`;
    if (isTentative) {
      timeStartEnd = tentativeNote ? `${timeStartEnd} (${tentativeNote})` : `${timeStartEnd} (Tentative)`;
    }

    const deadlineString = registrationDeadlineDate 
      ? `${registrationDeadlineDate} ${registrationDeadlineTime}`.trim()
      : undefined;

    const formattedEligibility = getFormattedEligibility();
    let eligibilityWithFlag = formattedEligibility.trim();
    if (isTentative && !eligibilityWithFlag.includes('[TENTATIVE]')) {
      eligibilityWithFlag = `${eligibilityWithFlag} [TENTATIVE]`.trim();
    }

    if (isCustomLocation) {
      if (customMapPin) {
        eligibilityWithFlag = `${eligibilityWithFlag} [MAP_PIN: ${customMapPin.x.toFixed(1)}, ${customMapPin.y.toFixed(1)}]`.trim();
      }
      if (nearestLandmarkId) {
        eligibilityWithFlag = `${eligibilityWithFlag} [NEAREST_LOC: ${nearestLandmarkId}]`.trim();
      }
    }

    const fallbackImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80';

    if (selectedCategories.length === 0) {
      setErrorMsg('Please select at least one category.');
      return;
    }

    const primaryCategory = selectedCategories[0];
    const categoryString = selectedCategories.join(', ');

    if (eventToEdit) {
      // UPDATE EXISTING EVENT OR APPLICATION
      updateEvent(eventToEdit.id, {
        item_type: itemType,
        has_interview: itemType === 'application' ? hasInterview : false,
        interview_details: itemType === 'application' && hasInterview ? interviewDetails.trim() : undefined,
        event_name: eventName.trim(),
        category: categoryString,
        categories: selectedCategories,
        date,
        time_start_end: timeStartEnd,
        time_start: timeStart,
        time_end: timeEnd,
        venue_zone: venueZone,
        room_specific: finalRoomSpecific,
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
      // RATE LIMIT CHECK FOR NEW POSTS
      const rateLimitCheck = checkUserPostLimit(user?.flame_email);
      if (!rateLimitCheck.allowed) {
        setSubmitError(rateLimitCheck.reason || 'Hourly posting limit reached.');
        return;
      }

      // CREATE NEW EVENT OR APPLICATION
      const res = createEvent({
        item_type: itemType,
        has_interview: itemType === 'application' ? hasInterview : false,
        interview_details: itemType === 'application' && hasInterview ? interviewDetails.trim() : undefined,
        event_name: eventName.trim(),
        category: categoryString,
        categories: selectedCategories,
        date,
        time_start_end: timeStartEnd,
        time_start: timeStart,
        time_end: timeEnd,
        venue_zone: venueZone,
        room_specific: finalRoomSpecific,
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
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs ${
              isEditing 
                ? 'bg-amber-200 text-amber-900' 
                : itemType === 'application' 
                  ? 'bg-purple-200 text-purple-900 font-bold' 
                  : 'stamp-urgent'
            }`}>
              {isEditing 
                ? '✏️ Edit Mode' 
                : itemType === 'application' 
                  ? '📋 Club Recruitment' 
                  : 'Student Bulletin'}
            </span>
            <span className="text-xs text-neutral-500 font-handwritten text-base">
              {isEditing 
                ? 'update listing details' 
                : itemType === 'application' 
                  ? 'open membership calls' 
                  : 'post to campus'}
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
            {isEditing 
              ? (itemType === 'application' ? 'Edit Application' : 'Edit Campus Event') 
              : (itemType === 'application' ? 'Post Member / Committee Application' : 'Submit a Campus Event')}
          </h2>
          <p className="text-xs text-neutral-600 font-sans-ui mt-0.5">
            {itemType === 'application'
              ? 'Recruiting new members, core committee, or auditioning? Applications appear in the Applications tab with strict deadlines.'
              : 'Published events instantly appear on the discovery collage, planner, and interactive campus map.'}
          </p>

          {/* Type Toggle: Campus Event vs Member / Core Committee Application */}
          {!isEditing && (
            <div className="mt-3 grid grid-cols-2 gap-2 p-1 bg-[#ede6d3] rounded-md border border-[#d6cbb0]">
              <button
                type="button"
                onClick={() => setItemType('event')}
                className={`py-2 px-3 text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all ${
                  itemType === 'event'
                    ? 'bg-[#c93b2b] text-white shadow-sm ring-1 ring-[#b02e20]'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                <span>🎟️ Campus Event</span>
              </button>
              <button
                type="button"
                onClick={() => setItemType('application')}
                className={`py-2 px-3 text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all ${
                  itemType === 'application'
                    ? 'bg-[#1e1b17] text-amber-200 shadow-sm ring-1 ring-amber-400/40'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                <span>📋 Member / Committee App</span>
              </button>
            </div>
          )}

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
                      : `Hourly quota: ${rateLimit.count} of 2 ${itemType === 'application' ? 'applications' : 'events'} created in the last hour`}
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
              {itemType === 'application' ? 'Application / Role Title' : 'Event Title'} <span className="text-[#c93b2b]">*</span>
            </label>
            <input
              type="text"
              placeholder={itemType === 'application' ? "e.g. Core Committee 2026-27 Recruitment or Acting Auditions" : "e.g. Midnight Acoustic Jam or AI Prompt Battle"}
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

          {/* 3. Authoritative Campus Location & Custom Spot Mapping */}
          <div className="p-3 bg-[#f7f3e8] border border-[#d6cbb0] rounded-sm space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#c93b2b]" />
                  <span>Campus Location / Room</span>
                  <span className="text-[#c93b2b]">*</span>
                </label>
                
                {!isCustomLocation ? (
                  <button
                    type="button"
                    onClick={() => handleEnableCustomLocation()}
                    className="text-[11px] text-[#c93b2b] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>+ Custom / Unlisted Spot</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomLocation(false);
                      setCustomMapPin(null);
                      setLocationSearch('');
                      setRoomSpecific('');
                      setSelectedCampusLocId(null);
                    }}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 underline font-medium"
                  >
                    Choose from Campus List
                  </button>
                )}
              </div>

              {/* Location Search Bar / Autocomplete Input */}
              <div className="relative" ref={locationDropdownRef}>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setIsLocationDropdownOpen(true);
                      if (isCustomLocation) {
                        setRoomSpecific(e.target.value);
                      }
                    }}
                    onFocus={() => setIsLocationDropdownOpen(true)}
                    placeholder={
                      isCustomLocation 
                        ? "Type custom location name (e.g. Amphitheatre Lawn, Breezeway)..."
                        : "Search all rooms (APJ001, CC101), cafes (Juice Press), hostels (Block L–S)..."
                    }
                    className="w-full pl-9 pr-8 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 focus:outline-none focus:border-[#c93b2b] font-sans-ui placeholder:text-neutral-400"
                    required
                  />
                  {locationSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationSearch('');
                        setRoomSpecific('');
                        setSelectedCampusLocId(null);
                        setIsLocationDropdownOpen(true);
                      }}
                      className="absolute right-2.5 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Quick Filter Pills */}
                {!isCustomLocation && (
                  <div className="flex items-center gap-1 overflow-x-auto pt-1.5 pb-0.5 text-[10px]">
                    <span className="text-neutral-500 font-medium shrink-0">Filter:</span>
                    {[
                      { id: 'All', label: 'All Venues' },
                      { id: 'Academics', label: '🏛️ Academics' },
                      { id: 'Sports', label: '🏆 Sports' },
                      { id: 'Eateries', label: '🍽️ Eateries' },
                      { id: 'Housing', label: '🏠 Housing (L–S)' },
                      { id: 'Flora & Fauna', label: '🌳 Gardens' },
                      { id: 'Shantiniketan', label: '🎭 Shantiniketan' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setLocationCategoryFilter(cat.id);
                          setIsLocationDropdownOpen(true);
                        }}
                        className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                          locationCategoryFilter === cat.id
                            ? 'bg-[#c93b2b] text-white font-bold'
                            : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-[#ded3bb]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Autocomplete Suggestions Dropdown */}
                {isLocationDropdownOpen && !isCustomLocation && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-white border border-[#c9bfa7] rounded-sm shadow-xl z-50 divide-y divide-neutral-100 animate-fade-in">
                    {filteredCampusLocations.map((loc) => {
                      const isSelected = selectedCampusLocId === loc.id || roomSpecific === loc.name;
                      return (
                        <button
                          key={`sugg-${loc.id}`}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors hover:bg-amber-50/70 ${
                            isSelected ? 'bg-amber-100/60 font-semibold' : ''
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900 truncate">
                                {loc.name}
                              </span>
                              {loc.officialNumber && (
                                <span className="text-[10px] font-mono px-1 rounded bg-neutral-200 text-neutral-700 font-bold shrink-0">
                                  #{loc.officialNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate">
                              {loc.building} {loc.floor ? `· ${loc.floor}` : ''}
                            </div>
                          </div>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 shrink-0 border border-neutral-200">
                            {loc.officialCategory}
                          </span>
                        </button>
                      );
                    })}

                    {/* Option to create custom location with typed text */}
                    {locationSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => handleEnableCustomLocation(locationSearch)}
                        className="w-full text-left px-3 py-2.5 bg-amber-50 hover:bg-amber-100/80 text-xs font-bold text-[#b43224] flex items-center gap-1.5 transition-colors"
                      >
                        <span>✨ Use custom location: &ldquo;{locationSearch}&rdquo;</span>
                      </button>
                    )}

                    {filteredCampusLocations.length === 0 && !locationSearch.trim() && (
                      <div className="p-3 text-center text-xs text-neutral-500">
                        No matching locations found.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Official Location Badge */}
              {!isCustomLocation && roomSpecific && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-300 rounded-sm flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-emerald-950 truncate block">
                        {roomSpecific}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        Zone: {venueZone} · Linked to Master Campus Map
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationSearch('');
                      setRoomSpecific('');
                      setSelectedCampusLocId(null);
                      setIsLocationDropdownOpen(true);
                    }}
                    className="text-[10px] text-emerald-800 hover:underline font-bold shrink-0 px-2 py-0.5"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* CUSTOM LOCATION: PROMPT FOR NEAREST SPOT OR PIN ON MAP */}
            {isCustomLocation && (
              <div className="p-3 bg-[#1d1914] text-[#f7f2e7] rounded-sm border-2 border-amber-500/70 shadow-md space-y-3 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-extrabold text-amber-300">
                        Custom Location: &ldquo;{roomSpecific || locationSearch || 'Custom Spot'}&rdquo;
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-1.5 py-0.2 rounded border border-amber-400/30">
                      Wayfinding Setup
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c9bfa7] mt-1 leading-snug">
                    Where is this on campus? Select the nearest landmark or tap the map to place your pin so attendees know how to get there.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                  {/* Nearest Landmark */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-200 mb-1">
                      Nearest Landmark / Building <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={nearestLandmarkId}
                      onChange={(e) => handleNearestLandmarkChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#12100d] border border-[#4a3f31] rounded-sm text-xs text-[#fbf7ee] focus:outline-none focus:border-amber-400 font-sans-ui"
                    >
                      <optgroup label="West Housing Residences (Blocks L to S)">
                        <option value="other-west-housing">🏠 West Housing (Blocks L–S)</option>
                        <option value="housing-west-block-l">🏠 West Housing - Block L</option>
                        <option value="housing-west-block-m">🏠 West Housing - Block M</option>
                        <option value="housing-west-block-n">🏠 West Housing - Block N</option>
                        <option value="housing-west-block-o">🏠 West Housing - Block O</option>
                        <option value="housing-west-block-p">🏠 West Housing - Block P</option>
                        <option value="housing-west-block-q">🏠 West Housing - Block Q</option>
                        <option value="housing-west-block-r">🏠 West Housing - Block R</option>
                        <option value="housing-west-block-s">🏠 West Housing - Block S</option>
                      </optgroup>
                      <optgroup label="Popular Academic & Eatery Spots">
                        <option value="room-apj001">🏛️ APJ Abdul Kalam (#2)</option>
                        <option value="other-vivekananda-library">📚 Vivekananda Library (#3)</option>
                        <option value="other-aahar">🍽️ Aahar Dining Hall (#25)</option>
                        <option value="hall-shantiniketan-auditorium">🎭 Shantiniketan Auditorium (#49)</option>
                        <option value="other-juice-press">🥤 Juice Press (#28)</option>
                        <option value="other-hashtag">🥐 Hashtag Cafe (#29)</option>
                        <option value="other-charlies">☕ Charlies Cafe (#33 in APJ)</option>
                        <option value="sports-arjuna-complex-main">🏆 Arjuna Sports Complex (#18)</option>
                        <option value="other-flame-plaza">🏛️ FLAME Plaza (#43)</option>
                      </optgroup>
                      <optgroup label="All Campus Locations">
                        {ALL_CAMPUS_LOCATIONS.map((loc) => (
                          <option key={`custom-near-${loc.id}`} value={loc.id}>
                            {loc.name} {loc.officialNumber ? `(#${loc.officialNumber})` : ''} · {loc.building}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Pin on Map Button */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-200 mb-1">
                      Visual Map Placement
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(!isMapPickerOpen)}
                      className={`w-full px-2.5 py-2 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        customMapPin
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-[#261f17] hover:bg-[#332a1f] text-amber-300 border-amber-500/50'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{customMapPin ? `✓ Pinned on Map (${customMapPin.x}%, ${customMapPin.y}%)` : '🗺️ Put it on the Map'}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Visual Map Pin Dropper */}
                {isMapPickerOpen && (
                  <div className="pt-2 border-t border-[#3d3324] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-amber-200">
                        👇 Click anywhere on the campus map to drop your event pin:
                      </span>
                      {customMapPin && (
                        <button
                          type="button"
                          onClick={() => setCustomMapPin(null)}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Clear Pin
                        </button>
                      )}
                    </div>

                    <div 
                      onClick={handleMapClick}
                      className="relative w-full aspect-[16/10] bg-[#12100d] rounded-lg overflow-hidden border-2 border-amber-500/60 cursor-crosshair shadow-2xl"
                    >
                      <img
                        src="/campus-map-illustrated.jpg"
                        alt="FLAME Campus Pin Dropper"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />

                      {/* Reference Building Dots */}
                      {OFFICIAL_CAMPUS_BUILDINGS.map((b) => (
                        <div
                          key={`pin-ref-${b.number}`}
                          style={{
                            position: 'absolute',
                            left: `${b.x}%`,
                            top: `${b.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          className="w-2 h-2 rounded-full bg-white/40 pointer-events-none"
                        />
                      ))}

                      {/* Placed Custom Pin */}
                      {customMapPin && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${customMapPin.x}%`,
                            top: `${customMapPin.y}%`,
                            transform: 'translate(-50%, -100%)',
                          }}
                          className="z-30 pointer-events-none animate-bounce"
                        >
                          <div className="flex flex-col items-center">
                            <div className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] rounded shadow-2xl whitespace-nowrap border border-white">
                              📍 {roomSpecific || locationSearch || 'Event Spot'}
                            </div>
                            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-red-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#a89982]">
                      <span>
                        {customMapPin 
                          ? `Pinned at ${customMapPin.x}% X, ${customMapPin.y}% Y` 
                          : 'Click or tap on the map to place coordinates.'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMapPickerOpen(false)}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded text-xs"
                      >
                        Confirm Pin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Organizer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              {itemType === 'application' ? 'Club / Student Organization' : 'Organizer / Student Club'} <span className="text-[#c93b2b]">*</span>
            </label>
            <input
              type="text"
              placeholder={itemType === 'application' ? "e.g. MARKiT, First Cut, Rotaract Club" : "e.g. Student Council or Media Collective"}
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
              required
            />
          </div>

          {/* 4a. Cohorts & Eligibility Multi-Select */}
          <div className="p-3.5 bg-[#fdfaf4] border border-[#d6cbb0] rounded-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Target Cohorts / Eligibility
                </label>
                <span className="text-[11px] text-neutral-500">
                  Select all student cohorts eligible to attend or apply
                </span>
              </div>
              
              {/* Active Selection Badge */}
              <div className="text-left sm:text-right">
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-xs ${
                  isAllSelected 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : selectedCohorts.length > 0 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                }`}>
                  {isAllSelected 
                    ? '🌟 Open to All Students' 
                    : `${selectedCohorts.length} Cohort${selectedCohorts.length === 1 ? '' : 's'} Selected`}
                </span>
              </div>
            </div>

            {/* Quick Select Bundle Buttons: All, UG, BDes, PG, MSc */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#e2d8c3]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mr-1 font-mono">
                Quick Select:
              </span>
              
              {/* All Option */}
              <button
                type="button"
                onClick={toggleAllCohorts}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs border transition-all ${
                  isAllSelected
                    ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                    : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                }`}
              >
                🌟 All
              </button>

              {/* UG Option */}
              <button
                type="button"
                onClick={() => toggleBundle(UG_COHORTS)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs border transition-all ${
                  !isAllSelected && isUGSelected
                    ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                    : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                }`}
              >
                🎓 UG
              </button>

              {/* BDes Option */}
              <button
                type="button"
                onClick={() => toggleBundle(BDES_COHORTS)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs border transition-all ${
                  !isAllSelected && isBDesSelected
                    ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                    : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                }`}
              >
                🎨 BDes
              </button>

              {/* PG Option */}
              <button
                type="button"
                onClick={() => toggleBundle(PG_COHORTS)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs border transition-all ${
                  !isAllSelected && isPGSelected
                    ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                    : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                }`}
              >
                💼 PG
              </button>

              {/* MSc Option */}
              <button
                type="button"
                onClick={() => toggleBundle(MSC_COHORTS)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs border transition-all ${
                  !isAllSelected && isMScSelected
                    ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                    : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                }`}
              >
                🔬 MSc
              </button>
            </div>

            {/* Individual Cohort Buttons Grid */}
            <div className="space-y-2.5 pt-1">
              {/* UG */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono">
                    Undergraduate (UG)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBundle(UG_COHORTS)}
                    className="text-[10px] text-[#c93b2b] hover:underline font-semibold"
                  >
                    {isUGSelected ? 'Deselect UG' : 'Select all UG'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {UG_COHORTS.map((c) => {
                    const isSelected = isAllSelected || selectedCohorts.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleSingleCohort(c)}
                        className={`py-1.5 px-1 rounded-xs border text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                            : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BDes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono">
                    Bachelor of Design (BDes)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBundle(BDES_COHORTS)}
                    className="text-[10px] text-[#c93b2b] hover:underline font-semibold"
                  >
                    {isBDesSelected ? 'Deselect BDes' : 'Select all BDes'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BDES_COHORTS.map((c) => {
                    const isSelected = isAllSelected || selectedCohorts.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleSingleCohort(c)}
                        className={`py-1.5 px-1 rounded-xs border text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                            : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PG */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono">
                    Postgraduate (PG)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBundle(PG_COHORTS)}
                    className="text-[10px] text-[#c93b2b] hover:underline font-semibold"
                  >
                    {isPGSelected ? 'Deselect PG' : 'Select all PG'}
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {PG_COHORTS.map((c) => {
                    const isSelected = isAllSelected || selectedCohorts.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleSingleCohort(c)}
                        className={`py-1.5 px-0.5 rounded-xs border text-xs font-bold transition-all text-center truncate ${
                          isSelected
                            ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                            : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MSc */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono">
                    Master of Science (MSc)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBundle(MSC_COHORTS)}
                    className="text-[10px] text-[#c93b2b] hover:underline font-semibold"
                  >
                    {isMScSelected ? 'Deselect MSc' : 'Select all MSc'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {MSC_COHORTS.map((c) => {
                    const isSelected = isAllSelected || selectedCohorts.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleSingleCohort(c)}
                        className={`py-1.5 px-1 rounded-xs border text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'bg-[#c93b2b] text-white border-red-700 shadow-2xs'
                            : 'bg-white text-neutral-700 border-[#d6cbb0] hover:border-neutral-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Optional Custom Note / Condition */}
            <div className="pt-2 border-t border-[#e2d8c3]">
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Additional Criteria / Team Rules <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Teams of 2 to 4, Open to all doubles pairs, etc."
                value={customEligibilityNote}
                onChange={(e) => setCustomEligibilityNote(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#c93b2b]"
              />
            </div>
          </div>

          {/* 4b. Person of Contact (POC) */}
          <div className="p-3 bg-[#fdfaf4] border border-[#d6cbb0] rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c93b2b]" />
                <span>{itemType === 'application' ? 'Club POC (Recruitment Lead)' : 'Event POC (Person of Contact)'}</span>
                <span className="text-[11px] font-normal normal-case text-neutral-500">(Optional)</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-sans-ui">
                {itemType === 'application' ? 'Student lead handling recruitments' : 'Person handling this event'}
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

          {/* 4c. Interview & Audition Details (Dedicated for Applications) */}
          {itemType === 'application' && (
            <div className="p-3 bg-[#faf6ee] border border-[#d6cbb0] rounded-sm space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasInterview}
                  onChange={(e) => setHasInterview(e.target.checked)}
                  className="w-4 h-4 accent-[#c93b2b] rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-900">
                  Includes an Interview / Audition round later
                </span>
              </label>

              {hasInterview && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Interview / Audition Details & Timeline
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Shortlisted applicants will be invited for personal interviews on Oct 24th & 25th in Classroom Block A."
                    value={interviewDetails}
                    onChange={(e) => setInterviewDetails(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900 focus:outline-none focus:border-[#c93b2b]"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Help applicants know what rounds or dates to expect after submitting their application.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              {itemType === 'application' ? 'Role Overview & Requirements' : 'Description'} <span className="text-[#c93b2b]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder={itemType === 'application' ? "Describe the positions open, responsibilities, commitments, and qualities your club is looking for." : "What makes this event exciting? Add instructions, vibe, gear to bring, or what to expect."}
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
                {itemType === 'application' ? 'Strict Application Deadline' : 'Registration Deadline (Optional)'}
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
                {itemType === 'application' 
                  ? '⚠️ Applications have strict cutoffs. Radar alerts students before closing.' 
                  : 'Triggers high-priority red stamp and notification radar'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                {itemType === 'application' ? 'Application Form URL (Google Form, etc.)' : 'External RSVP / Google Form Link (Optional)'}
              </label>
              <input
                type="url"
                placeholder={itemType === 'application' ? "https://forms.gle/your-application-form" : "https://forms.google.com/your-form"}
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#d6cbb0] rounded-sm text-xs text-neutral-900"
              />
              <p className="text-[10px] text-amber-800 mt-1">
                {itemType === 'application' ? 'Link where students can submit their application' : 'Direct link to Google Form / RSVP website'}
              </p>
            </div>

            {itemType !== 'application' && (
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
            )}
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
                  ? (itemType === 'application' ? 'Update Application Call' : 'Save Changes & Update Bulletin')
                  : !rateLimit.allowed 
                    ? `Limit Reached (${rateLimit.count}/2/hr)` 
                    : (itemType === 'application' ? 'Publish Application' : 'Publish Event to Bulletin')}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
