import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl       from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl     from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const parkingIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="#1a73e8" stroke="#fff" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="Arial">P</text>
    </svg>`
  ),
  iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
})

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="#4285f4" stroke="#fff" stroke-width="3"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`
  ),
  iconSize: [28, 28], iconAnchor: [14, 14],
})

async function nominatimGeocode(query) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch { /* ignore */ }
  return null
}

async function fetchRoute(from, to) {
  try {
    const url  = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const res  = await fetch(url)
    const data = await res.json()
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
    }
  } catch { /* ignore */ }
  return null
}

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] })
    }
  }, [map, positions])
  return null
}

export default function DirectionsMap({ userCoords, locationName, address, city }) {
  const [destCoords, setDestCoords] = useState(null)
  const [route,      setRoute]      = useState(null)
  const [status,     setStatus]     = useState('Locating parking...')

  useEffect(() => {
    let cancelled = false
    const query = [locationName, address, city].filter(Boolean).join(', ')
    nominatimGeocode(query).then(dest => {
      if (cancelled) return
      if (!dest) { setStatus('Could not find parking location.'); return }
      setDestCoords(dest)
      fetchRoute(userCoords, dest).then(r => {
        if (cancelled) return
        setRoute(r)
        setStatus(null)
      })
    })
    return () => { cancelled = true }
  }, [userCoords, locationName, address, city])

  const center = [userCoords.lat, userCoords.lng]
  const allPositions = [
    center,
    destCoords ? [destCoords.lat, destCoords.lng] : null,
  ].filter(Boolean)

  return (
    <div style={wrap}>
      {/* ── From / To boxes ── */}
      <div style={fromToPanel}>
        <div style={row}>
          <span style={fromDot} />
          <input readOnly value="Your Current Location" style={inputBox} />
        </div>
        <div style={connector}>
          <div style={connLine} />
        </div>
        <div style={row}>
          <span style={toDot}>P</span>
          <input
            readOnly
            value={[locationName, address].filter(Boolean).join(', ')}
            style={inputBox}
          />
        </div>
      </div>

      {/* ── Map ── */}
      {status ? (
        <div style={loadingBox}>{status}</div>
      ) : (
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '260px', width: '100%' }}
          scrollWheelZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center} icon={userIcon} />
          {destCoords && (
            <Marker position={[destCoords.lat, destCoords.lng]} icon={parkingIcon} />
          )}
          {route && <Polyline positions={route} color="#1a73e8" weight={5} opacity={0.85} />}
          {allPositions.length >= 2 && <FitBounds positions={allPositions} />}
        </MapContainer>
      )}
    </div>
  )
}

const wrap = {
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #dadce0',
  margin: '14px 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}
const fromToPanel = {
  background: '#f8f9fa',
  padding: '14px 16px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  borderBottom: '1px solid #e0e0e0',
}
const row = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}
const fromDot = {
  width: '14px', height: '14px', borderRadius: '50%',
  background: '#4285f4', border: '2px solid #fff',
  boxShadow: '0 0 0 2px #4285f4',
  flexShrink: 0,
}
const toDot = {
  width: '20px', height: '20px', borderRadius: '50%',
  background: '#1a73e8', border: '2px solid #fff',
  flexShrink: 0, display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontSize: '9px', color: '#fff',
  fontWeight: 'bold',
}
const connector = {
  display: 'flex',
  paddingLeft: '6px',
  height: '14px',
  alignItems: 'center',
}
const connLine = {
  width: '2px', height: '100%',
  background: 'repeating-linear-gradient(to bottom, #bbb 0, #bbb 4px, transparent 4px, transparent 8px)',
  borderRadius: '1px',
}
const inputBox = {
  flex: 1,
  border: 'none',
  background: '#fff',
  padding: '8px 12px',
  borderRadius: '8px',
  fontSize: '0.88rem',
  color: '#333',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  outline: 'none',
  cursor: 'default',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
const loadingBox = {
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888',
  fontSize: '0.9rem',
  background: '#f0f4f8',
}
