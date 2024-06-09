import "./index.css";
import DashboardMenuButton from "../DashboardMenuButton";

import Monitors from "../../assets/Images/Icon-monitor-gray.png";
import Incidents from "../../assets/Images/Icon-warning-gray.png";
import SensorsIcon from "../../assets/Images/Icon-signal-gray.png";
import AllInclusiveIcon from "../../assets/Images/Icon-link-gray.png";
import SettingsIcon from "../../assets/Images/Icon-setting-gray.png";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * @component
 * DashboardMenu component displays a menu with icons and corresponding text.
 * Each menu item consists of an icon and a text label.
 *
 * @returns {JSX.Element} The JSX element representing the DashboardMenu component.
 */

function DashboardMenu() {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActiveButton(location.pathname);
  }, [location]);

  const handleClick = (title, path) => {
    setActiveButton(title);
    navigate(path);
  };

  return (
    <div className="dashboard-menu-container">
      {DashboardMenuButton(
        Monitors,
        "Monitors",
        "/monitors",
        activeButton === "/monitors",
        () => handleClick("Monitors", "/monitors")
      )}
      {DashboardMenuButton(
        Incidents,
        "Incidents",
        "/incidents",
        activeButton === "/incidents",
        () => handleClick("Incidents", "/incidents")
      )}
      {DashboardMenuButton(
        SensorsIcon,
        "Status Pages",
        "/status",
        activeButton === "/status",
        () => handleClick("Status Pages", "/status")
      )}
      {DashboardMenuButton(
        AllInclusiveIcon,
        "Integrations",
        "/integrations",
        activeButton === "/integrations",
        () => handleClick("Integrations", "/integrations")
      )}
      {DashboardMenuButton(
        SettingsIcon,
        "Settings",
        "/settings",
        activeButton === "/settings",
        () => handleClick("Settings", "/settings")
      )}
    </div>
  );
}

export default DashboardMenu;
