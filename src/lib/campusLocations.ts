import { CampusLocation, CampusRouteResult, CampusRouteStep, VenueZone } from '@/types';

export const FLAME_CAMPUS_CENTER = {
  lat: 18.5233078,
  lng: 73.7317384,
  googleMapsUrl: 'https://www.google.com/maps/place/FLAME+University/@18.5233078,73.7317384,17z/data=!4m6!3m5!1s0x3bc2bc338f698dd1:0x26bb10488cf7fe3c!8m2!3d18.5233078!4d73.7317384!16s%2Fg%2F11bw7s1qz1?hl=en-GB&entry=ttu&g_ep=EgoyMDI2MTAxMy4wIKXMDSoASAFQAw%3D%3D',
};

// Pedestrian Hub Nodes calibrated exactly to the real FLAME University Google Maps layout
export interface CampusHubNode {
  id: string;
  name: string;
  x: number; // percentage 0-100 on satellite map
  y: number; // percentage 0-100 on satellite map
  description: string;
}

export const CAMPUS_HUB_NODES: Record<string, CampusHubNode> = {
  hub_vks: {
    id: 'hub_vks',
    name: 'VKS (Vikram Sarabhai) North Loop',
    x: 53,
    y: 21,
    description: 'Northern loop road, VKS lecture halls & executive education',
  },
  hub_new_academic: {
    id: 'hub_new_academic',
    name: 'New Academic Block & Cricket Ground',
    x: 56,
    y: 34,
    description: 'North-central academic classrooms and the circular cricket lawn',
  },
  hub_shantiniketan: {
    id: 'hub_shantiniketan',
    name: 'Shantiniketan Cultural Complex',
    x: 66,
    y: 38,
    description: 'Main auditorium, performance stage, foyer, seminar & dance studios',
  },
  hub_library: {
    id: 'hub_library',
    name: 'Vivekananda Library & Lake',
    x: 62,
    y: 45,
    description: 'Central campus library, lakeside promenade & green study quad',
  },
  hub_academic_core: {
    id: 'hub_academic_core',
    name: 'Central Academic Core (APJ & Aryabhatta)',
    x: 62,
    y: 55,
    description: 'Main academic spine housing APJ, Aryabhatta, Kalidas, Chanakya & Tagore',
  },
  hub_stadium_track: {
    id: 'hub_stadium_track',
    name: 'Football Field & Athletic Track',
    x: 44,
    y: 56,
    description: '400m synthetic running track and FIFA-size football pitch (West campus)',
  },
  hub_arjuna_complex: {
    id: 'hub_arjuna_complex',
    name: 'Arjuna Sports Complex & Pool',
    x: 37,
    y: 66,
    description: 'Indoor sports arena, gym, half-Olympic pool, squash, badminton & cafe',
  },
  hub_outdoor_courts: {
    id: 'hub_outdoor_courts',
    name: 'Outdoor Sports Courts',
    x: 40,
    y: 73,
    description: 'Basketball, tennis, padel, pickleball, handball & volleyball courts',
  },
  hub_chandragupta: {
    id: 'hub_chandragupta',
    name: 'Chandragupta Complex & Amphitheatre',
    x: 63,
    y: 70,
    description: 'Southern academic wing, conference rooms, focus rooms & central amphitheatre',
  },
  hub_dining_charlies: {
    id: 'hub_dining_charlies',
    name: 'Aahar Dining, Charlies & Cafes',
    x: 49,
    y: 80,
    description: 'Aahar Dining Hall, Rasoi, Charlies, Coffee Nation, Hashtag & Convenience Store',
  },
  hub_south_housing: {
    id: 'hub_south_housing',
    name: 'South Housing Area & S-Block',
    x: 45,
    y: 92,
    description: 'Undergraduate & postgraduate residential hostels (S-Block, Q-Block, Block L)',
  },
};

