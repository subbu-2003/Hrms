import React from "react";
import { Button } from "antd";
import "./Profile.css";

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("User Info");

  const tabs = ["User Info", "Organisation Info"];

  const tabRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    width: 0,
    left: 0,
  });

  React.useEffect(() => {
    const index = tabs.indexOf(activeTab);
    const currentTab = tabRefs.current[index];

    if (currentTab) {
      setIndicatorStyle({
        width: currentTab.offsetWidth,
        left: currentTab.offsetLeft,
      });
    }
  }, [activeTab]);

  return (
    <div className="profile-page">
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="company-info">
            <img src="/Images/Logo/logoe2o.webp" alt="company" />
            <div>
              <h3>The E2o Technologies Pvt Ltd</h3>
              <p>Madurai, Tamil Nadu, India</p>
            </div>
          </div>

          <div className="topbar-actions">
            <Button type="primary">Edit Profile</Button>
          </div>
        </div>

        {/* 🔥 NEW SLIDING MENU */}
        <div className="top-tabs">
          {tabs.map((tab, index) => (
            <div
              key={tab}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className={`tab-item ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}

          {/* 🔥 PERFECT INDICATOR */}
          <div
            className="tab-indicator"
            style={{
              width: indicatorStyle.width,
              transform: `translateX(${indicatorStyle.left}px)`,
            }}
          />
        </div>

        {/* TAB CONTENT */}
        <div className="tab-content">
          <div className="info-card">
            {activeTab === "User Info" && (
              <>
                <h3>User Info</h3>

                <div className="info-grid">
                  <div>
                    <label>Name</label>
                    <p>Hema</p>
                  </div>

                  <div>
                    <label>Email</label>
                    <p>hema@gmail.com</p>
                  </div>

                  <div>
                    <label>Phone</label>
                    <p>9876543210</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "Organisation Info" && (
              <>
                <h3>Organisation Info</h3>

                <div className="info-grid">
                  <div>
                    <label>Company</label>
                    <p>E2o Technologies</p>
                  </div>

                  <div>
                    <label>Location</label>
                    <p>Madurai</p>
                  </div>

                  <div>
                    <label>Department</label>
                    <p>IT</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
