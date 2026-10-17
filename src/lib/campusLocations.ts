import { CampusLocation, CampusRouteResult, CampusRouteStep, VenueZone } from '@/types';

export const FLAME_CAMPUS_CENTER = {
  lat: 18.5233078,
  lng: 73.7317384,
  googleMapsUrl: 'https://www.google.com/maps/place/FLAME+University/@18.5233078,73.7317384,17z/data=!4m6!3m5!1s0x3bc2bc338f698dd1:0x26bb10488cf7fe3c!8m2!3d18.5233078!4d73.7317384!16s%2Fg%2F11bw7s1qz1?hl=en-GB&entry=ttu&g_ep=EgoyMDI2MTAxMy4wIKXMDSoASAFQAw%3D%3D',
};

// Pedestrian Hub Nodes on the Campus Map Canvas (percentage x, y)
export interface CampusHubNode {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
}

export const CAMPUS_HUB_NODES: Record<string, CampusHubNode> = {
  hub_south_housing: {
    id: 'hub_south_housing',
    name: 'South Housing Area & S-Block',
    x: 22,
    y: 84,
    description: 'Student residential hostels, quad walkways & South gates',
  },
  hub_charlies: {
    id: 'hub_charlies',
    name: 'Charlies & Convenience Plaza',
    x: 28,
    y: 75,
    description: 'Campus store plaza, hangout circle & Charlies eatery',
  },
  hub_eateries: {
    id: 'hub_eateries',
    name: 'Aahar & Central Eateries',
    x: 33,
    y: 63,
    description: 'Main Dining Hall, Rasoi, Coffee Nation, Hashtag & Juice Press',
  },
  hub_library: {
    id: 'hub_library',
    name: 'Vivekananda Library & Green Quad',
    x: 38,
    y: 49,
    description: 'Central library building, study lawns & walkway crossing',
  },
  hub_academics_south: {
    id: 'hub_academics_south',
    name: 'Kalidas & Chandragupta Quad',
    x: 48,
    y: 44,
    description: 'Kalidas auditoriums, Chandragupta conference rooms & amphitheatre',
  },
  hub_academics_north: {
    id: 'hub_academics_north',
    name: 'Academic Spine (APJ & Aryabhatta)',
    x: 42,
    y: 34,
    description: 'APJ classrooms, ARB computer labs, Chanakya & Tagore lecture halls',
  },
  hub_shantiniketan: {
    id: 'hub_shantiniketan',
    name: 'Shantiniketan Cultural Centre',
    x: 56,
    y: 53,
    description: 'Main auditorium, performance stage, foyer & dance studios',
  },
  hub_sports_courts: {
    id: 'hub_sports_courts',
    name: 'Outdoor Sports Courts',
    x: 68,
    y: 33,
    description: 'Basketball, Tennis, Padel, Pickleball, Handball & Volleyball courts',
  },
  hub_sports_complex: {
    id: 'hub_sports_complex',
    name: 'Arjuna Sports Complex',
    x: 75,
    y: 24,
    description: 'Indoor badminton, squash, gymnasium, swimming pool & sports cafe',
  },
  hub_grounds: {
    id: 'hub_grounds',
    name: 'Stadium, Cricket & Football Grounds',
    x: 80,
    y: 38,
    description: '400m athletic track, football turf & cricket stadium',
  },
};

