import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import parkingService from '../../services/parkingService'

export default function SearchParking() {
  const [params] = useSearchParams()
  const locationId = params.get('locationId')
  const [slots, setSlots] = useState([])
  const [city, setCity] = useState('')
  const [locations, setLocations] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (locationId) {
      parkingService.getAvailableSlots(locationId).then(setSlots)
    } else {
      parkingService.getLocations().then(setLocations)
    }
  }, [locationId])

  const searchByCity = async () => {
    const results = await parkingService.getLocationsByCity(city)
    setLocations(results)
  }

  return (
    <div style={page}>
      <h2 style={{ color: '#1a73e8', marginBottom: '20px' }}>Search Parking</h2>
      {!locationId && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <input style={input} placeholder="Enter city..." value={city} onChange={e => setCity(e.target.value)} />
          <button style={btn} onClick={searchByCity}>Search</button>
        </div>
      )}
      {locationId ? (
        <>
          <h3 style={{ marginBottom: '16px' }}>Available Slots</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {slots.map(slot => (
              <div key={slot.id} style={slotCard}>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{slot.slotNumber}</p>
                <p style={{ color: '#666', fontSize: '0.85rem' }}>Floor {slot.floorNumber} · {slot.slotType}</p>
                <p style={{ color: '#34a853', fontSize: '0.85rem' }}>{slot.status}</p>
                <button style={btn} onClick={() => navigate(`/reserve/${slot.id}`)}>Reserve</button>
              </div>
            ))}
            {slots.length === 0 && <p style={{ color: '#888' }}>No available slots found.</p>}
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {locations.map(loc => (
            <div key={loc.id} style={locCard}>
              <h3>{loc.locationName}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{loc.city}</p>
              <p style={{ color: '#1a73e8' }}>{loc.availableSlots} available</p>
              <button style={btn} onClick={() => navigate(`/search?locationId=${loc.id}`)}>View Slots</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const page    = { padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }
const input   = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', flex: 1 }
const btn     = { padding: '10px 20px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
const slotCard = { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', textAlign: 'center' }
const locCard  = { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
