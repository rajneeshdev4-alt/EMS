export function formatDate(dateString?: string | null) {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  }).format(new Date(dateString));
}