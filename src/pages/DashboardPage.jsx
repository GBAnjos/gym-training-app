import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useDashboardData } from '../hooks/useDashboardData';
import { HeroHeader } from '../components/dashboard/HeroHeader';
import { ActivityCalendar } from '../components/dashboard/ActivityCalendar';
import { MonthlyReport } from '../components/dashboard/MonthlyReport';
import { MuscleDistribution } from '../components/dashboard/MuscleDistribution';
import { ProgressionChart } from '../components/dashboard/ProgressionChart';
import { BodyComposition } from '../components/dashboard/BodyComposition';
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
        trainingDays={data.trainingDays}
        gymStats={data.gymStats}
      />
      <MuscleDistribution muscleSets={data.muscleSets} />
      <ProgressionChart activityTypes={data.activityTypes} />
      <BodyComposition profile={data.profile} />
    </div>
  );
}