// Pedestrian Walkway Graph Connections with realistic walking distance in meters
export const CAMPUS_EDGES: { u: string; v: string; meters: number; note: string }[] = [
  { u: 'hub_south_housing', v: 'hub_dining_charlies', meters: 110, note: 'Walk North from South Housing past S-Block toward Aahar Dining Hall & Charlies' },
  { u: 'hub_dining_charlies', v: 'hub_outdoor_courts', meters: 85, note: 'Take the paved pathway West toward the outdoor basketball and tennis courts' },
  { u: 'hub_outdoor_courts', v: 'hub_arjuna_complex', meters: 75, note: 'Walk along the sports promenade to the Arjuna Sports Complex & Pool entrance' },
  { u: 'hub_arjuna_complex', v: 'hub_stadium_track', meters: 80, note: 'Head North along the grandstand walkway toward the athletic track and football turf' },
  { u: 'hub_dining_charlies', v: 'hub_chandragupta', meters: 95, note: 'Walk North-East past the student plaza toward the Chandragupta complex' },
  { u: 'hub_chandragupta', v: 'hub_academic_core', meters: 110, note: 'Take the central shaded academic promenade North to APJ & Aryabhatta' },
  { u: 'hub_stadium_track', v: 'hub_academic_core', meters: 125, note: 'Cross the East-West connecting walkway from the stadium into the academic spine' },
  { u: 'hub_academic_core', v: 'hub_library', meters: 85, note: 'Stroll North past the courtyard gardens toward Vivekananda Library & the lake' },
  { u: 'hub_library', v: 'hub_shantiniketan', meters: 75, note: 'Follow the lakeside promenade North-East to Shantiniketan Auditorium' },
  { u: 'hub_library', v: 'hub_new_academic', meters: 90, note: 'Head North-West along the tree-lined path toward the New Academic Block' },
  { u: 'hub_shantiniketan', v: 'hub_new_academic', meters: 80, note: 'Cross the open amphitheatre pavilion between Shantiniketan and New Academic Block' },
  { u: 'hub_new_academic', v: 'hub_vks', meters: 115, note: 'Follow the northern loop road up past the cricket ground to VKS' },
];

