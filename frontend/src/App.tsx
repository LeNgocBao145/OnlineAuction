import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router'
import Landing from './pages/landing/landing'
import SignIn from './pages/signIn/signIn'
import SignUp from './pages/signUp/signUp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Common */}
        <Route path="/" element={<Landing />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path='/signUp' element={<SignUp/>}/>

        {/* Catch all Error Page*/}
      </Routes>
    </BrowserRouter>
  )
}
