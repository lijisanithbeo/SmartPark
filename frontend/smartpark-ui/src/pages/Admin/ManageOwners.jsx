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
import { Building2, Pencil } from 'lucide-react'

export default function ManageOwners() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    userService.getByRole(1)
      .then(setOwners)
      .catch(() => toast.error('Failed to load owners'))
      .finally(() => setLoading(false))
  }, [])

  const requestToggle = (owner) => {
    setConfirm({ id: owner.id, isActive: owner.isActive, name: `${owner.firstName} ${owner.lastName}` })
  }

  const handleConfirmToggle = async () => {
    if (!confirm) return
    try {
      const { isActive } = await userService.toggleActive(confirm.id)
      setOwners(o => o.map(x => x.id === confirm.id ? { ...x, isActive } : x))
      toast.success(`Owner ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch {
      toast.error('Failed to update owner status')
    } finally {
      setConfirm(null)
    }
  }

  const openEdit = (owner) => {
    setEditTarget(owner)
    setEditForm({
      firstName:   owner.firstName,
      lastName:    owner.lastName,
      email:       owner.email,
      phoneNumber: owner.phoneNumber,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await userService.updateUser(editTarget.id, editForm)
      setOwners(o => o.map(x => x.id === updated.id ? updated : x))
      toast.success('Owner details updated')
      setEditTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update owner')
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
        <Badge variant={val ? 'default' : 'destructive'} className="text-xs">
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
                ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
                : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
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
        <h2 className="text-2xl font-bold tracking-tight">Manage Owners</h2>
        <p className="text-muted-foreground mt-1">Parking Owner accounts</p>
      </div>

      <DataTable
        columns={columns}
        data={owners}
        loading={loading}
        searchable
        searchPlaceholder="Search by name or email…"
        emptyMessage="No parking owners found."
        emptyIcon={Building2}
        pageSize={10}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.isActive ? 'Deactivate Owner' : 'Activate Owner'}
        description={`Are you sure you want to ${confirm?.isActive ? 'deactivate' : 'activate'} ${confirm?.name}?`}
        confirmLabel={confirm?.isActive ? 'Deactivate' : 'Activate'}
        variant={confirm?.isActive ? 'destructive' : 'default'}
        onConfirm={handleConfirmToggle}
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Owner Details</DialogTitle>
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
