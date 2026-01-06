/**
 * Time utility functions - All times are standardized to UTC
 */

/**
 * Get current UTC time as Date object
 * @returns {Date} Current UTC time
 */
export function getUTCNow() {
  return new Date();
}

/**
 * Get current UTC time as ISO string
 * @returns {string} Current UTC time in ISO format
 */
export function getUTCNowISO() {
  return new Date().toISOString();
}

/**
 * Convert a date string or Date object to UTC Date
 * @param {string|Date} date - Date to convert
 * @returns {Date} UTC Date object
 */
export function toUTCDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds()
  ));
}

/**
 * Format date for PostgreSQL timestamp (UTC)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string for PostgreSQL
 */
export function formatForPostgres(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

/**
 * Get UTC timestamp in milliseconds
 * @returns {number} Current UTC timestamp in milliseconds
 */
export function getUTCTimestamp() {
  return Date.now();
}

/**
 * Compare two dates in UTC
 * @param {Date|string} date1 
 * @param {Date|string} date2 
 * @returns {number} Negative if date1 < date2, 0 if equal, positive if date1 > date2
 */
export function compareUTCDates(date1, date2) {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return d1 - d2;
}

/**
 * Check if a date has expired (is in the past) in UTC
 * @param {Date|string} date 
 * @returns {boolean} True if date is in the past
 */
export function isExpiredUTC(date) {
  return new Date(date).getTime() < Date.now();
}

/**
 * Add minutes to current UTC time
 * @param {number} minutes 
 * @returns {number} UTC timestamp in milliseconds
 */
export function addMinutesToNow(minutes) {
  return Date.now() + minutes * 60 * 1000;
}

/**
 * Subtract time from current UTC time
 * @param {number} milliseconds 
 * @returns {Date} UTC Date object
 */
export function subtractFromNow(milliseconds) {
  return new Date(Date.now() - milliseconds);
}
