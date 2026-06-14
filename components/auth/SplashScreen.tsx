'use client';

export default function SplashScreen() {
  return (
    <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16, animation: 'bounce 1.5s ease infinite' }}>
          🚀
        </div>
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: 22,
          color: '#1A1D3A',
          marginBottom: 8,
        }}>
          AI Kids Academy
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
          Loading your learning world...
        </div>
        <div style={{
          width: 40, height: 40,
          border: '4px solid #E5E7EB',
          borderTopColor: '#4F8EF7',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
          margin: '0 auto',
        }} />
      </div>
    </div>
  );
}
