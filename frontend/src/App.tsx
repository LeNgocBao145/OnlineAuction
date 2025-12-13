import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router'
import Landing from './pages/landing/landing'
import SignIn from './pages/signIn/signIn'
import SignUp from './pages/signUp/signUp'
import SearchPage from './pages/search/search'
import ProductPage from './pages/product/product'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Common */}
        <Route path="/" element={<Landing />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path='/signUp' element={<SignUp/>}/>
        <Route path='/search' element={<SearchPage/>}/>
        <Route path='/product/:id' element={<ProductPage/>}/>

        {/* Catch all Error Page*/}
      </Routes>
    </BrowserRouter>
  )
}
