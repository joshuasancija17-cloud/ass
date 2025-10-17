import React, { useEffect, useState } from 'react';
import PreferencesSection from '../components/PreferencesSection';
import '../styles/dashboard-main.css';
import '../styles/profile.css';
import '../styles/profile-mobile.css';
import '../styles/profile-feed-mobile.css';
import { HeaderDesktop } from '../components/headerDesktop';
import Header from '../components/Header';
import AvatarCircle from '../components/AvatarCircle';


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
  // navigation is handled by router links elsewhere; no direct navigate call needed here

  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileForm, setMobileForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const defaultAvatars = [
    'https://ui-avatars.com/api/?name=JD&background=ff867c&color=fff',
    'https://ui-avatars.com/api/?name=JD&background=2980b9&color=fff',
    'https://ui-avatars.com/api/?name=JD&background=16a085&color=fff',
    'https://ui-avatars.com/api/?name=JD&background=f39c12&color=fff',
    'https://ui-avatars.com/api/?name=JD&background=8e44ad&color=fff',
    'https://ui-avatars.com/api/?name=JD&background=2c3e50&color=fff',
    'https://ui-avatars.com/api/?name=JD&background=27ae60&color=fff',
    'https://ui-avatars.com/api/?name=JD&background=34495e&color=fff',
  ];
  const isMobile = useIsMobile();

  // Fetch profile data from backend
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setProfile(null);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="profile-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f0ff 0%, #b6cfff 100%)' }}>
    {!isMobile && <HeaderDesktop user={profile} />}
    {isMobile && <Header user={{ ...profile, avatar: avatarPreview || profile?.avatar }} />}
      {!isMobile ? (
        <main style={{ maxWidth: 1000, margin: '0 auto', paddingTop: 100 }}>
          {/* Desktop Layout */}
          <div style={{ background: '#fff', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(44,62,80,0.10)', padding: '2.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Row: Avatar/Email left, Edit/Save/Cancel right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, position: 'relative' }}>
                <div style={{ position: 'relative', width: 90, height: 90 }}>
                  <AvatarCircle
                    src={avatarPreview || profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((profile?.first_name || '') + ' ' + (profile?.last_name || ''))}&background=2980b9&color=fff`}
                    size={90}
                  />
                  {editMode && (
                    <button
                      type="button"
                      aria-label="Change Avatar"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#fff',
                        border: '1.5px solid #2980b9',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                      onClick={() => setShowAvatarPicker(true)}
                    >
                      <i className="fas fa-pencil-alt" style={{ color: '#2980b9', fontSize: '1.15rem' }}></i>
                    </button>
                  )}
                  {showAvatarPicker && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(44,62,80,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 12 }}>Choose Your Avatar</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                          {defaultAvatars.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Avatar ${idx+1}`}
                              style={{ width: 64, height: 64, borderRadius: '50%', border: avatarPreview === url ? '3px solid #2980b9' : '2px solid #e0e0e0', cursor: 'pointer', objectFit: 'cover', transition: 'border 0.2s' }}
                              onClick={() => { setAvatarPreview(url); setShowAvatarPicker(false); }}
                            />
                          ))}
                        </div>
                        <button
                          style={{ marginTop: 18, background: '#e0e6ed', color: '#232946', border: 'none', borderRadius: 8, padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                          onClick={() => setShowAvatarPicker(false)}
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.35rem', color: '#232946', marginBottom: 4 }}>
                    {(profile?.first_name || '') + ' ' + (profile?.last_name || '')}
                  </div>
                  <div style={{ fontSize: '1.08rem', color: '#7f8c8d' }}>{profile?.email || '-'}</div>
                </div>
              </div>
              <div>
                {!editMode ? (
                  <button
                    className="profile-edit-btn"
                    style={{
                      background: '#2980b9',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.5rem 1.2rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                    }}
                    onClick={() => {
                      setEditMode(true);
                      setForm(profile);
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      className="profile-edit-btn"
                      style={{
                        background: '#2980b9',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.5rem 1.2rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }}
                      onClick={async () => {
                        setLoading(true);
                        setErrorMsg('');
                        try {
                          const res = await fetch('/api/profile', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                            },
                            body: JSON.stringify({
                              ...form,
                              avatar: avatarPreview || profile?.avatar,
                            }),
                          });
                          // Re-fetch profile after update to ensure avatar and other changes are reflected
                          const fetchRes = await fetch('/api/profile', {
                            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                          });
                          const updated = await fetchRes.json();
                          setProfile(updated);
                          setEditMode(false);
                        } catch (err) {
                          setErrorMsg('Could not save changes.');
                        }
                        setLoading(false);
                      }}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      className="profile-edit-btn"
                      style={{
                        background: '#e0e6ed',
                        color: '#232946',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.5rem 1.2rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setEditMode(false);
                        setForm(profile);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {errorMsg && <div style={{ color: 'red', marginTop: 8 }}>{errorMsg}</div>}
              </div>
            </div>

            {/* Caregiver Information Section */}
            <section>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2980b9', marginBottom: '1.2rem' }}>Caregiver Information</h3>
              <form onSubmit={e => e.preventDefault()} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label className="profile-info-label">First Name</label>
                  <input className="profile-info-value" type="text" value={editMode ? form.first_name ?? '' : profile?.first_name ?? ''} onChange={e => setForm((f: any) => ({ ...f, first_name: e.target.value }))} disabled={!editMode ? true : false} />
                </div>
                <div>
                  <label className="profile-info-label">Last Name</label>
                  <input className="profile-info-value" type="text" value={editMode ? form.last_name ?? '' : profile?.last_name ?? ''} onChange={e => setForm((f: any) => ({ ...f, last_name: e.target.value }))} disabled={!editMode ? true : false} />
                </div>
                <div>
                  <label className="profile-info-label">Phone Number</label>
                  <input className="profile-info-value" type="text" value={editMode ? form.phone_number ?? '' : profile?.phone_number ?? ''} onChange={e => setForm((f: any) => ({ ...f, phone_number: e.target.value }))} disabled={!editMode ? true : false} />
                </div>
                <div>
                  <label className="profile-info-label">Email</label>
                  <input className="profile-info-value" type="email" value={editMode ? form.email ?? '' : profile?.email ?? ''} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} disabled={!editMode ? true : false} />
                </div>
              </form>
            </section>

            {/* Patient Info Section */}
            <section>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2980b9', marginBottom: '1.2rem' }}>Patient Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label className="profile-info-label">Full Name</label>
                  <input className="profile-info-value" type="text" value={profile?.blind_full_name || '-'} disabled />
                </div>
                <div>
                  <label className="profile-info-label">Phone Number</label>
                  <input className="profile-info-value" type="text" value={profile?.blind_phone_number || '-'} disabled />
                </div>
                <div>
                  <label className="profile-info-label">Age</label>
                  <input className="profile-info-value" type="text" value={profile?.blind_age || '-'} disabled />
                </div>
                <div>
                  <label className="profile-info-label">Impairment Level</label>
                  <input className="profile-info-value" type="text" value={profile?.impairment_level || '-'} disabled />
                </div>
              </div>
            </section>

            {/* Relationship & Device Info Section */}
            <section>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2980b9', marginBottom: '1.2rem' }}>Relationship & Device Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label className="profile-info-label">Relationship</label>
                  <input className="profile-info-value" type="text" value={profile?.relationship || '-'} disabled />
                </div>
                <div>
                  <label className="profile-info-label">Device Serial Number</label>
                  <input className="profile-info-value" type="text" value={profile?.device_id || '-'} disabled />
                </div>
              </div>
            </section>
          </div>
        </main>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Mobile header: fixed height so avatar doesn't shift when toggling edit mode */}
          <div style={{ width: '100%', height: 160, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0 }}>
            <div style={{ position: 'absolute', top: 30, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <AvatarCircle
                  src={avatarPreview || profile?.avatar || defaultAvatars[0]}
                  size={100}
                />
                {editMode && (
                  <button
                    type="button"
                    aria-label="Change Avatar"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: '#fff',
                      border: '1.5px solid #2980b9',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                    onClick={() => setShowAvatarPicker(true)}
                  >
                    <i className="fas fa-pencil-alt" style={{ color: '#2980b9', fontSize: '1.35rem' }}></i>
                  </button>
                )}
              </div>
              <div style={{ height: 12 }} />
              {!editMode && (
                <>
                  <button
                    style={{ background: '#232946', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(44,62,80,0.10)', minHeight: 44, marginTop: 0 }}
                    onClick={() => {
                      setEditMode(true);
                      setMobileForm({
                        first_name: (profile?.first_name || ''),
                        last_name: (profile?.last_name || ''),
                        email: (profile?.email || ''),
                        phone: (profile?.phone_number || ''),
                      });
                    }}
                  >
                    Edit Profile
                  </button>
                  <div style={{ width: '100%', maxWidth: 360, margin: '24px auto 0', overflow: 'hidden' }}>
                    <PreferencesSection />
                  </div>
                </>
              )}
              {showAvatarPicker && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(44,62,80,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 12 }}>Choose Your Avatar</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                      {defaultAvatars.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Avatar ${idx+1}`}
                          style={{ width: 64, height: 64, borderRadius: '50%', border: avatarPreview === url ? '3px solid #2980b9' : '2px solid #e0e0e0', cursor: 'pointer', objectFit: 'cover', transition: 'border 0.2s' }}
                          onClick={() => { setAvatarPreview(url); setShowAvatarPicker(false); }}
                        />
                      ))}
                    </div>
                    <button
                      style={{ marginTop: 18, background: '#e0e6ed', color: '#232946', border: 'none', borderRadius: 8, padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                      onClick={() => setShowAvatarPicker(false)}
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content area: either the edit form or preferences. The header above reserves space so avatar won't move. */}
          {editMode ? (
            <>
              <main style={{ width: '100%', padding: 0, margin: 0, fontFamily: 'Segoe UI, Open Sans, Roboto, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#fff', width: '100%', maxWidth: 340, marginTop: 0, borderRadius: 12, padding: 18, boxShadow: '0 6px 20px rgba(44,62,80,0.08)' }}>
                  <form onSubmit={async (e) => { e.preventDefault();
                      setLoading(true); setErrorMsg('');
                      try {
                        const res = await fetch('/api/profile', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                          body: JSON.stringify({
                            first_name: mobileForm.first_name,
                            last_name: mobileForm.last_name,
                            email: mobileForm.email,
                            phone_number: mobileForm.phone,
                            avatar: avatarPreview || profile?.avatar,
                            relationship: profile?.relationship,
                            blind_full_name: profile?.blind_full_name,
                            blind_phone_number: profile?.blind_phone_number,
                            blind_age: profile?.blind_age,
                            impairment_level: profile?.impairment_level,
                            device_id: profile?.device_id
                          })
                        });
                        if (!res.ok) throw new Error('Failed to update profile');
                        // Re-fetch profile after update to ensure avatar and other changes are reflected
                        const fetchRes = await fetch('/api/profile', {
                          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                        });
                        const updated = await fetchRes.json();
                        setProfile(updated);
                        setEditMode(false);
                      } catch (err) {
                        setErrorMsg('Could not update profile');
                      }
                      setLoading(false);
                    }} style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ marginBottom: 0 }}>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: '#2980b9', marginBottom: '1.1rem' }}>Caregiver Information</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                        <div>
                          <label className="profile-info-label">First Name</label>
                          <input className="profile-info-value" name="first_name" value={mobileForm.first_name} onChange={e => setMobileForm(m => ({ ...m, first_name: e.target.value }))} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: '1.08rem', fontWeight: 500 }} />
                        </div>
                        <div>
                          <label className="profile-info-label">Last Name</label>
                          <input className="profile-info-value" name="last_name" value={mobileForm.last_name} onChange={e => setMobileForm(m => ({ ...m, last_name: e.target.value }))} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: '1.08rem', fontWeight: 500 }} />
                        </div>
                        <div>
                          <label className="profile-info-label">Email</label>
                          <input className="profile-info-value" name="email" value={mobileForm.email} onChange={e => setMobileForm(m => ({ ...m, email: e.target.value }))} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: '1.08rem', fontWeight: 500 }} />
                        </div>
                        <div>
                          <label className="profile-info-label">Phone Number</label>
                          <input className="profile-info-value" name="phone" value={mobileForm.phone} onChange={e => setMobileForm(m => ({ ...m, phone: e.target.value }))} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: '1.08rem', fontWeight: 500 }} />
                        </div>
                      </div>
                    </div>
                    {/* Patient Info Section (non-editable) */}
                    <div style={{ marginTop: 0 }}>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: '#2980b9', marginBottom: '1.1rem' }}>Patient Info</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                        <div>
                          <label className="profile-info-label">Full Name</label>
                          <input className="profile-info-value" type="text" value={profile?.blind_full_name || '-'} disabled style={{ cursor: 'not-allowed', borderColor: '#e74c3c' }} />
                        </div>
                        <div>
                          <label className="profile-info-label">Phone Number</label>
                          <input className="profile-info-value" type="text" value={profile?.blind_phone_number || '-'} disabled style={{ cursor: 'not-allowed', borderColor: '#e74c3c' }} />
                        </div>
                        <div>
                          <label className="profile-info-label">Age</label>
                          <input className="profile-info-value" type="text" value={profile?.blind_age || '-'} disabled style={{ cursor: 'not-allowed', borderColor: '#e74c3c' }} />
                        </div>
                        <div>
                          <label className="profile-info-label">Impairment Level</label>
                          <input className="profile-info-value" type="text" value={profile?.impairment_level || '-'} disabled style={{ cursor: 'not-allowed', borderColor: '#e74c3c' }} />
                        </div>
                      </div>
                    </div>
                    {/* Relationship & Device Info Section (non-editable) */}
                    <div style={{ marginTop: 0 }}>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: '#2980b9', marginBottom: '1.1rem' }}>Relationship & Device Info</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                        <div>
                          <label className="profile-info-label">Relationship</label>
                          <input className="profile-info-value" type="text" value={profile?.relationship || '-'} disabled style={{ cursor: 'not-allowed', borderColor: '#e74c3c' }} />
                        </div>
                        <div>
                          <label className="profile-info-label">Device Serial Number</label>
                          <input className="profile-info-value" type="text" value={profile?.device_id || '-'} disabled style={{ cursor: 'not-allowed', borderColor: '#e74c3c' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <button type="submit" disabled={loading} style={{ background: '#232946', color: '#fff', border: 'none', borderRadius: 12, padding: '0.9rem 0', fontWeight: 700, fontSize: '1.13rem', flex: 1, cursor: 'pointer' }}>Update</button>
                      <button type="button" onClick={() => setEditMode(false)} style={{ background: '#e0e6ed', color: '#232946', border: 'none', borderRadius: 12, padding: '0.9rem 0', fontWeight: 700, fontSize: '1.13rem', flex: 1, cursor: 'pointer' }}>Cancel</button>
                    </div>
                    {errorMsg && <div style={{ color: 'red', marginTop: 0 }}>{errorMsg}</div>}
                  </form>
                </div>
              </main>
              <div style={{ height: 24 }} />

            </>
          ) : (
            {/* Preferences main and card removed, nothing shown in view mode here */}
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
