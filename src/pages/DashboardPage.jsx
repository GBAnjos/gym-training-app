import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useDashboardData } from '../hooks/useDashboardData';
import { HeroHeader } from '../components/dashboard/HeroHeader';
import './DashboardPage.css';

export function DashboardPage({ onTabChange }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const data = useDashboardData();

  return (
    <div className="dashboard-page">
      <HeroHeader
        data={data}
        onNavigateToTraining={() => onTabChange?.('training')}
      />
    </div>
  );
}
