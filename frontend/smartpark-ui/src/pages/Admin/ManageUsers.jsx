import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import userService from '@/services/userService'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { ArrowLeft, Users, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ManageUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    userService.getByRole(2)
      .then(setUsers)
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const requestToggle = (user) => {
    setConfirm({ id: user.id, isActive: user.isActive, name: `${user.firstName} ${user.lastName}` })
  }

  const handleConfirmToggle = async () => {
    if (!confirm) return
    try {
      const { isActive } = await userService.toggleActive(confirm.id)
      setUsers(u => u.map(x => x.id === confirm.id ? { ...x, isActive } : x))
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setConfirm(null)
    }
  }

  const openEdit = (user) => {
    setEditTarget(user)
    setEditForm({
      firstName:   user.firstName,
      lastName:    user.lastName,
      email:       user.email,
      phoneNumber: user.phoneNumber,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await userService.updateUser(editTarget.id, editForm)
      setUsers(u => u.map(x => x.id === updated.id ? updated : x))
      toast.success('User details updated')
      setEditTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'userID', header: 'User ID' },
    { key: 'firstName', header: 'Full Name', render: (_, row) => `${row.firstName} ${row.lastName}` },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone' },
    { key: 'createdDate', header: 'Joined', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
    {
      key: 'isActive',
      header: 'Status',
      render: (val) => (
        <Badge variant={val ? 'success' : 'destructive'} className="text-xs">
          {val ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={
              row.isActive
                ? 'border-[#FCA5A5] text-[#DC2626] hover:bg-red-50'
                : 'border-green-400 text-[#059669] hover:bg-green-50'
            }
            onClick={() => requestToggle(row)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 text-sm font-medium mb-3 hover:opacity-75 transition-opacity"
          style={{ color: '#2563EB' }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
        <p className="text-muted-foreground mt-1">Customer accounts</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchable
        searchPlaceholder="Search by name or email…"
        emptyMessage="No customers found."
        emptyIcon={Users}
        pageSize={10}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.isActive ? 'Deactivate User' : 'Activate User'}
        description={`Are you sure you want to ${confirm?.isActive ? 'deactivate' : 'activate'} ${confirm?.name}?`}
        confirmLabel={confirm?.isActive ? 'Deactivate' : 'Activate'}
        variant={confirm?.isActive ? 'destructive' : 'default'}
        onConfirm={handleConfirmToggle}
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editForm.phoneNumber}
                onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
