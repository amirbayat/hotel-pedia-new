import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { HotelListing } from './pages/HotelListing'
import './App.css'

// Code-split: pulls in @neshan-maps-platform/maplibre-sdk (~1MB), only needed here.
const HotelDetail = lazy(() => import('./pages/HotelDetail').then((m) => ({ default: m.HotelDetail })))

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hotels" element={<HotelListing />} />
      <Route path="/hotels/:slug" element={<Suspense fallback={null}><HotelDetail /></Suspense>} />
    </Routes>
  )
}

export default App
