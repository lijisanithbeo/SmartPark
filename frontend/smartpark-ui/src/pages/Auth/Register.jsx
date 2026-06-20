import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'

export default function Register() {
  const [form, setForm] = useState({ userID: '', firstName: '', lastName: '', email: '', password: '', phoneNumber: '', role: 'Customer' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await authService.register(form)
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  const f = (field) => ({ style: inputStyle, value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }), required: true })

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '24px', color: '#1a73e8' }}>Create Account</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input {...f('userID')}      placeholder="User ID" />
          <input {...f('firstName')}   placeholder="First Name" />
          <input {...f('lastName')}    placeholder="Last Name" />
          <input {...f('email')}       placeholder="Email" type="email" />
          <input {...f('password')}    placeholder="Password" type="password" />
          <input {...f('phoneNumber')} placeholder="Phone Number" />
          <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="Customer">Customer</option>
            <option value="ParkingOwner">Parking Owner</option>
          </select>
          <button style={btnStyle} type="submit">Register</button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          Have an account? <Link to="/login" style={{ color: '#1a73e8' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}

const pageStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }
const cardStyle = { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '380px' }
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }
const btnStyle   = { width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }
const errorStyle = { background: '#fce8e6', color: '#d93025', padding: '10px', borderRadius: '6px', marginBottom: '14px' }
