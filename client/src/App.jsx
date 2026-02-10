import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Chat from './pages/Chat.jsx'

function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/chat" /> : <Login />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
