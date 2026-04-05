import { Icon } from './Icon';
import { useLanguage } from '../hooks/useLanguage';
import './BottomNav.css';

export function BottomNav({ activeTab, onTabChange }) {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { id: 'schedule', icon: 'calendar-days', labelKey: 'nav_schedule' },
    { id: 'meals', icon: 'knife-fork-1', labelKey: 'nav_meals' },
    { id: 'training', icon: 'dumbbell-1', labelKey: 'nav_training' },
    { id: 'dashboard', icon: 'bar-chart-4', labelKey: 'nav_dashboard' },
    { id: 'settings', icon: 'user-4', labelKey: 'nav_profile' },
  ];

  return (
    <nav className="bottom-nav safe-bottom">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <Icon name={item.icon} className="nav-icon" />
          <span className="nav-label">{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
