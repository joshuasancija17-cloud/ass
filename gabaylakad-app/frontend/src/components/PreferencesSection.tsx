import React from 'react';

const PreferencesSection: React.FC = () => (
  <div style={{ background: '#fff', width: '100%', maxWidth: 360, borderRadius: 12, padding: 18, boxShadow: '0 6px 20px rgba(44,62,80,0.08)' }}>
    <div style={{ borderTop: '8px solid #f7f7f7', borderBottom: '1px solid #f7f7f7', padding: '0.7rem 0.5rem', fontWeight: 700, color: '#232946', fontSize: '1.08rem', textAlign: 'left' }}>Preferences</div>
    <div style={{ background: 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.2rem', borderBottom: '1px solid #f7f7f7', fontWeight: 600, color: '#232946', fontSize: '1.08rem' }}>
        <span><i className="fas fa-language" style={{ marginRight: 12, color: '#232946' }}></i>Language</span>
        <i className="fas fa-chevron-right" style={{ color: '#232946', fontSize: '1.1rem' }}></i>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.2rem', borderBottom: '1px solid #f7f7f7', fontWeight: 600, color: '#232946', fontSize: '1.08rem' }}>
        <span><i className="fas fa-moon" style={{ marginRight: 12, color: '#232946' }}></i>Darkmode</span>
        <i className="fas fa-chevron-right" style={{ color: '#232946', fontSize: '1.1rem' }}></i>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.2rem', fontWeight: 600, color: '#232946', fontSize: '1.08rem' }}>
        <span><i className="fas fa-wifi" style={{ marginRight: 12, color: '#232946' }}></i>Only Download via Wifi</span>
        <i className="fas fa-chevron-right" style={{ color: '#232946', fontSize: '1.1rem' }}></i>
      </div>
    </div>
  </div>
);

export default PreferencesSection;
