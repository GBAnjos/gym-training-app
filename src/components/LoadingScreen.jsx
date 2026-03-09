import './LoadingScreen.css';

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <span className="loading-icon">💪</span>
        </div>
        <h1 className="loading-title">Vida</h1>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}
