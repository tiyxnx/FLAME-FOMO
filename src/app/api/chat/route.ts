import { NextRequest, NextResponse } from 'next/server';

interface ChatRequestPayload {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  userContext?: {
    isAuthenticated: boolean;
    name?: string;
    email?: string;
    cohort?: string;
    interests?: string[];
    timetable?: Array<{
      id: string;
      courseName: string;
      day: string;
      timeStart: string;
      timeEnd: string;
      room?: string;
      venueZone?: string;
    }>;
    savedEventIds?: string[];
    goingEventIds?: string[];
    favouriteEventIds?: string[];
  };
  eventsCatalog?: Array<{
    id: string;
    event_name: string;
    category: string;
    categories?: string[];
    date: string;
    time_start_end: string;
    time_start?: string;
    time_end?: string;
    venue_zone: string;
    room_specific?: string;
    organizer: string;
    description: string;
    registration_deadline?: string;
    registration_link?: string;
    registration_fee?: string;
    requirements_eligibility?: string;
    status: string;
    poc_name?: string;
    poc_number?: string;
  }>;
  userApiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestPayload = await req.json();
    const { messages, userContext, eventsCatalog = [], userApiKey } = body;

    const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'NO_API_KEY', 
          message: 'Gemini API key is not configured. Falling back to local campus intelligence engine.' 
        },
        { status: 400 }
      );
    }

    // Build the system prompt
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const currentDayStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentDateStr = now.toISOString().split('T')[0];

    const studentInfo = userContext?.isAuthenticated
      ? `
- Name: ${userContext.name || 'FLAME Student'}
- Email: ${userContext.email}
- Cohort / Year: ${userContext.cohort || 'UG2'}
- Mapped Interests: ${(userContext.interests || []).join(', ') || 'None selected yet'}
- Number of Saved Events: ${userContext.savedEventIds?.length || 0} (IDs: ${userContext.savedEventIds?.join(', ') || 'None'})
- Number of Going Events: ${userContext.goingEventIds?.length || 0} (IDs: ${userContext.goingEventIds?.join(', ') || 'None'})
- Favourited / Starred Events: ${userContext.favouriteEventIds?.length || 0} (IDs: ${userContext.favouriteEventIds?.join(', ') || 'None'})
- Classes & Commitments:
${(userContext.timetable || []).map(t => `  * ${t.day} ${t.timeStart}-${t.timeEnd}: ${t.courseName} (${t.room || t.venueZone || 'Academics'})`).join('\n') || '  * No classes scheduled'}
`
      : 'User is currently browsing as a Guest (unauthenticated). Prompt them warmly to sign in with their @flame.edu.in email if they want their timetable and personalized events synced.';

    const eventsList = eventsCatalog.map(e => `
- [ID: ${e.id}] "${e.event_name}"
  * Category: ${e.categories?.join(', ') || e.category}
  * Date & Time: ${e.date} (${e.time_start_end})
  * Venue: ${e.venue_zone}${e.room_specific ? ` - ${e.room_specific}` : ''}
  * Organizer: ${e.organizer}
  * Deadline: ${e.registration_deadline || 'No strict deadline'}
  * Fee: ${e.registration_fee || 'Free'}
  * Target Eligibility: ${e.requirements_eligibility || 'Open to All'}
  * Registration Link: ${e.registration_link || 'In-app'}
  * Description: ${e.description.slice(0, 150)}...
`).join('\n');

    const systemPrompt = `
You are FOMO Bot (FLAME Genie), the witty, friendly, and ultra-informative campus AI concierge for FLAME University in Pune, Maharashtra.

CURRENT TIME & DATE:
- Today is ${currentDayStr}, ${currentDateStr} at ${currentTimeStr}.

CAMPUS GEOGRAPHY & RULES:
1. Walking on the cricket ground is STRICTLY FORBIDDEN. Pedestrians must use the paved peripheral ring road.
2. Juice Press is spot #28 on the campus map, located at the base of West Housing.
3. West Housing consists of student residential blocks L, M, N, O, P, Q, R, and S.
4. Arjuna Centre for Sports houses indoor badminton, squash courts, gym, table tennis, and the swimming pool.
5. APJ Abdul Kalam Academic Block and Chanakya are primary academic lecture lecture halls.
6. The official cohorts are:
   - UG: UG1, UG2, UG3, UG4
   - BDes: BDes 1, BDes 2, BDes 3, BDes 4
   - PG: PGB1, PGB2, PGC1, PGC2, PGPEI
   - MSc: MSc 1, MSc 2

CURRENT LOGGED-IN STUDENT CONTEXT:
${studentInfo}

LIVE CAMPUS EVENT CATALOG:
${eventsList}

GUIDELINES FOR ANSWERING:
1. "I'm free rn what to do?":
   - Check if they have a class right now based on ${currentDayStr} ${currentTimeStr}.
   - Check which events are happening today or within the next few hours.
   - If nothing is happening right this second, recommend grabbing a fresh juice at Juice Press (#28), visiting FLAME Plaza, or working out at Arjuna Centre.
2. "I wanna take part in some film comp soon what are my options?":
   - Search for film, video, creative, and media competitions (e.g. AD-SHAD Brand Advertisement Challenge by MARKiT x TFR, First Cut Film Festival, Front Row Film Club). Give deadlines, team requirements, and registration links.
3. "What's the next event I'm going to?":
   - Look at the student's Going Event IDs (${userContext?.goingEventIds?.join(', ') || 'None'}).
   - Identify the earliest upcoming event chronologically from today (${currentDateStr}).
   - Give the event name, date, time, venue, and directions!
4. "What all events have I saved?":
   - List the events from their Saved list (${userContext?.savedEventIds?.join(', ') || 'None'}).
5. "Are there any events similar to the ones I've favourited/starred?":
   - Look at their favourited events (${userContext?.favouriteEventIds?.join(', ') || 'None'}).
   - Find active events with matching categories, organizers, or topics that they haven't favorited yet, and recommend them with reasons!
6. Formatting:
   - Keep answers concise, energetic, student-friendly, and well-structured using markdown bullets and bold text.
   - Whenever you recommend an event from the catalog, include its ID like "[EVENT: evt-id]" so the frontend can render an interactive card if desired.
`;

    // Format messages for Google Gemini API
    const geminiContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood! I'm FOMO Bot, your personal FLAME University campus concierge. I have full knowledge of the campus spots, live events, registration links, and the student's personal schedule and saved events. How can I help today?" }]
      },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API Error:', geminiRes.status, errText);
      
      // Fallback to gemini-1.5-flash if 2.0-flash returned error
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          }
        })
      });

      if (!fallbackRes.ok) {
        throw new Error(`Gemini API returned error: ${geminiRes.status}`);
      }

      const fallbackData = await fallbackRes.json();
      const answer = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      return NextResponse.json({ answer, source: 'gemini-1.5-flash' });
    }

    const data = await geminiRes.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({ answer, source: 'gemini-2.0-flash' });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err?.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
