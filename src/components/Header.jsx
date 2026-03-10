import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../hooks/useLanguage';
import { Icon } from './Icon';
import './Header.css';

export function Header() {
  const { user, signOut } = useAuth();
  const { currentWeight, targetWeight } = useProgress();
  const { t } = useLanguage();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            <Icon name="dumbbell-1" className="header-icon" />
            <span className="header-name">Vida</span>
          </h1>
          <span className="header-tagline">{t('app_tagline')}</span>
        </div>

        <div className="header-right">
          <div className="goal-badge">
            {currentWeight} → {targetWeight}kg
          </div>

          {user && (
            <div className="user-section">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar user-avatar-icon">
                  <Icon name="user-4" />
                </div>
              )}
              <button className="logout-button" onClick={signOut}>
                <Icon name="exit" className="logout-icon" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
