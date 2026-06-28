import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList } from 'lucide-react'
import analyticsService from '@/services/analyticsService'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

const STATUS_VARIANT = {
  Confirmed: 'default',
  Pending:   'secondary',
  Cancelled: 'destructive',
  Completed: 'outline',
}

const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

const fmtCurrency = (n) =>
  typeof n === 'number' ? '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—'

export default function OwnerReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getOwnerReservations()
      .then(setReservations)
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    {
      key: 'reservationID',
      header: '#',
      render: (val) => <span className="font-mono text-xs text-muted-foreground">#{val}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (val, row) => (
        <div>
          <p className="font-medium text-sm">{val}</p>
          <p className="text-xs text-muted-foreground">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'slotNumber',
      header: 'Slot',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-sm">{val}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{row.locationName}</p>
        </div>
      ),
    },
    {
      key: 'bookingTime',
      header: 'Booking Time',
      render: (val) => <span className="text-sm">{fmtDate(val)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (val) => <span className="font-semibold text-sm">{fmtCurrency(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <Badge variant={STATUS_VARIANT[val] ?? 'secondary'} className="text-xs">
          {val}
        </Badge>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (val) => (
        <Badge
          variant={val === 'Success' ? 'default' : val === 'Failed' ? 'destructive' : 'secondary'}
          className="text-xs"
        >
          {val}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">All customer reservations at your locations</p>

      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        searchable
        searchPlaceholder="Search by customer or slot…"
        emptyMessage="No reservations yet."
        emptyIcon={ClipboardList}
        pageSize={15}
      />
    </div>
  )
}
