import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userService from '../../services/userService'
import parkingService from '../../services/parkingService'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ customers: 0, owners: 0, locations: 0 })

  useEffect(() => {
    Promise.all([
      userService.getByRole(2),
      userService.getByRole(1),
      parkingService.getLocations()
    ]).then(([customers, owners, locations]) => {
      setStats({ customers: customers.length, owners: owners.length, locations: locations.length })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Customers',        value: stats.customers, icon: '👤', path: '/admin/users',   bg: '#e8f0fe', color: '#1a73e8' },
    { label: 'Parking Owners',         value: stats.owners,    icon: '🏢', path: '/admin/owners',  bg: '#e6f4ea', color: '#137333' },
    { label: 'Parking Locations',      value: stats.locations, icon: '📍', path: '/owner/locations', bg: '#fef7e0', color: '#b06000' },
  ]

  return (
    <div style={page}>
      <h2 style={{ color: '#1a73e8', marginBottom: '8px' }}>Admin Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '28px' }}>SmartPark system overview</p>

      <div style={grid}>
        {cards.map(c => (
          <div key={c.path} style={{ ...card, background: c.bg }} onClick={() => navigate(c.path)}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{c.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ color: '#555', marginTop: '4px', fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={quickLinks}>
        <h3 style={{ color: '#333', marginBottom: '14px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'View Customers',    path: '/admin/users' },
            { label: 'View Owners',       path: '/admin/owners' },
            { label: 'View Locations',    path: '/owner/locations' },
          ].map(a => (
            <button key={a.path} style={actionBtn} onClick={() => navigate(a.path)}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

const page       = { padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }
const grid       = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }
const card       = { borderRadius: '12px', padding: '24px', cursor: 'pointer', textAlign: 'center', transition: 'transform .15s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const quickLinks = { background: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const actionBtn  = { padding: '10px 20px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }
