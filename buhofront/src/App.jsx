import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomeScreen from './Home/WelcomeScreen.jsx'
import Materias from './Materias/Materias.jsx'
import AdminPanel from './Admin/AdminPanel.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/Materias" element={<Materias />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App