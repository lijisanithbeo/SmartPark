import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MapPin, User } from 'lucide-react'
import parkingService from '@/services/parkingService'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function AdminLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading]     = useState(true)
  const [confirm, setConfirm]     = useState(null)
  const [toggling, setToggling]   = useState(false)

  useEffect(() => {
    parkingService.getAllLocationsAdmin()
      .then(setLocations)
      .catch(() => toast.error('Failed to load locations'))
      .finally(() => setLoading(false))
  }, [])

  const requestToggle = (loc) => setConfirm(loc)

  const handleConfirmToggle = async () => {
    if (!confirm) return
    setToggling(true)
    try {
      const updated = await parkingService.updateLocation(confirm.id, {
        locationName: confirm.locationName,
        address:      confirm.address,
        city:         confirm.city,
        totalSlots:   confirm.totalSlots,
        isActive:     !confirm.isActive,
      })
      setLocations(prev => prev.map(l => l.id === updated.id ? updated : l))
      toast.success(`Location ${updated.isActive ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update location status')
    } finally {
      setToggling(false)
      setConfirm(null)
    }
  }

  const columns = [
    {
      key: 'locationName',
      header: 'Location',
      render: (val, row) => (
        <div>
          <p className="font-medium text-sm">{val}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[220px]">{row.address}</p>
        </div>
      ),
    },
    { key: 'city', header: 'City' },
    {
      key: 'ownerName',
      header: 'Owner',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm">{val || '—'}</span>
        </div>
      ),
    },
    {
      key: 'totalSlots',
      header: 'Slots',
      render: (_, row) => (
        <span className="text-sm tabular-nums">
          {row.availableSlots}/{row.totalSlots}
          <span className="text-muted-foreground ml-1 text-xs">avail</span>
        </span>
      ),
    },
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
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Locations</h2>
        <p className="text-muted-foreground mt-1">All parking locations with their assigned owners</p>
      </div>

      <DataTable
        columns={columns}
        data={locations}
        loading={loading}
        searchable
        searchPlaceholder="Search by location, city or owner…"
        emptyMessage="No locations found."
        emptyIcon={MapPin}
        pageSize={15}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.isActive ? 'Deactivate Location' : 'Activate Location'}
        description={`Are you sure you want to ${confirm?.isActive ? 'deactivate' : 'activate'} "${confirm?.locationName}"?`}
        confirmLabel={confirm?.isActive ? 'Deactivate' : 'Activate'}
        variant={confirm?.isActive ? 'destructive' : 'default'}
        onConfirm={handleConfirmToggle}
        loading={toggling}
      />
    </div>
  )
}
