import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard-main.css';

interface HistoryPageProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ sidebarExpanded, setSidebarExpanded }) => {
  return (
    <div className="dashboard-container">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"}>
        <h1>History</h1>
        {/* Add history content here */}
      </main>
    </div>
  );
}

export default HistoryPage;
