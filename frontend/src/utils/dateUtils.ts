export function formatDate(val: string) {
  if(!val) return;
  return new Date(val).toLocaleString("vi-VN");
}