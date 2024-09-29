import { useState } from 'react'
import { Button } from './components/ui/button'
import { Toaster } from './components/ui/toaster'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Registration from './pages/Registration'
import Authentication from './pages/Authentication'

function App() {

  return (
    <BrowserRouter>
      <Toaster/>
      <Routes>
        <Route path='/' element ={<Registration/>}></Route>
        <Route path='/auth' element ={<Authentication/>}></Route>
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
