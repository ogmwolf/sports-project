import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { school } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  const prompt = `You are a college volleyball recruiting email writer. Write a unique, personalized recruiting email from this athlete to this college coach.

ATHLETE PROFILE:
Name: Sofia Reyes
Position: OH (Outside Hitter)
Grad Year: 2029
Club: SC Rockstar 16U
High School: Mira Costa HS
Height: 5'10"
GPA: 3.9
Stats: Kill% .312, Kills/set 3.8, Attacks/set 8.2
Highlight reel: linked on Scoutly profile
Recent tournament: Red Rock Rave #1, Las Vegas — went 4-1 in pool play
Interests: Marine biology, considering pre-med

TARGET PROGRAM:
School: ${school.name}
Coach: ${school.coach}
Division: ${school.division}
Conference: ${school.conference}
Current relationship status: ${school.status}
Notes: ${school.notes || "none"}

RULES:
- Write in Sofia's voice — 17 year old, driven, genuine, not corporate
- Reference specific details from her profile naturally — don't list them
- If status is Offered, acknowledge the offer warmly and express continued interest without being over the top
- If status is Contacted, this is a follow-up — reference that first contact
- If status is Interested, this is a first contact
- Mention the recent tournament naturally
- Reference her highlight reel naturally
- Keep it under 200 words
- Do NOT use templates or clichés like "I have been following your program" or "I would be honored"
- Include a subject line at the top formatted as: Subject: [subject line]
- Make it feel like only Sofia could have written this email to this specific coach

Write the email now.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Anthropic API error" }, { status: 500 });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  return NextResponse.json({ text });
}
