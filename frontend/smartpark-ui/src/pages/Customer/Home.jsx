import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import parkingService from '../../services/parkingService'
import ParkingMap from '../../components/Map/ParkingMap'

async function geocodeCity(city) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch { /* ignore */ }
  return null
}

export default function Home() {
  const [allLocations, setAllLocations] = useState([])
  const [filtered, setFiltered] = useState([])
  const [query, setQuery] = useState('')
  const [cityCenter, setCityCenter] = useState(null)
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    parkingService.getLocations()
      .then(data => { setAllLocations(data); setFiltered(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const doSearch = async () => {
    const q = query.trim()
    if (!q) { handleClear(); return }
    setSearching(true)
    const matches = allLocations.filter(loc =>
      loc.city.toLowerCase().includes(q.toLowerCase()) ||
      loc.locationName.toLowerCase().includes(q.toLowerCase())
    )
    setFiltered(matches)
    setSearched(true)
    const coords = await geocodeCity(q)
    setCityCenter(coords)
    setSearching(false)
  }

  const handleClear = () => {
    setQuery('')
    setFiltered(allLocations)
    setCityCenter(null)
    setSearched(false)
  }

  return (
    <div style={page}>
      <h1 style={heading}>Find Parking Near You</h1>
      <p style={subtext}>Search by city or location name, then reserve your slot in advance</p>

      {/* ── Search bar ── */}
      <div style={searchRow}>
        <div style={inputWrap}>
          <span style={searchIcon}>🔍</span>
          <input
            style={searchInput}
            placeholder="Search city or location… e.g. Chennai, Kochi"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          {query && (
            <button style={clearX} onClick={handleClear} title="Clear">✕</button>
          )}
        </div>
        <button style={searchBtn} onClick={doSearch} disabled={searching || loading}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* ── Result count ── */}
      {searched && (
        <p style={resultMeta}>
          {filtered.length > 0
            ? `${filtered.length} parking location${filtered.length > 1 ? 's' : ''} found`
            : `No parking locations found for "${query}"`}
        </p>
      )}

      {/* ── Live Map ── */}
      <ParkingMap locations={filtered} cityCenter={cityCenter} />

      {/* ── Location Cards ── */}
      {loading ? (
        <p style={resultMeta}>Loading parking locations…</p>
      ) : filtered.length > 0 ? (
        <>
          <h2 style={sectionTitle}>
            {searched ? 'Search Results' : 'All Parking Locations'}
          </h2>
          <div style={grid}>
            {filtered.map(loc => (
              <div key={loc.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>📍</span>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '1rem', color: '#202124', margin: 0 }}>{loc.locationName}</p>
                    <p style={{ fontSize: '0.82rem', color: '#777', margin: '2px 0 0' }}>{loc.address}</p>
                    <p style={{ fontSize: '0.82rem', color: '#777', margin: '1px 0 0' }}>{loc.city}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: loc.availableSlots > 0 ? '#34a853' : '#d93025' }}>
                    {loc.availableSlots > 0 ? `🟢 ${loc.availableSlots} available` : '🔴 Full'}
                  </span>
                  <button style={viewBtn} onClick={() => navigate(`/search?locationId=${loc.id}`)}>
                    Reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : searched ? (
        <p style={noResults}>No parking locations match your search. Try a different city or location name.</p>
      ) : null}
    </div>
  )
}

const page        = { padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }
const heading     = { color: '#1a73e8', marginBottom: '6px', fontSize: '1.8rem' }
const subtext     = { color: '#666', marginBottom: '24px', fontSize: '0.95rem' }
const searchRow   = { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }
const inputWrap   = { position: 'relative', flex: 1, minWidth: '240px' }
const searchIcon  = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }
const searchInput = { width: '100%', padding: '12px 40px 12px 38px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', background: '#fafafa' }
const clearX      = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '0.9rem', lineHeight: 1 }
const searchBtn   = { padding: '12px 28px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap' }
const resultMeta  = { color: '#555', marginBottom: '12px', fontSize: '0.88rem' }
const sectionTitle = { color: '#202124', marginTop: '32px', marginBottom: '16px', fontSize: '1.1rem', fontWeight: '700' }
const grid        = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }
const card        = { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }
const viewBtn     = { padding: '8px 18px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }
const noResults   = { color: '#888', marginTop: '24px', textAlign: 'center', fontSize: '0.95rem' }
