import { NextRequest, NextResponse } from 'next/server';
import { LIFE_AT_FLAME_KNOWLEDGE, LIFE_AT_FLAME_PORTAL_URL } from '@/lib/lifeAtFlameKnowledge';

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
          fallbackToLocal: true,
          message: 'Gemini API key is not configured. Falling back to local campus intelligence engine.' 
        },
        { status: 200 }
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
You are FOMO Bot. Talk like a real, chill FLAME student talking to a college friend. 
Be casual, relaxed, and use simple language. No corporate buzzwords, no cheesy marketing speak, and no robotic persona.
Greet with "hello" instead of "yo".
Understand and casually use college slang and short forms like "rn" (right now), "smth" (something), "tmrw" (tomorrow), "wknd" (weekend), "comps" (competitions), "bc" (because), and "u" / "ur".
Keep answers brief, direct, and conversational. 
Do NOT bring up Juice Press unless the user specifically asks about it.

CURRENT TIME & DATE:
- Today is ${currentDayStr}, ${currentDateStr} at ${currentTimeStr}.

CAMPUS INFO & RULES:
1. Walking on the cricket ground isn't allowed — gotta stick to the peripheral roads around it.
2. West Housing has blocks L through S.
3. Arjuna Centre for Sports has indoor badminton, squash, gym, and the pool.
4. APJ and Chanakya are the main academic lecture halls.
5. Cohorts: UG1-4, BDes 1-4, PGB1-2, PGC1-2, PGPEI, MSc 1-2.

BACKGROUND KNOWLEDGE FROM LIFE@FLAME (${LIFE_AT_FLAME_PORTAL_URL}):
${LIFE_AT_FLAME_KNOWLEDGE.map(k => `* **${k.title}** (${k.category}): ${k.summary} — ${k.details} [Link: ${k.link || LIFE_AT_FLAME_PORTAL_URL}]`).join('\n')}

STUDENT PROFILE & SCHEDULE:
${studentInfo}

LIVE CAMPUS EVENTS:
${eventsList}

HOW TO TALK & ANSWER (LIKE CHATGPT):
1. Talk back naturally to ANY message:
   - If user says "nah", "no", "whatever" -> respond like a chill friend ("fair enough haha, just chilling then?").
   - If user laughs ("sjsjjajaja", "hahaha", "lmao") -> laugh with them and keep it playful ("lmao what's got u laughing? 😂").
   - If user asks casual questions or chit-chats -> talk back fluently, never repeat the same canned sentence!
2. "I'm free rn what to do?":
   - Check if they have class right now based on ${currentDayStr} ${currentTimeStr}.
   - Tell them if they're free or when their next class is in a casual way.
   - List upcoming events happening today or this week.
   - You can mention hanging out at the Plaza, sports at Arjuna Centre, or checking Life@FLAME. Do NOT mention Juice Press.
3. Flagship events & campus life (Kurukshetra, FLAME Fest, Blaze, FirstCut Film Fest, TEDx, Maidaan):
   - Answer with details from the Life@FLAME knowledge base and include the link (${LIFE_AT_FLAME_PORTAL_URL})!
4. "Film competitions / creative comps":
   - Point out active film, media, and video comps (like AD-SHAD Brand Challenge, Bunkasai, etc.) with dates and links.
5. "Next event I'm going to":
   - Check their Going list (${userContext?.goingEventIds?.join(', ') || 'None'}).
   - Tell them their earliest upcoming event, the time, and where to go.
6. "Events I have saved":
   - List what they've saved (${userContext?.savedEventIds?.join(', ') || 'None'}).
7. "Similar to my favourites":
   - Recommend upcoming events that match the genres/categories of what they starred (${userContext?.favouriteEventIds?.join(', ') || 'None'}).
8. Formatting:
   - Keep it short, clean, dynamic, and conversational.
   - If recommending an event from the list, tag it like "[EVENT: evt-id]" so the app shows an interactive card.
`;

    // Format messages for Google Gemini API
    const geminiContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: "hello! what's up? i got you. ask me whatever you need about events, comps, your classes, or what's on your schedule." }]
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
