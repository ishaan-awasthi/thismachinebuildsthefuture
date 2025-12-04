import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TimelinePage from './pages/TimelinePage'
import ChatPage from './pages/ChatPage'
import ManifestoPage from './pages/ManifestoPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/manifesto" element={<ManifestoPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
