import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import userService from '@/services/userService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserCircle2 } from 'lucide-react'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    userService.getMe()
      .then(data => {
        setForm({
          firstName:   data.firstName,
          lastName:    data.lastName,
          email:       data.email,
          phoneNumber: data.phoneNumber,
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await userService.updateMe(form)
      updateProfile({
        firstName: updated.firstName,
        lastName:  updated.lastName,
        email:     updated.email,
      })
      setForm({
        firstName:   updated.firstName,
        lastName:    updated.lastName,
        email:       updated.email,
        phoneNumber: updated.phoneNumber,
      })
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    userService.getMe().then(data => {
      setForm({
        firstName:   data.firstName,
        lastName:    data.lastName,
        email:       data.email,
        phoneNumber: data.phoneNumber,
      })
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const roleLabel = user?.role === 'ParkingOwner' ? 'Parking Owner'
    : user?.role === 'Admin' ? 'Administrator'
    : 'Customer'

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-muted-foreground">View and manage your account details</p>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {form.firstName} {form.lastName}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{roleLabel}</Badge>
                  <span className="text-xs text-muted-foreground">{user?.userID}</span>
                </div>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                disabled={!editing}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                disabled={!editing}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              disabled={!editing}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">This email is used to log in.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={form.phoneNumber}
              disabled={!editing}
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
            />
          </div>

          {editing && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
