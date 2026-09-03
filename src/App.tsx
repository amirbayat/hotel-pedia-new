import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { BookingConfirmPay } from './pages/BookingConfirmPay'
import { BookingPassengers } from './pages/BookingPassengers'
import { BookingResult } from './pages/BookingResult'
import { Home } from './pages/Home'
import { HotelListing } from './pages/HotelListing'
import { PaymentGateway } from './pages/PaymentGateway'
import './App.css'

// Code-split: pulls in @neshan-maps-platform/maplibre-sdk (~1MB), only needed here.
const HotelDetail = lazy(() => import('./pages/HotelDetail').then((m) => ({ default: m.HotelDetail })))

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hotels" element={<HotelListing />} />
      <Route path="/hotels/:slug" element={<Suspense fallback={null}><HotelDetail /></Suspense>} />
      <Route path="/hotels/:slug/book/passengers" element={<BookingPassengers />} />
      <Route path="/hotels/:slug/book/confirm" element={<BookingConfirmPay />} />
      <Route path="/hotels/:slug/book/result" element={<BookingResult />} />
      <Route path="/payment/gateway" element={<PaymentGateway />} />
    </Routes>
  )
}

export default App
