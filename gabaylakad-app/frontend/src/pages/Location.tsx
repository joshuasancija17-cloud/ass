
import React, { useState, useEffect } from 'react';
import HeaderDesktop from '../components/headerDesktop';
import '../styles/dashboard-main.css';
import useIsMobile from '../components/useIsMobile';

interface LocationPageProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const LocationPage: React.FC<LocationPageProps> = ({ sidebarExpanded, setSidebarExpanded }) => {
  const [profile, setProfile] = useState<any>(null);
  const isMobile = useIsMobile();

  // Example: fetch user profile if needed
  useEffect(() => {
    // Replace with your actual fetch logic
    setProfile({ name: 'User' });
  }, []);

  return (
    <div className="dashboard-container">
      {/* Desktop: HeaderDesktop, Mobile: no header or mobile header if needed */}
      {!isMobile && <HeaderDesktop user={profile} />}
  <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"} style={isMobile ? { paddingTop: 80 } : {}}>
        {/* Add location tracking content here */}
      </main>
    </div>
  );
}

export default LocationPage;
