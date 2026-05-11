export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { question, context: ctx } = await request.json();

    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'question is required.' }, { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY_2;
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    const prompt = `Context: ${ctx || ''}\n\nQuestion: ${question}`;
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
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate an answer.";

    return Response.json({ answer });
  } catch (err) {
    return Response.json({ error: err.message || 'Assistant request failed.' }, { status: 500 });
  }
}
