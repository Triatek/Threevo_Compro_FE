import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  )
}
