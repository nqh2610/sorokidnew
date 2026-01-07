'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EFF6FF, #F3E8FF, #FDF2F8)',
          padding: '1rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>😅</div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '0.75rem'
            }}>
              Ối! Có lỗi xảy ra
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Đừng lo, hãy thử tải lại trang nhé!
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              🔄 Tải lại trang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
