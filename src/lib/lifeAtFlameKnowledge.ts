/**
 * Complete Life@FLAME Knowledge Base
 * Extracted from https://sites.google.com/flame.edu.in/lifeatflame/home
 * Contains flagship events, committees, student leadership, sports, culturals, and campus facilities.
 */

export interface LifeAtFlameTopic {
  title: string;
  category: 'flagship' | 'sports' | 'culturals' | 'committees' | 'clubs' | 'facilities' | 'newsletter';
  keywords: string[];
  summary: string;
  details: string;
  link?: string;
}

export const LIFE_AT_FLAME_PORTAL_URL = 'https://sites.google.com/flame.edu.in/lifeatflame/home';

export const LIFE_AT_FLAME_KNOWLEDGE: LifeAtFlameTopic[] = [
  // 1. Flagship Events
  {
    title: 'Kurukshetra 2026 (Sports Fest)',
    category: 'flagship',
    keywords: ['kurukshetra', 'sports fest', 'inter college sports', 'athletics fest', 'tournaments'],
    summary: 'FLAME’s premier national inter-collegiate sports festival organized by the Sports Committee.',
    details: 'Kurukshetra is FLAME’s flagship annual sports fest featuring inter-college tournaments in football, basketball, cricket, badminton, table tennis, tennis, swimming, squash, and track athletics. Hosted at the Arjuna Centre for Sports.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/flagship-events'
  },
  {
    title: 'FLAME Fest 2026 (Cultural Fest)',
    category: 'flagship',
    keywords: ['flame fest', 'cultural fest', 'annual fest', 'college fest', 'celebration'],
    summary: 'The biggest annual cultural extravaganza on campus organized by the Cultural Committee.',
    details: 'FLAME Fest brings colleges across India together for mega competitions in western & classical dance, battle of the bands, theatre plays, fashion showcases, photography exhibits, and literary debacles, capped off with headline celebrity concerts and DJ nights.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/flagship-events'
  },
  {
    title: 'FirstCut International Film Festival',
    category: 'flagship',
    keywords: ['first cut', 'firstcut', 'film fest', 'movie fest', 'cinema festival', 'short films'],
    summary: 'FLAME’s prestigious student-run international film festival.',
    details: 'FirstCut showcases student and indie short films, documentaries, animation, and fiction films from across the globe. Features jury screenings, panels with leading Bollywood and regional cinema directors, and creative workshops.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/flagship-events'
  },
  {
    title: 'BLAZE (Inter-Housing Sports)',
    category: 'flagship',
    keywords: ['blaze', 'housing sports', 'inter house', 'hostel sports'],
    summary: 'The fierce inter-housing championship where residential blocks compete for campus glory.',
    details: 'BLAZE pits West Housing (Blocks L–S) and East Housing residential blocks against each other across multiple athletic and field events to crown the best student housing community.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/flagship-events'
  },
  {
    title: 'FLAME Maidaan',
    category: 'flagship',
    keywords: ['maidaan', 'flame maidaan', 'cohort sports', 'inter batch'],
    summary: 'Inter-cohort sports league for undergraduate and postgraduate batches.',
    details: 'Maidaan features intense intra-college rivalry across UG1-UG4, BDes, and PG cohorts in football, cricket, volleyball, and racquet sports.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/sports-2025-26'
  },
  {
    title: 'TEDx FLAME University',
    category: 'flagship',
    keywords: ['tedx', 'ted talk', 'tedxflame', 'guest speakers', 'innovators'],
    summary: 'Independently organized TED event spreading revolutionary ideas on campus.',
    details: 'Curates inspiring talks, performances, and networking opportunities with authors, scientists, social entrepreneurs, and changemakers.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/flagship-events'
  },

  // 2. Student Leadership & Committees (2025-26)
  {
    title: 'Sports Committee (2025-26)',
    category: 'sports',
    keywords: ['sports committee', 'soham rasal', 'khushi bhatia', 'sports sec', 'sports secretary'],
    summary: 'Headed by Sports Secretary Soham Rasal & Joint Secretary Khushi Bhatia.',
    details: 'The Sports Committee governs all athletic activities, manages campus sports equipment, organizes Kurukshetra, BLAZE, and Maidaan, and coordinates inter-university team representations. Contact: sportscommittee@flame.edu.in.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/sports-2025-26'
  },
  {
    title: 'Cultural Committee (2025-26)',
    category: 'culturals',
    keywords: ['cultural committee', 'khushi shet', 'aditya mehta', 'cult sec', 'cultural secretary'],
    summary: 'Headed by Cultural Secretary Khushi Shet & Joint Secretary Aditya Mehta.',
    details: 'Coordinates major festivals (Navratri Garba nights, Diwali, Onam, Pongal, Holi) and spearheads FLAME Fest. Supports all 20+ cultural and performing arts clubs on campus. Contact: culturalcommittee@flame.edu.in.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/culturals-2025-26'
  },
  {
    title: 'Student Council',
    category: 'committees',
    keywords: ['student council', 'council', 'student body', 'representation', 'student affairs'],
    summary: 'The apex student government representing the undergraduate and postgraduate student body.',
    details: 'Acts as the bridge between the administration and students, oversees clubs, allocates event budgets, and addresses student campus welfare. Contact: studentcouncil@flame.edu.in.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/home'
  },

  // 3. Clubs & Charter
  {
    title: 'Student Club Charter & Governance',
    category: 'clubs',
    keywords: ['club charter', 'start a club', 'club elections', 'presidential elections', 'office bearers'],
    summary: 'Official rules for joining, leading, or launching a recognized student club.',
    details: 'FLAME houses 30+ student-led clubs across arts, music, dance, literature, debate, social service, coding, marketing, and philosophy. To start a new club, students submit a charter proposal to the Student Council and Election Committee.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/resources'
  },

  // 4. Campus Facilities & Life
  {
    title: 'Arjuna Centre for Sports & Cricket Ground Rules',
    category: 'facilities',
    keywords: ['arjuna', 'sports centre', 'gym', 'pool', 'cricket ground', 'badminton court', 'squash'],
    summary: 'State-of-the-art sports complex housing badminton, gym, squash, swimming, and tennis.',
    details: 'Features Olympic-style swimming pool, indoor wooden badminton courts, glass-back squash courts, modern fitness gym, and floodlit basketball courts. Reminder: walking on the central cricket ground pitch grass is strictly prohibited; students must always use the paved perimeter road.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/home'
  },
  {
    title: 'West Housing & Student Hostels',
    category: 'facilities',
    keywords: ['west housing', 'hostel', 'blocks', 'housing blocks', 'block l', 'block s', 'residence'],
    summary: 'Residential blocks L, M, N, O, P, Q, R, and S located along the scenic western hillside.',
    details: 'West Housing provides student living spaces with high-speed campus WiFi, common lounges, laundry services, and security. Paved hillside roads connect West Housing directly to the central Academic Quad and Plaza.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/home'
  },
  {
    title: 'Dining Hall & Food Spots',
    category: 'facilities',
    keywords: ['dining hall', 'mess', 'cafeteria', 'food spots', 'meals', 'aahar'],
    summary: 'Daily four-meal buffet service and social dining spaces.',
    details: 'The central Dining Hall serves breakfast, lunch, evening snacks/hi-tea, and dinner with rotating vegetarian and multi-cuisine options. Additional quick-bite cafes and tuck shops operate across the FLAME Plaza.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/home'
  },
  {
    title: 'Medical Health Centre & Emergency',
    category: 'facilities',
    keywords: ['medical', 'health centre', 'infirmary', 'doctor', 'ambulance', 'emergency', 'counsellor'],
    summary: '24/7 on-campus infirmary with resident medical officers and emergency ambulance.',
    details: 'Provides round-the-clock primary medical aid, resident nurses, on-call doctors, and ambulance services for quick transit to top Pune hospitals. Professional student mental health counsellors are also available.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/home'
  },
  {
    title: 'Life@FLAME Newsletters & Archives',
    category: 'newsletter',
    keywords: ['newsletter', 'lifeatflame newsletter', 'convocation edition', 'archives', 'student affairs'],
    summary: 'Official student life publications highlighting semester milestones and achievements.',
    details: 'Includes the Convocation Special Edition, April semester review, and September fest editions capturing sports championships, art galas, and student achievements.',
    link: 'https://sites.google.com/flame.edu.in/lifeatflame/newsletter_1'
  }
];
