import { NOMINATIM_BASE_URL, GOOGLE_MAPS_BASE_URL } from '@/lib/constants'

// Fixed starting location used as the origin for all navigation.
export const NAV_ORIGIN = 'BEO Software, Palrivattom'

// Forward-geocodes a parking location to lat/lng using Nominatim.
// Called silently when owner saves a location — result is stored in the DB.
// Returns { lat, lng } or null if Nominatim cannot find the address.
export async function geocodeAddress(locationName, address, city) {
  const query = [locationName, address, city, 'India'].filter(Boolean).join(', ')
  try {
    const res = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch { /* ignore — coordinates are optional */ }
  return null
}

// Converts GPS coordinates to a human-readable address via Nominatim (OSM).
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

// Formats a parking location into a single destination string.
export function formatDestination(locationName, address, city) {
  return [locationName, address, city, 'India'].filter(Boolean).join(', ')
}

// Returns true if the string looks like a "lat,lng" coordinate pair.
function isCoordinateString(s) {
  return /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(s.trim())
}

// Builds a Google Maps directions URL.
//
// destLat/destLng: stored GPS coordinates for the parking location (preferred — precise).
// destination:     text fallback when coordinates are not yet stored.
// origin:          optional "lat,lng" string; omit to let Google Maps use the
//                  device's own live GPS as starting point (recommended for drivers).
export function buildMapsUrl(destination, origin, destLat, destLng) {
  const dest = (destLat != null && destLng != null)
    ? `${destLat},${destLng}`
    : encodeURIComponent(destination)

  if (origin) {
    const orig = isCoordinateString(origin)
      ? origin.trim()
      : encodeURIComponent(origin)
    return `${GOOGLE_MAPS_BASE_URL}/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=driving`
  }

  // No origin — Google Maps will use the device's live GPS automatically.
  // This is more reliable than browser geolocation and works instantly on mobile.
  return `${GOOGLE_MAPS_BASE_URL}/dir/?api=1&destination=${dest}&travelmode=driving`
}
