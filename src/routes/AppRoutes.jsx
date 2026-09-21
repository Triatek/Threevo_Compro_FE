import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { LoadingState } from '../components/ui/states'
import { SiteProvider } from '../context/SiteProvider'
import About from '../pages/About'
import ArticleDetail from '../pages/ArticleDetail'
import Articles from '../pages/Articles'
import Contact from '../pages/Contact'
import Home from '../pages/Home'
import Locations from '../pages/Locations'
import NotFound from '../pages/NotFound'
import Pricing from '../pages/Pricing'
import ServiceDetail from '../pages/ServiceDetail'
import Services from '../pages/Services'
import { adminPaths, paths } from './paths'

/**
 * Panel admin dipisah jadi bundel sendiri: pengunjung situs tidak pernah
 * mengunduhnya, dan sebaliknya.
 */
const AdminRoutes = lazy(() => import('./AdminRoutes'))

export default function AppRoutes() {
  return (
    <Routes>
      {/*
        SiteProvider hanya membungkus halaman publik. Panel admin tidak butuh
        GET /site, jadi tidak perlu ikut menunggunya.
      */}
      <Route
        element={
          <SiteProvider>
            <Layout />
          </SiteProvider>
        }
      >
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.about} element={<About />} />
        <Route path={paths.services} element={<Services />} />
        <Route path={paths.serviceDetail()} element={<ServiceDetail />} />
        <Route path={paths.pricing} element={<Pricing />} />
        <Route path={paths.articles} element={<Articles />} />
        <Route path={paths.articleDetail()} element={<ArticleDetail />} />
        <Route path={paths.locations} element={<Locations />} />
        <Route path={paths.contact} element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path={`${adminPaths.root}/*`}
        element={
          <Suspense fallback={<LoadingState label="Memuat panel..." className="min-h-dvh" />}>
            <AdminRoutes />
          </Suspense>
        }
      />
    </Routes>
  )
}
