import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';


const AppRoutes = () => {
    return(
        <Routes>
            <Route path='home' element={<Home />} />
            <Route path='/' element={<Home/>} />
        </Routes>
    )
}
export default AppRoutes