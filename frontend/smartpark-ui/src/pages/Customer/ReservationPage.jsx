import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import reservationService from '../../services/reservationService'
import parkingService from '../../services/parkingService'
import QRCodeDisplay from '../../components/QRCode/QRCodeDisplay'
import MiniMap from '../../components/Map/MiniMap'

function NavigateBtn({ locationName, address, city }) {
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    console.log('NavigateBtn props:', { locationName, address, city })
    const destination = encodeURIComponent([locationName, address, city].filter(Boolean).join(', '))
    const open = (origin) => {
      const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=driving`
      console.log('Opening Maps URL:', url)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        pos => { setLoading(false); open(`${pos.coords.latitude},${pos.coords.longitude}`) },
        ()  => { setLoading(false); open(null) }
      )
    } else {
      open(null)
    }
  }

  return (
    <button onClick={handleClick} style={navBtn} disabled={loading}>
      {loading ? '📍 Getting location…' : '🗺️ Get Directions'}
    </button>
  )
}

// ── Custom time picker using dropdowns (always visible, no clipping) ─────
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

function TimePicker({ value, onChange }) {
  const [hh, setHh] = useState(() => value ? value.split(':')[0] : '')
  const [mm, setMm] = useState(() => value ? value.split(':')[1] : '')

  // Fully sync internal dropdowns when value changes (including programmatic updates)
  useEffect(() => {
    if (!value) { setHh(''); setMm('') }
    else { const [h, m] = value.split(':'); setHh(h || ''); setMm(m || '') }
  }, [value])

  const handleHour = (h) => {
    setHh(h)
    if (mm) onChange(`${h}:${mm}`)
  }
  const handleMin = (m) => {
    setMm(m)
    if (hh) onChange(`${hh}:${m}`)
  }

  return (
    <div style={timeRow}>
      <select style={timeSelect} value={hh} onChange={e => handleHour(e.target.value)} required>
        <option value="">HH</option>
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span style={timeSep}>:</span>
      <select style={timeSelect} value={mm} onChange={e => handleMin(e.target.value)} required>
        <option value="">MM</option>
        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  )
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ReservationPage() {
  const { slotId } = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [slot,          setSlot]          = useState(null)
  const [startDate,     setStartDate]     = useState('')
  const [startTime,     setStartTime]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [endTime,       setEndTime]       = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [duration,      setDuration]      = useState(0)
  const [totalAmount,   setTotalAmount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [step,          setStep]          = useState('form')
  const [qrCode,        setQrCode]        = useState('')
  const [reservation,   setReservation]   = useState(null)
  const [nowLabel,      setNowLabel]      = useState(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  })

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

  // When start date changes, keep end date >= start date
  const handleStartDateChange = (date) => {
    setStartDate(date)
    if (endDate && endDate < date) setEndDate(date)
  }

  // When start time changes, if start >= end (same date), advance end by 1 hour
  const handleStartTimeChange = (time) => {
    setStartTime(time)
    if (startDate === endDate && endTime && time >= endTime) {
      const newH = Math.min(parseInt(time.split(':')[0]) + 1, 23)
      setEndTime(`${String(newH).padStart(2, '0')}:${time.split(':')[1]}`)
    }
  }

  const recalculate = useCallback(() => {
    if (!startDate || !startTime || !endDate || !endTime || !slot) {
      setDuration(0); setTotalAmount(0); return
    }
    const start  = new Date(`${startDate}T${startTime}`)
    const end    = new Date(`${endDate}T${endTime}`)
    const diffMs = end - start
    if (diffMs <= 0) { setDuration(0); setTotalAmount(0); return }
    const mins  = Math.round(diffMs / 60000)
    const hours = mins / 60
    setDuration(mins)
    setTotalAmount(parseFloat((hours * slot.hourlyRate).toFixed(2)))
  }, [startDate, startTime, endDate, endTime, slot])

  useEffect(() => { recalculate() }, [recalculate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!startTime || !endTime) { setError('Please select both start and end times.'); return }
    if (duration <= 0)          { setError('End time must be after start time.'); return }

    setLoading(true)
    try {
      const res = await reservationService.create({
        userID: user.id, slotID: parseInt(slotId),
        startTime: `${startDate}T${startTime}`,
        endTime:   `${endDate}T${endTime}`,
      })
      setReservation(res)
      const payment = await reservationService.pay(res.id, {
        amount: totalAmount, paymentMethod,
      })
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

  // ── Confirmed (Card / UPI) ───────────────────────────────────────────────
  if (step === 'done') return (
    <div style={page}><div style={card}>
      <div style={{ fontSize: '2.5rem', marginBottom: '4px', textAlign: 'center' }}>✅</div>
      <h2 style={{ color: '#34a853', marginBottom: '4px', textAlign: 'center' }}>Booking Confirmed!</h2>
      <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', marginBottom: '4px' }}>
        Payment of <strong>₹{totalAmount.toFixed(2)}</strong> received via {paymentMethod}
      </p>

      {reservation && (
        <>
          <p style={{ color: '#444', fontWeight: '600', fontSize: '0.95rem', margin: '12px 0 0', textAlign: 'center' }}>
            📍 {reservation.locationName}
          </p>
          <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', margin: '2px 0 0' }}>
            {reservation.locationAddress}, {reservation.locationCity}
          </p>
          <MiniMap locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} />
          <NavigateBtn locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} />
        </>
      )}

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <QRCodeDisplay base64={qrCode} />
        <p style={{ color: '#888', fontSize: '0.8rem', margin: '10px 0 20px' }}>
          Show this QR code at the parking entrance
        </p>
        <button style={btn} onClick={() => navigate('/bookings')}>View My Bookings</button>
      </div>
    </div></div>
  )

  // ── Cash (pending) ───────────────────────────────────────────────────────
  if (step === 'cash') return (
    <div style={page}><div style={card}>
      <div style={{ fontSize: '2.5rem', marginBottom: '4px', textAlign: 'center' }}>🅿️</div>
      <h2 style={{ color: '#f9a825', marginBottom: '4px', textAlign: 'center' }}>Slot Reserved!</h2>
      <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', marginBottom: '4px' }}>
        Pay at the counter upon arrival.
      </p>

      {reservation && (
        <>
          <p style={{ color: '#444', fontWeight: '600', fontSize: '0.95rem', margin: '12px 0 0', textAlign: 'center' }}>
            📍 {reservation.locationName}
          </p>
          <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', margin: '2px 0 0' }}>
            {reservation.locationAddress}, {reservation.locationCity}
          </p>
          <MiniMap locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} />
          <NavigateBtn locationName={reservation.locationName || slot?.locationName} address={reservation.locationAddress} city={reservation.locationCity} />
        </>
      )}

      <div style={summaryBox}>
        <SummaryRow label="Amount Due"  value={`₹${totalAmount.toFixed(2)}`} valueStyle={{ color: '#f9a825', fontWeight: '700' }} />
        <SummaryRow label="Payment"     value="Cash at Counter" />
        <SummaryRow label="Status"      value="⏳ Pending"  valueStyle={{ color: '#f9a825' }} />
      </div>
      <p style={{ color: '#888', fontSize: '0.8rem', margin: '8px 0 16px', textAlign: 'center' }}>
        QR code will be generated after counter confirms payment
      </p>
      <button style={btn} onClick={() => navigate('/bookings')}>View My Bookings</button>
    </div></div>
  )

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ color: '#1a73e8', marginBottom: '4px' }}>Reserve Slot</h2>

        {slot && (
          <div style={slotBadge}>
            <span>🅿️ <strong>{slot.slotNumber}</strong></span>
            <span style={dot} /><span>{slot.slotType}</span>
            <span style={dot} /><span>Floor {slot.floorNumber}</span>
            <span style={dot} /><span style={{ color: '#1a73e8', fontWeight: '600' }}>₹{slot.hourlyRate}/hr</span>
          </div>
        )}

        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleSubmit}>

          {/* ── Start ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ ...groupLabel, margin: 0 }}>Start</p>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Current time: <strong style={{ color: '#1a73e8' }}>{nowLabel}</strong></span>
          </div>
          <div style={row}>
            <div style={half}>
              <label style={label}>Date</label>
              <input style={input} type="date" value={startDate}
                onChange={e => handleStartDateChange(e.target.value)} required />
            </div>
            <div style={half}>
              <label style={label}>Time</label>
              <TimePicker value={startTime} onChange={handleStartTimeChange} />
            </div>
          </div>

          {/* ── End ── */}
          <p style={groupLabel}>End</p>
          <div style={row}>
            <div style={half}>
              <label style={label}>Date</label>
              <input style={input} type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)} required />
            </div>
            <div style={half}>
              <label style={label}>Time</label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* ── Live summary ── */}
          {duration > 0 && slot && (
            <div style={summaryBox}>
              <SummaryRow label="Duration" value={formatDuration(duration)} />
              <SummaryRow label="Rate"     value={`₹${slot.hourlyRate}/hour`} />
              <div style={{ borderTop: '1px solid #e8eaed', marginTop: '6px', paddingTop: '10px' }}>
                <SummaryRow
                  label="Total"
                  value={`₹${totalAmount.toFixed(2)}`}
                  labelStyle={{ fontWeight: '700', color: '#202124' }}
                  valueStyle={{ fontWeight: '700', color: '#1a73e8', fontSize: '1.1rem' }}
                />
              </div>
            </div>
          )}

          {/* ── Payment Method ── */}
          <label style={label}>Payment Method</label>
          <div style={paymentGrid}>
            {[
              { id: 'Card', icon: '💳', sub: null },
              { id: 'UPI',  icon: '📱', sub: null },
              { id: 'Cash', icon: '💵', sub: 'Pay at counter' },
            ].map(({ id, icon, sub }) => (
              <button key={id} type="button"
                style={{ ...payOpt, ...(paymentMethod === id ? paySelected : {}) }}
                onClick={() => setPaymentMethod(id)}
              >
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{id}</span>
                {sub && <span style={{ fontSize: '0.7rem', color: '#f9a825' }}>{sub}</span>}
              </button>
            ))}
          </div>

          <button style={{ ...btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Processing…'
              : paymentMethod === 'Cash'
                ? `Reserve — Pay ₹${totalAmount > 0 ? totalAmount.toFixed(2) : '—'} at Counter`
                : `Confirm & Pay ₹${totalAmount > 0 ? totalAmount.toFixed(2) : '—'}`}
          </button>
        </form>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, labelStyle = {}, valueStyle = {} }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
      <span style={{ color: '#666', fontSize: '0.88rem', ...labelStyle }}>{label}</span>
      <span style={{ color: '#202124', fontSize: '0.88rem', ...valueStyle }}>{value}</span>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────
const page         = { display: 'flex', justifyContent: 'center', padding: '40px 24px' }
const card         = { background: '#fff', padding: '36px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '480px', maxWidth: '100%', boxSizing: 'border-box' }
const slotBadge    = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f4ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '0.9rem', color: '#444', flexWrap: 'wrap' }
const dot          = { width: '4px', height: '4px', borderRadius: '50%', background: '#aaa', display: 'inline-block' }
const groupLabel   = { fontWeight: '700', color: '#1a73e8', margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }
const row          = { display: 'flex', gap: '12px', marginBottom: '14px' }
const half         = { flex: 1, minWidth: 0 }
const label        = { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555', fontSize: '0.85rem' }
const input        = { display: 'block', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }
const timeRow      = { display: 'flex', alignItems: 'center', gap: '4px' }
const timeSelect   = { flex: 1, padding: '10px 4px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', textAlign: 'center', background: '#fff', cursor: 'pointer' }
const timeSep      = { fontWeight: '700', color: '#444', fontSize: '1.1rem' }
const summaryBox   = { background: '#f8f9fa', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }
const paymentGrid  = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', margin: '8px 0 18px' }
const payOpt       = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px', borderRadius: '10px', border: '2px solid #e0e0e0', background: '#fafafa', cursor: 'pointer' }
const paySelected  = { border: '2px solid #1a73e8', background: '#e8f0fe' }
const btn          = { width: '100%', padding: '13px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' }
const errorStyle   = { background: '#fce8e6', color: '#d93025', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.9rem' }
const navBtn       = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: '#34a853', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxSizing: 'border-box', marginBottom: '12px' }
