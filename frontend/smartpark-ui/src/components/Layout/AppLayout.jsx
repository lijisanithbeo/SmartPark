import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ChatWidget from '@/components/Chat/ChatWidget'

const ROUTE_TITLES = {
  '/admin':            'Dashboard',
  '/admin/users':      'Manage Users',
  '/admin/owners':     'Manage Owners',
  '/admin/analytics':  'Analytics',
  '/owner':            'Dashboard',
  '/owner/locations':  'Locations',
  '/owner/slots':         'Parking Slots',
  '/owner/reservations':  'Reservations',
  '/owner/pricing':       'Pricing Configuration',
  '/owner/gate':          'Gate Scanner',
  '/':                 'Find Parking',
  '/search':           'Search Parking',
  '/bookings':         'My Bookings',
  '/profile':          'My Profile',
}

// Dynamic route title helper — differentiates by pathname and query params
function getRouteTitle(pathname, search) {
  if (pathname.startsWith('/reserve/')) return 'Reserve a Slot'
  if (pathname === '/search') {
    const params = new URLSearchParams(search)
    return params.get('locationId') ? 'Select a Slot' : 'Find a Location'
  }
  return ROUTE_TITLES[pathname] || 'SmartPark'
}

export default function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const title = getRouteTitle(location.pathname, location.search)
  const role = user?.role || 'Customer'

  const toggleDesktopSidebar = () => setSidebarCollapsed(c => !c)
  const toggleMobileSidebar = () => setMobileSidebarOpen(o => !o)
  const closeMobileSidebar = () => setMobileSidebarOpen(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleDesktopSidebar}
          role={role}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileSidebar}
          />
          {/* Sidebar panel */}
          <div className="relative h-full">
            <Sidebar
              collapsed={false}
              onToggle={closeMobileSidebar}
              role={role}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar
          onMenuToggle={toggleMobileSidebar}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900/60 dark:to-indigo-950/20">
          <Outlet />
        </main>
      </div>

      <ChatWidget />
    </div>
  )
}
