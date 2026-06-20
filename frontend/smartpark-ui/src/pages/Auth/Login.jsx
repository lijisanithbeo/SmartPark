import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await authService.login(form)
      login(data)
      if (data.role === 'Admin') navigate('/admin')
      else if (data.role === 'ParkingOwner') navigate('/owner')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '24px', color: '#1a73e8' }}>🅿 Login to SmartPark</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={inputStyle} type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={btnStyle} type="submit">Login</button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          No account? <Link to="/register" style={{ color: '#1a73e8' }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const pageStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }
const cardStyle = { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '360px' }
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }
const btnStyle   = { width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }
const errorStyle = { background: '#fce8e6', color: '#d93025', padding: '10px', borderRadius: '6px', marginBottom: '14px' }
