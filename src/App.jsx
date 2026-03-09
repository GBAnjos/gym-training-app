import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SchedulePage } from './pages/SchedulePage';
import { MealsPage } from './pages/MealsPage';
import { TrainingPage } from './pages/TrainingPage';
import { ProgressPage } from './pages/ProgressPage';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  if (loading) {
    return <LoginScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'schedule':
        return <SchedulePage />;
      case 'meals':
        return <MealsPage />;
      case 'training':
        return <TrainingPage />;
      case 'progress':
        return <ProgressPage />;
      default:
        return <SchedulePage />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderPage()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
