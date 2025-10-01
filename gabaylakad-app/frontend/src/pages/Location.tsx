import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard-main.css';

interface LocationPageProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const LocationPage: React.FC<LocationPageProps> = ({ sidebarExpanded, setSidebarExpanded }) => {
  return (
    <div className="dashboard-container">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"}>
        <h1>Location Tracking</h1>
        {/* Add location tracking content here */}
      </main>
    </div>
  );
}

export default LocationPage;
