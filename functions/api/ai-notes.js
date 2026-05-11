export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { title, transcript } = await request.json();

    if (!title) {
      return Response.json({ error: 'title is required.' }, { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY_1;
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    const prompt = `Generate comprehensive study notes for this video.
Video Title: ${title}
Transcript: ${transcript || 'No transcript available'}

Return ONLY valid JSON with this exact structure:
{"summary":"2-3 sentence summary","keyPoints":["point1","point2"],"concepts":["concept1","concept2"]}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!geminiRes.ok) {
      const details = await geminiRes.text();
      return Response.json({ error: `Gemini API error: ${details}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let notes = { summary: '', keyPoints: [], concepts: [] };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) notes = JSON.parse(match[0]);
      else notes.summary = raw;
    } catch {
      notes.summary = raw;
    }

    return Response.json({ notes });
  } catch (err) {
    return Response.json({ error: err.message || 'Failed to generate notes.' }, { status: 500 });
  }
}
