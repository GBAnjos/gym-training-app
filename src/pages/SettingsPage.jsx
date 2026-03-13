import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useOnboarding } from '../hooks/useOnboarding';
import { Icon } from '../components/Icon';
import './SettingsPage.css';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  const { userProfile, resetOnboarding } = useOnboarding();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleResetOnboarding = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    await resetOnboarding();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const getGoalLabel = (goal) => {
    const labels = {
      muscle_gain: t('training_goal_muscle'),
      weight_loss: t('training_goal_loss'),
      maintain: t('training_goal_maintain'),
      general: t('training_goal_general')
    };
    return labels[goal] || '-';
  };

  const getLevelLabel = (level) => {
    const labels = {
      beginner: t('training_level_beginner'),
      intermediate: t('training_level_intermediate'),
      advanced: t('training_level_advanced')
    };
    return labels[level] || '-';
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">{t('settings_title')}</h1>

      {/* User Profile Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Icon name="user-4" className="section-icon" />
          <h2>{t('settings_profile')}</h2>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" />
            ) : (
              <Icon name="user-4" className="avatar-icon" />
            )}
          </div>
          <div className="profile-info">
            <span className="profile-name">
              {userProfile?.name || user?.user_metadata?.full_name || t('profile_name')}
            </span>
            <span className="profile-email">{user?.email}</span>
          </div>
        </div>

        {userProfile && (
          <div className="profile-stats">
            <div className="stat-item">
              <Icon name="target-user" className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">{t('summary_goal')}</span>
                <span className="stat-value">{getGoalLabel(userProfile.goal)}</span>
              </div>
            </div>
            <div className="stat-item">
              <Icon name="dumbbell-1" className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">{t('training_level')}</span>
                <span className="stat-value">{getLevelLabel(userProfile.fitnessLevel)}</span>
              </div>
            </div>
            <div className="stat-item">
              <Icon name="calendar-days" className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">{t('summary_training')}</span>
                <span className="stat-value">
                  {userProfile.trainingDays?.length || 0}{t('summary_per_week')}
                </span>
              </div>
            </div>
            <div className="stat-item">
              <Icon name="bar-chart-4" className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">{t('summary_weight')}</span>
                <span className="stat-value">
                  {userProfile.currentWeight}kg → {userProfile.targetWeight}kg
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Language Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Icon name="globe-1" className="section-icon" />
          <h2>{t('settings_language')}</h2>
        </div>

        <div className="language-selector">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => setLanguage(lang.code)}
            >
              <span className="language-flag">
                {lang.code === 'pt-BR' ? (
                  <Icon name="flag-1" />
                ) : (
                  <Icon name="flag-2" />
                )}
              </span>
              <span className="language-name">{lang.name}</span>
              {language === lang.code && (
                <Icon name="check-circle-1" className="language-check" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Actions Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Icon name="gear-1" className="section-icon" />
          <h2>{t('settings_title')}</h2>
        </div>

        <div className="settings-actions">
          <button className="settings-action-btn warning" onClick={handleResetOnboarding}>
            <Icon name="refresh-circle-1-clockwise" />
            <span>{t('settings_redo_onboarding')}</span>
            <Icon name="chevron-right" className="action-arrow" />
          </button>

          <button className="settings-action-btn danger" onClick={handleLogout}>
            <Icon name="exit" />
            <span>{t('logout')}</span>
            <Icon name="chevron-right" className="action-arrow" />
          </button>
        </div>
      </section>

      {/* App Info */}
      <div className="app-info">
        <p className="app-version">Vida v1.0.0</p>
        <p className="app-tagline">{t('app_tagline')}</p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name="warning" />
            </div>
            <h3>{t('settings_redo_onboarding')}</h3>
            <p>{language === 'pt-BR'
              ? 'Tem certeza? Isso vai resetar todas as suas configurações.'
              : 'Are you sure? This will reset all your settings.'
            }</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowResetConfirm(false)}>
                {t('cancel')}
              </button>
              <button className="btn-confirm" onClick={confirmReset}>
                {t('continue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
