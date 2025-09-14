import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * The main layout for the application.
 * It now includes state and handlers to manage a collapsible sidebar.
 */
const MainLayout = () => {
  // State to manage whether the sidebar is visible or not. Default to true (visible).
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Function to toggle the sidebar's visibility state
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      {/* The Header receives the function so its button can trigger the change */}
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="container-fluid">
        <div className="row">
          {/* The Sidebar receives its current state and the toggle function */}
          <Sidebar isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

          {/* The main content area's class will now change based on the sidebar's state.
            This allows our CSS in the next step to smoothly adjust its position.
          */}
          <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

