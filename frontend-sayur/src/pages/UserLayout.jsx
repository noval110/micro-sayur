import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';

export default function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <BackToTop />
      <Footer />
    </>
  );
}
