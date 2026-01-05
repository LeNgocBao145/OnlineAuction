export function formatDate(val: string | undefined | null) {
  if (!val) return "";
  try {
    let dateStr = val.trim();

    // 1. Convert Space to T for valid ISO format if needed (e.g., "2026-01-05 09:16:15" -> "2026-01-05T09:16:15")
    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T');
    }

    // 2. Force UTC suffix 'Z' if no timezone or offset is present
    // This ensures new Date() treats it as UTC and then toLocaleString() shifts it to Local Time
    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:?\d{2}$/)) {
      dateStr += 'Z';
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return val;

    // 3. Format using vi-VN to get "HH:mm:ss DD/MM/YYYY" format
    return date.toLocaleString('vi-VN', {
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