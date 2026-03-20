import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useDashboardData } from '../hooks/useDashboardData';
import './DashboardPage.css';

export function DashboardPage() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const data = useDashboardData();

  return (
    <div className="dashboard-page">
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>
        Dashboard coming soon...
      </p>
    </div>
  );
}
