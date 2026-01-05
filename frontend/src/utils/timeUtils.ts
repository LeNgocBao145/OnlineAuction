export function getRemainingTime(endTime: string): string {
  if (!endTime) return "N/A";

  const now = new Date().getTime();
  const parseSecureDate = (val: string) => {
    if (!val.includes('Z') && !val.includes('+') && !val.match(/-\d{2}:?\d{2}$/)) {
      return val.replace(' ', 'T');
    }
    return val;
  };
  const end = new Date(parseSecureDate(endTime)).getTime();

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

export function formatTimeLeft(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return "N/A";

  let sec: number;
  if (typeof val === 'string') {
    // Check if it's a date string (has - or T)
    if (val.includes('-') || val.includes('T')) {
      const parseSecureDate = (v: string) => {
        if (!v.includes('Z') && !v.includes('+') && !v.match(/-\d{2}:?\d{2}$/)) {
          return v.replace(' ', 'T');
        }
        return v;
      };
      const end = new Date(parseSecureDate(val)).getTime();
      const now = new Date().getTime();
      sec = Math.floor((end - now) / 1000);
    } else {
      sec = parseFloat(val);
    }
  } else {
    sec = val;
  }

  if (isNaN(sec) || sec <= 0) return "Ended";

  const days = Math.floor(sec / (60 * 60 * 24));
  const hours = Math.floor((sec % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((sec % (60 * 60)) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
