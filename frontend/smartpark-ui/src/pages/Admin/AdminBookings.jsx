import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList } from 'lucide-react'
import reservationService from '@/services/reservationService'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

const STATUS_VARIANT = {
  Pending:   'secondary',
  Confirmed: 'default',
  Cancelled: 'destructive',
}

const PAYMENT_VARIANT = {
  Success: 'default',
  Pending: 'secondary',
  Failed:  'destructive',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    reservationService.getAll()
      .then(setBookings)
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    {
      key: 'id',
      header: 'Booking ID',
      render: (val) => <span className="font-mono text-xs">#{val}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (val, row) => (
        <div>
          <p className="font-medium text-sm">{val || '—'}</p>
          <p className="text-xs text-muted-foreground">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'locationName',
      header: 'Location',
      render: (val, row) => (
        <div>
          <p className="text-sm font-medium">{val || '—'}</p>
          <p className="text-xs text-muted-foreground">{row.locationCity}</p>
        </div>
      ),
    },
    {
      key: 'slotNumber',
      header: 'Slot',
      render: (val) => <span className="font-mono text-sm">{val || '—'}</span>,
    },
    {
      key: 'vehicleNumber',
      header: 'Vehicle No.',
      render: (val) => val
        ? <span className="font-mono text-sm">{val}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: 'startTime',
      header: 'Start',
      render: (val) => val
        ? <span className="text-xs">{new Date(val).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
        : '—',
    },
    {
      key: 'endTime',
      header: 'End',
      render: (val) => val
        ? <span className="text-xs">{new Date(val).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
        : '—',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (val) => val != null
        ? <span className="font-medium">₹{Number(val).toLocaleString()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <Badge variant={STATUS_VARIANT[val] || 'secondary'} className="text-xs">{val}</Badge>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (val) => val
        ? <Badge variant={PAYMENT_VARIANT[val] || 'secondary'} className="text-xs">{val}</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
        <p className="text-muted-foreground mt-1">All reservations across all parking locations</p>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        searchable
        searchPlaceholder="Search by customer, location, slot or vehicle…"
        emptyMessage="No bookings found."
        emptyIcon={ClipboardList}
        pageSize={10}
      />
    </div>
  )
}
