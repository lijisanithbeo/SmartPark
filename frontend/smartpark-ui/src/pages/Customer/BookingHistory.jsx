import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import reservationService from '../../services/reservationService'
import QRCodeDisplay from '../../components/QRCode/QRCodeDisplay'

export default function BookingHistory() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [qrData, setQrData] = useState({})

  useEffect(() => {
    reservationService.getByUser(user.id).then(setReservations)
  }, [user.id])

  const showQr = async (id) => {
    if (qrData[id]) { setQrData(p => ({ ...p, [id]: null })); return }
    const data = await reservationService.getQrCode(id)
    setQrData(p => ({ ...p, [id]: data.qrCode }))
  }

  const cancel = async (id) => {
    await reservationService.cancel(id)
    setReservations(r => r.map(x => x.id === id ? { ...x, status: 'Cancelled' } : x))
  }

  return (
    <div style={page}>
      <h2 style={{ color: '#1a73e8', marginBottom: '24px' }}>My Bookings</h2>
      {reservations.length === 0 && <p style={{ color: '#888' }}>No bookings yet.</p>}
      {reservations.map(r => (
        <div key={r.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p><strong>Slot:</strong> {r.slotNumber} — {r.locationName}</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{new Date(r.startTime).toLocaleString()} → {new Date(r.endTime).toLocaleString()}</p>
              <span style={{ ...badge, background: r.status === 'Confirmed' ? '#e6f4ea' : r.status === 'Cancelled' ? '#fce8e6' : '#fff8e1', color: r.status === 'Confirmed' ? '#34a853' : r.status === 'Cancelled' ? '#d93025' : '#f9ab00' }}>{r.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {r.status !== 'Cancelled' && (
                <>
                  <button style={qrBtn} onClick={() => showQr(r.id)}>QR</button>
                  <button
                    style={navBtn}
                    onClick={() => {
                      const destination = encodeURIComponent([r.locationName, r.locationAddress, r.locationCity].filter(Boolean).join(', '))
                      const open = (origin) => {
                        const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=driving`
                        window.open(url, '_blank', 'noopener,noreferrer')
                      }
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          pos => open(`${pos.coords.latitude},${pos.coords.longitude}`),
                          ()  => open(null)
                        )
                      } else { open(null) }
                    }}
                  >🗺️ Navigate</button>
                  <button style={cancelBtn} onClick={() => cancel(r.id)}>Cancel</button>
                </>
              )}
            </div>
          </div>
          {qrData[r.id] && <QRCodeDisplay base64={qrData[r.id]} />}
        </div>
      ))}
    </div>
  )
}

const page      = { padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }
const card      = { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' }
const badge     = { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '6px' }
const qrBtn     = { padding: '6px 14px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
const navBtn    = { padding: '6px 14px', background: '#34a853', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }
const cancelBtn = { padding: '6px 14px', background: '#d93025', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
