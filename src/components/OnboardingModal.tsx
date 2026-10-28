'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { getUserRole } from '@/lib/permissions';
import { 
  AcademicYear, 
  EventCategory, 
  ClassScheduleItem 
} from '@/types';
import { 
  ACADEMIC_YEARS, 
  UG_COHORTS,
  BDES_COHORTS,
  PG_COHORTS,
  MSC_COHORTS,
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

interface OnboardingModalProps {
  isMandatory?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isMandatory = false }) => {
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

  // Keep state synced if user changes
  useEffect(() => {
    if (user?.academic_year) setAcademicYear(user.academic_year);
    if (user?.category_preferences && user.category_preferences.length > 0) {
      setPreferences(user.category_preferences);
    }
    if (user?.academic_timetable && user.academic_timetable.length > 0) {
      setTimetable(user.academic_timetable);
    }
  }, [user]);

  // Clubs and admins never need to take the student onboarding quiz
  const userRole = user ? getUserRole(user.flame_email) : 'student';
  useEffect(() => {
    if (user && (userRole === 'club' || userRole === 'admin') && isOnboardingOpen) {
      closeOnboarding();
    }
  }, [user, userRole, isOnboardingOpen, closeOnboarding]);

  const shouldShow = (isOnboardingOpen || isMandatory) && user && userRole === 'student';
  if (!shouldShow) return null;

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

  const handleFinish = () => {
    updateProfile({
      academic_year: academicYear,
      category_preferences: preferences,
      academic_timetable: timetable,
      quiz_completed: true,
    });

    if (user?.flame_email) {
      try {
        localStorage.setItem(`flame_fomo_quiz_completed_${user.flame_email.toLowerCase()}`, 'true');
      } catch {}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#131017] text-[#f4f3f6] rounded-xl shadow-2xl border border-[#2b2438] p-6 sm:p-8"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Scrapbook washi tape header motif */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-5 bg-[#ff2d55]/80 shadow-[0_0_14px_rgba(255,45,85,0.4)] rotate-1 pointer-events-none"
          style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
        />

        {/* Close Button - only shown if quiz is opened voluntarily (e.g. editing from profile) */}
        {!isMandatory && (
          <button
            type="button"
            onClick={closeOnboarding}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#1e1926] hover:bg-[#2b2336] text-[#9d93a8] hover:text-white transition-colors z-30 cursor-pointer"
            title="Close Quiz"
            aria-label="Close Quiz"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Step Indicator Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#9d93a8] mb-2">
            <span>Student Onboarding</span>
            <span className="text-[#ff2d55]">Step {step} of 4</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#ff2d55] shadow-[0_0_8px_rgba(255,45,85,0.5)]' : 'bg-[#221c2b]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome & Profile Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <span className="font-handwritten text-xl text-[#ff2d55]">welcome to campus</span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                Welcome to FLAME FOMO
              </h2>
              <p className="text-xs sm:text-sm text-[#9d93a8] max-w-md mx-auto mt-1">
                Your tactile digital bulletin board and personalized event planner for FLAME University life.
              </p>
            </div>

            <div className="p-4 bg-[#181420] border border-[#2b2438] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8a7f96] font-semibold uppercase">Verified Email:</span>
                <span className="font-mono font-bold text-white">{user.flame_email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8a7f96] font-semibold uppercase">Display Name:</span>
                <span className="font-bold text-white">{user.name}</span>
              </div>
            </div>

            <div className="p-3 bg-[#1e1524] border border-[#ff2d55]/30 rounded-xl text-xs text-[#ff758f] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff2d55] shrink-0" />
              <span>We&apos;ll customize your event radar based on your cohort, interests, and classes.</span>
            </div>
          </div>
        )}

        {/* STEP 2: Cohort Identification */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-editorial text-2xl font-bold text-white">
                Cohort Identification
              </h2>
              <p className="text-xs text-[#9d93a8] mt-1">
                Select your academic year to highlight cohort-specific opportunities and competitions.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Undergraduate (UG) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                    Undergraduate (UG)
                  </span>
                  <span className="text-[10px] text-[#8a7f96] font-mono">4 Years</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {UG_COHORTS.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setAcademicYear(year as AcademicYear)}
                      className={`py-2 px-2 rounded-lg border text-center transition-all ${
                        academicYear === year
                          ? 'bg-[#ff2d55] text-white border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.4)] font-bold scale-[1.02]'
                          : 'bg-[#181420] text-neutral-200 border-[#2b2438] hover:border-[#ff2d55]/50'
                      }`}
                    >
                      <div className="font-editorial text-sm font-bold">{year}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bachelor of Design (BDes) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                    Bachelor of Design (BDes)
                  </span>
                  <span className="text-[10px] text-[#8a7f96] font-mono">Design Program</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {BDES_COHORTS.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setAcademicYear(year as AcademicYear)}
                      className={`py-2 px-2 rounded-lg border text-center transition-all ${
                        academicYear === year
                          ? 'bg-[#ff2d55] text-white border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.4)] font-bold scale-[1.02]'
                          : 'bg-[#181420] text-neutral-200 border-[#2b2438] hover:border-[#ff2d55]/50'
                      }`}
                    >
                      <div className="font-editorial text-sm font-bold">{year}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Postgraduate (PG) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                    Postgraduate (PG)
                  </span>
                  <span className="text-[10px] text-[#8a7f96] font-mono">MBA / Postgrad</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {PG_COHORTS.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setAcademicYear(year as AcademicYear)}
                      className={`py-2 px-1 rounded-lg border text-center transition-all ${
                        academicYear === year
                          ? 'bg-[#ff2d55] text-white border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.4)] font-bold scale-[1.02]'
                          : 'bg-[#181420] text-neutral-200 border-[#2b2438] hover:border-[#ff2d55]/50'
                      }`}
                    >
                      <div className="font-editorial text-xs font-bold truncate">{year}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Master of Science (MSc) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                    Master of Science (MSc)
                  </span>
                  <span className="text-[10px] text-[#8a7f96] font-mono">Economics / Science</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MSC_COHORTS.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setAcademicYear(year as AcademicYear)}
                      className={`py-2 px-2 rounded-lg border text-center transition-all ${
                        academicYear === year
                          ? 'bg-[#ff2d55] text-white border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.4)] font-bold scale-[1.02]'
                          : 'bg-[#181420] text-neutral-200 border-[#2b2438] hover:border-[#ff2d55]/50'
                      }`}
                    >
                      <div className="font-editorial text-sm font-bold">{year}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Interest Mapping */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-editorial text-2xl font-bold text-white">
                Interest Mapping
              </h2>
              <p className="text-xs text-[#9d93a8] mt-1">
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
                    className={`p-3 rounded-lg border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#ff2d55] text-white border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.35)]'
                        : 'bg-[#181420] text-neutral-200 border-[#2b2438] hover:border-[#ff2d55]/40'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
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
              <h2 className="font-editorial text-2xl font-bold text-white">
                Classes &amp; Weekly Commitments
              </h2>
              <p className="text-xs text-[#9d93a8] mt-1">
                Add your classes or other weekly commitments to avoid clashes.
              </p>
            </div>

            {/* List of current enrolled slots */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {timetable.map((cls) => (
                editingClassId === cls.id ? (
                  <div key={cls.id} className="flex flex-col gap-2 p-2.5 bg-[#181420] border border-[#ff2d55]/40 rounded-lg w-full shadow-sm animate-fade-in">
                    <div className="flex gap-2">
                      <input 
                         value={cls.courseName} 
                         onChange={e => handleEditChange(cls.id, 'courseName', e.target.value)}
                         placeholder="Course Name"
                         className="flex-1 p-1.5 text-xs bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white" 
                      />
                      <input 
                         value={cls.room || ''} 
                         onChange={e => handleEditChange(cls.id, 'room', e.target.value)}
                         placeholder="Location"
                         className="w-1/3 p-1.5 text-xs bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                         value={cls.day} 
                         onChange={e => handleEditChange(cls.id, 'day', e.target.value as any)}
                         className="p-1.5 text-xs bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white flex-1" 
                      >
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input 
                         type="time" value={cls.timeStart} 
                         onChange={e => handleEditChange(cls.id, 'timeStart', e.target.value)}
                         className="p-1.5 text-xs bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white" 
                      />
                      <input 
                         type="time" value={cls.timeEnd} 
                         onChange={e => handleEditChange(cls.id, 'timeEnd', e.target.value)}
                         className="p-1.5 text-xs bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white" 
                      />
                      <button 
                        onClick={() => setEditingClassId(null)} 
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-2.5 bg-[#181420] border border-[#2b2438] rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#ff2d55]" />
                      <span className="font-bold text-white">{cls.courseName}</span>
                      <span className="text-[#8a7f96]">({cls.room || 'No location'})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-neutral-300 font-mono">
                        {cls.day.substring(0, 3).toUpperCase()} {cls.timeStart}-{cls.timeEnd}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingClassId(cls.id)}
                          className="text-amber-400 hover:text-amber-300 p-1 bg-[#221c2b] rounded-md transition-colors"
                          title="Edit Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeClass(cls.id)}
                          className="text-red-400 hover:text-red-300 p-1 bg-[#221c2b] rounded-md transition-colors"
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
            <div className="p-3 bg-[#181420] border border-[#2b2438] rounded-xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9d93a8]">
                Add class or weekly commitment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Class or commitment name"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="p-2 bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white placeholder-[#6d6379] focus:outline-none focus:border-[#ff2d55]"
                />
                
                <input
                  type="text"
                  placeholder="Location (e.g. Chanakya 2)"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="p-2 bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white placeholder-[#6d6379] focus:outline-none focus:border-[#ff2d55]"
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
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        newDays.includes(d) 
                          ? 'bg-[#ff2d55] text-white border border-[#ff2d55]' 
                          : 'bg-[#1e1926] text-neutral-300 border border-[#2b2438] hover:border-[#ff2d55]/40'
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
                  className="p-2 bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white"
                />
                <input
                  type="time"
                  value={newTimeEnd}
                  onChange={(e) => setNewTimeEnd(e.target.value)}
                  className="p-2 bg-[#0e0c12] border border-[#2b2438] rounded-lg text-white"
                />
                <button
                  type="button"
                  onClick={addClassToTimetable}
                  className="p-2 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white font-bold rounded-lg flex items-center justify-center gap-1 col-span-2 sm:col-span-1 shadow-md hover:brightness-110"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slot</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-[#262030]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            isMandatory ? (
              <span className="text-xs text-neutral-500 font-sans">
                Quick 4-step setup
              </span>
            ) : (
              <button
                type="button"
                onClick={closeOnboarding}
                className="px-3 py-2 text-xs font-semibold text-[#8a7f96] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )
          )}

          {step < 4 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_0_15px_rgba(255,45,85,0.4)] flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
              >
                <span>{step === 1 ? "Let's Get Started" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Complete Setup &amp; Explore</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
