import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router'
import LandingPage from "./pages/index/landing"
import SignInPage from './pages/signIn/signIn'
import SignUpPage from './pages/signUp/signUp'
import ErrorPage from './pages/error/error'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='*' element={<ErrorPage/>}/>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/signin' element={<SignInPage/>}/>
        <Route path='/signup' element={<SignUpPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