// Pedestrian Walkway Graph Connections with distance in meters
export const CAMPUS_EDGES: { u: string; v: string; meters: number; note: string }[] = [
  { u: 'hub_south_housing', v: 'hub_charlies', meters: 85, note: 'Walk along the paved residential path past S-Block towards Charlies' },
  { u: 'hub_charlies', v: 'hub_eateries', meters: 110, note: 'Continue North-East past the convenience store towards Aahar Dining Hall' },
  { u: 'hub_eateries', v: 'hub_library', meters: 95, note: 'Take the central shaded walkway heading North towards Vivekananda Library' },
  { u: 'hub_library', v: 'hub_academics_south', meters: 85, note: 'Cross the central lawn towards the Kalidas Centre & Chandragupta Quad' },
  { u: 'hub_library', v: 'hub_academics_north', meters: 100, note: 'Head up the main academic corridor directly towards APJ and Aryabhatta' },
  { u: 'hub_academics_south', v: 'hub_academics_north', meters: 75, note: 'Walk through the academic spine connector between Kalidas and APJ' },
  { u: 'hub_academics_south', v: 'hub_shantiniketan', meters: 90, note: 'Walk East towards the Shantiniketan entrance plaza and amphitheatre' },
  { u: 'hub_shantiniketan', v: 'hub_sports_courts', meters: 130, note: 'Follow the sports boulevard past the tree grove towards the outdoor courts' },
  { u: 'hub_academics_south', v: 'hub_sports_courts', meters: 140, note: 'Take the cross-campus walkway towards the basketball & tennis courts' },
  { u: 'hub_sports_courts', v: 'hub_sports_complex', meters: 90, note: 'Head North towards the Arjuna Sports Complex grand entrance' },
  { u: 'hub_sports_courts', v: 'hub_grounds', meters: 95, note: 'Step onto the track walkway towards the football turf & cricket pitch' },
  { u: 'hub_sports_complex', v: 'hub_grounds', meters: 105, note: 'Walk down from the Arjuna pavilion to the athletic track and stadium' },
];

