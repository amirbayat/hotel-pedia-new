import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { HotelListing } from './pages/HotelListing'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hotels" element={<HotelListing />} />
    </Routes>
  )
}

export default App
