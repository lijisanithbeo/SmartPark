import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Layout/Navbar'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Home from './pages/Customer/Home'
import SearchParking from './pages/Customer/SearchParking'
import ReservationPage from './pages/Customer/ReservationPage'
import BookingHistory from './pages/Customer/BookingHistory'
import OwnerDashboard from './pages/ParkingOwner/Dashboard'
import ManageLocations from './pages/ParkingOwner/ManageLocations'
import ManageSlots from './pages/ParkingOwner/ManageSlots'
import AdminDashboard from './pages/Admin/Dashboard'
import ManageUsers from './pages/Admin/ManageUsers'
import ManageOwners from './pages/Admin/ManageOwners'

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
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer */}
        <Route path="/" element={<PrivateRoute roles={['Customer']}><Home /></PrivateRoute>} />
        <Route path="/search"   element={<PrivateRoute roles={['Customer']}><SearchParking /></PrivateRoute>} />
        <Route path="/reserve/:slotId" element={<PrivateRoute roles={['Customer']}><ReservationPage /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute roles={['Customer']}><BookingHistory /></PrivateRoute>} />

        {/* Parking Owner */}
        <Route path="/owner"           element={<PrivateRoute roles={['ParkingOwner']}><OwnerDashboard /></PrivateRoute>} />
        <Route path="/owner/locations" element={<PrivateRoute roles={['ParkingOwner']}><ManageLocations /></PrivateRoute>} />
        <Route path="/owner/slots"     element={<PrivateRoute roles={['ParkingOwner']}><ManageSlots /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin"         element={<PrivateRoute roles={['Admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users"   element={<PrivateRoute roles={['Admin']}><ManageUsers /></PrivateRoute>} />
        <Route path="/admin/owners"  element={<PrivateRoute roles={['Admin']}><ManageOwners /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  )
}
