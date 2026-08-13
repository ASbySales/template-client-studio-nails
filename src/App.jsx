import { Routes, Route } from 'react-router-dom'
import Home from './paginas/Home'
import Catalogo from './paginas/Catalogo'
import Login from './paginas/Login'
import Admin from './paginas/Admin'
import EditarCard from './paginas/EditarCard'
import ExcluirCard from './paginas/ExcluirCard'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/Catalogo" element={<Catalogo/>}/>
      <Route path="/Login" element={<Login/>}/>
      <Route path="/Admin" element={<Admin/>}/>
      <Route path="/admin/EditarCard/:id" element={<EditarCard/>}/>
      <Route path="/admin/ExcluirCard/:id" element={<ExcluirCard/>}/>
    </Routes>
  )
}

export default App
