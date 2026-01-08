async function loadTreinos() {
  try {
    const res = await fetch('data/treinos.json');
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    renderTreinos(data);
  } catch (err) {
    console.error('Failed to load treinos.json:', err);
    const container = document.getElementById('workouts');
    if (container) container.textContent = 'Failed to load workouts.';
  }
}

function renderTreinos(treinos) {
  const container = document.getElementById('workouts');
  if (!container) return;
  if (!Array.isArray(treinos) || treinos.length === 0) {
    container.textContent = 'No workouts available.';
    return;
  }
  container.innerHTML = '';
  treinos.forEach(t => {
    const section = document.createElement('section');
    section.className = 'workout';
    section.innerHTML = `
      <h2>${escapeHtml(t.name)}</h2>
      <p><strong>Duration:</strong> ${t.duration ? escapeHtml(t.duration) + ' min' : '-'}</p>
      <div>${(t.exercises || []).map(ex => `<div class="exercise"><strong>${escapeHtml(ex.name)}</strong> — ${escapeHtml(ex.reps || '')}</div>`).join('')}</div>
    `;
    container.appendChild(section);
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', loadTreinos);
