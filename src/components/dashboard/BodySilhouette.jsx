export function BodySilhouette({ muscleSets, view = 'front', maxSets }) {
  const getOpacity = (group) => {
    if (!maxSets || maxSets === 0) return 0.08;
    const sets = muscleSets[group] || 0;
    return Math.max(0.08, Math.min(1, sets / maxSets));
  };

  const color = 'var(--color-accent-primary)';

  if (view === 'front') {
    return (
      <svg viewBox="0 0 120 280" className="body-silhouette">
        {/* Head */}
        <ellipse cx="60" cy="22" rx="14" ry="16" fill="var(--color-text-muted)" opacity="0.15" />
        {/* Neck */}
        <rect x="53" y="37" width="14" height="10" rx="3" fill="var(--color-text-muted)" opacity="0.15" />
        {/* Shoulders */}
        <path d="M30,52 Q38,44 53,47 L53,60 L30,60 Z" fill={color} opacity={getOpacity('Shoulders')} />
        <path d="M90,52 Q82,44 67,47 L67,60 L90,60 Z" fill={color} opacity={getOpacity('Shoulders')} />
        {/* Chest */}
        <path d="M40,60 L80,60 L78,90 Q60,95 42,90 Z" fill={color} opacity={getOpacity('Chest')} />
        {/* Core */}
        <path d="M45,90 L75,90 L73,145 Q60,148 47,145 Z" fill={color} opacity={getOpacity('Core')} />
        {/* Biceps */}
        <path d="M25,62 L38,62 L36,105 L23,105 Z" fill={color} opacity={getOpacity('Arms')} />
        <path d="M82,62 L95,62 L97,105 L84,105 Z" fill={color} opacity={getOpacity('Arms')} />
        {/* Forearms */}
        <path d="M22,107 L36,107 L33,150 L19,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
        <path d="M84,107 L98,107 L101,150 L87,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
        {/* Quads */}
        <path d="M42,148 L58,148 L55,215 L38,215 Z" fill={color} opacity={getOpacity('Legs')} />
        <path d="M62,148 L78,148 L82,215 L65,215 Z" fill={color} opacity={getOpacity('Legs')} />
        {/* Calves */}
        <path d="M38,218 L55,218 L53,270 L40,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
        <path d="M65,218 L82,218 L80,270 L67,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
      </svg>
    );
  }

  // Back view
  return (
    <svg viewBox="0 0 120 280" className="body-silhouette">
      {/* Head */}
      <ellipse cx="60" cy="22" rx="14" ry="16" fill="var(--color-text-muted)" opacity="0.15" />
      {/* Neck */}
      <rect x="53" y="37" width="14" height="10" rx="3" fill="var(--color-text-muted)" opacity="0.15" />
      {/* Traps */}
      <path d="M38,47 L53,47 L53,60 L35,60 Z" fill={color} opacity={getOpacity('Back') * 0.8} />
      <path d="M82,47 L67,47 L67,60 L85,60 Z" fill={color} opacity={getOpacity('Back') * 0.8} />
      {/* Back / Lats */}
      <path d="M38,60 L82,60 L80,110 Q60,118 40,110 Z" fill={color} opacity={getOpacity('Back')} />
      {/* Lower back */}
      <path d="M45,110 L75,110 L73,145 Q60,148 47,145 Z" fill={color} opacity={getOpacity('Core') * 0.6} />
      {/* Triceps */}
      <path d="M22,62 L36,62 L34,105 L20,105 Z" fill={color} opacity={getOpacity('Arms')} />
      <path d="M84,62 L98,62 L100,105 L86,105 Z" fill={color} opacity={getOpacity('Arms')} />
      {/* Forearms */}
      <path d="M19,107 L34,107 L31,150 L17,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
      <path d="M86,107 L100,107 L103,150 L89,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
      {/* Glutes */}
      <path d="M42,145 L78,145 L80,175 Q60,180 40,175 Z" fill={color} opacity={getOpacity('Legs') * 0.8} />
      {/* Hamstrings */}
      <path d="M40,178 L57,178 L55,230 L37,230 Z" fill={color} opacity={getOpacity('Legs') * 0.9} />
      <path d="M63,178 L80,178 L83,230 L65,230 Z" fill={color} opacity={getOpacity('Legs') * 0.9} />
      {/* Calves */}
      <path d="M37,233 L55,233 L53,270 L40,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
      <path d="M65,233 L83,233 L80,270 L67,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
    </svg>
  );
}
