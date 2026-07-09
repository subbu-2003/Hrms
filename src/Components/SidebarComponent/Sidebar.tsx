import "./Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  DollarSign,
  File,
  BarChart2,
  UserCog,
  ChevronRight,
  ChevronDown,
  Phone,
  MessageCircle,
} from "lucide-react";
import React from "react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  pinned: boolean;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
};

type ItemProps = {
  to?: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  collapsed: boolean;
  children?: { label: string; to: string }[];
};

function SidebarItem({
  to,
  icon,
  label,
  badge,
  collapsed,
  children,
}: ItemProps) {
  const location = useLocation();

  const isChildActive =
    children?.some((child) =>
      location.pathname.includes(child.to)
    ) || false;

  const [open, setOpen] = React.useState(isChildActive);

  if (children) {
    return (
      <div>
        <div
          className={`sidebar-item ${isChildActive ? "active" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <div className="item-left">
            {icon}
            {!collapsed && <span>{label}</span>}
          </div>

          {!collapsed && (
            <ChevronDown
              size={16}
              className={`arrow ${open ? "rotate" : ""}`}
            />
          )}
        </div>

        {!collapsed && open && (
          <div className="dropdown">
            {children.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `dropdown-item ${
                    isActive ? "dropdown-active" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to || "#"}
      className={({ isActive }) =>
        `sidebar-item ${isActive ? "active" : ""}`
      }
    >
      <div className="item-left">
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>

      {!collapsed && (
        <div className="item-right">
          {badge && <span className="badge">{badge}</span>}
          <ChevronRight size={16} />
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  pinned,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const location = useLocation();

  const isMobile = window.innerWidth <= 768;

  /* ✅ Auto close on route change (mobile) */
  React.useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (!pinned && !isMobile) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!pinned && !isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <>
      {/* Overlay */}
      {mobileOpen && isMobile && (
        <div
          className="overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`Sidebar 
          ${collapsed && !isMobile ? "collapsed" : ""} 
          ${mobileOpen ? "mobile-open" : ""}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-menu">

          <SidebarItem
            to="/"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            icon={<Users size={18} />}
            label="Employees"
            collapsed={isMobile ? false : collapsed}
            children={[
              { label: "Employees", to: "/employee" },
              { label: "Departments", to: "/department" },
              { label: "Designations", to: "/designation" },
              { label: "Attendance Permission", to: "/attendancepermission" },
              { label: "Manage Branch", to: "/managebranch" },
            ]}
          />

          <SidebarItem
            to="/shifts"
            icon={<Users size={18} />}
            label="Manage Shifts"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            to="/leaves"
            icon={<CalendarDays size={18} />}
            label="Leaves & Holidays"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            to="/approvals"
            icon={<FileText size={18} />}
            label="Approval Requests"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            to="/payroll"
            icon={<DollarSign size={18} />}
            label="Payroll"
            badge="New"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            to="/loan"
            icon={<File size={18} />}
            label="Loan & Arrears"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            to="/reports"
            icon={<BarChart2 size={18} />}
            label="Reports"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            to="/dynamic-reports"
            icon={<BarChart2 size={18} />}
            label="Dynamic Reports"
            collapsed={isMobile ? false : collapsed}
          />

          <SidebarItem
            to="/users"
            icon={<UserCog size={18} />}
            label="User Management"
            collapsed={isMobile ? false : collapsed}
          />
        </div>

        {/* Footer */}
        {(!collapsed || isMobile) && (
          <div className="sidebar-footer">
            <div className="footer-item">
              <Phone size={18} className="footer-icon" />
              <p>
                Call Us On: <span className="link">07969223344</span>
              </p>
            </div>

            <div className="footer-item">
              <MessageCircle
                size={18}
                className="footer-icon whatsapp-icon"
              />
              <p>
                Contact on <span className="link">Whatsapp</span>
                <span className="external">↗</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}