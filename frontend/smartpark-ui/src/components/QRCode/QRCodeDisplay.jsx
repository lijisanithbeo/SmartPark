export default function QRCodeDisplay({ base64 }) {
  if (!base64) return null
  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Your Booking QR Code</p>
      <img src={`data:image/png;base64,${base64}`} alt="Reservation QR Code" style={{ width: 200, height: 200 }} />
    </div>
  )
}
