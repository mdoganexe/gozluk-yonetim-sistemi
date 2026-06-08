import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initTheme } from './utils/theme'
import { initDB } from './db/database'
import { createDefaultAdmin } from './utils/auth'

initTheme()

const root = ReactDOM.createRoot(document.getElementById('root'))

function Splash({ text, error }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif',
      gap: 12, color: error ? '#dc2626' : '#0369a1', textAlign: 'center', padding: 24
    }}>
      <div style={{ fontSize: 28, fontWeight: 700 }}>OptikPro</div>
      <div>{text}</div>
      {error && (
        <button onClick={() => window.location.reload()}
          style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Tekrar Dene
        </button>
      )}
    </div>
  )
}

root.render(<Splash text="Veriler yükleniyor…" />)

initDB()
  .then(async () => {
    // İlk açılışta yönetici hesabı yoksa otomatik oluştur (kayıt yerine direkt giriş)
    try { await createDefaultAdmin(); } catch (e) { /* yarış durumu - sorun değil */ }
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
  .catch((e) => {
    root.render(<Splash error text={'Sunucuya bağlanılamadı. Sunucunun (OptikPro.exe) çalıştığından emin olun. ' + (e?.message || '')} />)
  })
