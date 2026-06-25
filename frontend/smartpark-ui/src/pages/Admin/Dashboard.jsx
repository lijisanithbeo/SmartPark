import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ParkingSquare,
  CheckCircle2,
  Car,
  CalendarCheck,
  IndianRupee,
  Users,
  Building2,
  BarChart3,
  BookOpen,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'
import analyticsService from '@/services/analyticsService'
import signalrService from '@/services/signalrService'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const fetchStats = () => {
      analyticsService.getDashboardStats()
        .then(data => { if (mountedRef.current) { setStats(data); setLoading(false) } })
        .catch(() => { toast.error('Failed to load dashboard stats'); setLoading(false) })
    }

    fetchStats()

    signalrService.on('BookingCreated', fetchStats)
    signalrService.on('BookingCancelled', fetchStats)
    signalrService.on('PaymentCompleted', fetchStats)
    signalrService.start().then(() => signalrService.joinAdminGroup())

    return () => {
      mountedRef.current = false
      signalrService.off('BookingCreated', fetchStats)
      signalrService.off('BookingCancelled', fetchStats)
      signalrService.off('PaymentCompleted', fetchStats)
    }
  }, [])

  const kpiCards = [
    {
      title: 'Total Slots',
      value: stats?.totalSlots ?? '—',
      icon: ParkingSquare,
      color: 'blue',
      subtitle: stats ? `${stats.totalLocations} locations` : undefined,
    },
    {
      title: 'Available Slots',
      value: stats?.availableSlots ?? '—',
      icon: CheckCircle2,
      color: 'green',
      subtitle: 'Ready to book',
    },
    {
      title: 'Occupied Slots',
      value: stats?.occupiedSlots ?? '—',
      icon: Car,
      color: 'orange',
      subtitle: stats ? `${stats.activeReservations} active` : undefined,
    },
    {
      title: "Today's Bookings",
      value: stats?.todayReservations ?? '—',
      icon: CalendarCheck,
      color: 'purple',
      subtitle: 'Reservations today',
    },
    {
      title: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue?.toLocaleString()}` : '—',
      icon: IndianRupee,
      color: 'teal',
      subtitle: stats ? `₹${stats.todayRevenue?.toLocaleString()} today` : undefined,
    },
    {
      title: 'Total Bookings',
      value: stats?.totalReservations ?? '—',
      icon: BookOpen,
      color: 'blue',
      subtitle: stats ? `${stats.todayReservations} today` : undefined,
    },
    {
      title: 'Active Bookings',
      value: stats?.activeReservations ?? '—',
      icon: CalendarCheck,
      color: 'green',
      subtitle: 'Confirmed reservations',
    },
    {
      title: 'Paid Transactions',
      value: stats?.totalPayments ?? '—',
      icon: CreditCard,
      color: 'purple',
      subtitle: 'Successful payments',
    },
  ]

  const quickActions = [
    {
      icon: Users,
      label: 'Manage Users',
      description: 'View and manage customer accounts',
      path: '/admin/users',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      icon: Building2,
      label: 'Manage Owners',
      description: 'View and manage parking owners',
      path: '/admin/owners',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'Booking and revenue insights',
      path: '/admin/analytics',
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your parking network</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            subtitle={kpi.subtitle}
            loading={loading}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.path}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
