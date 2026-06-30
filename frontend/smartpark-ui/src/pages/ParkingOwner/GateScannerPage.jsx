import { useState, useRef } from 'react'
import gateService from '@/services/gateService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  LogIn, LogOut, ScanLine, User, Car, MapPin,
  Clock, AlertTriangle, CheckCircle2, Loader2, IndianRupee,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const TABS = [
  { id: 'checkin',  label: 'Entry',  icon: LogIn,  color: 'text-emerald-600' },
  { id: 'checkout', label: 'Exit',   icon: LogOut, color: 'text-rose-600' },
]

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function InfoRow({ label, value, valueClass }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-right max-w-[55%]', valueClass)}>{value}</span>
    </div>
  )
}

function StatusBadge({ info }) {
  if (info.isCheckedOut) return <Badge className="bg-slate-100 text-slate-600">Checked Out</Badge>
  if (info.isCheckedIn)  return <Badge className="bg-blue-100 text-blue-700">Inside</Badge>
  return <Badge className="bg-amber-100 text-amber-700">Not Yet Entered</Badge>
}

export default function GateScannerPage() {
  const [tab,          setTab]          = useState('checkin')
  const [qr,           setQr]           = useState('')
  const [scanning,     setScanning]     = useState(false)
  const [confirming,   setConfirming]   = useState(false)
  const [info,         setInfo]         = useState(null)   // GateScanResultDto
  const [result,       setResult]       = useState(null)   // check-in/out result
  const [overstayPaid, setOverstayPaid] = useState(false)
  const inputRef = useRef(null)

  const switchTab = (id) => {
    setTab(id); setInfo(null); setResult(null); setQr(''); setOverstayPaid(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleScan = async (e) => {
    e.preventDefault()
    if (!qr.trim()) return
    setScanning(true); setInfo(null); setResult(null)
    try {
      const data = await gateService.scan(qr.trim())
      setInfo(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not read QR code.')
    } finally {
      setScanning(false)
    }
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      let data
      if (tab === 'checkin') {
        data = await gateService.checkIn(qr.trim())
        toast.success('Vehicle checked in successfully.')
      } else {
        data = await gateService.checkOut(qr.trim(), overstayPaid)
        toast.success('Vehicle checked out.')
      }
      setResult(data)
      setInfo(null)
      setQr('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
    } finally {
      setConfirming(false)
    }
  }

  const reset = () => { setInfo(null); setResult(null); setQr(''); setOverstayPaid(false); setTimeout(() => inputRef.current?.focus(), 50) }

  const canCheckIn  = info && !info.isCheckedIn && !info.isCheckedOut
  const canCheckOut = info && info.isCheckedIn  && !info.isCheckedOut

  return (
    <div className="max-w-lg mx-auto space-y-5 py-2">

      {/* Tab toggle */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className={cn('h-4 w-4', tab === t.id ? t.color : '')} />
            {t.label}
          </button>
        ))}
      </div>

      {/* QR input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary" />
            {tab === 'checkin' ? 'Entry Scan' : 'Exit Scan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="space-y-3">
            <div className="space-y-1.5">
              <Label>QR Code / Reservation ID</Label>
              <Input
                ref={inputRef}
                autoFocus
                placeholder="Paste QR data or type reservation ID…"
                value={qr}
                onChange={e => { setQr(e.target.value); setInfo(null); setResult(null) }}
              />
              <p className="text-xs text-muted-foreground">
                Paste the QR text from the customer's booking, or enter the reservation ID manually.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={scanning || !qr.trim()}>
              {scanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Looking up…</> : 'Look Up Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Booking info card */}
      {info && (
        <Card className={cn(
          'border-2',
          tab === 'checkin'  && canCheckIn  ? 'border-emerald-200 dark:border-emerald-800' :
          tab === 'checkout' && canCheckOut ? 'border-rose-200 dark:border-rose-800'       :
          'border-border'
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Booking Details</CardTitle>
              <StatusBadge info={info} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-0.5">
              <InfoRow label={<span className="flex items-center gap-1"><User className="h-3 w-3" /> Customer</span>} value={info.customerName} />
              <InfoRow label={<span className="flex items-center gap-1"><Car className="h-3 w-3" /> Vehicle</span>}  value={info.vehicleNumber || 'Not specified'} />
              <InfoRow label={<span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</span>} value={`${info.locationName}, ${info.city}`} />
              <InfoRow label="Slot"  value={info.slotNumber} />
              <Separator className="my-1" />
              <InfoRow label={<span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Booking</span>}
                       value={`${fmt(info.startTime)} → ${fmt(info.endTime)}`} />
              {info.checkInTime  && <InfoRow label="Checked In"  value={fmt(info.checkInTime)}  valueClass="text-emerald-600" />}
              {info.checkOutTime && <InfoRow label="Checked Out" value={fmt(info.checkOutTime)} valueClass="text-slate-500" />}
            </div>

            {/* Entry gate actions */}
            {tab === 'checkin' && (
              <>
                {!canCheckIn && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    {info.isCheckedOut ? 'This vehicle has already exited.' : info.isCheckedIn ? 'This vehicle is already inside.' : 'Reservation is cancelled.'}
                  </div>
                )}
                {canCheckIn && (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleConfirm} disabled={confirming}>
                    {confirming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : <><LogIn className="mr-2 h-4 w-4" />Confirm Entry</>}
                  </Button>
                )}
              </>
            )}

            {/* Exit gate actions */}
            {tab === 'checkout' && (
              <>
                {!canCheckOut && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    {info.isCheckedOut ? 'This vehicle has already exited.' : 'This vehicle has not entered yet.'}
                  </div>
                )}
                {canCheckOut && (
                  <div className="space-y-3">
                    {/* Overstay preview */}
                    {(() => {
                      const now   = new Date()
                      const end   = new Date(info.endTime)
                      const diffM = Math.max(0, (now - end) / 60000 - 15)
                      const blocks  = Math.ceil(diffM / 15)
                      const penalty = blocks * 20
                      return diffM > 0 ? (
                        <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 space-y-1">
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" /> Overstay Detected
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {Math.ceil(diffM)} min beyond grace period — Penalty: <strong>₹{penalty}</strong>
                          </p>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={overstayPaid}
                              onChange={e => setOverstayPaid(e.target.checked)}
                              className="h-4 w-4 rounded"
                            />
                            <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                              Penalty of ₹{penalty} collected (Cash / UPI)
                            </span>
                          </label>
                        </div>
                      ) : null
                    })()}
                    <Button
                      className="w-full bg-rose-600 hover:bg-rose-700"
                      onClick={handleConfirm}
                      disabled={confirming}
                    >
                      {confirming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : <><LogOut className="mr-2 h-4 w-4" />Confirm Exit</>}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result card */}
      {result && (
        <Card className="border-2 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {tab === 'checkin' ? 'Entry Recorded' : 'Exit Recorded'}
                </p>
                <p className="text-xs text-muted-foreground">{result.message}</p>
              </div>
            </div>

            {/* Show overstay summary on checkout */}
            {tab === 'checkout' && result.hasOverstay && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-2 space-y-0.5">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" /> Overstay Summary
                </p>
                <InfoRow label="Overstay duration" value={`${result.overstayMinutes} min`} />
                <InfoRow label="Penalty"           value={`₹${result.overstayPenalty}`} valueClass="font-bold text-rose-600" />
                <InfoRow label="Payment"           value={result.overstayPaid ? 'Collected ✓' : 'Not collected'} valueClass={result.overstayPaid ? 'text-emerald-600' : 'text-red-500'} />
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={reset}>
              Scan Next Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
