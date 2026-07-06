import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Car, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.login(form)
      login(data)
      if (data.role === 'Admin') navigate('/admin')
      else if (data.role === 'ParkingOwner') navigate('/owner')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div
        className="flex rounded-2xl overflow-hidden w-full shadow-xl"
        style={{ maxWidth: '780px', minHeight: '520px', border: '0.5px solid #C7D2FE' }}
      >
        {/* ── Left: Form Panel ─────────────────────────────── */}
        <div className="flex-none w-72 flex flex-col justify-center px-7 py-9" style={{ background: '#F0F0FF' }}>
          {/* Logo */}
          <div className="text-center mb-6">
            <div
              className="flex items-center justify-center mx-auto mb-2"
              style={{ width: 52, height: 52, borderRadius: 14, background: '#4338CA' }}
            >
              <Car className="text-white" style={{ width: 24, height: 24 }} />
            </div>
            <p className="font-medium text-indigo-900" style={{ fontSize: 21 }}>SmartPark</p>
            <p className="mt-0.5" style={{ fontSize: 11, color: '#818CF8' }}>Reserve your slot before you arrive</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <p className="font-medium mb-1" style={{ fontSize: 11, color: '#3730A3' }}>Email address</p>
            <div
              className="flex items-center gap-2 bg-white mb-3"
              style={{ border: '0.5px solid #C7D2FE', borderRadius: 8, padding: '10px 12px' }}
            >
              <Mail style={{ width: 14, height: 14, color: '#818CF8', flexShrink: 0 }} />
              <Input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className="border-0 p-0 h-auto text-sm bg-transparent focus-visible:ring-0 shadow-none placeholder:text-gray-400"
                style={{ fontSize: 13 }}
              />
            </div>

            {/* Password */}
            <p className="font-medium mb-1" style={{ fontSize: 11, color: '#3730A3' }}>Password</p>
            <div
              className="flex items-center gap-2 bg-white mb-1"
              style={{ border: '0.5px solid #C7D2FE', borderRadius: 8, padding: '10px 12px' }}
            >
              <Lock style={{ width: 14, height: 14, color: '#818CF8', flexShrink: 0 }} />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                className="border-0 p-0 h-auto text-sm bg-transparent focus-visible:ring-0 shadow-none placeholder:text-gray-400 flex-1"
                style={{ fontSize: 13 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="hover:opacity-70 transition-opacity"
                style={{ color: '#C7D2FE', flexShrink: 0 }}
              >
                {showPassword
                  ? <EyeOff style={{ width: 13, height: 13 }} />
                  : <Eye style={{ width: 13, height: 13 }} />}
              </button>
            </div>

            {/* Forgot */}
            <div className="flex justify-end mb-3.5 mt-1.5">
              <Link
                to="/forgot-password"
                style={{ fontSize: 11, color: '#6D28D9' }}
                className="hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 mb-3 text-destructive" style={{ fontSize: 12 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-medium cursor-pointer disabled:opacity-60 transition-colors mb-3.5"
              style={{ background: '#4338CA', borderRadius: 8, padding: '11px 0', fontSize: 14 }}
              onMouseEnter={e => e.currentTarget.style.background = '#3730A3'}
              onMouseLeave={e => e.currentTarget.style.background = '#4338CA'}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn style={{ width: 15, height: 15 }} />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <p className="text-center text-gray-500" style={{ fontSize: 12 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4338CA', fontWeight: 500 }} className="hover:underline">
              Register now
            </Link>
          </p>
        </div>

        {/* ── Right: Illustration Panel ─────────────────────── */}
        <div
          className="flex-1 relative overflow-hidden flex-col justify-end p-6 hidden sm:flex"
          style={{ background: '#1B3A6B' }}
        >
          {/* SVG scene */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" viewBox="0 0 520 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="spSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F2A56"/>
                  <stop offset="100%" stopColor="#1B3A6B"/>
                </linearGradient>
                <linearGradient id="spRoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D1F3C"/>
                  <stop offset="100%" stopColor="#0A1628"/>
                </linearGradient>
                <filter id="spGlow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="spSoftGlow">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {/* Sky */}
              <rect width="520" height="540" fill="url(#spSky)"/>
              {/* Moon */}
              <circle cx="400" cy="80" r="55" fill="#1B3A6B" opacity="0.4"/>
              <circle cx="400" cy="80" r="26" fill="#FEF3C7" opacity="0.9"/>
              <circle cx="400" cy="80" r="40" fill="#FFF8DC" opacity="0" filter="url(#spSoftGlow)">
                <animate attributeName="opacity" values="0.1;0.28;0.1" dur="3.5s" repeatCount="indefinite"/>
                <animate attributeName="r" values="38;46;38" dur="3.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="393" cy="74" r="8" fill="#FEF9C3" opacity="0.5"/>
              {/* Stars - each twinkles at different speed and phase */}
              <circle cx="60" cy="50" r="1.5" fill="#E0EEFF">
                <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2.1s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1.5;2.2;1.5" dur="2.1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="130" cy="30" r="1" fill="#BAD4F5">
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.7s" begin="0.4s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;1.8;1" dur="1.7s" begin="0.4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="200" cy="55" r="1.5" fill="#E0EEFF">
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.6s" begin="0.9s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1.5;2.3;1.5" dur="2.6s" begin="0.9s" repeatCount="indefinite"/>
              </circle>
              <circle cx="290" cy="25" r="1" fill="#BAD4F5">
                <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.4s" begin="0.2s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;1.7;1" dur="1.4s" begin="0.2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="340" cy="45" r="1" fill="#E0EEFF">
                <animate attributeName="opacity" values="0.5;0.05;0.5" dur="2.9s" begin="1.1s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;1.9;1" dur="2.9s" begin="1.1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="460" cy="35" r="1.5" fill="#BAD4F5">
                <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.9s" begin="0.6s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1.5;2.4;1.5" dur="1.9s" begin="0.6s" repeatCount="indefinite"/>
              </circle>
              <circle cx="490" cy="110" r="1" fill="#E0EEFF">
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.3s" begin="1.5s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;1.6;1" dur="2.3s" begin="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="80" cy="110" r="1" fill="#BAD4F5">
                <animate attributeName="opacity" values="0.6;0.05;0.6" dur="3.1s" begin="0.8s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1;1.8;1" dur="3.1s" begin="0.8s" repeatCount="indefinite"/>
              </circle>
              {/* Parking garage */}
              <rect x="110" y="130" width="300" height="230" rx="8" fill="#163358"/>
              <rect x="110" y="130" width="300" height="18" rx="4" fill="#1E4A7A"/>
              {/* Sign */}
              <rect x="175" y="100" width="170" height="34" rx="6" fill="#2563EB"/>
              <text x="260" y="122" fontFamily="system-ui,sans-serif" fontSize="13" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="1">SMART PARK</text>
              <rect x="253" y="134" width="14" height="8" fill="#1E4A7A"/>
              {/* Floor labels */}
              <text x="125" y="190" fontFamily="system-ui,sans-serif" fontSize="9" fill="#4A90D9" opacity="0.8">FLOOR 1</text>
              <text x="125" y="255" fontFamily="system-ui,sans-serif" fontSize="9" fill="#4A90D9" opacity="0.8">FLOOR 2</text>
              <text x="125" y="320" fontFamily="system-ui,sans-serif" fontSize="9" fill="#4A90D9" opacity="0.8">FLOOR 3</text>
              {/* Floor 1 */}
              <rect x="155" y="168" width="240" height="48" rx="3" fill="#0F2240"/>
              {/* slot: empty */}
              <rect x="163" y="174" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              {/* slot: empty */}
              <rect x="207" y="174" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              {/* slot: blue car (top-down) */}
              <rect x="251" y="174" width="38" height="36" rx="3" fill="#1E3D6E" stroke="#3B82F6" strokeWidth="1.2"/>
              <rect x="256" y="179" width="28" height="26" rx="5" fill="#2563EB"/>
              <rect x="260" y="182" width="20" height="8" rx="2" fill="#93C5FD" opacity="0.7"/>
              <rect x="257" y="179" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="278" y="179" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="257" y="199" width="5" height="4" rx="1" fill="#FCA5A5"/>
              <rect x="278" y="199" width="5" height="4" rx="1" fill="#FCA5A5"/>
              {/* slot: open */}
              <rect x="295" y="174" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              <rect x="299" y="178" width="30" height="10" rx="3" fill="#059669" opacity="0.9"/>
              <text x="314" y="186" fontFamily="system-ui,sans-serif" fontSize="6.5" fill="white" textAnchor="middle" fontWeight="600">OPEN</text>
              {/* slot: green car (top-down) */}
              <rect x="339" y="174" width="38" height="36" rx="3" fill="#1E3D6E" stroke="#3B82F6" strokeWidth="1.2"/>
              <rect x="344" y="179" width="28" height="26" rx="5" fill="#059669"/>
              <rect x="348" y="182" width="20" height="8" rx="2" fill="#6EE7B7" opacity="0.7"/>
              <rect x="345" y="179" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="366" y="179" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="345" y="199" width="5" height="4" rx="1" fill="#FCA5A5"/>
              <rect x="366" y="199" width="5" height="4" rx="1" fill="#FCA5A5"/>
              {/* Floor 2 */}
              <rect x="155" y="232" width="240" height="48" rx="3" fill="#0F2240"/>
              {/* slot: orange car */}
              <rect x="163" y="238" width="38" height="36" rx="3" fill="#1E3D6E" stroke="#3B82F6" strokeWidth="1.2"/>
              <rect x="168" y="243" width="28" height="26" rx="5" fill="#D97706"/>
              <rect x="172" y="246" width="20" height="8" rx="2" fill="#FDE68A" opacity="0.7"/>
              <rect x="169" y="243" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="190" y="243" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="169" y="263" width="5" height="4" rx="1" fill="#FCA5A5"/>
              <rect x="190" y="263" width="5" height="4" rx="1" fill="#FCA5A5"/>
              {/* slot: open */}
              <rect x="207" y="238" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              <rect x="211" y="242" width="30" height="10" rx="3" fill="#059669" opacity="0.9"/>
              <text x="226" y="250" fontFamily="system-ui,sans-serif" fontSize="6.5" fill="white" textAnchor="middle" fontWeight="600">OPEN</text>
              {/* slot: open */}
              <rect x="251" y="238" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              <rect x="255" y="242" width="30" height="10" rx="3" fill="#059669" opacity="0.9"/>
              <text x="270" y="250" fontFamily="system-ui,sans-serif" fontSize="6.5" fill="white" textAnchor="middle" fontWeight="600">OPEN</text>
              {/* slot: blue car */}
              <rect x="295" y="238" width="38" height="36" rx="3" fill="#1E3D6E" stroke="#3B82F6" strokeWidth="1.2"/>
              <rect x="300" y="243" width="28" height="26" rx="5" fill="#2563EB"/>
              <rect x="304" y="246" width="20" height="8" rx="2" fill="#93C5FD" opacity="0.7"/>
              <rect x="301" y="243" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="322" y="243" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="301" y="263" width="5" height="4" rx="1" fill="#FCA5A5"/>
              <rect x="322" y="263" width="5" height="4" rx="1" fill="#FCA5A5"/>
              {/* slot: empty */}
              <rect x="339" y="238" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              {/* Floor 3 */}
              <rect x="155" y="296" width="240" height="48" rx="3" fill="#0F2240"/>
              {/* slot: empty */}
              <rect x="163" y="302" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              {/* slot: green car */}
              <rect x="207" y="302" width="38" height="36" rx="3" fill="#1E3D6E" stroke="#3B82F6" strokeWidth="1.2"/>
              <rect x="212" y="307" width="28" height="26" rx="5" fill="#059669"/>
              <rect x="216" y="310" width="20" height="8" rx="2" fill="#6EE7B7" opacity="0.7"/>
              <rect x="213" y="307" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="234" y="307" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="213" y="327" width="5" height="4" rx="1" fill="#FCA5A5"/>
              <rect x="234" y="327" width="5" height="4" rx="1" fill="#FCA5A5"/>
              {/* slot: open */}
              <rect x="251" y="302" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              <rect x="255" y="306" width="30" height="10" rx="3" fill="#059669" opacity="0.9"/>
              <text x="270" y="314" fontFamily="system-ui,sans-serif" fontSize="6.5" fill="white" textAnchor="middle" fontWeight="600">OPEN</text>
              {/* slot: empty */}
              <rect x="295" y="302" width="38" height="36" rx="3" fill="#1A3560" stroke="#2563EB" strokeWidth="0.8"/>
              {/* slot: orange car */}
              <rect x="339" y="302" width="38" height="36" rx="3" fill="#1E3D6E" stroke="#3B82F6" strokeWidth="1.2"/>
              <rect x="344" y="307" width="28" height="26" rx="5" fill="#D97706"/>
              <rect x="348" y="310" width="20" height="8" rx="2" fill="#FDE68A" opacity="0.7"/>
              <rect x="345" y="307" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="366" y="307" width="5" height="4" rx="1" fill="#FEF9C3"/>
              <rect x="345" y="327" width="5" height="4" rx="1" fill="#FCA5A5"/>
              <rect x="366" y="327" width="5" height="4" rx="1" fill="#FCA5A5"/>
              {/* Gate barriers */}
              <rect x="380" y="340" width="30" height="20" rx="2" fill="#0F2240"/>
              <rect x="383" y="342" width="24" height="16" rx="2" fill="#1A3560"/>
              <text x="395" y="353" fontFamily="system-ui,sans-serif" fontSize="7" fill="#3B82F6" textAnchor="middle" fontWeight="700">IN</text>
              <rect x="95" y="340" width="30" height="20" rx="2" fill="#0F2240"/>
              <rect x="98" y="342" width="24" height="16" rx="2" fill="#1A3560"/>
              <text x="110" y="353" fontFamily="system-ui,sans-serif" fontSize="7" fill="#34D399" textAnchor="middle" fontWeight="700">OUT</text>
              <rect x="92" y="356" width="2" height="18" fill="#FCD34D"/>
              <rect x="94" y="356" width="28" height="3" rx="1" fill="#FCD34D" opacity="0.8"/>
              <rect x="408" y="356" width="2" height="18" fill="#FCD34D"/>
              <rect x="382" y="356" width="28" height="3" rx="1" fill="#FCD34D" opacity="0.8"/>
              {/* Road */}
              <rect x="0" y="374" width="520" height="8" fill="#1A3D70"/>
              <rect x="0" y="382" width="520" height="100" fill="url(#spRoad)"/>
              <rect x="0" y="384" width="520" height="2" fill="#FCD34D" opacity="0.5"/>
              <rect x="50" y="392" width="40" height="4" rx="2" fill="white" opacity="0.2"/>
              <rect x="130" y="392" width="40" height="4" rx="2" fill="white" opacity="0.2"/>
              <rect x="210" y="392" width="40" height="4" rx="2" fill="white" opacity="0.2"/>
              <rect x="290" y="392" width="40" height="4" rx="2" fill="white" opacity="0.2"/>
              <rect x="370" y="392" width="40" height="4" rx="2" fill="white" opacity="0.2"/>
              <rect x="450" y="392" width="40" height="4" rx="2" fill="white" opacity="0.2"/>
              {/* Car 1 - Blue (sedan silhouette facing right) */}
              <g transform="translate(55,406)">
                {/* body */}
                <rect x="0" y="12" width="78" height="18" rx="4" fill="#2563EB"/>
                {/* cabin - narrow, offset centre-rear for sedan look */}
                <path d="M14 12 L20 2 L52 2 L60 12 Z" fill="#1D4ED8"/>
                {/* windscreen */}
                <path d="M22 11 L27 3 L43 3 L48 11 Z" fill="#93C5FD" opacity="0.85"/>
                {/* rear glass */}
                <path d="M50 11 L53 3 L56 3 L59 11 Z" fill="#93C5FD" opacity="0.55"/>
                {/* headlight */}
                <rect x="73" y="16" width="6" height="5" rx="1" fill="#FEF9C3"/>
                {/* taillight */}
                <rect x="0" y="16" width="4" height="5" rx="1" fill="#FCA5A5"/>
                <circle cx="15" cy="30" r="8" fill="#0F2240" stroke="#60A5FA" strokeWidth="2.5"/>
                <circle cx="15" cy="30" r="3.5" fill="#1E3A5F"/>
                <circle cx="60" cy="30" r="8" fill="#0F2240" stroke="#60A5FA" strokeWidth="2.5"/>
                <circle cx="60" cy="30" r="3.5" fill="#1E3A5F"/>
              </g>
              {/* Car 2 - Green */}
              <g transform="translate(205,406)">
                <rect x="0" y="12" width="78" height="18" rx="4" fill="#059669"/>
                <path d="M14 12 L20 2 L52 2 L60 12 Z" fill="#047857"/>
                <path d="M22 11 L27 3 L43 3 L48 11 Z" fill="#6EE7B7" opacity="0.85"/>
                <path d="M50 11 L53 3 L56 3 L59 11 Z" fill="#6EE7B7" opacity="0.55"/>
                <rect x="73" y="16" width="6" height="5" rx="1" fill="#FEF9C3"/>
                <rect x="0" y="16" width="4" height="5" rx="1" fill="#FCA5A5"/>
                <circle cx="15" cy="30" r="8" fill="#0F2240" stroke="#34D399" strokeWidth="2.5"/>
                <circle cx="15" cy="30" r="3.5" fill="#1E3A5F"/>
                <circle cx="60" cy="30" r="8" fill="#0F2240" stroke="#34D399" strokeWidth="2.5"/>
                <circle cx="60" cy="30" r="3.5" fill="#1E3A5F"/>
              </g>
              {/* Car 3 - Orange */}
              <g transform="translate(360,406)">
                <rect x="0" y="12" width="78" height="18" rx="4" fill="#D97706"/>
                <path d="M14 12 L20 2 L52 2 L60 12 Z" fill="#B45309"/>
                <path d="M22 11 L27 3 L43 3 L48 11 Z" fill="#FDE68A" opacity="0.85"/>
                <path d="M50 11 L53 3 L56 3 L59 11 Z" fill="#FDE68A" opacity="0.55"/>
                <rect x="73" y="16" width="6" height="5" rx="1" fill="#FEF9C3"/>
                <rect x="0" y="16" width="4" height="5" rx="1" fill="#FCA5A5"/>
                <circle cx="15" cy="30" r="8" fill="#0F2240" stroke="#FDE68A" strokeWidth="2.5"/>
                <circle cx="15" cy="30" r="3.5" fill="#1E3A5F"/>
                <circle cx="60" cy="30" r="8" fill="#0F2240" stroke="#FDE68A" strokeWidth="2.5"/>
                <circle cx="60" cy="30" r="3.5" fill="#1E3A5F"/>
              </g>
              {/* Phone with QR */}
              <g transform="translate(420,120)">
                <rect x="0" y="0" width="58" height="98" rx="10" fill="#0D2444" stroke="#2563EB" strokeWidth="1.5"/>
                <rect x="5" y="8" width="48" height="76" rx="5" fill="#1A3560"/>
                <rect x="10" y="12" width="38" height="38" rx="3" fill="white" opacity="0.95"/>
                <rect x="13" y="15" width="10" height="10" rx="1" fill="#1B3A6B"/>
                <rect x="29" y="15" width="10" height="10" rx="1" fill="#1B3A6B"/>
                <rect x="13" y="31" width="10" height="10" rx="1" fill="#1B3A6B"/>
                <rect x="25" y="27" width="4" height="4" rx="0.5" fill="#1B3A6B"/>
                <rect x="31" y="27" width="4" height="4" rx="0.5" fill="#1B3A6B"/>
                <rect x="25" y="33" width="4" height="4" rx="0.5" fill="#1B3A6B"/>
                <rect x="35" y="33" width="4" height="4" rx="0.5" fill="#1B3A6B"/>
                <rect x="31" y="39" width="7" height="4" rx="0.5" fill="#1B3A6B"/>
                <rect x="13" y="42" width="4" height="4" rx="0.5" fill="#1B3A6B"/>
                <rect x="19" y="42" width="4" height="4" rx="0.5" fill="#1B3A6B"/>
                <text x="29" y="66" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#3B82F6" textAnchor="middle" fontWeight="700">Booked!</text>
                <text x="29" y="76" fontFamily="system-ui,sans-serif" fontSize="6" fill="#6EE7B7" textAnchor="middle">Slot C001 · 2h</text>
                <rect x="21" y="88" width="16" height="3" rx="1.5" fill="#3B82F6" opacity="0.6"/>
              </g>
              {/* Signal lines */}
              <path d="M448 118 Q440 100 420 90" stroke="#3B82F6" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.5"/>
              <path d="M452 115 Q450 95 435 82" stroke="#3B82F6" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.4"/>
              {/* Location pin */}
              <g transform="translate(247,72)" filter="url(#spGlow)">
                <ellipse cx="13" cy="28" rx="5" ry="2" fill="#000" opacity="0.25"/>
                <path d="M13 0 C6 0 0 6 0 13 C0 22 13 30 13 30 C13 30 26 22 26 13 C26 6 20 0 13 0Z" fill="#2563EB"/>
                <circle cx="13" cy="13" r="6" fill="white"/>
                <circle cx="13" cy="13" r="3" fill="#2563EB"/>
              </g>
            </svg>
          </div>

        </div>
      </div>
    </div>
  )
}
