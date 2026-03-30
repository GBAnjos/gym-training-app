export function formatExerciseName(name) {
  if (!name || typeof name !== 'string') return name;
  if (!name.includes('_')) return name;
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
