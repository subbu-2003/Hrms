import "./Layout.css";
import Sidebar from "../SidebarComponent/Sidebar";
import Navbar from "../NavbarComponent/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  // Hide Navbar & Sidebar on login page
  const hideLayout = location.pathname === "/login";

  const toggleSidebar = () => {
    // Mobile behavior
    if (window.innerWidth <= 768) {
      setMobileOpen((prev) => !prev);
      return;
    }

    // Desktop behavior
    setPinned((prev) => {
      const newPinned = !prev;
      setCollapsed(!newPinned);
      return newPinned;
    });
  };

  return (
    <div className="layout">

      {/* Show Navbar only if not login */}
      {!hideLayout && (
        <Navbar toggleSidebar={toggleSidebar} />
      )}

      <div className="body">

        {/* Show Sidebar only if not login */}
        {!hideLayout && (
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            pinned={pinned}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        )}

        <div className="content">
          <Outlet />
        </div>

      </div>
    </div>
  );
}