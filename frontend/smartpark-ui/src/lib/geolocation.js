import { NOMINATIM_BASE_URL, GOOGLE_MAPS_BASE_URL } from '@/lib/constants'

// Keeps refining position until accuracy < 100 m or 8 seconds elapse
export function getFreshGPS() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return }
    let best = null
    let watchId = null
    const timer = setTimeout(() => {
      navigator.geolocation.clearWatch(watchId)
      if (best) resolve(best)
      else reject(new Error('GPS timeout'))
    }, 8000)
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        best = pos
        if (pos.coords.accuracy <= 100) {
          clearTimeout(timer)
          navigator.geolocation.clearWatch(watchId)
          resolve(pos)
        }
      },
      (err) => { clearTimeout(timer); reject(err) },
      { maximumAge: 0, enableHighAccuracy: true }
    )
  })
}

// Converts GPS coordinates to a human-readable address
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

// Formats a parking location into a single destination string
export function formatDestination(locationName, address, city) {
  return [locationName, address, city, 'India'].filter(Boolean).join(', ')
}

// Builds a Google Maps directions (or search) URL
export function buildMapsUrl(destination, origin) {
  const dest = encodeURIComponent(destination)
  if (origin) {
    const orig = encodeURIComponent(origin)
    return `${GOOGLE_MAPS_BASE_URL}/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=driving`
  }
  return `${GOOGLE_MAPS_BASE_URL}/search/?api=1&query=${dest}`
}
