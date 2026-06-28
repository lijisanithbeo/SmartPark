import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import reservationService from '@/services/reservationService'
import QRCodeDisplay from '@/components/QRCode/QRCodeDisplay'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { BookOpen, QrCode, Navigation, X } from 'lucide-react'
import { NAV_ORIGIN, formatDestination, buildMapsUrl } from '@/lib/geolocation'

const STATUS_VARIANT = {
  Confirmed: 'default',
  Cancelled: 'destructive',
  Pending:   'secondary',
}

function BookingCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-5 w-20 mt-1" />
          </div>
          <div className="flex gap-2 ml-4">
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


export default function BookingHistory() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState({})
  const [cancelTarget, setCancelTarget] = useState(null)
  useEffect(() => {
    reservationService.getByUser(user.id)
      .then(setReservations)
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [user.id])

  const toggleQr = async (id) => {
    if (qrData[id]) {
      setQrData(p => ({ ...p, [id]: null }))
      return
    }
    try {
      const data = await reservationService.getQrCode(id)
      setQrData(p => ({ ...p, [id]: data.qrCode }))
    } catch {
      toast.error('Could not load QR code')
    }
  }

  const handleNavigate = (r) => {
    const destination = formatDestination(r.locationName, r.locationAddress, r.locationCity)
    window.location.href = buildMapsUrl(destination, NAV_ORIGIN, r.latitude, r.longitude)
  }

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    try {
      await reservationService.cancel(cancelTarget)
      setReservations(r =>
        r.map(x => x.id === cancelTarget ? { ...x, status: 'Cancelled' } : x)
      )
      toast.success('Booking cancelled successfully')
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancelTarget(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your parking reservation history</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Bookings</h2>
        <p className="text-muted-foreground mt-1">Your parking reservation history</p>
      </div>

      {reservations.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No bookings yet"
          description="Reserve a parking spot to get started"
        />
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">
                      Slot {r.slotNumber}
                      {r.locationName && (
                        <span className="font-normal text-muted-foreground"> — {r.locationName}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(r.startTime).toLocaleString()} → {new Date(r.endTime).toLocaleString()}
                    </p>
                    <Badge
                      variant={STATUS_VARIANT[r.status] || 'secondary'}
                      className="mt-1.5 text-xs"
                    >
                      {r.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  {r.status !== 'Cancelled' && (
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => toggleQr(r.id)}
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        {qrData[r.id] ? 'Hide QR' : 'QR'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleNavigate(r)}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Navigate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setCancelTarget(r.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* QR code (toggle) */}
                {qrData[r.id] && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <QRCodeDisplay base64={qrData[r.id]} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? If you already paid, your refund will be processed within 3–5 business days."
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancelConfirm}
      />
    </div>
  )
}
