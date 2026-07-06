import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ChatWidget from '@/components/Chat/ChatWidget'

const ROUTE_TITLES = {
  '/admin':              'Dashboard',
  '/admin/users':        'Manage Users',
  '/admin/owners':       'Manage Owners',
  '/admin/locations':    'Locations',
  '/admin/bookings':     'Bookings',
  '/admin/payments':     'Payments',
  '/admin/analytics':    'Analytics',
  '/owner':              'Dashboard',
  '/owner/locations':    'Locations',
  '/owner/slots':        'Parking Slots',
  '/owner/reservations': 'Reservations',
  '/owner/pricing':      'Pricing Configuration',
  '/owner/gate':         'Gate Scanner',
  '/':                   'Find Parking',
  '/search':             'Search Parking',
  '/bookings':           'My Bookings',
  '/profile':            'My Profile',
}

const ROUTE_SUBTITLES = {
  '/admin':              'Overview of your parking network',
  '/admin/users':        'Customer accounts registered on the platform',
  '/admin/owners':       'Parking owner accounts and their status',
  '/admin/locations':    'All parking locations with assigned owners',
  '/admin/bookings':     'All reservations across all parking locations',
  '/admin/payments':     'All payment transactions across all bookings',
  '/admin/analytics':    'Booking and revenue insights',
  '/owner':              'Your parking operations at a glance',
  '/owner/locations':    'Manage your parking locations',
  '/owner/slots':        'Manage individual parking slots',
  '/owner/reservations': 'Customer reservations at your locations',
  '/owner/pricing':      'Configure hourly and daily parking rates',
  '/owner/gate':         'Scan QR codes for vehicle check-in and check-out',
  '/':                   'Find and book a parking slot near you',
  '/search':             'Browse available parking locations',
  '/bookings':           'Your parking reservation history',
  '/profile':            'Your account details and preferences',
}

function getRouteInfo(pathname, search) {
  if (pathname.startsWith('/reserve/')) return { title: 'Reserve a Slot', subtitle: 'Choose your slot and confirm booking' }
  if (pathname === '/search') {
    const params = new URLSearchParams(search)
    if (params.get('locationId')) return { title: 'Select a Slot', subtitle: 'Pick an available slot at this location' }
    return { title: 'Find a Location', subtitle: 'Search for parking near you' }
  }
  return {
    title: ROUTE_TITLES[pathname] || 'SmartPark',
    subtitle: ROUTE_SUBTITLES[pathname] || '',
  }
}

export default function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const { title, subtitle } = getRouteInfo(location.pathname, location.search)
  const role = user?.role || 'Customer'

  const toggleDesktopSidebar = () => setSidebarCollapsed(c => !c)
  const toggleMobileSidebar = () => setMobileSidebarOpen(o => !o)
  const closeMobileSidebar = () => setMobileSidebarOpen(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFF]">
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileSidebar}
          />
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
          subtitle={subtitle}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFF] dark:bg-slate-950">
          <Outlet />
        </main>
      </div>

      <ChatWidget />
    </div>
  )
}
