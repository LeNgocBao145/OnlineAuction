/**
 * Generate a color from a string using a simple hash function
 */
function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Generate a data URL for an avatar with initials
 */
export function generateAvatarFromName(name: string): string {
  // Get initials (first letter of first and last word)
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  const bgColor = hashStringToColor(name);
  const size = 200;

  // Create SVG avatar with initials
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-size="80" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle"
        font-family="Arial, sans-serif"
      >
        ${initials}
      </text>
    </svg>
  `.trim();

  // Encode UTF-8 string to base64 (supports Unicode)
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Get avatar URL, generate if not available
 */
export function getAvatarUrl(avatar: string | null | undefined, name: string): string {
  if (avatar && avatar.trim()) {
    return avatar;
  }
  return generateAvatarFromName(name);
}
