import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router'

import Landing from './pages/landing/landing'
import SignIn from './pages/signIn/signIn'
import SignUp from './pages/signUp/signUp'
import SearchPage from './pages/search/search'
import ProductPage from './pages/product/product'
import ProfileSettingsBasicInfo from './pages/profile/settings'
import ProfileMyBids from './pages/profile/myBids'
import ProfileMyReviews from './pages/profile/reviews'
import ProfileFavorites from './pages/profile/favorites'
import ProductSellerPage from './pages/profile/selling/productSeller'
import CreateAuction from './pages/profile/selling/createProdForSell'

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
        <Route path='/profile/settings' element={<ProfileSettingsBasicInfo/>} />
        <Route path='/profile/bids' element={<ProfileMyBids/>} />
        <Route path='/profile/reviews' element={<ProfileMyReviews/>} />
        <Route path='/profile/favorites' element={<ProfileFavorites/>} />

        {/* Seller Page */}
        <Route path='/productSeller' element={<ProductSellerPage/>} />
        <Route path='/createProduct' element={<CreateAuction/>} />

        {/* Catch all Error Page*/}
      </Routes>
    </BrowserRouter>
  )
}
