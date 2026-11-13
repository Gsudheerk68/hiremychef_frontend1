import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Landing from './pages/public/Landing'
import Login from './pages/auth/Login'
import About from './pages/public/About'
import HowItWorks from './pages/public/HowItWorks'
import FAQ from './pages/public/FAQ'
import Contact from './pages/public/Contact'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Explore from './pages/public/Explore'
import ChefDetails from './pages/public/ChefDetails'
import Skeleton from './components/common/Skeleton'
import Messages from './pages/shared/Messages'
import Account from './pages/shared/Account'

// Dashboards are code-split so the public site stays light (admin pages pull in the charting library).
const CustomerOverview = lazy(() => import('./pages/customer/Overview'))
const CustomerBookings = lazy(() => import('./pages/customer/Bookings'))
const BookChef = lazy(() => import('./pages/customer/BookChef'))
const Favorites = lazy(() => import('./pages/customer/Favorites'))
const AIAssistant = lazy(() => import('./pages/customer/AIAssistant'))
const ChefOverview = lazy(() => import('./pages/chef/Overview'))
const ChefRequests = lazy(() => import('./pages/chef/Requests'))
const Availability = lazy(() => import('./pages/chef/Availability'))
const ChefProfile = lazy(() => import('./pages/chef/Profile'))
const Earnings = lazy(() => import('./pages/chef/Earnings'))
const ChefReviews = lazy(() => import('./pages/chef/Reviews'))
const AdminOverview = lazy(() => import('./pages/admin/Overview'))
const AdminChefs = lazy(() => import('./pages/admin/Chefs'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminBookings = lazy(() => import('./pages/admin/Bookings'))

export default function App() {
  return <Suspense fallback={<div className="container-x section"><Skeleton className="h-64" /></div>}><Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Landing />} />
      <Route path="/chefs" element={<Explore />} />
      <Route path="/chefs/:id" element={<ChefDetails />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Route>

    <Route element={<ProtectedRoute role="customer" />}><Route path="/customer" element={<DashboardLayout />}>
      <Route index element={<CustomerOverview />} />
      <Route path="bookings" element={<CustomerBookings />} />
      <Route path="book/:chefId" element={<BookChef />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="messages" element={<Messages />} />
      <Route path="ai" element={<AIAssistant />} />
      <Route path="account" element={<Account />} />
      <Route path="*" element={<Navigate to="/customer" replace />} /></Route></Route>

    <Route element={<ProtectedRoute role="chef" />}><Route path="/chef" element={<DashboardLayout />}>
      <Route index element={<ChefOverview />} />
      <Route path="bookings" element={<ChefRequests />} />
      <Route path="availability" element={<Availability />} />
      <Route path="profile" element={<ChefProfile />} />
      <Route path="earnings" element={<Earnings />} />
      <Route path="reviews" element={<ChefReviews />} />
      <Route path="messages" element={<Messages />} />
      <Route path="*" element={<Navigate to="/chef" replace />} /></Route></Route>

    <Route element={<ProtectedRoute role="admin" />}><Route path="/admin" element={<DashboardLayout />}>
      <Route index element={<AdminOverview />} />
      <Route path="chefs" element={<AdminChefs />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="*" element={<Navigate to="/admin" replace />} /></Route></Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
}
