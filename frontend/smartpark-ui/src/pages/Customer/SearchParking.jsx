import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, MapPin, ParkingSquare, Search } from 'lucide-react'
import parkingService from '@/services/parkingService'
import pricingService from '@/services/pricingService'
import signalrService from '@/services/signalrService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

const STATUS_STYLES = {
  Available:   'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  Reserved:    'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
  Maintenance: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
}

const STATUS_BADGE = {
  Available:   'default',
  Reserved:    'secondary',
  Maintenance: 'destructive',
}

const DEMAND_BADGE = {
  Low:    'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  High:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

const DEMAND_EMOJI = { Low: '🟢', Medium: '🟡', High: '🔴' }

function SlotCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-full mt-2" />
      </CardContent>
    </Card>
  )
}

function LocationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function SearchParking() {
  const [params] = useSearchParams()
  const locationId = params.get('locationId')
  const navigate = useNavigate()

  const [slots, setSlots] = useState([])
  const [locationName, setLocationName] = useState('')
  const [city, setCity] = useState('')
  const [locations, setLocations] = useState([])
  const [demands, setDemands] = useState({}) // locationId → DemandDto
  const [locationDemand, setLocationDemand] = useState(null)  // demand for slot view
  const [loading, setLoading] = useState(false)

  // Unified real-time handler — covers both location list and slot detail view
  useEffect(() => {
    const handleSlotChanged = ({ slotId, locationId: changedLocId, status }) => {
      if (locationId) {
        setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status } : s))
      } else {
        const delta = status === 'Reserved' ? -1 : status === 'Available' ? 1 : 0
        if (delta !== 0) {
          setLocations(prev => prev.map(loc =>
            loc.id === changedLocId
              ? { ...loc, availableSlots: Math.max(0, (loc.availableSlots ?? 0) + delta) }
              : loc
          ))
        }
      }
    }

    signalrService.on('SlotStatusChanged', handleSlotChanged)
    signalrService.start()

    return () => { signalrService.off('SlotStatusChanged', handleSlotChanged) }
  }, [locationId])

  // Load data — slots or locations
  useEffect(() => {
    setLoading(true)
    if (locationId) {
      parkingService.getAvailableSlots(locationId)
        .then(data => {
          setSlots(data)
          if (data.length > 0) setLocationName(data[0].locationName || '')
        })
        .catch(() => toast.error('Failed to load parking slots'))
        .finally(() => setLoading(false))

      // Load demand for this location (slot view)
      pricingService.getDemand(parseInt(locationId))
        .then(setLocationDemand)
        .catch(() => {})
    } else {
      parkingService.getLocations()
        .then(data => {
          setLocations(data)
          // Fetch demands for all locations in parallel
          data.forEach(loc => {
            pricingService.getDemand(loc.id)
              .then(d => setDemands(prev => ({ ...prev, [loc.id]: d })))
              .catch(() => {})
          })
        })
        .catch(() => toast.error('Failed to load parking locations'))
        .finally(() => setLoading(false))
    }
  }, [locationId])

  const searchByCity = async () => {
    if (!city.trim()) {
      parkingService.getLocations().then(setLocations)
      return
    }
    setLoading(true)
    parkingService.getLocationsByCity(city)
      .then(setLocations)
      .catch(() => toast.error('Failed to search by city'))
      .finally(() => setLoading(false))
  }

  // ── Slot view ──────────────────────────────────────────────────────────────
  if (locationId) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold leading-tight">{locationName || 'Available Slots'}</h2>
            <p className="text-sm text-muted-foreground">Select a slot to reserve</p>
          </div>
        </div>

        {/* Demand banner for this location */}
        {locationDemand && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DEMAND_BADGE[locationDemand.demandLevel] || DEMAND_BADGE.Low}`}>
              {DEMAND_EMOJI[locationDemand.demandLevel]} {locationDemand.demandLevel} Demand
            </span>
            <span className="text-sm text-muted-foreground">{locationDemand.demandMessage}</span>
            {locationDemand.isPeakActive && (
              <span className="ml-auto text-xs font-medium text-amber-600 dark:text-amber-400">
                ⚡ {locationDemand.peakMessage}
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <SlotCardSkeleton key={i} />)}
          </div>
        ) : slots.length === 0 ? (
          <EmptyState icon={ParkingSquare} title="No slots found" description="There are no available slots for this location." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map(slot => (
              <Card key={slot.id} className={`border-2 transition-colors ${STATUS_STYLES[slot.status] || ''}`}>
                <CardContent className="p-4 space-y-1.5">
                  <p className="font-bold text-lg leading-tight">{slot.slotNumber}</p>
                  <p className="text-xs text-muted-foreground">Floor {slot.floorNumber} · {slot.slotType}</p>
                  <Badge variant={STATUS_BADGE[slot.status] || 'secondary'} className="text-xs">
                    {slot.status}
                  </Badge>
                  {slot.status === 'Available' && (
                    <Button size="sm" className="w-full mt-2" onClick={() => navigate(`/reserve/${slot.id}`)}>
                      Reserve
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Location list view ─────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Find a parking location by city</h2>
      </div>

      <div className="flex gap-2 max-w-sm">
        <Input
          placeholder="Enter city…"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchByCity()}
        />
        <Button onClick={searchByCity} className="gap-1.5 shrink-0">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <LocationCardSkeleton key={i} />)}
        </div>
      ) : locations.length === 0 ? (
        <EmptyState icon={MapPin} title="No locations found" description="Try searching with a different city name." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(loc => {
            const d = demands[loc.id]
            return (
              <Card key={loc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{loc.locationName}</p>
                      <p className="text-xs text-muted-foreground truncate">{loc.city}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant={loc.availableSlots > 0 ? 'default' : 'destructive'} className="text-xs">
                      {loc.availableSlots > 0 ? `${loc.availableSlots} available` : 'Full'}
                    </Badge>
                    {d && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEMAND_BADGE[d.demandLevel] || ''}`}>
                        {DEMAND_EMOJI[d.demandLevel]} {d.demandLevel}
                      </span>
                    )}
                    {d?.isPeakActive && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">⚡ Peak</span>
                    )}
                  </div>

                  {d && (
                    <p className="text-xs text-muted-foreground mb-3">{d.demandMessage}</p>
                  )}

                  <Button size="sm" className="w-full" onClick={() => navigate(`/search?locationId=${loc.id}`)}>
                    View Slots
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
