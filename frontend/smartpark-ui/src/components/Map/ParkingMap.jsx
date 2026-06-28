import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { NAV_ORIGIN, buildMapsUrl } from '@/lib/geolocation'

// Fix Vite asset-hashing breaking Leaflet's default icon lookup
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const INDIA_CENTER = [20.5937, 78.9629]

async function geocode(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch {
    // geocoding failed — marker just won't appear
  }
  return null
}

function NavigateButton({ loc }) {
  const destination = `${loc.locationName}, ${loc.address}, ${loc.city}, India`
  const handleNavigate = () => {
    window.location.href = buildMapsUrl(destination, NAV_ORIGIN, loc.latitude, loc.longitude)
  }
  return (
    <button
      onClick={handleNavigate}
      style={{
        background: '#34a853',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '7px 16px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        width: '100%',
        marginTop: '6px',
      }}
    >
      Navigate
    </button>
  )
}

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 })
  }, [center, zoom])
  return null
}

export default function ParkingMap({ locations = [], cityCenter = null }) {
  const navigate = useNavigate()
  const [coords, setCoords] = useState({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for (const loc of locations) {
        if (coords[loc.id]) continue
        const result = await geocode(`${loc.locationName}, ${loc.city}, India`)
        if (cancelled) return
        if (result) setCoords(prev => ({ ...prev, [loc.id]: result }))
        await new Promise(r => setTimeout(r, 350))
      }
    })()
    return () => { cancelled = true }
  }, [locations])

  return (
    <MapContainer
      center={cityCenter ?? INDIA_CENTER}
      zoom={cityCenter ? 13 : 5}
      style={{ height: '440px', width: '100%', borderRadius: '12px', zIndex: 0 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cityCenter && <MapController center={cityCenter} zoom={13} />}

      {locations.map(loc => {
        const pos = coords[loc.id]
        if (!pos) return null
        return (
          <Marker key={loc.id} position={pos}>
            <Popup minWidth={210}>
              <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.5' }}>
                <p style={{ fontWeight: '700', color: '#1a73e8', marginBottom: '3px', fontSize: '0.95rem' }}>
                  📍 {loc.locationName}
                </p>
                <p style={{ color: '#555', fontSize: '0.82rem', marginBottom: '3px' }}>{loc.address}</p>
                <p style={{ color: '#555', fontSize: '0.82rem', marginBottom: '8px' }}>{loc.city}</p>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px', color: loc.availableSlots > 0 ? '#34a853' : '#d93025', fontWeight: '600' }}>
                  {loc.availableSlots > 0 ? `🟢 ${loc.availableSlots} / ${loc.totalSlots} slots available` : '🔴 No slots available'}
                </p>
                <button
                  onClick={() => navigate(`/search?locationId=${loc.id}`)}
                  style={{ background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', width: '100%' }}
                >
                  View Slots
                </button>
                <NavigateButton loc={loc} />
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
