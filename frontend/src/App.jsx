import { Routes, Route } from 'react-router-dom'

// Layouts
import CustomerLayout from './components/layouts/CustomerLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminSales from './pages/admin/AdminSales'
import AdminHero from './pages/admin/AdminHero'
import AdminInfluencers from './pages/admin/AdminInfluencers'
import AdminUsers from './pages/admin/AdminUsers'

// Customer Pages
import Home from './pages/customer/Home'
import Shop from './pages/customer/Shop'
import ProductDetails from './pages/customer/ProductDetails'
import Login from './pages/customer/Login'
import Register from './pages/customer/Register'
import Profile from './pages/customer/Profile'

import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="sales" element={<AdminSales />} />
        <Route path="hero" element={<AdminHero />} />
        <Route path="influencers" element={<AdminInfluencers />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