// Master Campus Venue Directory (Every single venue provided by user)
export const ALL_CAMPUS_LOCATIONS: CampusLocation[] = [
  // ==========================================
  // 1. CLASSROOMS & LECTURE ROOMS
  // ==========================================
  // APJ Abdul Kalam Block
  {
    id: 'room-apj001',
    name: 'APJ001',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 42,
    y: 33,
    description: 'Ground floor smart classroom with tiered seating and multimedia projector',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj002',
    name: 'APJ002',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 43,
    y: 33,
    description: 'Ground floor lecture hall, central APJ wing',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj003',
    name: 'APJ003',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 44,
    y: 33,
    description: 'Ground floor seminar room with interactive whiteboard',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj004',
    name: 'APJ004',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 45,
    y: 33,
    description: 'Ground floor lecture room next to garden courtyard',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj005',
    name: 'APJ005',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 46,
    y: 33,
    description: 'Ground floor classroom, East APJ corridor',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj006',
    name: 'APJ006',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 47,
    y: 33,
    description: 'Ground floor discussion classroom',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj007',
    name: 'APJ007',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 48,
    y: 33,
    description: 'Ground floor classroom, near staircase',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj008',
    name: 'APJ008',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 49,
    y: 33,
    description: 'Ground floor corner lecture room',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj101',
    name: 'APJ101',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 42,
    y: 31,
    description: 'First floor lecture hall, accessible via central staircase',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj102',
    name: 'APJ102',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 43,
    y: 31,
    description: 'First floor smart classroom',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj104',
    name: 'APJ104',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 45,
    y: 31,
    description: 'First floor seminar & case study room',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj105',
    name: 'APJ105',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 46,
    y: 31,
    description: 'First floor classroom, East wing',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj106',
    name: 'APJ106',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'First Floor',
    zone: 'Academics',
    x: 47,
    y: 31,
    description: 'First floor classroom with high-definition presentation system',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-apj-design-lab',
    name: 'Design Lab, APJ',
    category: 'Classrooms',
    building: 'APJ Abdul Kalam',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 48,
    y: 34,
    description: 'Innovation & Design thinking lab with prototyping stations',
    hubNodeId: 'hub_academics_north',
  },

  // Aryabhatta Block (ARB)
  {
    id: 'room-arb001',
    name: 'ARB001',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 35,
    y: 35,
    description: 'Ground floor lecture classroom, Aryabhatta block',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb002',
    name: 'ARB002',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 36,
    y: 35,
    description: 'Ground floor classroom & computing workspace',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb003',
    name: 'ARB003',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 37,
    y: 35,
    description: 'Ground floor quantitative reasoning lab',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb004',
    name: 'ARB004',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 38,
    y: 35,
    description: 'Ground floor seminar room',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb101',
    name: 'ARB101',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 35,
    y: 33,
    description: 'First floor lecture room, Aryabhatta North wing',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb102',
    name: 'ARB102',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 36,
    y: 33,
    description: 'First floor computer lab & data science facility',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb103',
    name: 'ARB103',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 37,
    y: 33,
    description: 'First floor classroom with dual projectors',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb104',
    name: 'ARB104',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 38,
    y: 33,
    description: 'First floor lecture hall',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb201',
    name: 'ARB201',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 35,
    y: 31,
    description: 'Second floor classroom with campus view',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb202',
    name: 'ARB202',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 36,
    y: 31,
    description: 'Second floor research seminar room',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb203',
    name: 'ARB203',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 37,
    y: 31,
    description: 'Second floor lecture room',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-arb204',
    name: 'ARB204',
    category: 'Classrooms',
    building: 'Aryabhatta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 38,
    y: 31,
    description: 'Second floor executive seminar room',
    hubNodeId: 'hub_academics_north',
  },

  // Bhaskaracharya (BHS)
  {
    id: 'room-bhs001',
    name: 'BHS001',
    category: 'Classrooms',
    building: 'Bhaskaracharya',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 34,
    y: 38,
    description: 'Ground floor lecture hall, Bhaskaracharya block',
    hubNodeId: 'hub_academics_north',
  },

  // Chanakya (CHK)
  {
    id: 'room-chk001',
    name: 'CHK001',
    category: 'Classrooms',
    building: 'Chanakya',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 43,
    y: 41,
    description: 'Ground floor lecture hall, Chanakya academic block',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'room-chk101',
    name: 'CHK101',
    category: 'Classrooms',
    building: 'Chanakya',
    floor: 'First Floor',
    zone: 'Academics',
    x: 43,
    y: 39,
    description: 'First floor lecture hall, Chanakya block',
    hubNodeId: 'hub_academics_south',
  },

  // Ramanujan (RNJ / Raman)
  {
    id: 'room-raman-001',
    name: 'Raman 001',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 49,
    y: 36,
    description: 'Ground floor lecture room, Ramanujan block',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-rnj001',
    name: 'RNJ001',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 50,
    y: 36,
    description: 'Ground floor seminar hall, Ramanujan block',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-rnj002',
    name: 'RNJ002',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 51,
    y: 36,
    description: 'Ground floor mathematics & logic lab',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-rnj101',
    name: 'RNJ101',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'First Floor',
    zone: 'Academics',
    x: 50,
    y: 34,
    description: 'First floor smart classroom, Ramanujan block',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-rnj102',
    name: 'RNJ102',
    category: 'Classrooms',
    building: 'Ramanujan',
    floor: 'First Floor',
    zone: 'Academics',
    x: 51,
    y: 34,
    description: 'First floor lecture hall',
    hubNodeId: 'hub_academics_north',
  },

  // Chandragupta Block
  {
    id: 'room-chandragupta-e-conf-001',
    name: 'Chandragupta E conference Room 001',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 51,
    y: 44,
    description: 'East wing executive conference room, ground floor',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'room-chandragupta-w-conf-102',
    name: 'Chandragupta W conference Room 102',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 49,
    y: 43,
    description: 'West wing conference room, first floor',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'room-chandragupta-w-focus-101',
    name: 'Chandragupta W Focus Room 101',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'First Floor',
    zone: 'Academics',
    x: 48,
    y: 43,
    description: 'First floor focused group meeting & team breakout room',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'room-chandragupta-w-focus-201',
    name: 'Chandragupta W Focus Room 201',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Second Floor',
    zone: 'Academics',
    x: 48,
    y: 41,
    description: 'Second floor quiet study & project focus room',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'room-chandragupta-w-focus-301',
    name: 'Chandragupta W Focus Room 301',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Third Floor',
    zone: 'Academics',
    x: 48,
    y: 39,
    description: 'Third floor leadership focus & discussion suite',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'room-chandragupta-lc-ab',
    name: 'Chandragupta LC A&B',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 50,
    y: 46,
    description: 'Learning Centre Sections A & B combined hall',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'room-chandragupta-lc-cd',
    name: 'Chandragupta LC C&D',
    category: 'Classrooms',
    building: 'Chandragupta',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 52,
    y: 46,
    description: 'Learning Centre Sections C & D collaborative hall',
    hubNodeId: 'hub_academics_south',
  },

  // Tagore Block (TGR)
  {
    id: 'room-tgr001',
    name: 'TGR001',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 40,
    y: 37,
    description: 'Ground floor humanities lecture hall, Tagore block',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-tgr002',
    name: 'TGR002',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 41,
    y: 37,
    description: 'Ground floor literature and language seminar room',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-tgr101',
    name: 'TGR101',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'First Floor',
    zone: 'Academics',
    x: 40,
    y: 35,
    description: 'First floor lecture hall, Tagore block',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-tgr102',
    name: 'TGR102',
    category: 'Classrooms',
    building: 'Tagore',
    floor: 'First Floor',
    zone: 'Academics',
    x: 41,
    y: 35,
    description: 'First floor interactive seminar room',
    hubNodeId: 'hub_academics_north',
  },

  // Vikram Sarabhai (VKS)
  {
    id: 'room-vks001',
    name: 'VKS001',
    category: 'Classrooms',
    building: 'Vikram Sarabhai',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 37,
    y: 37,
    description: 'Ground floor physical sciences lecture hall',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-vks002',
    name: 'VKS002',
    category: 'Classrooms',
    building: 'Vikram Sarabhai',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 38,
    y: 37,
    description: 'Ground floor seminar room, VKS block',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'room-vks003',
    name: 'VKS003',
    category: 'Classrooms',
    building: 'Vikram Sarabhai',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 39,
    y: 37,
    description: 'Ground floor laboratory lecture room',
    hubNodeId: 'hub_academics_north',
  },

  // Special Seminar Rooms & Studios
  {
    id: 'room-shantiniketan-seminar',
    name: 'Shanti Niketan Seminar Room',
    category: 'Classrooms',
    building: 'Shantiniketan',
    floor: 'First Floor',
    zone: 'Shantiniketan/Recreational',
    x: 55,
    y: 51,
    description: 'Quiet executive seminar and symposium room in Shantiniketan',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'room-arjuna-seminar',
    name: 'Arjuna Seminar Room',
    category: 'Classrooms',
    building: 'Arjuna Sports Complex',
    floor: 'First Floor',
    zone: 'Sports',
    x: 74,
    y: 23,
    description: 'Sports theory, sports psychology and team briefing seminar room',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'room-painting-studio',
    name: 'Painting Studio',
    category: 'Classrooms',
    building: 'Fine Arts Wing',
    floor: 'Ground Floor',
    zone: 'Shantiniketan/Recreational',
    x: 53,
    y: 54,
    description: 'Naturally lit visual arts studio with easels and painting equipment',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'room-sculpture-studio',
    name: 'Sculpture Studio',
    category: 'Classrooms',
    building: 'Fine Arts Wing',
    floor: 'Ground Floor',
    zone: 'Shantiniketan/Recreational',
    x: 52,
    y: 55,
    description: '3D modeling, pottery, clay and sculpture workshop studio',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'room-sarojini-naidu',
    name: 'Sarojini Naidu',
    category: 'Classrooms',
    building: 'Sarojini Naidu Block',
    floor: 'Ground Floor',
    zone: 'Academics',
    x: 45,
    y: 47,
    description: 'Liberal arts seminar and conference room',
    hubNodeId: 'hub_academics_south',
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
    x: 56,
    y: 52,
    description: 'Grand campus auditorium with stage lighting, acoustics & 500+ capacity',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'venue-kalidas-auditorium',
    name: 'Kalidas Auditorium',
    category: 'Auditoriums / Halls',
    building: 'Kalidas Centre',
    floor: 'Main Hall',
    zone: 'Academics',
    x: 52,
    y: 41,
    description: 'State-of-the-art tiered academic auditorium for keynotes & symposia',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'venue-kalidas-open-amphitheater',
    name: 'Kalidas Open Amphitheater',
    category: 'Auditoriums / Halls',
    building: 'Kalidas Centre',
    floor: 'Outdoor Arena',
    zone: 'Academics',
    x: 54,
    y: 43,
    description: 'Sunken stone amphitheatre for open mic performances, debates & poetry',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'venue-chandragupta-amphitheatre',
    name: 'Chandragupta Amphitheatre',
    category: 'Auditoriums / Halls',
    building: 'Chandragupta',
    floor: 'Outdoor Forum',
    zone: 'Academics',
    x: 50,
    y: 45,
    description: 'Central circular forum for student gatherings, showcases & rallies',
    hubNodeId: 'hub_academics_south',
  },
  {
    id: 'venue-ramanujan-open-amphitheatre',
    name: 'Ramanujan Open Amphitheatre',
    category: 'Auditoriums / Halls',
    building: 'Ramanujan',
    floor: 'Outdoor Courtyard',
    zone: 'Academics',
    x: 49,
    y: 38,
    description: 'Shaded open amphitheatre overlooking the academic gardens',
    hubNodeId: 'hub_academics_north',
  },

  // ==========================================
  // 3. SPORTS FACILITIES
  // ==========================================
  {
    id: 'sports-football-field',
    name: 'Football field',
    category: 'Sports',
    building: 'Campus Stadium',
    floor: 'Outdoor Pitch',
    zone: 'Sports',
    x: 75,
    y: 38,
    description: 'Full-sized FIFA standard natural turf football field with floodlights',
    hubNodeId: 'hub_grounds',
  },
  {
    id: 'sports-handball-courts',
    name: 'Handball courts',
    category: 'Sports',
    building: 'Outdoor Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 70,
    y: 36,
    description: 'Dedicated outdoor handball court with marked safety boundaries',
    hubNodeId: 'hub_sports_courts',
  },
  {
    id: 'sports-athletic-track-arjuna',
    name: 'Athletic Track, Arjuna',
    category: 'Sports',
    building: 'Arjuna Stadium',
    floor: 'Outdoor Stadium',
    zone: 'Sports',
    x: 80,
    y: 40,
    description: '400-meter synthetic running track encircling the main stadium pitch',
    hubNodeId: 'hub_grounds',
  },
  {
    id: 'sports-pickleball-courts',
    name: 'Pickleball Courts',
    category: 'Sports',
    building: 'Outdoor Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 67,
    y: 27,
    description: 'High-bounce tournament standard pickleball courts',
    hubNodeId: 'hub_sports_courts',
  },
  {
    id: 'sports-padel-courts',
    name: 'Padel Courts',
    category: 'Sports',
    building: 'Outdoor Courts',
    floor: 'Outdoor Glass Enclosure',
    zone: 'Sports',
    x: 66,
    y: 25,
    description: 'Glass-enclosed international regulation padel tennis court',
    hubNodeId: 'hub_sports_courts',
  },
  {
    id: 'sports-squash-courts',
    name: 'Squash Courts',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Indoor Arena',
    zone: 'Sports',
    x: 77,
    y: 22,
    description: 'Four wooden maple-floored glass-back squash courts',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-badminton-courts',
    name: 'Badminton Courts',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Indoor Arena',
    zone: 'Sports',
    x: 76,
    y: 25,
    description: 'Indoor badminton hall with synthetic BWF regulation mats',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-gym-arjuna',
    name: 'Gym, Arjuna',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'First Floor',
    zone: 'Sports',
    x: 75,
    y: 22,
    description: 'Full-service gymnasium with free weights, cardio decks & trainers',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-swimming-pool-arjuna',
    name: 'Swimming Pool, Arjuna',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Outdoor Aquatic Deck',
    zone: 'Sports',
    x: 71,
    y: 28,
    description: 'Half-Olympic 25-meter temperature-controlled swimming pool & lanes',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-conditioning-studio-arjuna',
    name: 'Conditioning Studio, Arjuna',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor',
    zone: 'Sports',
    x: 76,
    y: 23,
    description: 'Athletic strength & conditioning studio with resistance ropes and sleds',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-cricket-ground',
    name: 'Cricket Ground',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Outdoor Pitch',
    zone: 'Sports',
    x: 84,
    y: 32,
    description: 'Expansive lush green cricket pitch with natural turf and pavilion',
    hubNodeId: 'hub_grounds',
  },
  {
    id: 'sports-volleyball-courts',
    name: 'Volleyball Courts',
    category: 'Sports',
    building: 'Outdoor Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 72,
    y: 34,
    description: 'Regulation clay & synthetic outdoor volleyball courts',
    hubNodeId: 'hub_sports_courts',
  },
  {
    id: 'sports-tennis-courts',
    name: 'Tennis Courts',
    category: 'Sports',
    building: 'Outdoor Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 68,
    y: 22,
    description: 'Synthetic hard tennis courts with LED floodlights for evening play',
    hubNodeId: 'hub_sports_courts',
  },
  {
    id: 'sports-martial-arts-room',
    name: 'Martial Arts Room',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'First Floor',
    zone: 'Sports',
    x: 74,
    y: 21,
    description: 'Padded tatami dojo room for Taekwondo, Karate & mixed martial arts',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-billiards-snooker-room',
    name: 'Billiards & Snooker Room',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor',
    zone: 'Sports',
    x: 73,
    y: 22,
    description: 'Tournament standard slate snooker and English billiards tables',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-chess-room',
    name: 'Chess Room',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor',
    zone: 'Sports',
    x: 72,
    y: 21,
    description: 'Quiet room for competitive chess tournaments and clock games',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-arjuna-complex-main',
    name: 'Arjuna Sports Complex',
    category: 'Sports',
    building: 'Arjuna Sports Complex',
    floor: 'Main Complex',
    zone: 'Sports',
    x: 75,
    y: 24,
    description: 'Premier sports hub housing indoor courts, fitness studios & amenities',
    hubNodeId: 'hub_sports_complex',
  },
  {
    id: 'sports-basketball-courts',
    name: 'Basketball courts',
    category: 'Sports',
    building: 'Outdoor Courts',
    floor: 'Outdoor Courts',
    zone: 'Sports',
    x: 69,
    y: 32,
    description: 'Full-court championship basketball courts with acrylic surface',
    hubNodeId: 'hub_sports_courts',
  },

  // ==========================================
  // 4. OTHERS (DINING, LIVING, HUBS & STUDY)
  // ==========================================
  {
    id: 'other-dance-studio',
    name: 'Dance Studio, Shantiniketan',
    category: 'Others',
    building: 'Shantiniketan',
    floor: 'First Floor',
    zone: 'Shantiniketan/Recreational',
    x: 57,
    y: 54,
    description: 'Mirrored wall rehearsal studio with sprung wooden dance floors',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'other-shantiniketan-foyer',
    name: 'Shantiniketan Foyer',
    category: 'Others',
    building: 'Shantiniketan',
    floor: 'Ground Floor',
    zone: 'Shantiniketan/Recreational',
    x: 55,
    y: 51,
    description: 'Expansive gallery foyer for exhibitions, registrations & receptions',
    hubNodeId: 'hub_shantiniketan',
  },
  {
    id: 'other-convenience-store',
    name: 'Convenience Store plaza',
    category: 'Others',
    building: 'Convenience Plaza',
    floor: 'Ground Floor',
    zone: 'Eateries',
    x: 27,
    y: 76,
    description: 'On-campus grocery, stationery and daily essentials store plaza',
    hubNodeId: 'hub_charlies',
  },
  {
    id: 'other-charlies',
    name: 'Charlies',
    category: 'Others',
    building: 'Convenience Plaza',
    floor: 'Ground Floor',
    zone: 'Eateries',
    x: 29,
    y: 74,
    description: 'Popular student hangout cafe serving fast food, shakes & late snacks',
    hubNodeId: 'hub_charlies',
  },
  {
    id: 'other-coffee-nation',
    name: 'Coffee Nation',
    category: 'Others',
    building: 'Dining Quad',
    floor: 'Ground Floor & Patio',
    zone: 'Eateries',
    x: 36,
    y: 65,
    description: 'Specialty espresso bar with outdoor shaded patio seating',
    hubNodeId: 'hub_eateries',
  },
  {
    id: 'other-aahar',
    name: 'Aahar',
    category: 'Others',
    building: 'Aahar Dining Hall',
    floor: 'Main Dining Hall',
    zone: 'Eateries',
    x: 32,
    y: 58,
    description: 'Primary campus multi-cuisine dining hall with meal service',
    hubNodeId: 'hub_eateries',
  },
  {
    id: 'other-rasoi',
    name: 'Rasoi',
    category: 'Others',
    building: 'Food Court',
    floor: 'Ground Floor Counter',
    zone: 'Eateries',
    x: 30,
    y: 64,
    description: 'Quick-service campus eatery counter serving fresh regional meals',
    hubNodeId: 'hub_eateries',
  },
  {
    id: 'other-vivekananda-library',
    name: 'Vivekananda Library',
    category: 'Others',
    building: 'Vivekananda Library',
    floor: 'Main Reading & Study Hall',
    zone: 'Academics',
    x: 38,
    y: 47,
    description: 'Two-story central academic library with quiet zones & group rooms',
    hubNodeId: 'hub_library',
  },
  {
    id: 'other-juice-press',
    name: 'Juice Press',
    category: 'Others',
    building: 'Dining Quad',
    floor: 'Ground Floor Kiosk',
    zone: 'Eateries',
    x: 34,
    y: 60,
    description: 'Fresh fruit juice, smoothies and cold beverage kiosk',
    hubNodeId: 'hub_eateries',
  },
  {
    id: 'other-vks-area',
    name: 'VKS Area',
    category: 'Others',
    building: 'Vikram Sarabhai',
    floor: 'Courtyard',
    zone: 'Academics',
    x: 38,
    y: 39,
    description: 'Open central courtyard plaza between VKS and Aryabhatta blocks',
    hubNodeId: 'hub_academics_north',
  },
  {
    id: 'other-south-housing',
    name: 'South Housing Area',
    category: 'Others',
    building: 'Hostels Complex',
    floor: 'Residential Campus',
    zone: 'Flora & Fauna',
    x: 22,
    y: 84,
    description: 'Undergraduate and postgraduate student residential dormitories',
    hubNodeId: 'hub_south_housing',
  },
  {
    id: 'other-s-block',
    name: 'S-Block',
    category: 'Others',
    building: 'Hostels Complex',
    floor: 'Hostel Block',
    zone: 'Flora & Fauna',
    x: 25,
    y: 82,
    description: 'Student hostel block S overlooking the southern landscape gardens',
    hubNodeId: 'hub_south_housing',
  },
  {
    id: 'other-ring-road',
    name: 'Ring Road',
    category: 'Others',
    building: 'Campus Perimeter',
    floor: 'Ground Level',
    zone: 'Flora & Fauna',
    x: 20,
    y: 60,
    description: 'Pedestrian & golf-cart ring pathway circling the FLAME campus',
    hubNodeId: 'hub_south_housing',
  },
  {
    id: 'other-hashtag',
    name: 'Hashtag',
    category: 'Others',
    building: 'Dining Quad',
    floor: 'Ground Floor',
    zone: 'Eateries',
    x: 39,
    y: 61,
    description: 'Student cafe hub known for sandwiches, fries & evening conversations',
    hubNodeId: 'hub_eateries',
  },
  {
    id: 'other-arjuna-cafe',
    name: 'Arjuna Cafe',
    category: 'Others',
    building: 'Arjuna Sports Complex',
    floor: 'Ground Floor Lounge',
    zone: 'Sports',
    x: 73,
    y: 25,
    description: 'Post-workout protein smoothies, healthy wraps and energy drinks cafe',
    hubNodeId: 'hub_sports_complex',
  },
];

