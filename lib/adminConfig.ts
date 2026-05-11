export function getYoutubeApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY environment variable.");
  return key;
}

export function getGeminiApiKey(index: 1 | 2 | 3): string {
  const key = process.env[`GEMINI_API_KEY_${index}`];
  if (!key) throw new Error(`Missing GEMINI_API_KEY_${index} environment variable.`);
  return key;
}
