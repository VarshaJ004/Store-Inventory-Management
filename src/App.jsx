import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import StockIn from './pages/StockIn'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     
     <StockIn/>
     
    </>
  )
}

export default App
