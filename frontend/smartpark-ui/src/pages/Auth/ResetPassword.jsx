import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // idle | success | error
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (status !== 'success') return
    const timer = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(timer)
  }, [status, navigate])

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-sm text-destructive">Invalid reset link.</p>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Request a new one
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (form.newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, form.newPassword)
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
              P
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            {status === 'success' ? 'Password updated!' : 'Enter your new password below'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your password has been reset. Redirecting to sign in…
              </p>
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Go to sign in
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">
                This reset link is invalid or has expired.
              </p>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Request a new link
              </Link>
            </div>
          )}

          {status === 'idle' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your new password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>

              {validationError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {validationError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
