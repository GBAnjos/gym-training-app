import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import './Header.css';

export function Header() {
  const { user, signOut } = useAuth();
  const { currentWeight, targetWeight } = useProgress();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            <span className="header-icon">🏋️</span>
            <span className="header-name">Vida</span>
          </h1>
          <span className="header-tagline">Estrutura real. Vida real.</span>
        </div>

        <div className="header-right">
          <div className="goal-badge">
            {currentWeight} → {targetWeight}kg · 2026
          </div>

          {user && (
            <div className="user-section">
              <img
                src={user.user_metadata?.avatar_url || ''}
                alt="Avatar"
                className="user-avatar"
              />
              <button className="logout-button" onClick={signOut}>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
