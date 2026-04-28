import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userProfile, availableSkills, userSkills } = await req.json();

    if (!availableSkills || availableSkills.length === 0) {
      return NextResponse.json({ error: 'No skills in marketplace yet' }, { status: 400 });
    }

    const prompt = `
You are an elite AI matchmaker for a skill-bartering platform called PraMuse.

Here is the user's profile:
- Name: ${userProfile.name}
- Skills they offer & want:
${userSkills && userSkills.length > 0 ? JSON.stringify(
  userSkills.map((s: { title: string; seeking: string }) => ({
    offering: s.title,
    seeking: s.seeking,
  })),
  null,
  2
) : "None listed yet. Match them based on potential interests."}

Here are the available skills on the marketplace:
${JSON.stringify(
  availableSkills.map((s: { id: string; title: string; seeking: string; category: string; user: { name: string } }) => ({
    id: s.id,
    offering: s.title,
    seeking: s.seeking,
    category: s.category,
    provider: s.user.name,
  })),
  null,
  2
)}

Task: Find the single BEST skill from the list above that would be most valuable for ${userProfile.name} to learn or exchange.
Match them such that what they offer overlaps with what the other person seeks, or what the other person offers overlaps with what ${userProfile.name} seeks. If no direct overlap, pick the best complementary match.

Return ONLY a raw JSON object in this exact format with no markdown or extra text:
{"matchId": "<id string here>", "reason": "<one punchy sentence explaining why this is a perfect match for them>"}
`.trim();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API failed');
    }

    const matchData = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(matchData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Matchmaker API Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
