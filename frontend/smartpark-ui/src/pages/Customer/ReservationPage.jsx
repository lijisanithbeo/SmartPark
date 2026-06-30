import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import reservationService from '@/services/reservationService'
import parkingService from '@/services/parkingService'
import pricingService from '@/services/pricingService'
import QRCodeDisplay from '@/components/QRCode/QRCodeDisplay'
import MiniMap from '@/components/Map/MiniMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2, Navigation, CheckCircle2, Clock, CreditCard,
  Smartphone, Banknote, TrendingUp, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ORIGIN, formatDestination, buildMapsUrl } from '@/lib/geolocation'

// ── NavigateBtn ──────────────────────────────────────────────────────────────
function NavigateBtn({ locationName, address, city, latitude, longitude }) {
  const handleClick = () => {
    const destination = formatDestination(locationName, address, city)
    window.location.href = buildMapsUrl(destination, NAV_ORIGIN, latitude, longitude)
  }
  return (
    <Button variant="default" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleClick}>
      <Navigation className="h-4 w-4" />
      Get Directions
    </Button>
  )
}

// ── TimePicker ───────────────────────────────────────────────────────────────
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

function TimePicker({ value, onChange }) {
  const [hh, setHh] = useState(() => value ? value.split(':')[0] : '')
  const [mm, setMm] = useState(() => value ? value.split(':')[1] : '')

  useEffect(() => {
    if (!value) { setHh(''); setMm('') }
    else { const [h, m] = value.split(':'); setHh(h || ''); setMm(m || '') }
  }, [value])

  const handleHour = (h) => { setHh(h); if (mm) onChange(`${h}:${mm}`) }
  const handleMin  = (m) => { setMm(m); if (hh) onChange(`${hh}:${m}`) }

  return (
    <div className="flex items-center gap-1">
      <select className="flex-1 h-10 rounded-md border border-input bg-background px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" value={hh} onChange={e => handleHour(e.target.value)} required>
        <option value="">HH</option>
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="font-bold text-muted-foreground">:</span>
      <select className="flex-1 h-10 rounded-md border border-input bg-background px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" value={mm} onChange={e => handleMin(e.target.value)} required>
        <option value="">MM</option>
        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function SummaryRow({ label, value, valueClassName }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium', valueClassName)}>{value}</span>
    </div>
  )
}

const DEMAND_STYLES = {
  Low:    { dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',  emoji: '🟢' },
  Medium: { dot: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400', emoji: '🟡' },
  High:   { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',         emoji: '🔴' },
}

// ── Demand / Pricing Card ─────────────────────────────────────────────────────
function PricingCard({ estimate, loading }) {
  if (loading) {
    return (
      <div className="rounded-lg bg-muted p-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        Calculating pricing…
      </div>
    )
  }
  if (!estimate) return null

  const demand = DEMAND_STYLES[estimate.demandLevel] || DEMAND_STYLES.Low

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Pricing breakdown */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Price Breakdown</span>
        </div>
        <SummaryRow label="Pricing Type" value={estimate.pricingType} />
        <SummaryRow label="Rate" value={`₹${estimate.rateApplied}/hr`} />
        <SummaryRow label="Duration" value={`${estimate.durationHours.toFixed(2)}h`} />
        <Separator className="my-1.5" />
        <div className="flex justify-between items-center py-1">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-base font-bold text-primary">₹{estimate.totalAmount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{estimate.breakdownDescription}</p>
      </div>

      <Separator />

      {/* Demand indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Demand Level</span>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', demand.badge)}>
            {demand.emoji} {estimate.demandLevel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{estimate.demandMessage}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{estimate.availableSlots} available</span>
          <span>{estimate.occupiedSlots} occupied</span>
        </div>
      </div>

      {/* Peak pricing alert */}
      {estimate.isPeakActive && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">{estimate.peakMessage}</p>
        </div>
      )}
    </div>
  )
}

// ── Payment options ───────────────────────────────────────────────────────────
const PAYMENT_OPTIONS = [
  { id: 'Card', label: 'Card', icon: CreditCard, sub: null },
  { id: 'UPI',  label: 'UPI',  icon: Smartphone, sub: null },
  { id: 'Cash', label: 'Cash', icon: Banknote,   sub: 'Pay at counter' },
]

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReservationPage() {
  const { slotId } = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [slot,          setSlot]          = useState(null)
  const [startDate,     setStartDate]     = useState('')
  const [startTime,     setStartTime]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [endTime,       setEndTime]       = useState('')
  const [vehicleNumber, setVehicleNumber]  = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [duration,      setDuration]      = useState(0)
  const [estimate,      setEstimate]      = useState(null)
  const [estimateLoading, setEstimateLoading] = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [step,          setStep]          = useState('form')
  const [qrCode,        setQrCode]        = useState('')
  const [reservation,   setReservation]   = useState(null)
  const [paidAmount,    setPaidAmount]    = useState(0)
  const [nowLabel,      setNowLabel]      = useState(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  })

  const debounceRef = useRef(null)

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNowLabel(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`)
    }
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    parkingService.getSlotById(parseInt(slotId))
      .then(setSlot)
      .catch(() => setError('Could not load slot details.'))
  }, [slotId])

  const handleStartDateChange = (date) => {
    setStartDate(date)
    if (!endDate || endDate < date) setEndDate(date)
  }

  const handleStartTimeChange = (time) => {
    setStartTime(time)
    // Auto-advance end time to start+1h if not set or not after start
    if (!endTime || (startDate === endDate && time >= endTime)) {
      const newH = Math.min(parseInt(time.split(':')[0]) + 1, 23)
      setEndTime(`${String(newH).padStart(2, '0')}:${time.split(':')[1]}`)
    }
  }

  // Debounced pricing estimate fetch — replaces client-side calculation
  const fetchEstimate = useCallback(() => {
    if (!startDate || !startTime || !endDate || !endTime || !slotId) {
      setDuration(0); setEstimate(null); return
    }
    const start  = new Date(`${startDate}T${startTime}`)
    const end    = new Date(`${endDate}T${endTime}`)
    const diffMs = end - start
    if (diffMs <= 0) { setDuration(0); setEstimate(null); return }
    setDuration(Math.round(diffMs / 60000))

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setEstimateLoading(true)
      pricingService.getEstimate(
        parseInt(slotId),
        `${startDate}T${startTime}`,
        `${endDate}T${endTime}`
      )
        .then(data => setEstimate(data))
        .catch(() => setEstimate(null))
        .finally(() => setEstimateLoading(false))
    }, 600)
  }, [startDate, startTime, endDate, endTime, slotId])

  useEffect(() => { fetchEstimate() }, [fetchEstimate])

  const totalAmount = estimate?.totalAmount ?? 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!startTime || !endTime) { setError('Please select both start and end times.'); return }
    if (duration <= 0)          { setError('End time must be after start time.'); return }

    setLoading(true)
    try {
      const res = await reservationService.create({
        slotID: parseInt(slotId),
        startTime: `${startDate}T${startTime}`,
        endTime:   `${endDate}T${endTime}`,
        vehicleNumber: vehicleNumber.trim() || null,
      })
      setReservation(res)

      // Amount sent here will be overridden server-side; send estimate as reference
      const payment = await reservationService.pay(res.id, {
        amount: totalAmount, paymentMethod,
      })
      setPaidAmount(payment.amount ?? totalAmount)

      if (payment.paymentStatus === 'Success') {
        const qr = await reservationService.getQrCode(res.id)
        setQrCode(qr.qrCode)
        setStep('done')
      } else {
        setStep('cash')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  // ── Confirmed step ──────────────────────────────────────────────────────────
  if (step === 'done') return (
    <div className="flex justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Booking Confirmed!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Payment of <strong>₹{paidAmount.toFixed(2)}</strong> received via {paymentMethod}
            </p>
          </div>
          {reservation && (
            <div className="text-left space-y-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="font-semibold text-sm">{reservation.locationName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{reservation.locationAddress}, {reservation.locationCity}</p>
              </div>
              <MiniMap locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} latitude={reservation.latitude} longitude={reservation.longitude} />
              <NavigateBtn locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} latitude={reservation.latitude} longitude={reservation.longitude} />
            </div>
          )}
          <div className="space-y-2">
            <QRCodeDisplay base64={qrCode} />
            <p className="text-xs text-muted-foreground">Show this QR code at the parking entrance</p>
          </div>
          <Button className="w-full" onClick={() => navigate('/bookings')}>View My Bookings</Button>
        </CardContent>
      </Card>
    </div>
  )

  // ── Cash / pending step ─────────────────────────────────────────────────────
  if (step === 'cash') return (
    <div className="flex justify-center px-4 py-8">
      <Card className="w-full max-w-lg border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950">
              <Clock className="h-9 w-9 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-400">Slot Reserved!</h2>
            <p className="text-sm text-muted-foreground mt-1">Pay at the counter upon arrival.</p>
          </div>
          {reservation && (
            <div className="text-left space-y-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="font-semibold text-sm">{reservation.locationName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{reservation.locationAddress}, {reservation.locationCity}</p>
              </div>
              <MiniMap locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} latitude={reservation.latitude} longitude={reservation.longitude} />
              <NavigateBtn locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} latitude={reservation.latitude} longitude={reservation.longitude} />
            </div>
          )}
          <div className="rounded-lg bg-muted p-4 text-left space-y-1">
            <SummaryRow label="Amount Due" value={`₹${paidAmount.toFixed(2)}`} valueClassName="text-yellow-700 dark:text-yellow-400 font-bold" />
            <SummaryRow label="Payment" value="Cash at Counter" />
            <SummaryRow label="Status" value="Pending" valueClassName="text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-xs text-muted-foreground">QR code will be generated after counter confirms payment</p>
          <Button className="w-full" onClick={() => navigate('/bookings')}>View My Bookings</Button>
        </CardContent>
      </Card>
    </div>
  )

  // ── Form step ───────────────────────────────────────────────────────────────
  return (
    <div className="flex justify-center px-4 py-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle>Reserve Slot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Slot badge */}
          {slot && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 px-4 py-2.5 text-sm">
              <Badge variant="default" className="text-xs">{slot.slotNumber}</Badge>
              <span className="text-muted-foreground">{slot.slotType}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Floor {slot.floorNumber}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                Current time: <strong className="text-foreground">{nowLabel}</strong>
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Start */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Start</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={startDate} onChange={e => handleStartDateChange(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <TimePicker value={startTime} onChange={handleStartTimeChange} />
                </div>
              </div>
            </div>

            {/* End */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">End</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <TimePicker value={endTime} onChange={setEndTime} />
                </div>
              </div>
            </div>

            {/* Pricing + demand card (server-calculated) */}
            {(startDate && startTime && endDate && endTime) && (
              <PricingCard estimate={estimate} loading={estimateLoading} />
            )}

            {/* Vehicle Number */}
            <div className="space-y-1.5">
              <Label htmlFor="vehicleNumber">
                Vehicle Number <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="vehicleNumber"
                placeholder="e.g. KL 07 AB 1234"
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                maxLength={20}
              />
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_OPTIONS.map(({ id, label, icon: Icon, sub }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors text-sm font-medium',
                      paymentMethod === id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                    {sub && <span className="text-xs text-yellow-600 dark:text-yellow-400 font-normal">{sub}</span>}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || estimateLoading || !estimate}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
              ) : paymentMethod === 'Cash' ? (
                `Reserve — Pay ₹${totalAmount > 0 ? totalAmount.toFixed(2) : '—'} at Counter`
              ) : (
                `Confirm & Pay ₹${totalAmount > 0 ? totalAmount.toFixed(2) : '—'}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
