import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Pencil, ParkingSquare, Trash2 } from 'lucide-react'
import parkingService from '@/services/parkingService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'

const STATUS_CARD_STYLES = {
  Available:   'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  Reserved:    'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
  Maintenance: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
}

const STATUS_BADGE_VARIANT = {
  Available:   'default',
  Reserved:    'secondary',
  Maintenance: 'destructive',
}

export default function ManageSlots() {
  const [locations, setLocations] = useState([])
  const [slots, setSlots] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ slotNumber: '', floorNumber: '', slotType: 'Car' })
  const [error, setError] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ slotNumber: '', floorNumber: '', slotType: 'Car', status: 'Available' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    parkingService.getMyLocations()
      .then(setLocations)
      .catch(() => toast.error('Failed to load locations'))
  }, [])

  const selectedLocationData = locations.find(l => String(l.id) === selectedLocation)
  const atCapacity = selectedLocationData && slots.length >= selectedLocationData.totalSlots

  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId)
    setSlots([])
    if (locationId) {
      parkingService.getSlotsByLocation(locationId)
        .then(setSlots)
        .catch(() => toast.error('Failed to load slots'))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const s = await parkingService.createSlot({
        ...form,
        locationID: parseInt(selectedLocation),
        floorNumber: parseInt(form.floorNumber),
      })
      setSlots(sl => [...sl, s])
      setForm(f => ({ ...f, slotNumber: '', floorNumber: '' }))
      toast.success('Slot added successfully')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create slot'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (slot) => {
    setEditTarget(slot)
    setEditForm({
      slotNumber:  slot.slotNumber,
      floorNumber: String(slot.floorNumber),
      slotType:    slot.slotType,
      status:      slot.status,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await parkingService.updateSlot(editTarget.id, {
        slotNumber:  editForm.slotNumber,
        floorNumber: parseInt(editForm.floorNumber),
        slotType:    editForm.slotType,
        status:      editForm.status,
      })
      setSlots(sl => sl.map(x => x.id === updated.id ? updated : x))
      toast.success('Slot updated successfully')
      setEditTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update slot')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await parkingService.deleteSlot(deleteTarget.id)
      setSlots(sl => sl.filter(x => x.id !== deleteTarget.id))
      toast.success('Slot deleted')
    } catch {
      toast.error('Failed to delete slot')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Slots</h2>
        <p className="text-muted-foreground mt-1">Configure and monitor parking slots</p>
      </div>

      {/* Location selector */}
      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="location-select">Select Location</Label>
        <Select value={selectedLocation} onValueChange={handleLocationChange}>
          <SelectTrigger id="location-select">
            <SelectValue placeholder="Choose a location…" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(l => (
              <SelectItem key={l.id} value={String(l.id)}>
                {l.locationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLocation && (
        <>
          {/* Add slot form */}
          <Card className={`max-w-2xl ${atCapacity ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Add Slot</CardTitle>
                {selectedLocationData && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    atCapacity
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {slots.length} / {selectedLocationData.totalSlots} slots
                  </span>
                )}
              </div>
              {atCapacity && (
                <p className="text-xs text-destructive mt-1">
                  Maximum capacity reached. Delete a slot to add a new one.
                </p>
              )}
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-3 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1.5 flex-1 min-w-[140px]">
                  <Label htmlFor="slotNumber">Slot Number</Label>
                  <Input
                    id="slotNumber"
                    placeholder="e.g. A001"
                    value={form.slotNumber}
                    onChange={e => setForm({ ...form, slotNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-[100px]">
                  <Label htmlFor="floorNumber">Floor</Label>
                  <Input
                    id="floorNumber"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.floorNumber}
                    onChange={e => setForm({ ...form, floorNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-[120px]">
                  <Label htmlFor="slotType">Type</Label>
                  <Select
                    value={form.slotType}
                    onValueChange={(val) => setForm({ ...form, slotType: val })}
                  >
                    <SelectTrigger id="slotType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Car">Car</SelectItem>
                      <SelectItem value="Bike">Bike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={submitting || atCapacity} className="shrink-0">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    'Add Slot'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Slot grid */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              {slots.length} / {selectedLocationData?.totalSlots ?? '?'} Slot{slots.length !== 1 ? 's' : ''}
            </h3>
            {slots.length === 0 ? (
              <EmptyState
                icon={ParkingSquare}
                title="No slots yet"
                description="Add your first slot using the form above."
                className="py-8 border rounded-lg"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {slots.map(s => (
                  <Card
                    key={s.id}
                    className={`border-2 ${STATUS_CARD_STYLES[s.status] || ''}`}
                  >
                    <CardContent className="p-3 space-y-1">
                      <p className="font-bold text-sm">{s.slotNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Floor {s.floorNumber} · {s.slotType}
                      </p>
                      <Badge
                        variant={STATUS_BADGE_VARIANT[s.status] || 'secondary'}
                        className="text-xs"
                      >
                        {s.status}
                      </Badge>
                      <div className="flex gap-1 pt-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="flex-1 flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-background/60 hover:text-foreground transition-colors"
                          title="Edit slot"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: s.id, label: s.slotNumber })}
                          className="flex-1 flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete slot"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-slotNumber">Slot Number</Label>
                <Input
                  id="edit-slotNumber"
                  value={editForm.slotNumber}
                  onChange={e => setEditForm(f => ({ ...f, slotNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-floorNumber">Floor</Label>
                <Input
                  id="edit-floorNumber"
                  type="number"
                  min="0"
                  value={editForm.floorNumber}
                  onChange={e => setEditForm(f => ({ ...f, floorNumber: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={editForm.slotType} onValueChange={val => setEditForm(f => ({ ...f, slotType: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={val => setEditForm(f => ({ ...f, status: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Slot"
        description={`Are you sure you want to delete slot "${deleteTarget?.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
