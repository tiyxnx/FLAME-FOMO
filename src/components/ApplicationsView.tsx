'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { EventItem } from '@/types';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Bookmark, 
  Phone, 
  Plus, 
  Users, 
  AlertCircle, 
  Sparkles,
  Edit3,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';

const CLOSED_EXPIRED_APP_IDS = new Set([
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
]);

export const ApplicationsView: React.FC = () => {
  const { 
    events, 
    user, 
    isAuthenticated, 
    savedEventIds, 
    toggleSaveEvent, 
    openAuthModal, 
    openCreateEvent, 
    openEditEvent,
    openEventDetail,
    isUserAuthor,
    canCreateEvents,
    canEditEvent,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'closing_soon' | 'has_interview' | 'my_posts'>('all');

  const [todayStr, setTodayStr] = useState('');
  const [nowMs, setNowMs] = useState(0);

  React.useEffect(() => {
    const now = new Date();
    setTodayStr(now.toISOString().split('T')[0]);
    setNowMs(now.getTime());
  }, []);

  // Filter ONLY items marked as applications AND actively open for students to apply
  const allApplications = useMemo(() => {
    return events.filter((e) => {
      if (e.item_type !== 'application') return false;
      if (e.status === 'Completed' || e.status === 'Registration Closed') return false;
      // Life@FLAME portal items are informational only
      if (e.id.startsWith('lifeatflame-')) return false;
      if (CLOSED_EXPIRED_APP_IDS.has(e.id)) return false;
      // Exclude if registration deadline has passed today
      if (todayStr && e.registration_deadline) {
        const deadlineDate = e.registration_deadline.split(' ')[0];
        if (deadlineDate < todayStr) return false;
      }
      return true;
    });
  }, [events, todayStr]);

  // Check if current authenticated user has posted any applications
  const userApplications = useMemo(() => {
    return allApplications.filter(isUserAuthor);
  }, [allApplications, isUserAuthor]);

  const hasMyApplications = userApplications.length > 0;

  // Filtered applications based on search & filter pills
  const filteredApplications = useMemo(() => {
    return allApplications.filter((app) => {
      // 1. My Posts filter
      if (filterType === 'my_posts') {
        if (!isUserAuthor(app)) return false;
      }

      // 2. Has Interview filter
      if (filterType === 'has_interview') {
        const hasInterview = Boolean(
          app.has_interview || 
          app.interview_details || 
          app.requirements_eligibility?.includes('[HAS_INTERVIEW]')
        );
        if (!hasInterview) return false;
      }

      // 3. Closing soon (deadline within next 3 days)
      if (filterType === 'closing_soon') {
        if (!app.registration_deadline) return false;
        const deadlineDate = app.registration_deadline.split(' ')[0];
        if (todayStr && deadlineDate < todayStr) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = app.event_name.toLowerCase().includes(q);
        const matchOrg = app.organizer.toLowerCase().includes(q);
        const matchDesc = app.description.toLowerCase().includes(q);
        const matchPoc = (app.poc_name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchDesc && !matchPoc) return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize active applications over expired
      const aDeadline = a.registration_deadline ? a.registration_deadline.split(' ')[0] : a.date;
      const bDeadline = b.registration_deadline ? b.registration_deadline.split(' ')[0] : b.date;
      const aPast = todayStr ? aDeadline < todayStr : false;
      const bPast = todayStr ? bDeadline < todayStr : false;

      if (aPast && !bPast) return 1;
      if (!aPast && bPast) return -1;

      // Soonest deadline first
      return aDeadline.localeCompare(bDeadline);
    });
  }, [allApplications, filterType, searchQuery, todayStr, isUserAuthor]);

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      openAuthModal('Sign in with your FLAME email to post applications.');
      return;
    }
    openCreateEvent('application');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Editorial Header */}
      <div className="relative mb-6 sm:mb-8 pb-6 border-b border-[#26202e]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-purple-950/80 border border-purple-500/40 text-purple-200 rounded-full">
                Clubs &amp; Committees
              </span>
              <span className="text-xs text-[#9d93a8] font-mono uppercase tracking-wider">
                Member &amp; Core Desk
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Member &amp; Committee <span className="text-[#ff758f] italic font-serif">Applications</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#9d93a8] font-sans-ui mt-1 max-w-2xl leading-relaxed">
              Looking to become a club member, join core committees for flagship campus events, or audition for student productions? Discover verified positions with strict deadlines and interview timelines.
            </p>

            {/* Verified Deadlines Status Banner */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Verified Active Calls
              </span>
              <span className="text-[#9d93a8] text-[11px]">
                Only verified member and core committee applications with open deadlines are listed
              </span>
            </div>
          </div>

          {/* Action Button */}
          {canCreateEvents && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleCreateClick}
                className="px-5 py-2.5 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white rounded-full font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(255,45,85,0.4)] flex items-center gap-2 transition-transform active:scale-95 hover:brightness-110"
              >
                <Plus className="w-4 h-4" />
                <span>Post an Application</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#26202e]">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7f96]" />
            <input
              type="text"
              placeholder="Search by club, committee, position, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#131017] border border-[#26202e] rounded-full text-xs sm:text-sm text-white placeholder-[#7a6f88] focus:outline-none focus:border-[#ff2d55] transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'all'
                  ? 'bg-[#ff2d55] text-white border border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.35)]'
                  : 'bg-[#181420] text-[#9d93a8] border border-[#26202e] hover:text-white'
              }`}
            >
              All Applications ({allApplications.length})
            </button>

            <button
              onClick={() => setFilterType('closing_soon')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'closing_soon'
                  ? 'bg-[#ff2d55] text-white border border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.35)]'
                  : 'bg-[#181420] text-[#9d93a8] border border-[#26202e] hover:text-white'
              }`}
            >
              ⚠️ Closing Soon
            </button>

            <button
              onClick={() => setFilterType('has_interview')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === 'has_interview'
                  ? 'bg-[#ff2d55] text-white border border-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.35)]'
                  : 'bg-[#181420] text-[#9d93a8] border border-[#26202e] hover:text-white'
              }`}
            >
              🎙️ With Interviews
            </button>

            {hasMyApplications && (
              <button
                onClick={() => setFilterType('my_posts')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === 'my_posts'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                    : 'bg-[#181420] text-[#9d93a8] border border-[#26202e] hover:text-white'
                }`}
              >
                My Posted ({userApplications.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredApplications.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <div className="max-w-md mx-auto bg-[#131017] border border-[#26202e] rounded-2xl p-8 shadow-xl">
            <div className="w-14 h-14 bg-purple-950/60 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-300">
              <FileText className="w-7 h-7" />
            </div>

            {/* Crucial exact requirement string */}
            <h3 className="font-editorial text-2xl font-bold text-white mb-2">
              No applications open currently
            </h3>

            <p className="text-xs sm:text-sm text-[#9d93a8] font-sans-ui leading-relaxed mb-6">
              Clubs and flagship event committees are not accepting member or core committee applications right now. Check back soon or post an application call for your team.
            </p>

            <button
              onClick={handleCreateClick}
              className="px-5 py-2.5 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_0_15px_rgba(255,45,85,0.4)] transition-transform active:scale-95 inline-flex items-center gap-2 hover:brightness-110"
            >
              <Plus className="w-4 h-4" />
              <span>Post an Application</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredApplications.map((app) => {
            const isSaved = savedEventIds.includes(app.id);
            const hasInterview = Boolean(
              app.has_interview || 
              app.interview_details || 
              app.requirements_eligibility?.includes('[HAS_INTERVIEW]')
            );

            const interviewNote = app.interview_details || 
              app.requirements_eligibility?.match(/\[INTERVIEW:\s*([^\]]+)\]/)?.[1];

            const pocName = app.poc_name || 
              app.requirements_eligibility?.match(/\[POC_NAME:\s*([^\]]+)\]/)?.[1];
            const pocNumber = app.poc_number || 
              app.requirements_eligibility?.match(/\[POC_NUMBER:\s*([^\]]+)\]/)?.[1];

            const cleanEligibility = (app.requirements_eligibility || '')
              .replace('[TENTATIVE]', '')
              .replace(/\[FEE:\s*[^\]]+\]/g, '')
              .replace(/\[POC_NAME:\s*[^\]]+\]/g, '')
              .replace(/\[POC_NUMBER:\s*[^\]]+\]/g, '')
              .replace(/\[TYPE:\s*[^\]]+\]/g, '')
              .replace(/\[INTERVIEW:\s*[^\]]+\]/g, '')
              .replace(/\[HAS_INTERVIEW\]/g, '')
              .trim();

            const isExpired = todayStr && app.registration_deadline 
              ? app.registration_deadline.split(' ')[0] < todayStr 
              : false;

            return (
              <div
                key={app.id}
                className="group relative bg-[#131017] text-[#f4f3f6] rounded-xl border border-[#26202e] shadow-xl hover:border-[#ff2d55]/40 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Washi tape accent on top */}
                <div 
                  className="absolute -top-3 left-8 w-24 h-5 bg-[#ff2d55]/80 shadow-[0_0_10px_rgba(255,45,85,0.4)] rotate-[-2deg] z-10 pointer-events-none"
                  style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 96%)' }}
                />

                {/* Top Section / Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-[#ff2d55]/15 border border-[#ff2d55]/30 text-[#ff758f] text-[11px] font-bold uppercase tracking-wider rounded-full truncate max-w-[200px]">
                      {app.organizer}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {canEditEvent(app) && (
                        <button
                          onClick={() => openEditEvent(app)}
                          className="p-1.5 text-neutral-400 hover:text-white bg-[#181420] hover:bg-[#221c2b] rounded-full border border-[#2b2438] transition-colors"
                          title="Edit Application"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            openAuthModal('Sign in with your FLAME email to bookmark applications.');
                            return;
                          }
                          toggleSaveEvent(app.id);
                        }}
                        className={`p-1.5 rounded-full border transition-colors ${
                          isSaved 
                            ? 'bg-[#ff2d55] text-white border-[#ff2d55]' 
                            : 'bg-[#181420] text-neutral-400 hover:text-white border-[#2b2438]'
                        }`}
                        title={isSaved ? 'Saved to Bookmarks' : 'Bookmark for later'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Strict Deadline Warning Banner */}
                  {app.registration_deadline && (
                    <div className={`mb-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 ${
                      isExpired
                        ? 'bg-[#181420] text-neutral-400 border border-[#2b2438]'
                        : 'bg-rose-950/40 border border-rose-500/30 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">
                          {isExpired ? 'Applications Closed' : `Strict Deadline: ${app.registration_deadline}`}
                        </span>
                      </div>
                      {!isExpired && (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-rose-900/60 text-rose-200 rounded-full">
                          Cutoff
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <h3 
                    onClick={() => openEventDetail(app)}
                    className="font-editorial text-lg sm:text-xl font-bold text-white leading-snug hover:text-[#ff758f] cursor-pointer transition-colors mb-2 line-clamp-2"
                  >
                    {app.event_name}
                  </h3>

                  {/* Interview Information Badge */}
                  {hasInterview && (
                    <div className="mb-3 p-2 bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs text-purple-200 flex items-start gap-1.5">
                      <span className="text-sm shrink-0">🎙️</span>
                      <div className="min-w-0">
                        <span className="font-bold block text-[11px] text-purple-200">
                          Interview / Audition Round Later
                        </span>
                        {interviewNote && (
                          <p className="text-[10px] text-purple-300/80 line-clamp-2 mt-0.5">
                            {interviewNote}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Eligibility & Info */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-neutral-300 font-sans-ui">
                    {cleanEligibility && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#181420] border border-[#2b2438] rounded-full text-[11px] font-medium text-neutral-200">
                        <Users className="w-3 h-3 text-[#ff2d55]" />
                        <span>{cleanEligibility}</span>
                      </span>
                    )}

                    {app.room_specific && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#181420] border border-[#2b2438] rounded-full text-[11px] font-medium text-neutral-200">
                        <MapPin className="w-3 h-3 text-[#ff2d55]" />
                        <span className="truncate max-w-[150px]">{app.room_specific}</span>
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-[#9d93a8] line-clamp-3 leading-relaxed font-sans-ui mb-3">
                    {app.description}
                  </p>

                  {/* POC Contact Info if present */}
                  {(pocName || pocNumber) && (
                    <div className="pt-2 border-t border-[#26202e] flex items-center justify-between text-[11px] text-[#9d93a8] font-sans-ui">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-[#ff2d55] shrink-0" />
                        <span className="truncate">POC: <strong className="text-white">{pocName || 'Recruitment Lead'}</strong></span>
                      </div>
                      {pocNumber && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`https://wa.me/${pocNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-colors"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-[#181420] border-t border-[#26202e] flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEventDetail(app)}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                  >
                    View Details
                  </button>

                  {app.registration_link && !isExpired ? (
                    <a
                      href={app.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 bg-gradient-to-r from-[#ff2d55] to-[#e11d48] text-white text-xs font-bold rounded-full shadow-[0_0_12px_rgba(255,45,85,0.3)] flex items-center gap-1.5 transition-transform active:scale-95 hover:brightness-110"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : isExpired ? (
                    <span className="text-xs font-semibold text-neutral-500">
                      Closed
                    </span>
                  ) : (
                    <button
                      onClick={() => openEventDetail(app)}
                      className="px-3.5 py-1.5 bg-[#221c2b] hover:bg-[#2e263a] text-neutral-200 text-xs font-bold rounded-full shadow-xs"
                    >
                      Details &amp; Form
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
