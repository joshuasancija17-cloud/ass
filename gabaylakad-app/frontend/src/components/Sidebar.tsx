import './dashboard-sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const navTabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
  { key: 'profile', label: 'My Profile', icon: 'fas fa-user' },
  { key: 'history', label: 'History', icon: 'fas fa-history' },
  { key: 'location', label: 'Location Tracking', icon: 'fas fa-map-marker-alt' },
  { key: 'sensor', label: 'Sensor Data', icon: 'fas fa-microchip' },
];

interface SidebarProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  caregiverName?: string;
  caregiverRelationship?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, setExpanded, caregiverName, caregiverRelationship }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call backend logout API
  fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.ok) {
          localStorage.removeItem('token');
          sessionStorage.clear();
          navigate('/login');
        } else if (res.status === 404) {
          alert('Logout endpoint not found. Please contact support.');
        } else {
          alert('Logout failed. Please try again.');
        }
      })
      .catch((err) => {
        alert('Network error or server unavailable. Please try again later.');
      });
  };

  // Expand on hover (desktop) and touch (mobile)
  return (
    <aside
      className={`sidebar-nav ${expanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onTouchStart={() => setExpanded(true)}
      onTouchEnd={() => setExpanded(false)}
      aria-hidden={false}
    >
      {/* Caregiver info at top only for mobile, icon for desktop */}
      {typeof window !== 'undefined' && window.innerWidth <= 430 && (typeof caregiverName === 'string' && caregiverName.length > 0) ? (
        <div className="sidebar-caregiver-info" style={{padding: '1.2rem 1rem 0.5rem 1rem', textAlign: 'center'}}>
          <span style={{fontWeight: 700, fontSize: '1.1rem', color: '#232946'}}>{caregiverName}</span>
          {caregiverRelationship && (
            <span style={{
              display: 'block',
              marginTop: 2,
              background: 'rgba(44,62,80,0.08)',
              borderRadius: '1rem',
              padding: '0.13rem 0.8rem',
              fontWeight: 600,
              fontSize: '0.98rem',
              color: '#2c3e50',
              letterSpacing: 0.2,
              maxWidth: 120,
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{caregiverRelationship}</span>
          )}
        </div>
      ) : (
        <div className="sidebar-logo" aria-hidden>
          <i className="fas fa-blind"></i>
        </div>
      )}

      <nav className="sidebar-menu" role="navigation" aria-label="Main navigation">
        <ul>
          {navTabs.map(tab => (
            <li key={tab.key} className="sidebar-item">
              <button
                className={`sidebar-link`}
                aria-label={tab.label}
                onClick={() => navigate(`/${tab.key}`)}
              >
                <i className={tab.icon} aria-hidden></i>
                <span className="sidebar-label">{tab.label}</span>
              </button>
            </li>
          ))}

          <li className="sidebar-item">
            <button className={`sidebar-link`} aria-label="Logout" onClick={handleLogout}>
              <i className={`fas fa-sign-out-alt`} aria-hidden></i>
              <span className="sidebar-label">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
