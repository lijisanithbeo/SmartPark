import { useEffect, useState } from 'react'
import parkingService from '../../services/parkingService'

export default function ManageLocations() {
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ locationName: '', address: '', city: '', totalSlots: '' })
  const [error, setError] = useState('')

  useEffect(() => { parkingService.getLocations().then(setLocations) }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setError('')
    try {
      const newLoc = await parkingService.createLocation({ ...form, totalSlots: parseInt(form.totalSlots) })
      setLocations(l => [...l, newLoc])
      setForm({ locationName: '', address: '', city: '', totalSlots: '' })
    } catch (err) { setError(err.response?.data?.error || 'Failed to create location') }
  }

  const handleDelete = async (id) => {
    await parkingService.deleteLocation(id)
    setLocations(l => l.filter(x => x.id !== id))
  }

  return (
    <div style={page}>
      <h2 style={{ color: '#1a73e8', marginBottom: '24px' }}>Manage Locations</h2>
      <div style={formCard}>
        <h3 style={{ marginBottom: '16px' }}>Add New Location</h3>
        {error && <p style={errorStyle}>{error}</p>}
        <form onSubmit={handleCreate}>
          {['locationName','address','city'].map(f => (
            <input key={f} style={input} placeholder={f} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} required />
          ))}
          <input style={input} type="number" placeholder="Total Slots" value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })} required />
          <button style={btn} type="submit">Add Location</button>
        </form>
      </div>
      <div style={{ marginTop: '24px' }}>
        {locations.map(loc => (
          <div key={loc.id} style={row}>
            <div>
              <strong>{loc.locationName}</strong> — {loc.city}
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{loc.address} · {loc.totalSlots} total slots</p>
            </div>
            <button style={delBtn} onClick={() => handleDelete(loc.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const page     = { padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }
const formCard = { background: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const input    = { display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }
const btn      = { padding: '10px 24px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
const row      = { background: '#fff', borderRadius: '8px', padding: '16px 20px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const delBtn   = { padding: '6px 14px', background: '#d93025', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
const errorStyle = { background: '#fce8e6', color: '#d93025', padding: '10px', borderRadius: '6px', marginBottom: '12px' }
