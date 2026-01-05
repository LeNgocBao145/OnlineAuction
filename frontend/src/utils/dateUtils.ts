const parseSecureDate = (val: string) => {
  if (!val.includes('Z') && !val.includes('+') && !val.match(/-\d{2}:?\d{2}$/)) {
    return val.replace(' ', 'T') + 'Z';
  }
  return val;
};

export function formatDate(val: string | undefined | null) {
  if (!val) return;
  return new Date(parseSecureDate(val)).toLocaleString("vi-VN");
}