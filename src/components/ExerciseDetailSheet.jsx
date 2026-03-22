export function ExerciseDetailSheet({ exercise, language, onClose }) {
  if (!exercise) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
         onClick={onClose}>
      <div style={{ background: 'var(--color-bg-primary)', borderRadius: '16px 16px 0 0', padding: '24px', width: '100%', maxWidth: 500 }}
           onClick={e => e.stopPropagation()}>
        <h2>{exercise.name}</h2>
        <p>Detail sheet — full implementation in Task 6</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
