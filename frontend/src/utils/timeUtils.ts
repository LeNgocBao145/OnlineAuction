/**
 * Parse date string and ensure it's treated as UTC
 * Backend stores in UTC, so we need to append 'Z' if no timezone info
 */
function parseAsUTC(val: string): string {
  let dateStr = val.trim();
  // Convert space to T for valid ISO format
  if (dateStr.includes(' ') && !dateStr.includes('T')) {
    dateStr = dateStr.replace(' ', 'T');
  }
  // Append Z if no timezone info (treat as UTC)
  if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:?\d{2}$/)) {
    dateStr += 'Z';
  }
  return dateStr;
}

export function getRemainingTime(endTime: string): string {
  if (!endTime) return "N/A";

  const now = Date.now();
  const end = new Date(parseAsUTC(endTime)).getTime();

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
      const end = new Date(parseAsUTC(val)).getTime();
      const now = Date.now();
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
