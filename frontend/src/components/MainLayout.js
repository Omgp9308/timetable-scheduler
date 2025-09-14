import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * The main layout for the application.
 * It now includes state and handlers to manage a collapsible sidebar.
 */
const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      {/* The Header now receives the function to toggle the sidebar */}
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="container-fluid">
        <div className="row">
          {/* The Sidebar receives its current state and the toggle function */}
          <Sidebar isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

          {/* Main content's class will change to fill the space when sidebar is closed */}
          <main className={isSidebarOpen ? "col-md-9 ms-sm-auto col-lg-10 px-md-4" : "col-12 px-md-4"}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

