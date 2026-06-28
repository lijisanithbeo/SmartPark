import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const parkingIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="#1a73e8" stroke="#fff" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="Arial">P</text>
    </svg>`),

  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

async function geocode(query) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await r.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch { /* ignore */ }
  return null
}

// latitude/longitude: GPS coordinates stored in the database (precise).
// Falls back to Nominatim geocoding of the text address when not available.
export default function MiniMap({ locationName, address, city, latitude, longitude }) {
  const [center, setCenter] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // Prefer stored GPS coordinates — instant, no network call, accurate
    if (latitude != null && longitude != null) {
      setCenter([latitude, longitude])
      return
    }
    // Fall back to Nominatim geocoding for locations without saved coordinates
    const query = [locationName, address, city].filter(Boolean).join(', ')
    geocode(query).then(coords => {
      if (coords) setCenter(coords)
      else setFailed(true)
    })
  }, [latitude, longitude, locationName, address, city])

  if (failed) return null

  if (!center) return (
    <div style={placeholder}>
      <span>📍</span> Loading map…
    </div>
  )

  return (
    <div style={mapWrap}>
      <MapContainer
        center={center} zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} icon={parkingIcon}>
          <Popup>{locationName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

const mapWrap = {
  height: '180px',
  borderRadius: '12px',
  overflow: 'hidden',
  margin: '16px 0 12px',
  border: '1px solid #e0e0e0',
}
const placeholder = {
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888',
  fontSize: '0.9rem',
  gap: '6px',
  margin: '12px 0',
}
