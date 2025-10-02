import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard-main.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ExportButtons from '../components/ExportButtons';

// TypeScript interfaces for dashboard data

interface Patient {
  name: string;
  age: number;
}

// Fetch dashboard data from backend
async function fetchDashboardData() {
  try {
    const res = await fetch('/api/dashboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await res.json();
    // If token expired due to inactivity, throw special error
    if (data && data.error && data.error.name === 'TokenExpiredError') {
      throw new Error('INACTIVE_LOGOUT');
    }
    return data;
  } catch (err) {
    return { error: 'Unable to load dashboard. Please try again.' };
  }
}


interface DashboardProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

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

const Dashboard: React.FC<DashboardProps> = ({ sidebarExpanded, setSidebarExpanded }) => {
  const [data, setData] = useState<any>(null);
  const [inactiveTimeoutId, setInactiveTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData()
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        setData({ error: 'Unable to load dashboard. Please try again.' });
      });
  }, []);

  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactiveTimeoutId) clearTimeout(inactiveTimeoutId);
      const timeoutId = setTimeout(() => {
        setData('INACTIVE_DEEP_LOADING');
        setTimeout(() => {
          const token = localStorage.getItem('token');
          if (!token) {
            window.location.href = '/';
          } else {
            window.location.reload();
          }
        }, 4000);
      }, INACTIVITY_LIMIT);
      setInactiveTimeoutId(timeoutId);
    };
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      if (inactiveTimeoutId) clearTimeout(inactiveTimeoutId);
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Deep loading: show loading spinner for any error or unauthorized state
  if (!data || (data.message && (!data.user || data.message === 'Unauthorized')) || data.error || data === 'INACTIVE_DEEP_LOADING') {
    // If error is due to inactivity deep loading, show spinner for 4 seconds
    if (data === 'INACTIVE_DEEP_LOADING') {
      return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh'}}>
          <div className="deep-loading-spinner" style={{marginBottom: 24}}>
            <div style={{
              width: 60,
              height: 60,
              border: '6px solid #e0e0e0',
              borderTop: '6px solid #2a9fd6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
          <div style={{fontWeight: 600, color: '#e74c3c', fontSize: 20}}>Checking session for activity...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }
    // If error is due to inactivity logout, show message and redirect
    if (data === 'INACTIVE_LOGOUT' || (data && data.error && data.error.name === 'TokenExpiredError')) {
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh'}}>
          <div className="deep-loading-spinner" style={{marginBottom: 24}}>
            <div style={{
              width: 60,
              height: 60,
              border: '6px solid #e0e0e0',
              borderTop: '6px solid #2a9fd6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
          <div style={{fontWeight: 600, color: '#e74c3c', fontSize: 20}}>You are logout due to inactiveness, please relogin.</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh'}}>
        <div className="deep-loading-spinner" style={{marginBottom: 24}}>
          <div style={{
            width: 60,
            height: 60,
            border: '6px solid #e0e0e0',
            borderTop: '6px solid #2a9fd6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
        <div style={{fontWeight: 600, color: '#232946', fontSize: 20}}>Loading dashboard...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Use only actual data fields from backend
  const { user, recent } = data;

  return (
    <div className="dashboard-container">
      {/* Mobile sidebar overlay logic */}
      {isMobile ? (
        <>
          {sidebarOpen && (
            <>
              <div
                className="sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0, left: 0, width: '100vw', height: '100vh',
                  background: 'rgba(0,0,0,0.3)', zIndex: 1000
                }}
              />
              <div style={{position: 'fixed', top: 0, left: 0, height: '100vh', width: '220px', zIndex: 1001, background: '#232946'}}>
                <Sidebar expanded={true} setExpanded={() => {}} />
                <button
                  className="close-btn"
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    position: 'absolute', top: 12, right: 12, fontSize: '1.5rem',
                    background: 'none', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 1002
                  }}
                  aria-label="Close sidebar"
                >
                  &times;
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      )}
      <main className={isMobile ? "main-content-full" : sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"} style={isMobile ? { padding: 0, margin: 0, width: '100vw', minWidth: 0, maxWidth: '100vw', boxSizing: 'border-box', overflowX: 'hidden' } : {}}>
  <div className="dashboard-header" style={isMobile ? { width: '100%', margin: 0, padding: '0.7rem 0.7rem', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'hidden' } : {display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          {/* Hamburger, bell, and status badge in a single right-aligned row for mobile */}
          {isMobile ? (
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '0.7rem 0.5rem',
              boxSizing: 'border-box',
              gap: '1.2rem',
              overflowX: 'hidden',
            }}>
              <button
                className="hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#232946' }}
              >
                &#9776;
              </button>
              <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center'}}>
                <i 
                  className="fas fa-bell" 
                  style={{fontSize: '2rem', color: '#2c3e50', cursor: 'pointer', marginRight: '0.7rem'}} 
                  onMouseEnter={e => {
                    const tooltip = e.currentTarget.nextSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '1';
                  }} 
                  onMouseLeave={e => {
                    const tooltip = e.currentTarget.nextSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '0';
                  }}
                ></i>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: user?.device_active ? 'linear-gradient(90deg, #43cea2 0%, #2ecc71 100%)' : 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
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
                  <i className={user?.device_active ? 'fas fa-circle' : 'fas fa-circle-notch'} style={{marginRight: 5, color: user?.device_active ? '#2ecc71' : '#e74c3c'}}></i>
                  {user?.device_active ? 'ONLINE' : 'OFFLINE'}
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
                  zIndex: 10
                }}>Alerts & Safety</span>
              </div>
            </div>
          ) : (
            <>
              <h1>Monitoring Dashboard</h1>
              <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                {/* Alerts & Safety Icon with Tooltip */}
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                </div>
                <div style={{position: 'relative', display: 'inline-block'}}>
                  <i 
                    className="fas fa-bell" 
                    style={{fontSize: '2rem', color: '#2c3e50', cursor: 'pointer'}} 
                    onMouseEnter={e => {
                      const tooltip = e.currentTarget.nextSibling as HTMLElement;
                      if (tooltip) tooltip.style.opacity = '1';
                    }} 
                    onMouseLeave={e => {
                      const tooltip = e.currentTarget.nextSibling as HTMLElement;
                      if (tooltip) tooltip.style.opacity = '0';
                    }}
                  ></i>
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
                    zIndex: 10
                  }}>Alerts & Safety</span>
                </div>
                {/* Caregiver name and relationship in header for desktop */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                  <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#232946'}}>
                    {user?.first_name || ''} {user?.last_name || ''}
                  </span>
                  {user?.relationship && (
                    <span style={{
                      marginTop: 1,
                      right: '50px',
                      background: 'rgba(44,62,80,0.08)',
                      borderRadius: '1rem',
                      padding: '0.13rem 0.8rem',
                      fontWeight: 600,
                      fontSize: '0.98rem',
                      color: '#2c3e50',
                      letterSpacing: 0.2,
                      display: 'inline-block',
                      maxWidth: 90,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user.relationship}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
          {/* Bell notification icon for mobile (far right) */}
        </div>
        {/* Enhanced Profile Card Section with Device Status */}
        <div
          className="dashboard-profile-card"
            style={isMobile ? {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to right, #2a9fd6, #8e44ad)',
              borderRadius: '2rem',
              boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
              padding: '2rem 1rem',
              margin: '2rem 0 1.5rem 0',
              minHeight: '190px',
              position: 'relative',
              fontFamily: 'Segoe UI, Open Sans, Roboto, Arial, sans-serif',
              width: 'calc(100vw - 2rem)',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
            } : {
              display: 'flex',
              alignItems: 'flex-start',
              background: 'linear-gradient(to right, #2a9fd6, #8e44ad)',
              borderRadius: '2rem',
              boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
              padding: '2.5rem 2.5rem 2.5rem 2rem',
              margin: '2rem 0 1.5rem 0',
              minHeight: '190px',
              position: 'relative',
              flexWrap: 'wrap',
              fontFamily: 'Segoe UI, Open Sans, Roboto, Arial, sans-serif',
            }}
        >
          {/* Avatar, condition, device status for mobile; full info for desktop */}
          {isMobile ? (
            <>
              {/* Avatar */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(52, 152, 219, 0.85)',
                boxShadow: '0 4px 24px rgba(44,62,80,0.18)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '2rem',
                color: '#fff',
                marginBottom: '1rem',
              }}>
                <span>{(user?.blind_full_name || '').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}</span>
              </div>
              {/* Condition */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.18)',
                borderRadius: '1rem',
                padding: '0.2rem 0.9rem',
                fontWeight: 700,
                color: '#fff',
                fontSize: '1.05rem',
                marginBottom: '1rem',
              }}>
                <i className="fas fa-eye" style={{ marginRight: 7, color: '#f1c40f' }}></i>
                {user?.impairment_level || '-'}
              </div>
              {/* Device status */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                borderRadius: '999px',
                padding: '0.5rem 1.5rem',
                fontSize: '1rem',
                color: '#fff',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                letterSpacing: 0.2,
                minWidth: 220,
                marginBottom: '0.5rem',
              }}>
                <i className="fas fa-person-walking-with-cane" style={{ marginRight: 10, fontSize: '1.2em' }}></i>
                Smart Stick #{user?.device_serial_number || '--'} - Connected
              </div>
            </>
          ) : (
            // ...existing code for desktop view...
            <>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(52, 152, 219, 0.85)',
                boxShadow: '0 4px 24px rgba(44,62,80,0.18)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '2.5rem',
                color: '#fff',
                marginRight: '2.2rem',
                marginBottom: '0.5rem',
                flexShrink: 0,
              }}>
                <span>{(user?.blind_full_name || '').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', color: '#fff', flex: 1, minWidth: 180, width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '2.2rem',
                      letterSpacing: 0.5,
                      color: '#fff'
                    }}>
                      {user?.blind_full_name || <span style={{ fontStyle: 'italic', color: '#e0e0e0' }}>Name pending</span>}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.18)',
                      borderRadius: '1rem',
                      padding: '0.2rem 0.9rem',
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: '1.05rem'
                    }}>
                      <i className="fas fa-eye" style={{ marginRight: 7, color: '#f1c40f' }}></i>
                      {user?.impairment_level || '-'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                      <i className="fas fa-birthday-cake" style={{ marginRight: 6 }}></i>
                      {user?.blind_age || <span style={{ fontStyle: 'italic', color: '#e0e0e0' }}>Age pending</span>}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: '#fff' }}>
                      <i className="fas fa-phone" style={{ marginRight: 6 }}></i>
                      {user?.blind_phone_number || '-'}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', color: '#fff' }}>
                    <i className="fas fa-envelope" style={{ marginRight: 6 }}></i>
                    {user?.email || '-'}
                  </div>
                  <div style={{
                    marginTop: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    borderRadius: '999px',
                    padding: '0.5rem 1.5rem',
                    fontSize: '1rem',
                    color: '#fff',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                    letterSpacing: 0.2,
                    minWidth: 220
                  }}>
                    <i className="fas fa-person-walking-with-cane" style={{ marginRight: 10, fontSize: '1.2em' }}></i>
                    Smart Stick #{user?.device_serial_number || '--'} - Connected
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 0,
                  minWidth: 120,
                  marginLeft: '2.5rem',
                  height: '100%',
                  position: 'relative',
                }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: user?.device_active ? 'linear-gradient(90deg, #43cea2 0%, #2ecc71 100%)' : 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
                      borderRadius: '999px',
                      padding: '0.5rem 1.2rem',
                      fontSize: '1.1rem',
                      color: '#fff',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                      letterSpacing: 0.2,
                      minWidth: 120,
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <i className={user?.device_active ? 'fas fa-circle' : 'fas fa-circle-notch'} style={{marginRight: 10, color: user?.device_active ? '#2ecc71' : '#e74c3c'}}></i>
                    {user?.device_active ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  <span style={{fontSize: '0.98rem', color: '#fff', fontWeight: 500, marginTop: 2, opacity: 0.8, textAlign: 'center'}}>
                    Last sync: {data.locationUpdate || 'N/A'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Responsive CSS for ExportButtons */}
        <style>{`
          @media (max-width: 900px) {
            .export-buttons-responsive {
              align-items: stretch !important;
              max-width: 100% !important;
              margin-left: 0 !important;
              margin-top: 1.5rem !important;
            }
            .export-btn {
              width: 100% !important;
              font-size: 1rem !important;
              padding: 0.7rem 0.5rem !important;
            }
          }
          @media (max-width: 600px) {
            .export-buttons-responsive {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            .export-btn {
              width: 100% !important;
              font-size: 0.98rem !important;
              padding: 0.6rem 0.3rem !important;
            }
          }
        `}</style>
        <hr className="section-divider" />
        {/* Status Cards - Grid Layout (without Device Status card) */}
        <div className="dashboard-cards-grid">
          {/* Location Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="dashboard-card-title">Current Location</div>
                <div className="dashboard-card-value" style={{fontSize: '1.4rem'}}>{data.currentLocation || 'N/A'}</div>
                <div className="card-trend">
                  <i className="fas fa-clock"></i> Updated <span>{data.locationUpdate || 'N/A'}</span>
                </div>
              </div>
              <div className="dashboard-card-icon blue">
                <i className="fas fa-map-marker-alt"></i>
              </div>
            </div>
          </div>
          {/* Battery Level Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="dashboard-card-title">Battery Level</div>
                <div className="dashboard-card-value" style={{color: '#e67e22'}}>{data.batteryLevel || 'N/A'}</div>
                <div className="card-trend warning">
                  <i className="fas fa-battery-three-quarters"></i> <span>{data.batteryTime || 'N/A'}</span>
                </div>
              </div>
              <div className="dashboard-card-icon orange">
                <i className="fas fa-battery-three-quarters"></i>
              </div>
            </div>
          </div>
          {/* Activity Status Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="dashboard-card-title">Activity Status</div>
                <div className="dashboard-card-value" style={{color: '#9b59b6'}}>
                  <span className="status-indicator walking">
                    <i className="fas fa-walking"></i> {data.activityText || 'N/A'}
                  </span>
                </div>
                <div className="card-trend info">
                  <i className="fas fa-shoe-prints"></i> <span>{data.stepCount || 'N/A'}</span> steps today
                </div>
              </div>
              <div className="dashboard-card-icon purple">
                <i className="fas fa-shoe-prints"></i>
              </div>
            </div>
          </div>
          {/* Emergency System Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="dashboard-card-title">Emergency System</div>
                <div className="dashboard-card-value">
                  <span className="status-indicator online">
                    <i className="fas fa-check"></i> READY
                  </span>
                </div>
                <div className="card-trend">
                  <i className="fas fa-mobile-alt"></i> SMS alerts via GSM network
                </div>
              </div>
              <div className="dashboard-card-icon red">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
          {/* Night Reflector Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="dashboard-card-title">Night Reflector</div>
                <div className="dashboard-card-value">
                  <span className="status-indicator online" style={{color: '#f1c40f', fontWeight: 'bold'}}>
                    <i className="fas fa-sun" style={{color: '#f1c40f', marginRight: '8px'}}></i> ACTIVE
                  </span>
                </div>
                <div className="card-trend warning">
                  <i className="fas fa-lightbulb"></i> Auto-activates in low light
                </div>
              </div>
              <div className="dashboard-card-icon orange">
                <i className="fas fa-sun"></i>
              </div>
            </div>
          </div>
        </div>
        {/* Export Buttons above activity log for mobile */}
        {isMobile && (
          <div className="export-buttons" style={{ width: '100vw', margin: '0.5rem 0', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
            <ExportButtons activityLog={data?.activityLog || []} />
          </div>
        )}
        {/* Activity Log */}
        <div style={{
          background: 'linear-gradient(135deg, #eaf6fb 0%, #f4f1fa 100%)',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 24px rgba(44,62,80,0.10)',
          padding: '2rem 2.5rem 2.5rem 2.5rem',
          margin: '2.5rem 0 2rem 0',
          minHeight: 260,
          maxWidth: 700,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Segoe UI, Open Sans, Roboto, Arial, sans-serif',
          position: 'relative',
        }}>
          {/* Header */}
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '1.2rem'}}>
            <i className="fas fa-clock" style={{fontSize: '1.5rem', color: '#2a9fd6', marginRight: 12}}></i>
            <span style={{fontWeight: 700, fontSize: '1.35rem', color: '#232946', letterSpacing: 0.2}}>Real-time Activity Log</span>
          </div>
          {/* Content Area */}
          <div style={{
            maxHeight: 180,
            overflowY: 'auto',
            paddingRight: 8,
            scrollbarWidth: 'thin',
            scrollbarColor: '#5f6fff #eaf6fb',
          }}
            className="custom-activity-scrollbar"
          >
            {data.recent && data.recent.length > 0 ? (
              data.recent.map((item: any, idx: number) => (
                <div key={idx} style={{
                  background: '#fff',
                  borderRadius: '1rem',
                  boxShadow: '0 1px 6px rgba(44,62,80,0.06)',
                  marginBottom: 14,
                  padding: '1.1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: '4px solid #8e44ad',
                  gap: 16,
                }}>
                  <div style={{flex: 1}}>
                    <span style={{fontWeight: 600, color: '#232946', fontSize: '1.08rem'}}>{item.action}</span>
                    <span style={{marginLeft: 18, color: '#7f8c8d', fontSize: '0.98rem'}}>{item.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 140,
                color: '#b0b8c1',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: 0.1,
              }}>
                No activity detected
              </div>
            )}
          </div>
          {/* Custom scrollbar CSS (for webkit browsers) */}
          <style>{`
            .custom-activity-scrollbar::-webkit-scrollbar {
              width: 8px;
              background: transparent;
            }
            .custom-activity-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #5f6fff 0%, #8e44ad 100%);
              border-radius: 8px;
            }
          `}</style>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;