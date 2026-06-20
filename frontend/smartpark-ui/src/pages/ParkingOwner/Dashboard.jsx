import { useNavigate } from 'react-router-dom'

export default function OwnerDashboard() {
  const navigate = useNavigate()
  return (
    <div style={page}>
      <h2 style={{ color: '#1a73e8', marginBottom: '24px' }}>Parking Owner Dashboard</h2>
      <div style={grid}>
        <div style={card} onClick={() => navigate('/owner/locations')}>
          <h3>📍 My Locations</h3>
          <p style={{ color: '#666', marginTop: '8px' }}>Manage your parking locations</p>
        </div>
        <div style={card} onClick={() => navigate('/owner/slots')}>
          <h3>🅿 My Slots</h3>
          <p style={{ color: '#666', marginTop: '8px' }}>Manage parking slots</p>
        </div>
      </div>
    </div>
  )
}

const page = { padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }
const card = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform .15s' }
