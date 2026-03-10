import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { Icon } from './Icon';
import './Header.css';

export function Header({ onAvatarClick }) {
  const { user } = useAuth();
  const { currentWeight, targetWeight } = useProgress();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            <Icon name="dumbbell-1" className="header-icon" />
            <span className="header-name">Vida</span>
          </h1>
        </div>

        <div className="header-right">
          <div className="goal-badge">
            {currentWeight} → {targetWeight}kg
          </div>

          {user && (
            <button className="avatar-button" onClick={onAvatarClick} aria-label="Settings">
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
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
