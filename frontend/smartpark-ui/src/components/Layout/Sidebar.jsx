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
  ScanLine,
  Car,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

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
    { icon: ScanLine,        label: 'Gate Scanner', to: '/owner/gate' },
  ],
  Customer: [
    { icon: Home,     label: 'Home',         to: '/' },
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
        'h-full flex flex-col transition-all duration-300 ease-in-out overflow-hidden bg-[#1B3A6B]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]">
            <Car className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm truncate text-white">SmartPark</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/65 hover:bg-white/10 hover:text-white transition-colors"
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
                isActive
                  ? 'bg-white/15 text-white hover:bg-white/20'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 px-2 pb-3 pt-1 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
