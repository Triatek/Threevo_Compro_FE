import { Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import RequireAuth from '../components/admin/RequireAuth'
import { AuthProvider } from '../context/AuthProvider'
import { ToastProvider } from '../context/ToastProvider'
import Account from '../pages/admin/Account'
import AdminNotFound from '../pages/admin/AdminNotFound'
import Articles from '../pages/admin/Articles'
import AuditLogs from '../pages/admin/AuditLogs'
import Banners from '../pages/admin/Banners'
import Categories from '../pages/admin/Categories'
import Clients from '../pages/admin/Clients'
import Dashboard from '../pages/admin/Dashboard'
import Leads from '../pages/admin/Leads'
import Locations from '../pages/admin/Locations'
import Login from '../pages/admin/Login'
import Media from '../pages/admin/Media'
import Services from '../pages/admin/Services'
import Settings from '../pages/admin/Settings'
import Testimonials from '../pages/admin/Testimonials'
import Users from '../pages/admin/Users'

/**
 * Akar panel admin, dimuat terpisah dari situs publik (lihat AppRoutes).
 *
 * Jalurnya relatif terhadap `/admin` — alamat absolutnya ada di `adminPaths`
 * dan hanya dipakai untuk menautkan, bukan mendefinisikan rute.
 */
export default function AdminRoutes() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="account" element={<Account />} />

              <Route path="banners" element={<Banners />} />
              <Route path="services" element={<Services />} />
              <Route path="locations" element={<Locations />} />
              <Route path="categories" element={<Categories />} />
              <Route path="articles" element={<Articles />} />
              <Route path="media" element={<Media />} />
              <Route path="clients" element={<Clients />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="leads" element={<Leads />} />

              {/*
                Hanya Super Admin. Backend menolaknya lagi di sisi sana:
                /admin/settings, /admin/users, dan /admin/audit-logs memasang
                requireRole sendiri.
              */}
              <Route element={<RequireAuth roles={['SUPER_ADMIN']} />}>
                <Route path="settings" element={<Settings />} />
                <Route path="users" element={<Users />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>

              <Route path="*" element={<AdminNotFound />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