// Master Campus Venue Directory (Every single venue calibrated to real Google Maps satellite positions)
export const ALL_CAMPUS_LOCATIONS: CampusLocation[] = [
  // ==========================================
  // 1. CLASSROOMS & LECTURE ROOMS
  // ==========================================
  // APJ Abdul Kalam Block (Central Academic Core)
  {
    id: 'room-apj001',
    name: 'APJ001',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 61,
    y: 53,
    description: 'Ground floor smart classroom with tiered seating and multimedia projector (Central Academic Spine)',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj002',
    name: 'APJ002',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 62,
    y: 53,
    description: 'Ground floor lecture hall, central APJ wing',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj003',
    name: 'APJ003',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 63,
    y: 53,
    description: 'Ground floor seminar room with interactive whiteboard',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj004',
    name: 'APJ004',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 64,
    y: 53,
    description: 'Ground floor lecture room overlooking the courtyard',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj005',
    name: 'APJ005',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 61,
    y: 55,
    description: 'Ground floor classroom, APJ East wing',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj006',
    name: 'APJ006',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 62,
    y: 55,
    description: 'Ground floor discussion and presentation classroom',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj007',
    name: 'APJ007',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 63,
    y: 55,
    description: 'Ground floor classroom, near central staircase',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj008',
    name: 'APJ008',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 64,
    y: 55,
    description: 'Ground floor corner lecture room',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj101',
    name: 'APJ101',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 61,
    y: 52,
    description: 'First floor lecture hall, accessible via central staircase',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj102',
    name: 'APJ102',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 62,
    y: 52,
    description: 'First floor smart classroom',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj104',
    name: 'APJ104',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 63,
    y: 52,
    description: 'First floor case study & seminar room',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj105',
    name: 'APJ105',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 64,
    y: 52,
    description: 'First floor classroom, East corridor',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj106',
    name: 'APJ106',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 65,
    y: 52,
    description: 'First floor classroom with high-definition presentation system',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-apj-design-lab',
    name: 'Design Lab, APJ',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 65,
    y: 54,
    description: 'Innovation & Design Thinking lab with prototyping workspaces',
    hubNodeId: 'hub_academic_core',
  },

  // Aryabhatta Block (ARB) (West wing of Central Academic Spine)
  {
    id: 'room-arb001',
    name: 'ARB001',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 57,
    y: 55,
    description: 'Ground floor lecture classroom, Aryabhatta block',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb002',
    name: 'ARB002',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 58,
    y: 55,
    description: 'Ground floor computing and analytics workspace',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb003',
    name: 'ARB003',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 57,
    y: 57,
    description: 'Ground floor quantitative reasoning lab',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb004',
    name: 'ARB004',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 58,
    y: 57,
    description: 'Ground floor seminar room',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb101',
    name: 'ARB101',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 57,
    y: 54,
    description: 'First floor lecture room, Aryabhatta block',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb102',
    name: 'ARB102',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 58,
    y: 54,
    description: 'First floor computer lab & data science facility',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb103',
    name: 'ARB103',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 57,
    y: 56,
    description: 'First floor classroom with dual interactive displays',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb104',
    name: 'ARB104',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 58,
    y: 56,
    description: 'First floor lecture hall',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb201',
    name: 'ARB201',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 57,
    y: 53,
    description: 'Second floor classroom with campus views',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb202',
    name: 'ARB202',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 58,
    y: 53,
    description: 'Second floor research seminar room',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb203',
    name: 'ARB203',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 57,
    y: 55,
    description: 'Second floor lecture room',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-arb204',
    name: 'ARB204',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 58,
    y: 55,
    description: 'Second floor executive seminar room',
    hubNodeId: 'hub_academic_core',
  },

  // Bhaskaracharya Block (BHS)
  {
    id: 'room-bhs001',
    name: 'BHS001',
    category: 'Classrooms',
    building: 'Bhaskaracharya',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 56,
    y: 53,
    description: 'Ground floor lecture hall, Bhaskaracharya block',
    hubNodeId: 'hub_academic_core',
  },

  // Chanakya Block (CHK)
  {
    id: 'room-chk001',
    name: 'CHK001',
    category: 'Classrooms',
    building: 'Chanakya',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 59,
    y: 60,
    description: 'Ground floor lecture hall, Chanakya academic wing',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-chk101',
    name: 'CHK101',
    category: 'Classrooms',
    building: 'Chanakya',
    floor: 'First Floor',
    zone: 'Academics',
    x: 59,
    y: 59,
    description: 'First floor lecture hall, Chanakya block',
    hubNodeId: 'hub_academic_core',
  },

  // Ramanujan Block (RNJ / Raman)
  {
    id: 'room-raman-001',
    name: 'Raman 001',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 63,
    y: 50,
    description: 'Ground floor lecture room, Ramanujan block',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-rnj001',
    name: 'RNJ001',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 64,
    y: 50,
    description: 'Ground floor seminar hall, Ramanujan block',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-rnj002',
    name: 'RNJ002',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 65,
    y: 50,
    description: 'Ground floor mathematics & logic room',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-rnj101',
    name: 'RNJ101',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'First Floor',
    zone: 'Academics',
    x: 64,
    y: 49,
    description: 'First floor smart classroom, Ramanujan block',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-rnj102',
    name: 'RNJ102',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'First Floor',
    zone: 'Academics',
    x: 65,
    y: 49,
    description: 'First floor lecture hall',
    hubNodeId: 'hub_academic_core',
  },

  // Chandragupta Block (South Academic Complex)
  {
    id: 'room-chandragupta-e-conf-001',
    name: 'Chandragupta E conference Room 001',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 65,
    y: 71,
    description: 'East wing executive conference room, ground floor (Chandragupta)',
    hubNodeId: 'hub_chandragupta',
  },
  {
    id: 'room-chandragupta-w-conf-102',
    name: 'Chandragupta W conference Room 102',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 61,
    y: 71,
    description: 'West wing conference room, first floor',
    hubNodeId: 'hub_chandragupta',
  },
  {
    id: 'room-chandragupta-w-focus-101',
    name: 'Chandragupta W Focus Room 101',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 60,
    y: 71,
    description: 'First floor team collaboration and study focus room',
    hubNodeId: 'hub_chandragupta',
  },
  {
    id: 'room-chandragupta-w-focus-201',
    name: 'Chandragupta W Focus Room 201',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 60,
    y: 70,
    description: 'Second floor quiet study and team breakout room',
    hubNodeId: 'hub_chandragupta',
  },
  {
    id: 'room-chandragupta-w-focus-301',
    name: 'Chandragupta W Focus Room 301',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Third Floor',
    zone: 'Academics',
    x: 60,
    y: 69,
    description: 'Third floor leadership and research focus suite',
    hubNodeId: 'hub_chandragupta',
  },
  {
    id: 'room-chandragupta-lc-ab',
    name: 'Chandragupta LC A&B',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 62,
    y: 72,
    description: 'Learning Centre Sections A & B combined lecture hall',
    hubNodeId: 'hub_chandragupta',
  },
  {
    id: 'room-chandragupta-lc-cd',
    name: 'Chandragupta LC C&D',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 64,
    y: 72,
    description: 'Learning Centre Sections C & D collaborative hall',
    hubNodeId: 'hub_chandragupta',
  },

  // Tagore Block (TGR)
  {
    id: 'room-tgr001',
    name: 'TGR001',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 60,
    y: 51,
    description: 'Ground floor humanities lecture hall, Tagore block',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-tgr002',
    name: 'TGR002',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 61,
    y: 51,
    description: 'Ground floor literature and social sciences seminar room',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-tgr101',
    name: 'TGR101',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'First Floor',
    zone: 'Academics',
    x: 60,
    y: 50,
    description: 'First floor lecture hall, Tagore block',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-tgr102',
    name: 'TGR102',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'First Floor',
    zone: 'Academics',
    x: 61,
    y: 50,
    description: 'First floor seminar room',
    hubNodeId: 'hub_academic_core',
  },

  // Vikram Sarabhai Block (VKS) (North Loop Campus)
  {
    id: 'room-vks001',
    name: 'VKS001',
    category: 'Classrooms',
    building: 'Vikram Sarabhai',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 52,
    y: 20,
    description: 'Ground floor executive lecture hall, VKS North Campus',
    hubNodeId: 'hub_vks',
  },
  {
    id: 'room-vks002',
    name: 'VKS002',
    category: 'Classrooms',
    building: 'Vikram Sarabhai',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 53,
    y: 20,
    description: 'Ground floor seminar room, VKS North Campus',
    hubNodeId: 'hub_vks',
  },
  {
    id: 'room-vks003',
    name: 'VKS003',
    category: 'Classrooms',
    building: 'Vikram Sarabhai',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 54,
    y: 20,
    description: 'Ground floor laboratory and lecture room, VKS block',
    hubNodeId: 'hub_vks',
  },

  // Studios & Special Seminar Rooms
  {
    id: 'room-shantiniketan-seminar',
    name: 'Shanti Niketan Seminar Room',
    category: 'Classrooms',
    building: 'Shantiniketan',
    floor: 'First Floor',
    zone: 'Shantiniketan/Recreational',
    x: 66,
    y: 37,
    description: 'Executive seminar and symposium room in the Shantiniketan Cultural Centre',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'room-arjuna-seminar',
    name: 'Arjuna Seminar Room',
    category: 'Classrooms',
    building: 'Arjuna Sports Complex',
    floor: 'First Floor',
    zone: 'Sports',
    x: 39,
    y: 67,
    description: 'Sports theory, athletic strategy and team briefing seminar room',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'room-painting-studio',
    name: 'Painting Studio',
    category: 'Classrooms',
    building: 'Fine Arts Wing',
    floor: 'Ground Floor',
    zone: 'Shantiniketan/Recreational',
    x: 65,
    y: 61,
    description: 'Visual arts studio with natural lighting and easels',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-sculpture-studio',
    name: 'Sculpture Studio',
    category: 'Classrooms',
    building: 'Fine Arts Wing',
    floor: 'Ground Floor',
    zone: 'Shantiniketan/Recreational',
    x: 66,
    y: 61,
    description: 'Pottery, ceramics, 3D design and sculpture workshop',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'room-sarojini-naidu',
    name: 'Sarojini Naidu',
    category: 'Classrooms',
    building: 'Sarojini Naidu Block',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 65,
    y: 60,
    description: 'Liberal arts conference and seminar room',
    hubNodeId: 'hub_academic_core',
  },

  // ==========================================
  // 2. AUDITORIUMS / HALLS
  // ==========================================
  {
    id: 'venue-shantiniketan-auditorium',
    name: 'Shantiniketan Auditorium',
    category: 'Auditoriums / Halls',
    building: 'Shantiniketan',
    floor: 'Main Stage & Hall',
    zone: 'Shantiniketan/Recreational',
    x: 67,
    y: 38,
    description: 'Premier campus auditorium for concerts, productions, convocations & fests (500+ capacity)',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'venue-kalidas-auditorium',
    name: 'Kalidas Auditorium',
    category: 'Auditoriums / Halls',
    building: 'Kalidas Centre',
    floor: 'Main Hall',
    zone: 'Academics',
    x: 65,
    y: 56,
    description: 'Acoustically treated tiered academic auditorium for keynotes & symposia',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'venue-kalidas-open-amphitheater',
    name: 'Kalidas Open Amphitheater',
    category: 'Auditoriums / Halls',
    building: 'Kalidas Centre',
    floor: 'Outdoor Arena',
    zone: 'Academics',
    x: 66,
    y: 57,
    description: 'Sunken stone amphitheatre for open-mic performances, poetry & acoustic sets',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'venue-chandragupta-amphitheatre',
    name: 'Chandragupta Amphitheatre',
    category: 'Auditoriums / Halls',
    building: 'Chandragupta',
    floor: 'Outdoor Forum',
    zone: 'Academics',
    x: 63,
    y: 70,
    description: 'Central circular forum for student council assemblies, showcases & debates',
    hubNodeId: 'hub_chandragupta',
  },
  {
    id: 'venue-ramanujan-open-amphitheatre',
    name: 'Ramanujan Open Amphitheatre',
    category: 'Auditoriums / Halls',
    building: 'Ramanujan',
    floor: 'Outdoor Courtyard',
    zone: 'Academics',
    x: 64,
    y: 51,
    description: 'Shaded amphitheatre overlooking the central gardens and library pathway',
    hubNodeId: 'hub_academic_core',
  },

  // ==========================================
  // 3. SPORTS FACILITIES (West Campus Complex)
  // ==========================================
  {
    id: 'sports-football-field',
    name: 'Football field',
    category: 'Sports',
    building: 'West Campus Stadium',
    floor: 'Outdoor Pitch',
    zone: 'Sports',
    x: 44,
    y: 56,
    description: 'Full-sized FIFA standard natural turf football field enclosed by athletic track (West Campus)',
    hubNodeId: 'hub_stadium_track',
  },
  {
    id: 'sports-athletic-track-arjuna',
    name: 'Athletic Track, Arjuna',
    category: 'Sports',
    building: 'West Campus Stadium',
    floor: 'Outdoor Stadium',
    zone: 'Sports',
    x: 44,
    y: 56,
    description: '400-meter all-weather synthetic running track encircling the main football pitch',
    hubNodeId: 'hub_stadium_track',
  },
  {
    id: 'sports-cricket-ground',
    name: 'Cricket Ground',
    category: 'Sports',
    building: 'North Campus Oval',
    floor: 'Outdoor Pitch',
    zone: 'Sports',
    x: 57,
    y: 32,
    description: 'Expansive circular cricket turf and pavilion (North Campus near New Academic Block)',
    hubNodeId: 'hub_new_academic',
  },
  {
    id: 'sports-arjuna-complex-main',
    name: 'Arjuna Sports Complex',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Main Arena',
    zone: 'Sports',
    x: 37,
    y: 66,
    description: 'Premier sports complex housing gym, swimming pool, badminton, squash & wellness facilities',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-swimming-pool-arjuna',
    name: 'Swimming Pool, Arjuna',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Aquatic Deck',
    zone: 'Sports',
    x: 36,
    y: 67,
    description: 'Half-Olympic 25-meter temperature-controlled swimming pool with dedicated lanes',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-gym-arjuna',
    name: 'Gym, Arjuna',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'First Floor',
    zone: 'Sports',
    x: 38,
    y: 65,
    description: 'State-of-the-art strength and cardio gymnasium with personal fitness trainers',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-conditioning-studio-arjuna',
    name: 'Conditioning Studio, Arjuna',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor',
    zone: 'Sports',
    x: 38,
    y: 66,
    description: 'Functional movement, HIIT & athletic conditioning fitness studio',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-squash-courts',
    name: 'Squash Courts',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Indoor Arena',
    zone: 'Sports',
    x: 37,
    y: 65,
    description: 'Four wooden maple-floored glass-back tournament squash courts',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-badminton-courts',
    name: 'Badminton Courts',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Indoor Arena',
    zone: 'Sports',
    x: 37,
    y: 67,
    description: 'Indoor badminton hall with synthetic shock-absorbent BWF mats',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-martial-arts-room',
    name: 'Martial Arts Room',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'First Floor',
    zone: 'Sports',
    x: 38,
    y: 67,
    description: 'Padded tatami dojo room for Taekwondo, Karate, Judo & mixed martial arts',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-billiards-snooker-room',
    name: 'Billiards & Snooker Room',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor',
    zone: 'Sports',
    x: 39,
    y: 66,
    description: 'Tournament standard English billiards & cue sports lounge',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-chess-room',
    name: 'Chess Room',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor',
    zone: 'Sports',
    x: 39,
    y: 65,
    description: 'Quiet room for competitive chess tournaments and club matches',
    hubNodeId: 'hub_arjuna_complex',
  },
  {
    id: 'sports-basketball-courts',
    name: 'Basketball courts',
    category: 'Sports',
    building: 'Outdoor Sports Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 40,
    y: 73,
    description: 'Full-court championship basketball courts with acrylic surface and floodlights',
    hubNodeId: 'hub_outdoor_courts',
  },
  {
    id: 'sports-tennis-courts',
    name: 'Tennis Courts',
    category: 'Sports',
    building: 'Outdoor Sports Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 42,
    y: 73,
    description: 'Synthetic hard tennis courts with LED floodlights for evening play',
    hubNodeId: 'hub_outdoor_courts',
  },
  {
    id: 'sports-pickleball-courts',
    name: 'Pickleball Courts',
    category: 'Sports',
    building: 'Outdoor Sports Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 39,
    y: 74,
    description: 'High-bounce tournament regulation pickleball courts',
    hubNodeId: 'hub_outdoor_courts',
  },
  {
    id: 'sports-padel-courts',
    name: 'Padel Courts',
    category: 'Sports',
    building: 'Outdoor Sports Courts',
    floor: 'Outdoor Glass Arena',
    zone: 'Sports',
    x: 39,
    y: 72,
    description: 'Glass-enclosed regulation padel tennis court',
    hubNodeId: 'hub_outdoor_courts',
  },
  {
    id: 'sports-handball-courts',
    name: 'Handball courts',
    category: 'Sports',
    building: 'Outdoor Sports Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 41,
    y: 74,
    description: 'Outdoor regulation handball court with perimeter safety markings',
    hubNodeId: 'hub_outdoor_courts',
  },
  {
    id: 'sports-volleyball-courts',
    name: 'Volleyball Courts',
    category: 'Sports',
    building: 'Outdoor Sports Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 42,
    y: 75,
    description: 'Outdoor volleyball court adjacent to tennis complex',
    hubNodeId: 'hub_outdoor_courts',
  },

  // ==========================================
  // 4. OTHERS (DINING, LIVING, HUBS & STUDY)
  // ==========================================
  {
    id: 'other-vivekananda-library',
    name: 'Vivekananda Library',
    category: 'Others',
    building: 'Vivekananda Library',
    floor: 'Main Reading & Study Hall',
    zone: 'Academics',
    x: 62,
    y: 45,
    description: 'Central campus academic library with silent study halls, research collections & lake view',
    hubNodeId: 'hub_library',
  },
  {
    id: 'other-dance-studio',
    name: 'Dance Studio, Shantiniketan',
    category: 'Others',
    building: 'Shantiniketan',
    floor: 'First Floor',
    zone: 'Shantiniketan/Recreational',
    x: 67,
    y: 39,
    description: 'Mirrored wall rehearsal studio with sprung wooden dance floor in Shantiniketan',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'other-shantiniketan-foyer',
    name: 'Shantiniketan Foyer',
    category: 'Others',
    building: 'Shantiniketan',
    floor: 'Ground Floor',
    zone: 'Shantiniketan/Recreational',
    x: 66,
    y: 38,
    description: 'Spacious exhibition foyer and reception gallery at the entrance of Shantiniketan',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'other-south-housing',
    name: 'South Housing Area',
    category: 'Others',
    building: 'Residential Hostels',
    floor: 'Residential Campus',
    zone: 'Flora & Fauna',
    x: 45,
    y: 92,
    description: 'Student residential dormitories and hostel blocks (South Campus)',
    hubNodeId: 'hub_south_housing',
  },
  {
    id: 'other-s-block',
    name: 'S-Block',
    category: 'Others',
    building: 'Residential Hostels',
    floor: 'Hostel Block S',
    zone: 'Flora & Fauna',
    x: 47,
    y: 91,
    description: 'Hostel S-Block overlooking southern gardens and pedestrian avenue',
    hubNodeId: 'hub_south_housing',
  },
  {
    id: 'other-convenience-store',
    name: 'Convenience Store plaza',
    category: 'Others',
    building: 'Convenience Plaza',
    floor: 'Ground Floor',
    zone: 'Eateries',
    x: 47,
    y: 82,
    description: 'Campus grocery, stationery, printing and daily essentials plaza',
    hubNodeId: 'hub_dining_charlies',
  },
  {
    id: 'other-charlies',
    name: 'Charlies',
    category: 'Others',
    building: 'Convenience Plaza',
    floor: 'Ground Floor',
    zone: 'Eateries',
    x: 48,
    y: 81,
    description: 'Student hangout cafe serving snacks, shakes, coffee & late evening bites',
    hubNodeId: 'hub_dining_charlies',
  },
  {
    id: 'other-aahar',
    name: 'Aahar',
    category: 'Others',
    building: 'Aahar Dining Hall',
    floor: 'Main Dining Hall',
    zone: 'Eateries',
    x: 51,
    y: 79,
    description: 'Primary university multi-cuisine dining hall serving breakfast, lunch and dinner',
    hubNodeId: 'hub_dining_charlies',
  },
  {
    id: 'other-rasoi',
    name: 'Rasoi',
    category: 'Others',
    building: 'Food Court',
    floor: 'Ground Floor',
    zone: 'Eateries',
    x: 50,
    y: 80,
    description: 'Quick-service campus eatery counter serving fresh regional specialties',
    hubNodeId: 'hub_dining_charlies',
  },
  {
    id: 'other-coffee-nation',
    name: 'Coffee Nation',
    category: 'Others',
    building: 'Dining Quad',
    floor: 'Ground Floor & Patio',
    zone: 'Eateries',
    x: 52,
    y: 80,
    description: 'Specialty espresso bar with shaded outdoor courtyard seating',
    hubNodeId: 'hub_dining_charlies',
  },
  {
    id: 'other-hashtag',
    name: 'Hashtag',
    category: 'Others',
    building: 'Dining Quad',
    floor: 'Ground Floor',
    zone: 'Eateries',
    x: 53,
    y: 78,
    description: 'Popular campus cafe hub for sandwiches, wraps and casual hangouts',
    hubNodeId: 'hub_dining_charlies',
  },
  {
    id: 'other-juice-press',
    name: 'Juice Press',
    category: 'Others',
    building: 'Dining Quad',
    floor: 'Ground Floor Kiosk',
    zone: 'Eateries',
    x: 49,
    y: 79,
    description: 'Fresh fruit juices, smoothies, shakes and hydration counter',
    hubNodeId: 'hub_dining_charlies',
  },
  {
    id: 'other-vks-area',
    name: 'VKS Area',
    category: 'Others',
    building: 'Vikram Sarabhai',
    floor: 'North Quad',
    zone: 'Academics',
    x: 53,
    y: 22,
    description: 'Open courtyard and parking loop at VKS North Campus',
    hubNodeId: 'hub_vks',
  },
  {
    id: 'other-ring-road',
    name: 'Ring Road',
    category: 'Others',
    building: 'Campus Perimeter',
    floor: 'Ground Level',
    zone: 'Flora & Fauna',
    x: 74,
    y: 66,
    description: 'Scenic perimeter ring road circling the university campus and hills',
    hubNodeId: 'hub_academic_core',
  },
  {
    id: 'other-arjuna-cafe',
    name: 'Arjuna Cafe',
    category: 'Others',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor Lounge',
    zone: 'Sports',
    x: 36,
    y: 65,
    description: 'Post-workout protein smoothies, healthy snacks and sports nutrition cafe',
    hubNodeId: 'hub_arjuna_complex',
  },
];

