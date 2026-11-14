import { Routes, Route, Navigate } from 'react-router-dom'
import { AssinaturaGuard, UIProvider } from './core'
import Home from './paginas/Home'
import Catalogo from './paginas/Catalogo'
import './App.css'

function App() {
  return (
    <AssinaturaGuard>
      <UIProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Catalogo" element={<Catalogo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UIProvider>
    </AssinaturaGuard>
  )
}

export default App
