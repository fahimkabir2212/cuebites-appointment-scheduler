// lib/time.ts
export function formatMinute(minute: number) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;

  const hour = h % 12 || 12;
  const suffix = h >= 12 ? "PM" : "AM";

  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}
