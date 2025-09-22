import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer.jsx'
const PageLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
     <Footer/>
    </>
  );
};

export default PageLayout;