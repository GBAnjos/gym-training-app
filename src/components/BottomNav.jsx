import './BottomNav.css';

const NAV_ITEMS = [
  { id: 'schedule', icon: '📅', label: 'Semana' },
  { id: 'meals', icon: '🥗', label: 'Refeições' },
  { id: 'training', icon: '🏋️', label: 'Treino' },
  { id: 'progress', icon: '📈', label: 'Progresso' },
];

export function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav safe-bottom">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
