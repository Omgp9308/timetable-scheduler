import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * The main layout for the entire application.
 * It renders the persistent Header and Sidebar, and then renders the 
 * current page's content via the <Outlet /> component.
 */
const MainLayout = () => {
  return (
    <>
      <Header />
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar Column */}
          <div className="col-md-3 col-lg-2 p-0">
            <Sidebar />
          </div>

          {/* Main Content Column */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="pt-3 pb-2 mb-3">
              {/* The Outlet will render the matched child route component */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;

