import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard-main.css';

interface SensorPageProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const SensorPage: React.FC<SensorPageProps> = ({ sidebarExpanded, setSidebarExpanded }) => {
  return (
    <div className="dashboard-container">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"}>
        <h1>Sensor Data</h1>
        {/* Add sensor data content here */}
      </main>
    </div>
  );
}

export default SensorPage;
