import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, MapPin, Navigation, X } from 'lucide-react'
import parkingService from '@/services/parkingService'
import { NOMINATIM_BASE_URL } from '@/lib/constants'
import { NAV_ORIGIN, formatDestination, buildMapsUrl } from '@/lib/geolocation'
import ParkingMap from '@/components/Map/ParkingMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

const CITY_COORDS = {
  'cochin':             [9.9816,  76.2999],
  'kochi':              [9.9816,  76.2999],
  'ernakulam':          [9.9816,  76.2999],
  'thrissur':           [10.5276, 76.2144],
  'trivandrum':         [8.4875,  76.9525],
  'thiruvananthapuram': [8.4875,  76.9525],
  'calicut':            [11.2588, 75.7804],
  'kozhikode':          [11.2588, 75.7804],
  'kannur':             [11.8745, 75.3704],
  'kollam':             [8.8932,  76.6141],
  'palakkad':           [10.7867, 76.6548],
  'bangalore':          [12.9716, 77.5946],
  'bengaluru':          [12.9716, 77.5946],
  'chennai':            [13.0827, 80.2707],
  'mumbai':             [19.0760, 72.8777],
  'delhi':              [28.6139, 77.2090],
  'new delhi':          [28.6139, 77.2090],
  'hyderabad':          [17.3850, 78.4867],
  'pune':               [18.5204, 73.8567],
  'kolkata':            [22.5726, 88.3639],
  'ahmedabad':          [23.0225, 72.5714],
  'jaipur':             [26.9124, 75.7873],
  'surat':              [21.1702, 72.8311],
  'lucknow':            [26.8467, 80.9462],
  'bhopal':             [23.2599, 77.4126],
  'indore':             [22.7196, 75.8577],
  'nagpur':             [21.1458, 79.0882],
  'coimbatore':         [11.0168, 76.9558],
  'madurai':            [9.9252,  78.1198],
  'visakhapatnam':      [17.6868, 83.2185],
  'vizag':              [17.6868, 83.2185],
}

async function geocodeCity(city) {
  const key = city.toLowerCase().trim()
  // Instant lookup — no network call needed
  if (CITY_COORDS[key]) return CITY_COORDS[key]
  // Partial match (e.g. "kochi" matches "cochin")
  for (const [name, coords] of Object.entries(CITY_COORDS)) {
    if (key.includes(name) || name.includes(key)) return coords
  }
  // Fallback to Nominatim if city not in list
  try {
    const res = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch { /* ignore */ }
  return null
}

function LocationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )
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
      .catch(() => toast.error('Failed to load parking locations'))
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') doSearch()
  }

  const handleNavigate = (loc) => {
    const destination = formatDestination(loc.locationName, loc.address, loc.city)
    window.open(buildMapsUrl(destination, NAV_ORIGIN, null, null), '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 text-white px-6 py-8 md:px-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Find Your Perfect Parking Spot</h1>
        <p className="text-blue-100 text-sm mb-6">Search by city or location, then reserve your slot in advance.</p>
        <div className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 pr-8 bg-white text-foreground placeholder:text-muted-foreground border-0 focus-visible:ring-2 focus-visible:ring-white/50"
              placeholder="Search city or location…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            onClick={doSearch}
            disabled={searching || loading}
            variant="secondary"
            className="shrink-0"
          >
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Result count */}
      {searched && (
        <p className="text-sm text-muted-foreground">
          {filtered.length > 0
            ? `${filtered.length} parking location${filtered.length > 1 ? 's' : ''} found`
            : `No parking locations found for "${query}"`}
        </p>
      )}

      {/* Map */}
      <ParkingMap locations={filtered} cityCenter={cityCenter} />

      {/* Location cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {searched ? 'Search Results' : 'All Parking Locations'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LocationCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={searched ? 'No locations found' : 'No parking locations'}
            description={
              searched
                ? 'Try a different city or location name.'
                : 'No parking locations are available right now.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(loc => (
              <Card key={loc.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-tight truncate">{loc.locationName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{loc.address}</p>
                      <p className="text-xs text-muted-foreground truncate">{loc.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={loc.availableSlots > 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {loc.availableSlots > 0
                        ? `${loc.availableSlots} available`
                        : 'Full'}
                    </Badge>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleNavigate(loc)}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Navigate
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/search?locationId=${loc.id}`)}
                      >
                        Reserve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
