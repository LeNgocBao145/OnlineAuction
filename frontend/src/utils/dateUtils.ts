export function formatDate(val: string | undefined | null) {
  if(!val) return;
  return new Date(val).toLocaleString("vi-VN");
}