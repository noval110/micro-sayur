import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Home from './pages/Home';
import Katalog from './pages/Katalog';
import About from './pages/About';
import Contact from './pages/Contact';
import HowToBuy from './pages/HowToBuy';
import Returns from './pages/Returns';
import Terms from './pages/Terms';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLayout from './pages/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import Users from './pages/Admin/Users';
import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './pages/UserLayout';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            marginTop: '70px',
          },
        }}
      />
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public / User Routes */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/katalog" element={<Katalog />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-to-buy" element={<HowToBuy />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