export const LOCATION_BY_ID = new Map<string, CampusLocation>(
  ALL_CAMPUS_LOCATIONS.map((loc) => [loc.id, loc])
);

export const LOCATION_BY_NAME = new Map<string, CampusLocation>(
  ALL_CAMPUS_LOCATIONS.map((loc) => [loc.name.toLowerCase().trim(), loc])
);

export function findCampusLocation(query: string): CampusLocation | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();
  const direct = LOCATION_BY_ID.get(q) || LOCATION_BY_NAME.get(q);
  if (direct) return direct;

  return ALL_CAMPUS_LOCATIONS.find((loc) => {
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.building.toLowerCase().includes(q) ||
      (loc.floor && loc.floor.toLowerCase().includes(q))
    );
  });
}

// Build adjacency matrix for campus graph pathfinding
type GraphAdj = Map<string, { to: string; meters: number; note: string }[]>;

const graph: GraphAdj = new Map();

CAMPUS_EDGES.forEach((edge) => {
  if (!graph.has(edge.u)) graph.set(edge.u, []);
  if (!graph.has(edge.v)) graph.set(edge.v, []);
  graph.get(edge.u)!.push({ to: edge.v, meters: edge.meters, note: edge.note });
  graph.get(edge.v)!.push({ to: edge.u, meters: edge.meters, note: edge.note });
});

