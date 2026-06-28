import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  MapPin, ParkingSquare, ArrowRight, ClipboardList,
  IndianRupee, CalendarDays, TrendingUp, Car, Zap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import analyticsService from '@/services/analyticsService'
import signalrService from '@/services/signalrService'
import { useAuth } from '@/context/AuthContext'

const fmt = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '—'

const fmtCurrency = (n) =>
  typeof n === 'number'
    ? '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '—'

const ACTIONS = [
  {
    icon: MapPin,
    label: 'My Locations',
    description: 'Add and manage your parking locations',
    path: '/owner/locations',
    iconBg: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    border: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  {
    icon: ParkingSquare,
    label: 'My Slots',
    description: 'Configure and monitor parking slots',
    path: '/owner/slots',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  {
    icon: ClipboardList,
    label: 'Reservations',
    description: 'View all customer reservations',
    path: '/owner/reservations',
    iconBg: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
    border: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
]

export default function OwnerDashboard() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const fetchStats = () => {
      analyticsService.getOwnerDashboardStats()
        .then(data => { if (mountedRef.current) { setStats(data); setLoading(false) } })
        .catch(() => { toast.error('Could not load dashboard stats'); setLoading(false) })
    }

    fetchStats()

    signalrService.on('BookingCreated', fetchStats)
    signalrService.on('BookingCancelled', fetchStats)
    signalrService.on('PaymentCompleted', fetchStats)
    signalrService.start().then(() => {
      if (user?.id) signalrService.joinOwnerGroup(user.id)
    })

    return () => {
      mountedRef.current = false
      signalrService.off('BookingCreated', fetchStats)
      signalrService.off('BookingCancelled', fetchStats)
      signalrService.off('PaymentCompleted', fetchStats)
    }
  }, [])

  const kpi = [
    {
      label: 'Total Locations',
      value: fmt(stats?.totalLocations),
      icon: MapPin,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Total Slots',
      value: fmt(stats?.totalSlots),
      icon: ParkingSquare,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Available Slots',
      value: fmt(stats?.availableSlots),
      icon: Car,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Active Reservations',
      value: fmt(stats?.activeReservations),
      icon: Zap,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: "Today's Revenue",
      value: fmtCurrency(stats?.todayRevenue),
      icon: CalendarDays,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950',
    },
    {
      label: 'Monthly Revenue',
      value: fmtCurrency(stats?.monthlyRevenue),
      icon: TrendingUp,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      label: 'Total Revenue',
      value: fmtCurrency(stats?.totalRevenue),
      icon: IndianRupee,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Parking Overview</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpi.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                <p className={`text-xl font-bold tracking-tight ${loading ? 'text-muted-foreground' : ''}`}>
                  {loading ? '…' : value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          {ACTIONS.map(({ icon: Icon, label, description, path, iconBg, border }) => (
            <Card
              key={path}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 border-transparent ${border}`}
              onClick={() => navigate(path)}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
