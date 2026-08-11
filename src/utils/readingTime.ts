export function calculateReadingTime(text: string | undefined | null): string {
  if (!text) return '1 min baca';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min baca`;
}
