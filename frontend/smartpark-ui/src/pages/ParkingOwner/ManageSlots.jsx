import { useEffect, useState } from 'react'
import parkingService from '../../services/parkingService'

export default function ManageSlots() {
  const [locations, setLocations] = useState([])
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({ locationID: '', slotNumber: '', floorNumber: '', slotType: 'Car' })
  const [error, setError] = useState('')

  useEffect(() => { parkingService.getLocations().then(setLocations) }, [])

  const loadSlots = (locationId) => {
    setForm(f => ({ ...f, locationID: locationId }))
    parkingService.getSlotsByLocation(locationId).then(setSlots)
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setError('')
    try {
      const s = await parkingService.createSlot({ ...form, locationID: parseInt(form.locationID), floorNumber: parseInt(form.floorNumber) })
      setSlots(sl => [...sl, s])
      setForm(f => ({ ...f, slotNumber: '', floorNumber: '' }))
    } catch (err) { setError(err.response?.data?.error || 'Failed to create slot') }
  }

  return (
    <div style={page}>
      <h2 style={{ color: '#1a73e8', marginBottom: '20px' }}>Manage Slots</h2>
      <select style={input} value={form.locationID} onChange={e => loadSlots(e.target.value)}>
        <option value="">Select Location</option>
        {locations.map(l => <option key={l.id} value={l.id}>{l.locationName}</option>)}
      </select>
      {form.locationID && (
        <div style={formCard}>
          <h3 style={{ marginBottom: '14px' }}>Add Slot</h3>
          {error && <p style={errorStyle}>{error}</p>}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input style={{ ...input, flex: '1' }} placeholder="Slot Number (e.g. A001)" value={form.slotNumber} onChange={e => setForm({ ...form, slotNumber: e.target.value })} required />
            <input style={{ ...input, flex: '1' }} type="number" placeholder="Floor" value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} required />
            <select style={{ ...input, flex: '1' }} value={form.slotType} onChange={e => setForm({ ...form, slotType: e.target.value })}>
              <option>Car</option>
              <option>Bike</option>
            </select>
            <button style={btn} type="submit">Add</button>
          </form>
        </div>
      )}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {slots.map(s => (
          <div key={s.id} style={{ ...slotCard, borderLeft: `4px solid ${s.status === 'Available' ? '#34a853' : s.status === 'Reserved' ? '#f9ab00' : '#d93025'}` }}>
            <strong>{s.slotNumber}</strong>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Floor {s.floorNumber} · {s.slotType}</p>
            <p style={{ fontSize: '0.85rem' }}>{s.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const page     = { padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }
const formCard = { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '16px' }
const input    = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', width: '100%' }
const btn      = { padding: '10px 20px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
const slotCard = { background: '#fff', borderRadius: '8px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
const errorStyle = { background: '#fce8e6', color: '#d93025', padding: '8px', borderRadius: '6px', marginBottom: '10px' }
