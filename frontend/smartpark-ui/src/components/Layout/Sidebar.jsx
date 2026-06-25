import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  MapPin,
  ParkingSquare,
  ClipboardList,
  Home,
  Search,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  IndianRupee,
  Tag,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = {
  Admin: [
    { icon: LayoutDashboard, label: 'Dashboard',     to: '/admin' },
    { icon: Users,           label: 'Manage Users',  to: '/admin/users' },
    { icon: Building2,       label: 'Manage Owners', to: '/admin/owners' },
    { icon: MapPin,          label: 'Locations',     to: '/admin/locations' },
    { icon: CalendarCheck,   label: 'Bookings',      to: '/admin/bookings' },
    { icon: IndianRupee,     label: 'Payments',      to: '/admin/payments' },
    { icon: BarChart3,       label: 'Analytics',     to: '/admin/analytics' },
  ],
  ParkingOwner: [
    { icon: LayoutDashboard, label: 'Dashboard',    to: '/owner' },
    { icon: MapPin,          label: 'Locations',    to: '/owner/locations' },
    { icon: ParkingSquare,   label: 'Slots',        to: '/owner/slots' },
    { icon: ClipboardList,   label: 'Reservations', to: '/owner/reservations' },
    { icon: Tag,             label: 'Pricing',      to: '/owner/pricing' },
  ],
  Customer: [
    { icon: Home,     label: 'Home',        to: '/' },
    { icon: Search,   label: 'Find Parking', to: '/search' },
    { icon: BookOpen, label: 'My Bookings',  to: '/bookings' },
  ],
}

export default function Sidebar({ collapsed, onToggle, role }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV_ITEMS[role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
            P
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm truncate">SmartPark</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {items.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/admin' || to === '/owner'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary rounded-r-none'
                  : 'text-muted-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 px-2 pb-3 pt-1 border-t border-border mt-auto">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium',
            'text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
