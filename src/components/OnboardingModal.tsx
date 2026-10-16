'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  AcademicYear, 
  EventCategory, 
  ClassScheduleItem 
} from '@/types';
import { 
  ACADEMIC_YEARS, 
  EVENT_CATEGORIES, 
  DEFAULT_TIMETABLE_SAMPLE 
} from '@/lib/constants';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  Plus, 
  Trash2, 
  BookOpen, 
  Clock,
  Edit3,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal: React.FC = () => {
  const { user, isOnboardingOpen, closeOnboarding, updateProfile } = useApp();

  const [step, setStep] = useState<number>(1);
  const [academicYear, setAcademicYear] = useState<AcademicYear>(user?.academic_year || 'UG2');
  const [preferences, setPreferences] = useState<EventCategory[]>(
    user?.category_preferences || ['Performances', 'Workshop', 'Competition']
  );
  const [timetable, setTimetable] = useState<ClassScheduleItem[]>(
    user?.academic_timetable && user.academic_timetable.length > 0
      ? user.academic_timetable
      : DEFAULT_TIMETABLE_SAMPLE
  );

  // New class form state
  const [newCourseName, setNewCourseName] = useState('');
  const [newDays, setNewDays] = useState<('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[]>(['Monday']);
  const [newTimeStart, setNewTimeStart] = useState('10:30');
  const [newTimeEnd, setNewTimeEnd] = useState('11:45');
  const [newRoom, setNewRoom] = useState('');
  
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  if (!isOnboardingOpen || !user) return null;

  const toggleCategory = (cat: EventCategory) => {
    if (preferences.includes(cat)) {
      setPreferences(preferences.filter((c) => c !== cat));
    } else {
      setPreferences([...preferences, cat]);
    }
  };

  const addClassToTimetable = () => {
    if (!newCourseName.trim() || newDays.length === 0) return;
    
    const newClasses: ClassScheduleItem[] = newDays.map((day, index) => ({
      id: `class-${Date.now()}-${index}`,
      courseName: newCourseName.trim(),
      day: day,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      room: newRoom.trim() || 'Academics',
      venueZone: 'Academics',
    }));
    
    setTimetable([...timetable, ...newClasses]);
    setNewCourseName('');
    setNewRoom('');
  };

  const removeClass = (id: string) => {
    setTimetable(timetable.filter((c) => c.id !== id));
  };

  const handleEditChange = (id: string, field: keyof ClassScheduleItem, value: string) => {
    setTimetable(timetable.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDismiss = () => {
    updateProfile({
      quiz_completed: true,
    });

    if (user?.flame_email) {
      localStorage.setItem(`flame_fomo_quiz_completed_${user.flame_email.toLowerCase()}`, 'true');
    }

    closeOnboarding();
  };

  const handleFinish = () => {
    updateProfile({
      academic_year: academicYear,
      category_preferences: preferences,
      academic_timetable: timetable,
      quiz_completed: true,
    });

    if (user?.flame_email) {
      localStorage.setItem(`flame_fomo_quiz_completed_${user.flame_email.toLowerCase()}`, 'true');
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore in environments where canvas is unavailable
    }

    closeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#fcfbf7] text-neutral-900 rounded-sm shadow-2xl border-4 border-[#e8dfc9] p-6 sm:p-8"
        style={{
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Washi tape header motif */}
        <div 
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#f3da90]/90 shadow-md backdrop-blur-xs rotate-1 pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 transition-colors z-30"
          title="Close Quiz"
          aria-label="Close Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            <span>Student Onboarding</span>
            <span>Step {step} of 4</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#c93b2b]' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome & Profile Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <span className="font-handwritten text-xl text-[#c93b2b]">welcome to campus</span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900">
                Welcome to FLAME FOMO
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto mt-1">
                Your tactile digital bulletin board and personalized event planner for FLAME University life.
              </p>
            </div>

            <div className="p-4 bg-[#f5eee0] border border-[#e5dcc6] rounded-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-semibold uppercase">Verified Email:</span>
                <span className="font-mono font-bold text-neutral-900">{user.flame_email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-semibold uppercase">Display Name:</span>
                <span className="font-bold text-neutral-900">{user.name}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>We&apos;ll customize your event radar based on your cohort, interests, and classes.</span>
            </div>
          </div>
        )}

        {/* STEP 2: Cohort Identification */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-editorial text-2xl font-bold text-neutral-900">
                Cohort Identification
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Select your academic year to highlight cohort-specific opportunities and competitions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-3">
              {ACADEMIC_YEARS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setAcademicYear(year)}
                  className={`p-3 rounded-sm border-2 text-center transition-all ${
                    academicYear === year
                      ? 'bg-[#c93b2b] text-amber-100 border-[#991b1b] shadow-md scale-102 font-bold'
                      : 'bg-white text-neutral-800 border-[#d9ceb7] hover:border-neutral-500'
                  }`}
                >
                  <div className="font-editorial text-lg font-bold">{year}</div>
                  <div className="text-[10px] uppercase font-bold opacity-80 mt-1">
                    {year === 'All' ? 'Everyone' : year.startsWith('PG') ? `PG ${year.replace('PG', '')}` : `UG ${year.replace('UG', '')}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Interest Mapping */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-editorial text-2xl font-bold text-neutral-900">
                Interest Mapping
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Toggle your favorite categories. We&apos;ll prioritize them on your discovery collage.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {EVENT_CATEGORIES.map((cat) => {
                const isSelected = preferences.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-3 rounded-sm border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#1c1a17] text-amber-200 border-black shadow-sm'
                        : 'bg-white text-neutral-700 border-[#d9ceb7] hover:bg-[#fbf7ee]'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Timetable Sync */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-editorial text-2xl font-bold text-neutral-900">
                Classes & Weekly Commitments
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Add your classes or other weekly commitments to avoid clashes.
              </p>
            </div>

            {/* List of current enrolled slots */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {timetable.map((cls) => (
                editingClassId === cls.id ? (
                  <div key={cls.id} className="flex flex-col gap-2 p-2.5 bg-amber-50 border border-amber-300 rounded-sm w-full shadow-sm animate-fade-in">
                    <div className="flex gap-2">
                      <input 
                         value={cls.courseName} 
                         onChange={e => handleEditChange(cls.id, 'courseName', e.target.value)}
                         placeholder="Course Name"
                         className="flex-1 p-1.5 text-xs bg-white border border-amber-200 rounded text-neutral-900" 
                      />
                      <input 
                         value={cls.room || ''} 
                         onChange={e => handleEditChange(cls.id, 'room', e.target.value)}
                         placeholder="Location"
                         className="w-1/3 p-1.5 text-xs bg-white border border-amber-200 rounded text-neutral-900" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                         value={cls.day} 
                         onChange={e => handleEditChange(cls.id, 'day', e.target.value as any)}
                         className="p-1.5 text-xs bg-white border border-amber-200 rounded text-neutral-900 flex-1" 
                      >
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input 
                         type="time" value={cls.timeStart} 
                         onChange={e => handleEditChange(cls.id, 'timeStart', e.target.value)}
                         className="p-1.5 text-xs bg-white border border-amber-200 rounded text-neutral-900" 
                      />
                      <input 
                         type="time" value={cls.timeEnd} 
                         onChange={e => handleEditChange(cls.id, 'timeEnd', e.target.value)}
                         className="p-1.5 text-xs bg-white border border-amber-200 rounded text-neutral-900" 
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
                    className="flex items-center justify-between p-2.5 bg-white border border-[#e0d6be] rounded-sm text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#c93b2b]" />
                      <span className="font-bold text-neutral-900">{cls.courseName}</span>
                      <span className="text-neutral-500">({cls.room || 'No location'})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-neutral-600 font-mono">
                        {cls.day.substring(0, 3).toUpperCase()} {cls.timeStart}-{cls.timeEnd}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingClassId(cls.id)}
                          className="text-amber-600 hover:text-amber-800 p-1 bg-amber-50 rounded transition-colors"
                          title="Edit Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeClass(cls.id)}
                          className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded transition-colors"
                          title="Remove Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Add class snippet */}
            <div className="p-3 bg-[#f5efe1] border border-[#e0d3ba] rounded-sm space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Add class or weekly commitment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Class or commitment name"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="p-2 bg-white border border-[#d6cbb0] rounded text-neutral-900"
                />
                
                <input
                  type="text"
                  placeholder="Location (e.g. Chanakya 2)"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="p-2 bg-white border border-[#d6cbb0] rounded text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {/* Multiple Day Selection */}
                <div className="flex flex-wrap gap-1.5 mt-1">
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
                          ? 'bg-[#c93b2b] text-white border border-[#991b1b]' 
                          : 'bg-white text-neutral-600 border border-[#d6cbb0] hover:bg-neutral-100'
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
                  className="p-2 bg-white border border-[#d6cbb0] rounded text-neutral-900"
                />
                <input
                  type="time"
                  value={newTimeEnd}
                  onChange={(e) => setNewTimeEnd(e.target.value)}
                  className="p-2 bg-white border border-[#d6cbb0] rounded text-neutral-900"
                />
                <button
                  type="button"
                  onClick={addClassToTimetable}
                  className="p-2 bg-neutral-900 hover:bg-black text-amber-100 font-bold rounded flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slot</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-[#e2d6be]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              Skip for now
            </button>
          )}

          {step < 4 ? (
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  Skip for now
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-[#c93b2b] hover:bg-[#b02e20] text-amber-100 text-xs sm:text-sm font-bold rounded-sm shadow-md flex items-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-sm shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Complete Setup & Explore</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
