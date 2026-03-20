import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useDashboardData } from '../hooks/useDashboardData';
import { HeroHeader } from '../components/dashboard/HeroHeader';
import { ActivityCalendar } from '../components/dashboard/ActivityCalendar';
import { MonthlyReport } from '../components/dashboard/MonthlyReport';
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
      <ActivityCalendar
        trainingDays={data.trainingDays}
        getDateActivityData={data.getDateActivityData}
      />
      <MonthlyReport
        monthlyData={data.monthlyData}
        currentMonthCount={data.currentMonthCount}
        prevMonthCount={data.prevMonthCount}
        gymStats={data.gymStats}
      />
    </div>
  );
}