// Dijkstra pathfinding between two hub nodes
function findShortestHubPath(startHub: string, endHub: string): {
  hubs: string[];
  totalMeters: number;
  notes: string[];
} {
  if (startHub === endHub) {
    return { hubs: [startHub], totalMeters: 0, notes: [] };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, { hub: string; note: string; meters: number } | null>();
  const unvisited = new Set<string>();

  Object.keys(CAMPUS_HUB_NODES).forEach((h) => {
    distances.set(h, Infinity);
    previous.set(h, null);
    unvisited.add(h);
  });

  distances.set(startHub, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minD = Infinity;

    unvisited.forEach((node) => {
      const d = distances.get(node)!;
      if (d < minD) {
        minD = d;
        current = node;
      }
    });

    if (current === null || minD === Infinity) break;
    if (current === endHub) break;

    unvisited.delete(current);

    const neighbors = graph.get(current) || [];
    for (const edge of neighbors) {
      if (unvisited.has(edge.to)) {
        const alt = distances.get(current)! + edge.meters;
        if (alt < distances.get(edge.to)!) {
          distances.set(edge.to, alt);
          previous.set(edge.to, { hub: current, note: edge.note, meters: edge.meters });
        }
      }
    }
  }

  const hubs: string[] = [];
  const notes: string[] = [];
  let curr: string | null = endHub;

  while (curr) {
    hubs.unshift(curr);
    const prev = previous.get(curr);
    if (prev) {
      notes.unshift(prev.note);
      curr = prev.hub;
    } else {
      break;
    }
  }

  return {
    hubs,
    totalMeters: distances.get(endHub) || 120,
    notes,
  };
}

/**
 * Route & Wayfinding Calculator:
 * Computes exact walking time, distance in meters, step count, pace, and step-by-step
 * route guidance with SVG path coordinates for students navigating between campus venues.
 */
export function calculateCampusRoute(
  fromLocationId: string,
  toLocationId: string
): CampusRouteResult | null {
  const from = LOCATION_BY_ID.get(fromLocationId);
  const to = LOCATION_BY_ID.get(toLocationId);

  if (!from || !to) return null;

  // 1. Same location check
  if (from.id === to.id) {
    return {
      fromLocation: from,
      toLocation: to,
      distanceMeters: 0,
      walkTimeMinutes: 0,
      stepsCount: 0,
      paceDescription: 'You are currently at this venue!',
      steps: [
        {
          instruction: `You are already at ${to.name} (${to.building}, ${to.floor || 'Ground'}).`,
          distanceMeters: 0,
        },
      ],
      pathCoordinates: [{ x: from.x, y: from.y }],
      googleMapsUrl: FLAME_CAMPUS_CENTER.googleMapsUrl,
    };
  }

  // 2. Hub to Hub routing
  const hubResult = findShortestHubPath(from.hubNodeId, to.hubNodeId);

  // Additional floor stairs penalty
  let floorPenaltyMeters = 0;
  if (to.floor?.includes('First')) floorPenaltyMeters += 20;
  if (to.floor?.includes('Second')) floorPenaltyMeters += 45;
  if (to.floor?.includes('Third')) floorPenaltyMeters += 70;

  // Local offset distance from venue to its hub
  const localOffsetMeters = from.hubNodeId === to.hubNodeId ? 25 : 45;
  const totalMeters = Math.max(30, hubResult.totalMeters + localOffsetMeters + floorPenaltyMeters);

  // Speed: ~75 meters/min (~4.5 km/h campus walking speed)
  const walkTimeMinutes = Math.max(1, Math.round(totalMeters / 75));
  const stepsCount = Math.round(totalMeters * 1.35);

  // Pacing status
  let paceDescription = 'Gentle 2 min campus walk';
  if (walkTimeMinutes <= 2) {
    paceDescription = '⚡ Quick 1-2 min dash • Nearby venue';
  } else if (walkTimeMinutes <= 4) {
    paceDescription = '🚶 Comfortable 3-4 min walk • Standard campus pace';
  } else {
    paceDescription = '🏃 Cross-campus 5-7 min walk • Head out now to make it on time!';
  }

  // Build step-by-step human directions
  const steps: CampusRouteStep[] = [];

  // Step 1: Departure
  steps.push({
    instruction: `Depart from ${from.name} (${from.building}${from.floor ? `, ${from.floor}` : ''}) onto the campus walkway.`,
    landmark: from.building,
    distanceMeters: 25,
  });

  // Step 2...N: Waypoint instructions
  if (hubResult.notes.length > 0) {
    hubResult.notes.forEach((note) => {
      steps.push({
        instruction: note,
        distanceMeters: Math.round(hubResult.totalMeters / hubResult.notes.length),
      });
    });
  } else if (from.hubNodeId === to.hubNodeId) {
    steps.push({
      instruction: `Walk within the ${from.building} quad directly toward ${to.building}.`,
      distanceMeters: 35,
    });
  }

  // Final Step: Arrival
  steps.push({
    instruction: `Arrive at ${to.name} in ${to.building} (${to.floor || 'Ground Level'}). Look for door signage.`,
    landmark: to.name,
    distanceMeters: 15,
  });

  // Compile smooth path coordinates for SVG canvas drawing:
  const rawCoords: { x: number; y: number }[] = [];
  rawCoords.push({ x: from.x, y: from.y });

  hubResult.hubs.forEach((hId) => {
    const hub = CAMPUS_HUB_NODES[hId];
    if (hub) {
      rawCoords.push({ x: hub.x, y: hub.y });
    }
  });

  rawCoords.push({ x: to.x, y: to.y });

  // Filter consecutive duplicate coordinates
  const pathCoordinates: { x: number; y: number }[] = [];
  rawCoords.forEach((pt) => {
    const last = pathCoordinates[pathCoordinates.length - 1];
    if (!last || Math.abs(last.x - pt.x) > 0.5 || Math.abs(last.y - pt.y) > 0.5) {
      pathCoordinates.push(pt);
    }
  });

  // Direct Google Maps URL with walking mode
  const encodedDest = encodeURIComponent(`FLAME University ${to.name} ${to.building}`);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}&destination_place_id=ChIJ0Y9pjzO8wjsRPPv3jEiQuSY&travelmode=walking`;

  return {
    fromLocation: from,
    toLocation: to,
    distanceMeters: totalMeters,
    walkTimeMinutes,
    stepsCount,
    paceDescription,
    steps,
    pathCoordinates,
    googleMapsUrl,
  };
}
