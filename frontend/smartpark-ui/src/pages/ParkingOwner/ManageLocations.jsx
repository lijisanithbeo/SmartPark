import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, MapPin, Pencil, Trash2 } from 'lucide-react'
import parkingService from '@/services/parkingService'
import { geocodeAddress } from '@/lib/geolocation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

const EMPTY_FORM = { locationName: '', address: '', city: '', totalSlots: '' }

export default function ManageLocations() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ locationName: '', address: '', city: '', totalSlots: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    parkingService.getMyLocations()
      .then(setLocations)
      .catch(() => toast.error('Failed to load locations'))
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Silently geocode the address — owner just sees the normal spinner
      const coords = await geocodeAddress(form.locationName, form.address, form.city)
      const newLoc = await parkingService.createLocation({
        locationName: form.locationName,
        address:      form.address,
        city:         form.city,
        totalSlots:   parseInt(form.totalSlots),
        latitude:     coords?.lat ?? null,
        longitude:    coords?.lng ?? null,
      })
      setLocations(l => [...l, newLoc])
      setForm(EMPTY_FORM)
      toast.success('Location added successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create location')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (row) => {
    setEditTarget(row)
    setEditForm({
      locationName: row.locationName,
      address:      row.address,
      city:         row.city,
      totalSlots:   String(row.totalSlots),
      isActive:     row.isActive !== false,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Re-geocode whenever address or city changes — keeps coordinates fresh
      const coords = await geocodeAddress(editForm.locationName, editForm.address, editForm.city)
      const updated = await parkingService.updateLocation(editTarget.id, {
        locationName: editForm.locationName,
        address:      editForm.address,
        city:         editForm.city,
        totalSlots:   parseInt(editForm.totalSlots),
        isActive:     editForm.isActive,
        latitude:     coords?.lat ?? null,
        longitude:    coords?.lng ?? null,
      })
      setLocations(l => l.map(x => x.id === updated.id ? updated : x))
      toast.success('Location updated successfully')
      setEditTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update location')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await parkingService.deleteLocation(deleteTarget.id)
      setLocations(l => l.filter(x => x.id !== deleteTarget.id))
      toast.success('Location deleted')
    } catch {
      toast.error('Failed to delete location')
    } finally {
      setDeleteTarget(null)
    }
  }

  const columns = [
    { key: 'locationName', header: 'Name' },
    { key: 'city',         header: 'City' },
    { key: 'address',      header: 'Address' },
    {
      key: 'totalSlots',
      header: 'Total Slots',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (val) => (
        <Badge variant={val !== false ? 'default' : 'secondary'} className="text-xs">
          {val !== false ? 'Active' : 'Inactive'}
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
            className="gap-1.5 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setDeleteTarget({ id: row.id, name: row.locationName })}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/owner')}
          className="flex items-center gap-1.5 text-sm font-medium mb-3 hover:opacity-75 transition-opacity"
          style={{ color: '#2563EB' }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Manage Locations</h2>
        <p className="text-muted-foreground mt-1">Add and manage your parking locations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add location form */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Add Location</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="locationName">Location Name</Label>
                <Input
                  id="locationName"
                  placeholder="e.g. Central Plaza Parking"
                  value={form.locationName}
                  onChange={set('locationName')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={form.address}
                  onChange={set('address')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City name"
                  value={form.city}
                  onChange={set('city')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="totalSlots">Total Slots</Label>
                <Input
                  id="totalSlots"
                  type="number"
                  min="1"
                  placeholder="Number of slots"
                  value={form.totalSlots}
                  onChange={set('totalSlots')}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  'Add Location'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Locations table */}
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={locations}
            loading={loading}
            searchable
            searchPlaceholder="Search locations…"
            emptyMessage="No locations yet."
            emptyIcon={MapPin}
            pageSize={8}
          />
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-locationName">Location Name</Label>
              <Input
                id="edit-locationName"
                value={editForm.locationName}
                onChange={e => setEditForm(f => ({ ...f, locationName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editForm.city}
                  onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-totalSlots">Total Slots</Label>
                <Input
                  id="edit-totalSlots"
                  type="number"
                  min="1"
                  value={editForm.totalSlots}
                  onChange={e => setEditForm(f => ({ ...f, totalSlots: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="edit-isActive" className="cursor-pointer">Active</Label>
              <input
                id="edit-isActive"
                type="checkbox"
                checked={editForm.isActive}
                onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Location"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
