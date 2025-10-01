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
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, setExpanded }) => {
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
      <div className="sidebar-logo" aria-hidden>
        <i className="fas fa-blind"></i>
      </div>

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
