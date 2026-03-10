import { Icon } from './Icon';
import './LoadingScreen.css';

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <Icon name="dumbbell-1" className="loading-icon" />
        </div>
        <h1 className="loading-title">Vida</h1>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}
