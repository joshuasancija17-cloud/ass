import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard-main.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ExportButtons from '../components/ExportButtons';

// TypeScript interfaces for dashboard data
interface Patient {
  name: string;
  age: number;
  impairment_level: string;
  serial_number: string;
  device_active: boolean;
}
interface Caregiver {
  name: string;
  phone_number: string;
}
interface DashboardData {
  user: Patient;
  caregiver: Caregiver;
  lastSync: string;
  currentLocation: string;
  locationUpdate: string;
  batteryLevel: string;
  batteryTime: string;
  activityText: string;
  stepCount: string;
  activityLog: Array<{ title: string; details: string; time: string; icon: string; color: string }>;
}


const fetchDashboardData = async (): Promise<any> => {
  // Helper to send error logs to backend
  const sendLogToBackend = async (msg: string) => {
    try {
      await fetch('http://localhost:5000/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
    } catch (err) {
      // Ignore backend log errors
    }
  };
  const token = localStorage.getItem('token');
  const authHeader = token ? `Bearer ${token}` : '';
  console.log('[DASHBOARD] Token in localStorage:', token);
  console.log('[DASHBOARD] Authorization header to be sent:', authHeader);
  if (!token) {
    console.warn('[DASHBOARD] No token found in localStorage. Redirecting to login.');
  }
  const res = await fetch('http://localhost:5000/api/dashboard', {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
  // Store new token if present (sliding expiration)
  const refreshedToken = res.headers.get('X-Refreshed-Token');
  if (refreshedToken) {
    localStorage.setItem('token', refreshedToken);
    console.log('[DASHBOARD] Refreshed token received and saved.');
  }
  // Log custom error/info headers from backend to browser console
  const loginError = res.headers.get('X-Login-Error');
  const loginInfo = res.headers.get('X-Login-Info');
  if (loginError) {
    console.error('[DASHBOARD] Backend error:', loginError);
    sendLogToBackend('[DASHBOARD] Backend error: ' + loginError);
  }
  if (loginInfo) {
    console.log('[DASHBOARD] Backend info:', loginInfo);
    sendLogToBackend('[DASHBOARD] Backend info: ' + loginInfo);
  }
  const data = await res.json();
  console.log('[DASHBOARD] API response:', data);
  sendLogToBackend('[DASHBOARD] API response: ' + JSON.stringify(data));
  // If token expired due to inactivity, throw special error
  if (data && data.error && data.error.name === 'TokenExpiredError') {
    throw new Error('INACTIVE_LOGOUT');
  }
  return data;
};


const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);


  useEffect(() => {
    fetchDashboardData()
      .then((result) => {
        console.log('[DASHBOARD] Data received from API:', result);
        setData(result);
      })
      .catch((err) => {
        console.error('[DASHBOARD] Error fetching dashboard data:', err);
        setData({ error: 'Unable to load dashboard. Please try again.' });
      });
  }, []);


  // Handler for sidebar hover/touch
  const handleSidebarExpand = (expanded: boolean) => setSidebarExpanded(expanded);


  // Deep loading: show loading spinner for any error or unauthorized state
  if (!data || (data.message && (!data.user || data.message === 'Unauthorized')) || data.error) {
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
      <Sidebar expanded={sidebarExpanded} setExpanded={handleSidebarExpand} />
      <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"}>
        <div className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1>Monitoring Dashboard</h1>
          <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            {/* Avatar with relationship below in header */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'rgba(52, 152, 219, 0.85)',
                boxShadow: '0 2px 8px rgba(44,62,80,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.7rem',
                color: '#fff',
                marginBottom: 2,
              }}>
                {(user?.blind_full_name || '').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              {user?.relationship && (
                <span style={{
                  marginTop: 2,
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
                }}>{user.relationship}</span>
              )}
            </div>
            {/* Alerts & Safety Icon with Tooltip */}
            <div style={{position: 'relative', display: 'inline-block'}}>
              <i className="fas fa-bell" style={{fontSize: '2rem', color: '#2c3e50', cursor: 'pointer'}} onMouseEnter={e => {
                const tooltip = e.currentTarget.nextSibling as HTMLElement;
                if (tooltip) tooltip.style.opacity = '1';
              }} onMouseLeave={e => {
                const tooltip = e.currentTarget.nextSibling as HTMLElement;
                if (tooltip) tooltip.style.opacity = '0';
              }}></i>
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
            {/* User Name */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
              <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#232946'}}>{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Card Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(to right, #2a9fd6, #8e44ad)',
          borderRadius: '2rem',
          boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
          padding: '2.5rem 2.5rem 2.5rem 2rem',
          margin: '2rem 0 1.5rem 0',
          minHeight: '190px',
          position: 'relative',
          flexWrap: 'wrap',
          fontFamily: 'Segoe UI, Open Sans, Roboto, Arial, sans-serif',
        }}>
          {/* Avatar */}
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
            {user?.relationship && (
              <span style={{
                marginTop: 6,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: '1rem',
                padding: '0.18rem 1rem',
                fontWeight: 600,
                fontSize: '1rem',
                color: '#fff',
                letterSpacing: 0.2,
                display: 'inline-block',
                maxWidth: 90,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{user.relationship}</span>
            )}
        
          </div>
          {/* Details */}
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff', flex: 1, minWidth: 180}}>
            {/* Blind person's full name and condition */}
            <span style={{fontWeight: 800, fontSize: '2.2rem', marginBottom: 2, letterSpacing: 0.5, color: '#fff', display: 'flex', alignItems: 'center', gap: 16}}>
              {user?.blind_full_name || <span style={{fontStyle: 'italic', color: '#e0e0e0'}}>Name pending</span>}
              {/* Condition beside name */}
              <span style={{display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.18)', borderRadius: '1rem', padding: '0.2rem 0.9rem', fontWeight: 700, color: '#fff', fontSize: '1.05rem'}}>
                <i className="fas fa-eye" style={{marginRight: 7, color: '#f1c40f'}}></i>
                {user?.impairment_level || '-'}
              </span>
            </span>
            {/* Age and phone number row */}
            <span style={{fontSize: '1.1rem', fontWeight: 500, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 24}}>
              <span style={{display: 'inline-flex', alignItems: 'center', fontWeight: 600, fontSize: '1.1rem'}}>
                <i className="fas fa-birthday-cake" style={{marginRight: 6, color: '#fff'}}></i>
                {user?.blind_age ? user.blind_age : <span style={{fontStyle: 'italic', color: '#e0e0e0'}}>Age pending</span>}
              </span>
              <span style={{display: 'inline-flex', alignItems: 'center'}}>
                <i className="fas fa-phone" style={{marginRight: 8, color: '#fff'}}></i>
                <span style={{transition: 'color 0.2s', cursor: 'pointer'}}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffe082')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                >{user?.blind_phone_number || '-'}</span>
              </span>
            </span>
            {/* Email as last row below age */}
            <span style={{fontSize: '1.1rem', fontWeight: 500, marginBottom: 6, display: 'flex', alignItems: 'center'}}>
              <i className="fas fa-envelope" style={{marginRight: 6, color: '#fff'}}></i>
              <span style={{transition: 'color 0.2s', cursor: 'pointer'}} 
                onMouseEnter={e => (e.currentTarget.style.color = '#ffe082')}
                onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
              >{user?.email || '-'}</span>
            </span>
            {/* Pill-shaped connection button */}
            <div style={{marginTop: '1.2rem', display: 'flex', alignItems: 'center'}}>
              <span
                style={{
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
                  marginRight: 0,
                  cursor: 'pointer',
                  userSelect: 'none',
                  minWidth: 220,
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(90deg, #5ee7df 0%, #b490ca 100%)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(44,62,80,0.18)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(44,62,80,0.10)';
                }}
              >
                <i className="fas fa-person-walking-with-cane" style={{marginRight: 10, fontSize: '1.2em'}}></i>
                Smart Stick #{user?.device_serial_number || '--'} - Connected
              </span>
            </div>
          </div>
        </div>
        <hr className="section-divider" />
        {/* Status Cards - Grid Layout */}
        <div className="dashboard-cards-grid">
          {/* Device Status Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="dashboard-card-title">Device Status</div>
                <div className="dashboard-card-value">
                  <span className="status-indicator online">
                    <i className="fas fa-circle"></i> ONLINE
                  </span>
                </div>
                <div className="card-trend">
                  <i className="fas fa-wifi"></i> Last sync: <span>{data.lastSync || 'N/A'}</span>
                </div>
              </div>
              <div className="dashboard-card-icon green">
                <i className="fas fa-walking"></i>
              </div>
            </div>
          </div>

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
            {recent && recent.length > 0 ? (
              recent.map((item: any, idx: number) => (
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
};

export default DashboardPage;