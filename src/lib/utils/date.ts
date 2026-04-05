export function getLocalDateString(): string {
  const now = new Date();
  return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
}