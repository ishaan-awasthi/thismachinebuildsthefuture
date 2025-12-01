import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TimelinePage from './pages/TimelinePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
