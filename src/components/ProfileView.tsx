'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  AcademicYear, 
  EventCategory, 
  ClassScheduleItem, 
  EventItem 
} from '@/types';
import { 
  ACADEMIC_YEARS, 
  UG_COHORTS,
  BDES_COHORTS,
  PG_COHORTS,
  MSC_COHORTS,
  EVENT_CATEGORIES 
} from '@/lib/constants';
import { EventCard } from './EventCard';
import { EmptyStateScrapbook } from './EmptyStateScrapbook';
import { 
  User, 
  BookOpen, 
  Bookmark, 
  FileEdit, 
  Trash2, 
  Plus, 
  Check, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin,
  Save,
  Edit3,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getEventSavedCount, 
  getEventGoingCount, 
  getEventFavouriteCount 
} from '@/lib/constants';

export const ProfileView: React.FC = () => {
  const { 
    user, 
    events, 
    savedEventIds, 
    goingEventIds, 
    favouriteEventIds,
    updateProfile, 
    deleteEvent, 
    updateEvent,
    openCreateEvent,
    openEditEvent,
    openEventDetail,
    openEventFeedback,
    setCurrentTab,
    openOnboarding,
    isUserAuthor,
    isAdmin,
    userRole,
    canCreateEvents,
    canEditEvent,
    clubName,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'preferences' | 'saved' | 'submitted'>('preferences');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tab 1 state
  const [academicYear, setAcademicYear] = useState<AcademicYear>(user?.academic_year || 'UG2');
  const [preferences, setPreferences] = useState<EventCategory[]>(user?.category_preferences || []);
  const [timetable, setTimetable] = useState<ClassScheduleItem[]>(user?.academic_timetable || []);

  // New course input
  const [newCourseName, setNewCourseName] = useState('');
  const [newDays, setNewDays] = useState<('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[]>(['Monday']);
  const [newTimeStart, setNewTimeStart] = useState('14:15');
  const [newTimeEnd, setNewTimeEnd] = useState('15:30');
  const [newRoom, setNewRoom] = useState('');
  
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  if (!user) return null;

  // Tab 2: Bookmarked & Going Events
  const bookmarkedEvents = events.filter((e) => savedEventIds.includes(e.id) || goingEventIds.includes(e.id));

  // Tab 3: Events user published or can manage (Admin manages all, Club manages their own)
  const submittedEvents = isAdmin ? events : events.filter(isUserAuthor);

  const toggleCategory = (cat: EventCategory) => {
    if (preferences.includes(cat)) {
      setPreferences(preferences.filter((c) => c !== cat));
    } else {
      setPreferences([...preferences, cat]);
    }
  };

  const addClass = () => {
    if (!newCourseName.trim() || newDays.length === 0) return;
    const newItems: ClassScheduleItem[] = newDays.map((day, index) => ({
      id: `class-${Date.now()}-${index}`,
      courseName: newCourseName.trim(),
      day: day,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      room: newRoom.trim() || 'Academics',
      venueZone: 'Academics',
    }));
    setTimetable([...timetable, ...newItems]);
    setNewCourseName('');
    setNewRoom('');
  };

  const removeClass = (id: string) => {
    setTimetable(timetable.filter((c) => c.id !== id));
  };

  const handleEditChange = (id: string, field: keyof ClassScheduleItem, value: string) => {
    setTimetable(timetable.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const savePreferences = () => {
    updateProfile({
      academic_year: academicYear,
      category_preferences: preferences,
      academic_timetable: timetable,
    });
    setSavedSuccessMsg('Preferences & timetable saved successfully!');
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Profile Header Banner */}
      <div className="relative bg-[#201c18] border border-[#3d3429] rounded-sm p-6 shadow-xl mb-6">
        <div 
          className="absolute -top-3 left-6 w-24 h-5 bg-[#f3da90]/80 shadow-xs rotate-[-2deg] pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#c93b2b] text-amber-100 font-bold font-editorial text-2xl flex items-center justify-center border-2 border-amber-300/40 shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-100">
                  {user.name}
                </h2>
                {userRole === 'admin' && (
                  <span className="px-2 py-0.5 bg-red-950/90 text-red-200 border border-red-500/50 font-mono text-xs rounded font-bold">
                    🛡️ Admin
                  </span>
                )}
                {userRole === 'club' && (
                  <span className="px-2 py-0.5 bg-purple-950/90 text-purple-200 border border-purple-500/50 font-mono text-xs rounded font-bold">
                    🏛️ {clubName || 'Verified Club'}
                  </span>
                )}
                {userRole === 'student' && (
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 font-mono text-xs rounded border border-amber-400/30">
                    {user.academic_year}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a89b87] font-mono mt-0.5">{user.flame_email}</p>
              
              {/* Quick stats chips */}
              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-300 font-sans-ui">
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <strong>{bookmarkedEvents.length}</strong> Saved
                </span>
                {canCreateEvents && (
                  <>
                    <span>·</span>
                    <button
                      onClick={() => setActiveTab('submitted')}
                      className="flex items-center gap-1 text-amber-200 hover:text-amber-100 hover:underline transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-amber-400" />
                      <strong>{submittedEvents.length}</strong> {isAdmin ? 'Total Events' : 'Posted Events'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openOnboarding}
              className="px-3.5 py-2 bg-[#2c261e] hover:bg-[#383127] text-amber-200 border border-amber-400/30 text-xs font-bold rounded-xs shadow flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Quiz Answers</span>
            </button>
            {canCreateEvents && (
              <button
                onClick={() => openCreateEvent()}
                className="px-4 py-2 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 text-xs font-bold rounded-xs shadow flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Post Event</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* The Tabs */}
      <div className="flex border-b border-[#3d3429] mb-6">
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'preferences'
              ? 'border-[#c93b2b] text-amber-300 bg-[#26201a]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Schedule &amp; Interests</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'saved'
              ? 'border-[#c93b2b] text-amber-300 bg-[#26201a]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>2. Saved Events ({bookmarkedEvents.length})</span>
        </button>

        {canCreateEvents && (
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'submitted'
                ? 'border-[#c93b2b] text-amber-300 bg-[#26201a]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>3. {isAdmin ? `All Events (${submittedEvents.length})` : `Your Posted Events (${submittedEvents.length})`}</span>
          </button>
        )}
      </div>

      {/* TAB 1: Edit Preferences & Timetable */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {savedSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 rounded-sm text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {/* Cohort Selector */}
          <div className="bg-[#201c18] border border-[#3b3327] rounded-sm p-5 shadow-lg space-y-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-amber-100 mb-1">
                Your Cohort &amp; Program
              </h3>
              <p className="text-xs text-[#a89b87]">
                Active cohort: <strong className="text-amber-300 font-mono">{academicYear}</strong>
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Undergraduate */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5 font-mono">
                  Undergraduate (UG)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {UG_COHORTS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr as AcademicYear)}
                      className={`py-2 px-1 rounded-sm border text-center transition-all ${
                        academicYear === yr
                          ? 'bg-[#c93b2b] text-white border-red-700 shadow-md font-bold scale-[1.02]'
                          : 'bg-[#181613] text-neutral-300 border-[#3d352b] hover:border-neutral-500'
                      }`}
                    >
                      <div className="font-editorial text-sm font-bold">{yr}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bachelor of Design (BDes) */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5 font-mono">
                  Bachelor of Design (BDes)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {BDES_COHORTS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr as AcademicYear)}
                      className={`py-2 px-1 rounded-sm border text-center transition-all ${
                        academicYear === yr
                          ? 'bg-[#c93b2b] text-white border-red-700 shadow-md font-bold scale-[1.02]'
                          : 'bg-[#181613] text-neutral-300 border-[#3d352b] hover:border-neutral-500'
                      }`}
                    >
                      <div className="font-editorial text-sm font-bold">{yr}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Postgraduate (PG) */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5 font-mono">
                  Postgraduate (PG)
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {PG_COHORTS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr as AcademicYear)}
                      className={`py-2 px-1 rounded-sm border text-center transition-all ${
                        academicYear === yr
                          ? 'bg-[#c93b2b] text-white border-red-700 shadow-md font-bold scale-[1.02]'
                          : 'bg-[#181613] text-neutral-300 border-[#3d352b] hover:border-neutral-500'
                      }`}
                    >
                      <div className="font-editorial text-xs font-bold truncate">{yr}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Master of Science (MSc) */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5 font-mono">
                  Master of Science (MSc)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MSC_COHORTS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr as AcademicYear)}
                      className={`py-2 px-1 rounded-sm border text-center transition-all ${
                        academicYear === yr
                          ? 'bg-[#c93b2b] text-white border-red-700 shadow-md font-bold scale-[1.02]'
                          : 'bg-[#181613] text-neutral-300 border-[#3d352b] hover:border-neutral-500'
                      }`}
                    >
                      <div className="font-editorial text-sm font-bold">{yr}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Preferences */}
          <div className="bg-[#201c18] border border-[#3b3327] rounded-sm p-5 shadow-lg">
            <h3 className="font-editorial text-lg font-bold text-amber-100 mb-3">
              Your Interests
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {EVENT_CATEGORIES.map((cat) => {
                const isSelected = preferences.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-2.5 rounded-sm border text-left flex items-center justify-between text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-300 text-neutral-950 border-amber-400 font-bold'
                        : 'bg-[#181613] text-neutral-300 border-[#3d352b] hover:bg-[#25201a]'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-neutral-950" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add class or weekly commitments */}
          <div className="bg-[#201c18] border border-[#3b3327] rounded-sm p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div>
                <h3 className="font-editorial text-lg font-bold text-amber-100">
                  Add class or any other weekly commitments
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Add classes or weekly commitments to check for clashes.
                </p>
              </div>
              <span className="text-xs text-[#a89b87] font-mono">{timetable.length} added</span>
            </div>

            {/* List */}
            <div className="space-y-2 mb-4">
              {timetable.map((cls) => (
                editingClassId === cls.id ? (
                  <div key={cls.id} className="flex flex-col gap-2 p-3 bg-[#2a241c] border border-amber-500/50 rounded shadow-md w-full animate-fade-in">
                    <div className="flex gap-2">
                      <input 
                         value={cls.courseName} 
                         onChange={e => handleEditChange(cls.id, 'courseName', e.target.value)}
                         placeholder="Class or commitment name"
                         className="flex-1 p-1.5 text-xs bg-[#181613] border border-[#383025] rounded text-white" 
                      />
                      <input 
                         value={cls.room || ''} 
                         onChange={e => handleEditChange(cls.id, 'room', e.target.value)}
                         placeholder="Location"
                         className="w-1/3 p-1.5 text-xs bg-[#181613] border border-[#383025] rounded text-white" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                         value={cls.day} 
                         onChange={e => handleEditChange(cls.id, 'day', e.target.value as any)}
                         className="p-1.5 text-xs bg-[#181613] border border-[#383025] rounded text-white flex-1" 
                      >
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input 
                         type="time" value={cls.timeStart} 
                         onChange={e => handleEditChange(cls.id, 'timeStart', e.target.value)}
                         className="p-1.5 text-xs bg-[#181613] border border-[#383025] rounded text-white" 
                      />
                      <input 
                         type="time" value={cls.timeEnd} 
                         onChange={e => handleEditChange(cls.id, 'timeEnd', e.target.value)}
                         className="p-1.5 text-xs bg-[#181613] border border-[#383025] rounded text-white" 
                      />
                      <button 
                        onClick={() => setEditingClassId(null)} 
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center justify-center transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-2.5 bg-[#181613] border border-[#383025] rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#e25845]" />
                      <span className="font-bold text-neutral-100">{cls.courseName}</span>
                      <span className="text-neutral-400">({cls.room || 'No location'})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-amber-300/90">
                        {cls.day.substring(0, 3).toUpperCase()} {cls.timeStart}-{cls.timeEnd}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingClassId(cls.id)}
                          className="text-amber-400 hover:text-amber-300 p-1 bg-[#25201a] rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeClass(cls.id)}
                          className="text-red-400 hover:text-red-300 p-1 bg-[#25201a] rounded transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Add commitment form */}
            <div className="p-3 bg-[#181613] border border-[#383025] rounded space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Add class or commitment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Class or commitment name"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="p-2 bg-[#201c18] border border-[#42392d] rounded text-neutral-100"
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Chanakya 2)"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="p-2 bg-[#201c18] border border-[#42392d] rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {/* Multiple Day Selection */}
                <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                  {(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        if (newDays.includes(d)) {
                          setNewDays(newDays.filter(day => day !== d));
                        } else {
                          setNewDays([...newDays, d]);
                        }
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        newDays.includes(d) 
                          ? 'bg-amber-300 text-neutral-900 border border-amber-400' 
                          : 'bg-[#201c18] text-neutral-400 border border-[#42392d] hover:bg-[#2a2520]'
                      }`}
                    >
                      {d.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="time"
                  value={newTimeStart}
                  onChange={(e) => setNewTimeStart(e.target.value)}
                  className="p-2 bg-[#201c18] border border-[#42392d] rounded text-neutral-100"
                />
                <input
                  type="time"
                  value={newTimeEnd}
                  onChange={(e) => setNewTimeEnd(e.target.value)}
                  className="p-2 bg-[#201c18] border border-[#42392d] rounded text-neutral-100"
                />
                <button
                  type="button"
                  onClick={addClass}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-200 font-bold rounded flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={savePreferences}
                className="px-6 py-2.5 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 text-xs sm:text-sm font-bold rounded shadow flex items-center gap-2 ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: My Saved Events */}
      {activeTab === 'saved' && (
        <div>
          {bookmarkedEvents.length === 0 ? (
            <EmptyStateScrapbook
              title="No saved events"
              subtitle="Events you save will appear here."
              actionButton={{
                label: "View All Events",
                onClick: () => setCurrentTab('explore'),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedEvents.map((evt, idx) => (
                <EventCard key={evt.id} event={evt} rotationIndex={idx} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Events You've Posted (Creator Dashboard) */}
      {activeTab === 'submitted' && (
        <div>
          {submittedEvents.length === 0 ? (
            <EmptyStateScrapbook
              title="No posted events"
              subtitle="Events you post will appear here so you can edit them anytime."
              actionButton={{
                label: "Post an Event",
                onClick: openCreateEvent,
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>{isAdmin ? 'Manage all campus events' : 'Manage the events you have posted'}</span>
                <span className="text-amber-300 font-bold">{submittedEvents.length} {isAdmin ? 'Total Events' : 'Posted'}</span>
              </div>

              {submittedEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-[#201c18] border border-[#3d3429] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-400/40 transition-colors shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail */}
                    {evt.event_image ? (
                      <div className="w-16 h-16 rounded-xs overflow-hidden shrink-0 border border-neutral-700 bg-neutral-900">
                        <img
                          src={evt.event_image}
                          alt={evt.event_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xs bg-[#2e261f] border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-500">
                        <Calendar className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-neutral-800 text-amber-200 text-[10px] font-bold rounded uppercase">
                          {evt.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          evt.status === 'Cancelled'
                            ? 'bg-red-900/60 text-red-300 border border-red-700/50'
                            : evt.status === 'Registration Closed'
                            ? 'bg-neutral-800 text-neutral-400'
                            : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                        }`}>
                          {evt.status}
                        </span>
                        {evt.registration_fee && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                            🎟️ {evt.registration_fee}
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => openEventDetail(evt)}
                        className="font-editorial text-lg font-bold text-neutral-100 hover:text-amber-300 cursor-pointer transition-colors"
                      >
                        {evt.event_name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#a89b87] mt-1 font-sans-ui">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#c93b2b]" />
                          {evt.date} · {evt.time_start_end}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#c93b2b]" />
                          {evt.venue_zone} {evt.room_specific ? `(${evt.room_specific})` : ''}
                        </span>
                      </div>

                      {/* Engagement Metrics for Creator */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-[#342c22]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">Engagement:</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" title="Students attending">
                          👥 {getEventGoingCount(evt, goingEventIds)} Going
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/80 text-red-300 border border-red-800/60" title="Students saved">
                          🔖 {getEventSavedCount(evt, savedEventIds)} Saved
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60" title="Students favourited">
                          ⭐ {getEventFavouriteCount(evt, favouriteEventIds)} Favourited
                        </span>
                        <button
                          type="button"
                          onClick={() => openEventFeedback(evt)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-500 transition-colors flex items-center gap-1 cursor-pointer ml-auto shadow-2xs"
                          title="View all student feedback and reviews"
                        >
                          <MessageSquare className="w-3 h-3 text-amber-950" />
                          <span>{evt.feedback?.length || 0} Feedback Reviews &rarr;</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#3d3429]">
                    <select
                      value={evt.status}
                      onChange={(e) => updateEvent(evt.id, { status: e.target.value as any })}
                      className="px-2.5 py-1.5 bg-[#181613] border border-[#42392d] text-xs text-neutral-200 rounded focus:outline-none"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Registration Closed">Registration Closed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed / Event Closed</option>
                    </select>

                    <button
                      onClick={() => openEventDetail(evt)}
                      className="px-3 py-1.5 bg-[#2c2620] hover:bg-[#383028] text-amber-200 border border-[#4a3e30] rounded text-xs font-bold transition-colors"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => openEditEvent(evt)}
                      className="px-3 py-1.5 bg-[#f3da90] hover:bg-[#e4cb80] text-neutral-900 rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Edit Details</span>
                    </button>

                    {deletingId === evt.id ? (
                      <div className="flex items-center gap-1.5 bg-red-950/80 p-1 rounded border border-red-800">
                        <span className="text-[11px] text-red-200 font-bold px-1">Delete?</span>
                        <button
                          onClick={() => {
                            deleteEvent(evt.id);
                            setDeletingId(null);
                          }}
                          className="px-2 py-0.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-0.5 text-xs text-neutral-300 hover:text-white"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(evt.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
