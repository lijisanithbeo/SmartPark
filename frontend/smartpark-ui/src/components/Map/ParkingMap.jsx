import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { NAV_ORIGIN, buildMapsUrl } from '@/lib/geolocation'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const INDIA_CENTER = [20.5937, 78.9629]

const GEO_CACHE_KEY = 'sp_geo_v1'
function readCache()            { try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}') } catch { return {} } }
function writeCache(key, value) { try { const c = readCache(); c[key] = value; localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(c)) } catch {} }

async function nominatim(q) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch { }
  return null
}

async function geocodeLoc(loc) {
  const key = `${loc.locationName}|${loc.city}`
  const cached = readCache()[key]
  if (cached) return cached
  // Try location name alone first (e.g. "Lulu Mall Cochin" already contains city)
  const result =
    await nominatim(loc.locationName) ||
    await nominatim(`${loc.locationName}, ${loc.city}`) ||
    await nominatim(`${loc.locationName}, India`)
  if (result) writeCache(key, result)
  return result
}

// Circular offset so multiple markers at the same city don't stack
function offsetPosition(center, index, total) {
  if (total <= 1 || index === 0) return center
  const ring   = Math.floor((index - 1) / 6)
  const pos    = (index - 1) % 6
  const radius = 0.006 * (ring + 1)          // ~600m per ring
  const angle  = (pos / Math.min(6, total - 1)) * 2 * Math.PI
  return [
    center[0] + radius * Math.sin(angle),
    center[1] + radius * Math.cos(angle),
  ]
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
  const [geocodedCoords, setGeocodedCoords] = useState({})

  useEffect(() => {
    let cancelled = false
    setGeocodedCoords({})

    const stored = {}
    const needsGeocoding = []
    for (const loc of locations) {
      if (loc.latitude != null && loc.longitude != null) {
        stored[loc.id] = [loc.latitude, loc.longitude]
      } else {
        needsGeocoding.push(loc)
      }
    }
    if (Object.keys(stored).length > 0) setGeocodedCoords(stored)

    ;(async () => {
      for (const loc of needsGeocoding) {
        if (cancelled) return
        const result = await geocodeLoc(loc)
        if (cancelled) return
        if (result) setGeocodedCoords(prev => ({ ...prev, [loc.id]: result }))
        await new Promise(r => setTimeout(r, 1100))
      }
    })()

    return () => { cancelled = true }
  }, [locations])

  // Resolve marker position: stored / geocoded / cityCenter-offset fallback
  const getPos = (loc, index) => {
    if (geocodedCoords[loc.id]) return geocodedCoords[loc.id]
    if (cityCenter) return offsetPosition(cityCenter, index, locations.length)
    return null
  }

  return (
    <MapContainer
      center={cityCenter ?? INDIA_CENTER}
      zoom={cityCenter ? 12 : 5}
      style={{ height: '440px', width: '100%', borderRadius: '12px', zIndex: 0 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cityCenter && <MapController center={cityCenter} zoom={12} />}

      {locations.map((loc, index) => {
        const pos = getPos(loc, index)
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
                <button
                  onClick={() => {
                    const dest = `${loc.locationName}, ${loc.address}, ${loc.city}, India`
                    window.location.href = buildMapsUrl(dest, NAV_ORIGIN, loc.latitude, loc.longitude)
                  }}
                  style={{ background: '#34a853', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', width: '100%', marginTop: '6px' }}
                >
                  Navigate
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
