import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import ResetPassword from '@/pages/Auth/ResetPassword'
import Home from './pages/Customer/Home'
import SearchParking from './pages/Customer/SearchParking'
import ReservationPage from './pages/Customer/ReservationPage'
import BookingHistory from './pages/Customer/BookingHistory'
import OwnerDashboard from './pages/ParkingOwner/Dashboard'
import ManageLocations from './pages/ParkingOwner/ManageLocations'
import ManageSlots from './pages/ParkingOwner/ManageSlots'
import OwnerReservations from './pages/ParkingOwner/OwnerReservations'
import OwnerPricingConfig from './pages/ParkingOwner/OwnerPricingConfig'
import GateScannerPage from './pages/ParkingOwner/GateScannerPage'
import AdminDashboard from './pages/Admin/Dashboard'
import ManageUsers from './pages/Admin/ManageUsers'
import ManageOwners from './pages/Admin/ManageOwners'
import AdminLocations from './pages/Admin/AdminLocations'
import AdminBookings from './pages/Admin/AdminBookings'
import AdminPayments from './pages/Admin/AdminPayments'
import AnalyticsDashboard from './pages/Admin/AnalyticsDashboard'
import Profile from './pages/Profile'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={homeFor(user.role)} replace />
}

function homeFor(role) {
  if (role === 'Admin')        return '/admin'
  if (role === 'ParkingOwner') return '/owner'
  return '/'
}

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin routes — wrapped in AppLayout */}
        <Route
          element={
            <PrivateRoute roles={['Admin']}>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/admin"               element={<AdminDashboard />} />
          <Route path="/admin/users"       element={<ManageUsers />} />
          <Route path="/admin/owners"      element={<ManageOwners />} />
          <Route path="/admin/locations"   element={<AdminLocations />} />
          <Route path="/admin/bookings"    element={<AdminBookings />} />
          <Route path="/admin/payments"    element={<AdminPayments />} />
          <Route path="/admin/analytics"   element={<AnalyticsDashboard />} />
        </Route>

        {/* Parking Owner routes — wrapped in AppLayout */}
        <Route
          element={
            <PrivateRoute roles={['ParkingOwner']}>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/owner"                element={<OwnerDashboard />} />
          <Route path="/owner/locations"     element={<ManageLocations />} />
          <Route path="/owner/slots"         element={<ManageSlots />} />
          <Route path="/owner/reservations"  element={<OwnerReservations />} />
          <Route path="/owner/pricing"       element={<OwnerPricingConfig />} />
          <Route path="/owner/gate"          element={<GateScannerPage />} />
        </Route>

        {/* Customer routes — wrapped in AppLayout */}
        <Route
          element={
            <PrivateRoute roles={['Customer']}>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/"                    element={<Home />} />
          <Route path="/search"              element={<SearchParking />} />
          <Route path="/reserve/:slotId"     element={<ReservationPage />} />
          <Route path="/bookings"            element={<BookingHistory />} />
        </Route>

        {/* Profile — all authenticated roles */}
        <Route
          element={
            <PrivateRoute roles={['Admin', 'ParkingOwner', 'Customer']}>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </ThemeProvider>
  )
}
