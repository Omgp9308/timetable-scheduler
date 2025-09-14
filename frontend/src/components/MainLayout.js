import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * The main layout for the application.
 * It provides the persistent sidebar and a main content area
 * that now contains both the header and the page content.
 */
const MainLayout = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* --- Sidebar Column --- */}
        {/* This column stays fixed on the left side of the screen. */}
        <div className="col-md-3 col-lg-2 p-0">
          <Sidebar />
        </div>

        {/* --- Main Content Column --- */}
        {/* This column now contains BOTH the header and the page's content.
            The Bootstrap grid classes correctly position it to the right of the sidebar. */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

