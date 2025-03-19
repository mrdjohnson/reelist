import { useState } from 'react'
// import './App.css'
import Discover from './components/Discover.tsx'
import Homepage from './components/Homepage.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/discover" element={<Discover beta={false} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
