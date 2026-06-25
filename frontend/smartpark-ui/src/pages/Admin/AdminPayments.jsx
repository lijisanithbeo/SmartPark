import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { IndianRupee } from 'lucide-react'
import paymentService from '@/services/paymentService'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

const STATUS_VARIANT = {
  Success: 'default',
  Pending: 'secondary',
  Failed:  'destructive',
}

const METHOD_COLORS = {
  Card: 'text-blue-600 dark:text-blue-400',
  UPI:  'text-violet-600 dark:text-violet-400',
  Cash: 'text-emerald-600 dark:text-emerald-400',
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    paymentService.getAll()
      .then(setPayments)
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    {
      key: 'id',
      header: 'Payment ID',
      render: (val) => <span className="font-mono text-xs">#{val}</span>,
    },
    {
      key: 'reservationID',
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
      key: 'amount',
      header: 'Amount',
      render: (val) => (
        <span className="font-semibold text-sm">₹{Number(val).toLocaleString()}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (val) => (
        <span className={`font-medium text-sm ${METHOD_COLORS[val] || ''}`}>{val}</span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (val) => val
        ? <span className="text-xs">{new Date(val).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
        : '—',
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (val) => (
        <Badge variant={STATUS_VARIANT[val] || 'secondary'} className="text-xs">{val}</Badge>
      ),
    },
    {
      key: 'transactionID',
      header: 'Transaction ID',
      render: (val) => val
        ? <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px] block">{val}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground mt-1">All payment transactions across all bookings</p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        searchable
        searchPlaceholder="Search by customer, method or status…"
        emptyMessage="No payments found."
        emptyIcon={IndianRupee}
        pageSize={10}
      />
    </div>
  )
}