// Helper quick lookup by venue name or ID
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

  // Partial search
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
  const localOffsetMeters = from.hubNodeId === to.hubNodeId ? 30 : 50;
  const totalMeters = Math.max(30, hubResult.totalMeters + localOffsetMeters + floorPenaltyMeters);

  // Speed: ~75 meters/min (~4.5 km/h campus walking speed)
  const walkTimeMinutes = Math.max(1, Math.round(totalMeters / 75));
  const stepsCount = Math.round(totalMeters * 1.35);

  // Pacing status
  let paceDescription = 'Gentle 2 min campus walk';
  if (walkTimeMinutes <= 2) {
    paceDescription = '⚡ Quick 1-2 min dash • Nearby location';
  } else if (walkTimeMinutes <= 4) {
    paceDescription = '🚶 Comfortable 3-4 min walk • Standard campus pace';
  } else {
    paceDescription = '🏃 Cross-campus 5-7 min walk • Head out now to make it on time!';
  }

  // Build step-by-step human directions
  const steps: CampusRouteStep[] = [];

  // Step 1: Departure
  steps.push({
    instruction: `Start at ${from.name} (${from.building}${from.floor ? `, ${from.floor}` : ''}) and exit onto the main walkway.`,
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
      instruction: `Walk within the ${from.building} quad toward ${to.building}.`,
      distanceMeters: 40,
    });
  }

  // Final Step: Arrival
  steps.push({
    instruction: `Arrive at ${to.name} in ${to.building} (${to.floor || 'Ground Level'}). Look for room signage.`,
    landmark: to.name,
    distanceMeters: 15,
  });

  // Compile smooth path coordinates for SVG canvas drawing:
  // [From venue] -> [From Hub] -> [Intermediate Hubs] -> [To Hub] -> [To venue]
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
