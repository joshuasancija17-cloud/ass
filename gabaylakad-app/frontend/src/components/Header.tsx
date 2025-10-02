import React, { useState, useRef, useEffect } from 'react';
import '../styles/dashboard-main.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const navTabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
  { key: 'profile', label: 'My Profile', icon: 'fas fa-user' },
  { key: 'history', label: 'History', icon: 'fas fa-history' },
  { key: 'location', label: 'Location Tracking', icon: 'fas fa-map-marker-alt' },
  { key: 'sensor', label: 'Sensor Data', icon: 'fas fa-microchip' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 430);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 430);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

interface HeaderProps {
  user?: {
    blind_full_name?: string;
    first_name?: string;
    email?: string;
  };
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const isMobile = useIsMobile();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuBtnRef = useRef<HTMLButtonElement | null>(null);
  const userMenuDropdownRef = useRef<HTMLDivElement | null>(null);
  const deviceActive = true; // Replace with real status if available

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

  return (
    <div className="dashboard-header" style={isMobile ? { width: '100%', margin: 0, padding: '0.7rem 0.7rem', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'hidden', position: 'fixed', top: 0, left: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #f0f0f0' } : {display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      {isMobile ? (
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.7rem 0.5rem',
          boxSizing: 'border-box',
          gap: '1.2rem',
          overflowX: 'hidden',
        }}>
          {/* User avatar/profile button - leftmost */}
          <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center'}}>
            <button
              ref={userMenuBtnRef}
              className="mobile-profile-avatar-btn"
              aria-label="Open user menu"
              onClick={() => setUserMenuOpen((open) => !open)}
              style={{ background: 'none', border: '2px solid #8e44ad', padding: 0, borderRadius: '50%' }}
            >
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.blind_full_name || user?.first_name || 'User')}&background=8e44ad&color=fff`} alt="Avatar" className="mobile-profile-avatar" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }} />
            </button>
            {/* Dropdown menu */}
            {userMenuOpen && (
              <div
                ref={userMenuDropdownRef}
                className="mobile-profile-dropdown"
              >
                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.8rem 1.1rem', borderBottom: '1px solid #f0f0f0', background: 'rgba(41,128,185,0.07)' }}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.blind_full_name || user?.first_name || 'User')}&background=8e44ad&color=fff`} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.01rem', marginBottom: 2 }}>{user?.blind_full_name || user?.first_name || 'User Name'}</div>
                    <div style={{ fontSize: '0.95rem', color: '#7f8c8d' }}>{user?.email || 'user@email.com'}</div>
                  </div>
                </div>
                {/* Menu: Navigation links and actions */}
                <nav role="navigation" aria-label="User menu navigation" style={{ padding: '0.4rem 0.5rem' }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {navTabs.map(tab => (
                      <li key={tab.key}>
                        <button
                          className="mobile-profile-menu-link"
                          aria-label={tab.label}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'rgba(41,128,185,0.08)', border: 'none', borderRadius: 10, padding: '0.8rem 1.1rem', fontSize: '1.01rem', color: '#232946', fontWeight: 600, gap: 12, cursor: 'pointer', transition: 'background 0.18s', marginBottom: 6 }}
                          onClick={() => { setUserMenuOpen(false); window.location.href = `/${tab.key}`; }}
                        >
                          <i className={tab.icon} aria-hidden style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', color: '#2980b9' }}></i>
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button className="mobile-profile-menu-link" aria-label="Logout" style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'rgba(231,76,60,0.09)', border: 'none', borderRadius: 10, padding: '0.8rem 1.1rem', fontSize: '1.01rem', color: '#e74c3c', fontWeight: 600, gap: 12, cursor: 'pointer', transition: 'background 0.18s', marginBottom: 0 }} onClick={() => { setUserMenuOpen(false); sessionStorage.clear(); window.location.href = '/login'; }}>
                        <i className="fas fa-sign-out-alt" aria-hidden style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', color: '#e74c3c' }}></i>
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
          <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center'}}>
            <i 
              className="fas fa-bell" 
              style={{fontSize: '2rem', color: '#2c3e50', cursor: 'pointer', marginRight: '0.7rem'}} 
            ></i>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: deviceActive ? 'linear-gradient(90deg, #43cea2 0%, #2ecc71 100%)' : 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
              borderRadius: '999px',
              padding: '0.5rem 1.2rem',
              fontSize: '1.1rem',
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
              letterSpacing: 0.2,
              maxWidth: '100%',
              minWidth: 0,
              overflow: 'visible',
              textOverflow: 'ellipsis',
              justifyContent: 'center',
              flexShrink: 1,
              flexBasis: 'auto',
              boxSizing: 'border-box',
              marginLeft: '0.20rem',
            }}>
              <i className={deviceActive ? 'fas fa-circle' : 'fas fa-circle-notch'} style={{marginRight: 5, color: deviceActive ? '#2ecc71' : '#e74c3c'}}></i>
              {deviceActive ? 'ONLINE' : 'OFFLINE'}
            </span>
            <span style={{
              position: 'absolute',
              right: '110%',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#232946',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              opacity: 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
              zIndex: 10,
            }}>Alerts & Safety</span>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1.5rem', boxSizing: 'border-box', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: '#232946' }}>GabayLakad</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <i className="fas fa-bell" style={{ fontSize: '1.7rem', color: '#2c3e50', cursor: 'pointer' }}></i>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: deviceActive ? 'linear-gradient(90deg, #43cea2 0%, #2ecc71 100%)' : 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
              borderRadius: '999px',
              padding: '0.5rem 1.2rem',
              fontSize: '1.1rem',
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
              letterSpacing: 0.2,
              maxWidth: '100%',
              minWidth: 0,
              overflow: 'visible',
              textOverflow: 'ellipsis',
              justifyContent: 'center',
              flexShrink: 1,
              flexBasis: 'auto',
              boxSizing: 'border-box',
              marginLeft: '0.20rem',
            }}>
              <i className={deviceActive ? 'fas fa-circle' : 'fas fa-circle-notch'} style={{marginRight: 5, color: deviceActive ? '#2ecc71' : '#e74c3c'}}></i>
              {deviceActive ? 'ONLINE' : 'OFFLINE'}
            </span>
            <span style={{
              position: 'absolute',
              right: '110%',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#232946',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              opacity: 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
              zIndex: 10,
            }}>Alerts & Safety</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
