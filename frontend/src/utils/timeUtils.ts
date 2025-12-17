export function getRemainingTime(endTime: string): string {
  if (!endTime) return "N/A";
  
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  
  if (isNaN(end)) return "Invalid date";
  
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatTimeLeft(seconds: number | string): string {
  const sec = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  
  if (isNaN(sec) || sec <= 0) return "Ended";

  const days = Math.floor(sec / (60 * 60 * 24));
  const hours = Math.floor((sec % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((sec % (60 * 60)) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
