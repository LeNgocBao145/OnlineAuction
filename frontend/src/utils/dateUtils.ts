// Vietnam timezone (UTC+7)
const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function formatDate(val: string | undefined | null) {
  if (!val) return "";
  try {
    let dateStr = val.trim();

    // 1. Convert Space to T for valid ISO format if needed (e.g., "2026-01-05 09:16:15" -> "2026-01-05T09:16:15")
    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T');
    }

    // 2. Force UTC suffix 'Z' if no timezone or offset is present
    // Backend stores in UTC, so we append 'Z' to indicate it's UTC
    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:?\d{2}$/)) {
      dateStr += 'Z';
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return val;

    // 3. Format using vi-VN locale with explicit Vietnam timezone (UTC+7)
    return date.toLocaleString('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour12: false
    }).replace(',', '');
  } catch (error) {
    console.error("formatDate error:", error);
    return val || "";
  }
}

/**
 * Format date for display in Vietnam timezone (UTC+7)
 * Only shows date without time
 */
export function formatDateOnly(val: string | undefined | null) {
  if (!val) return "";
  try {
    let dateStr = val.trim();

    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T');
    }

    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:?\d{2}$/)) {
      dateStr += 'Z';
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return val;

    return date.toLocaleDateString('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error("formatDateOnly error:", error);
    return val || "";
  }
}

/**
 * Format time for display in Vietnam timezone (UTC+7)
 * Only shows time without date
 */
export function formatTimeOnly(val: string | undefined | null) {
  if (!val) return "";
  try {
    let dateStr = val.trim();

    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T');
    }

    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:?\d{2}$/)) {
      dateStr += 'Z';
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return val;

    return date.toLocaleTimeString('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("formatTimeOnly error:", error);
    return val || "";
  }
}