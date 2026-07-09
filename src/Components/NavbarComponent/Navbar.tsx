import "./Navbar.css";
import { BellOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { Menu } from "lucide-react";
import { useState } from "react";
import type { MenuProps } from "antd";

type NavbarProps = {
  toggleSidebar: () => void;
};

const menuItems: MenuProps["items"] = [
  { key: "1", label: "Profile" },
  { key: "2", label: "Settings" },
  { key: "3", label: "Logout" },
];

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [rotated, setRotated] = useState(false);

  const handleClick = () => {
    toggleSidebar();
    setRotated((prev) => !prev);
  };

  return (
    <div className="navbar">

    <div className="navbar-left">

  <Menu
    size={22}
    className={`menu-btn ${rotated ? "rotate" : ""}`}
    onClick={handleClick}
  />

  {/* ✅ NEW: PAYROLL */}
  <span className="app-name">PAYROLL</span>

  {/* ✅ NEW: Divider */}
  <span className="divider">|</span>

  {/* Existing */}
  <span className="company-name">
    The E2o Technologies Private Limited (26590)
  </span>

  <DownOutlined />
</div>

      {/* RIGHT */}
      <div className="navbar-right">

        <BellOutlined className="nav-icon" />

        <Dropdown menu={{ items: menuItems }}>
          <div className="profile-section">
            <Avatar size={36} icon={<UserOutlined />} />
            <span className="profile-name">
              The E2o Technologies Private Limited
            </span>
            <DownOutlined />
          </div>
        </Dropdown>

      </div>
    </div>
  );
}