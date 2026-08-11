export function calculateReadingTime(text: string, wpm: number = 200): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wpm);
  return minutes < 1 ? 1 : minutes;
}
