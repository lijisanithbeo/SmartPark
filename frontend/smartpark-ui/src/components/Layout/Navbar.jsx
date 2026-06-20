import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav style={{ background: '#1a73e8', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.3rem', textDecoration: 'none' }}>
        🅿 SmartPark
      </Link>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {!user ? (
          <>
            <Link to="/login"    style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        ) : (
          <>
            {user.role === 'Customer' && (
              <>
                <Link to="/search"   style={linkStyle}>Find Parking</Link>
                <Link to="/bookings" style={linkStyle}>My Bookings</Link>
              </>
            )}
            {user.role === 'ParkingOwner' && (
              <>
                <Link to="/owner/locations" style={linkStyle}>Locations</Link>
                <Link to="/owner/slots"     style={linkStyle}>Slots</Link>
              </>
            )}
            {user.role === 'Admin' && (
              <>
                <Link to="/admin/users"  style={linkStyle}>Users</Link>
                <Link to="/admin/owners" style={linkStyle}>Owners</Link>
              </>
            )}
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>Hi, {user.userID}</span>
            <button onClick={handleLogout} style={btnStyle}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}

const linkStyle = { color: '#fff', textDecoration: 'none', fontSize: '0.95rem' }
const btnStyle  = { background: '#fff', color: '#1a73e8', border: 'none', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold' }
