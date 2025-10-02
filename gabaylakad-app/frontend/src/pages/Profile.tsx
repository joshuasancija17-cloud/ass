import React, { useEffect, useState, useRef } from 'react';
import '../styles/dashboard-main.css';
import { HeaderDesktop } from '../components/headerDesktop';

const navTabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
  { key: 'profile', label: 'My Profile', icon: 'fas fa-user' },
  { key: 'history', label: 'History', icon: 'fas fa-history' },
  { key: 'location', label: 'Location Tracking', icon: 'fas fa-map-marker-alt' },
  { key: 'sensor', label: 'Sensor Data', icon: 'fas fa-microchip' },
];

// Custom hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 430);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 430);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}


interface ProfilePageProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ sidebarExpanded, setSidebarExpanded }) => {

  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [successMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const isMobile = useIsMobile();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuBtnRef = useRef<HTMLButtonElement | null>(null);
  const userMenuDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click (mobile only)
  useEffect(() => {
    if (!userMenuOpen || !isMobile) return;
    function handleClick(e: MouseEvent) {
      if (
        userMenuDropdownRef.current &&
        !userMenuDropdownRef.current.contains(e.target as Node) &&
        userMenuBtnRef.current &&
        !userMenuBtnRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen, isMobile]);

  // ...fetchProfile and other logic here...

  return (
    <div className="dashboard-container">
      {/* Desktop: HeaderDesktop, Mobile: mobile header */}
      {!isMobile && <HeaderDesktop user={profile} />}
      {isMobile && (
        <div className="dashboard-header" style={{ width: '100%', margin: 0, padding: '0.7rem 0.7rem', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'hidden', position: 'fixed', top: 0, left: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          {/* ...mobile header code here (avatar, dropdown, etc.)... */}
        </div>
      )}
  <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"} style={isMobile ? { paddingTop: 80 } : {}}>
        {/* Responsive Profile Form */}
        <div className={isMobile ? "profile-mobile-wrapper" : "max-w-4xl mx-auto"} style={isMobile ? { width: '100vw', margin: 0, padding: 0, boxSizing: 'border-box', background: '#fff', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(44,62,80,0.10)', marginTop: '1.2rem' } : {}}>
          {/* ...existing profile form code... */}
        </div>
        {/* Mobile-only responsive styles */}
        {isMobile && (
          <style>{`
            .profile-mobile-wrapper {
              max-width: 100vw !important;
              border-radius: 1.5rem !important;
              box-shadow: 0 4px 24px rgba(44,62,80,0.10) !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .profile-mobile-form {
              padding: 1.2rem !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            .profile-mobile-form input, .profile-mobile-form select {
              font-size: 1rem !important;
              padding: 0.7rem 0.8rem !important;
            }
            .profile-mobile-form label {
              font-size: 0.98rem !important;
            }
          `}</style>
        )}
      </main>
    </div>

  );
}

export default ProfilePage;
