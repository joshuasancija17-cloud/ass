
import React, { useState, useEffect, useRef } from 'react';
import HeaderDesktop from '../components/headerDesktop';
import Header from '../components/Header';
import '../styles/dashboard-main.css';
import useIsMobile from '../components/useIsMobile';

interface HistoryPageProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ sidebarExpanded, setSidebarExpanded }) => {
  const [profile, setProfile] = useState<any>(null);
  const isMobile = useIsMobile();

  // Example: fetch user profile if needed
  useEffect(() => {
    // Replace with your actual fetch logic
    setProfile({ name: 'User' });
  }, []);

  return (
    <div className="dashboard-container">
  {/* Desktop: HeaderDesktop, Mobile: mobile header inside container */}
  {!isMobile && <HeaderDesktop user={profile} />}
  {isMobile && <Header user={profile} />}
  <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"} style={isMobile ? { paddingTop: 80 } : {}}>
        {/* Add history content here */}
      </main>
    </div>
  );
}

export default HistoryPage;
