import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard-main.css';

interface ProfilePageProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ sidebarExpanded, setSidebarExpanded }) => {
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  // Change password state

  useEffect(() => {
    let retryCount = 0;
    const tryFetchProfile = async () => {
      try {
        await fetchProfile();
      } catch (err) {
        retryCount++;
        if (retryCount < 3) {
          setTimeout(tryFetchProfile, 1500); // Retry after 1.5s
        }
      }
    };
    tryFetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load profile.');
      }
      const data = await res.json();
      setProfile(data);
      setForm(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Profile updated successfully!');
        setProfile(data);
        setEditMode(false);
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <main className={sidebarExpanded ? "main-content-expanded" : "main-content-collapsed"}>
  <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-700 mb-2">My Profile</h1>
          {errorMsg && (
            <div className="error-notification text-red-600 mb-4 flex items-center justify-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{errorMsg}</span>
              <button className="ml-4 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold" onClick={() => window.location.reload()}>Reload</button>
            </div>
          )}
          <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl shadow-sm p-12">
            {/* Caregiver Information Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Caregiver Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {editMode ? (
                    <input type="text" name="first_name" value={form.first_name || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  ) : (
                    <div className="text-gray-600">{form.first_name || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {editMode ? (
                    <input type="text" name="last_name" value={form.last_name || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  ) : (
                    <div className="text-gray-600">{form.last_name || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {editMode ? (
                    <input type="tel" name="phone_number" value={form.phone_number || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" maxLength={11} required />
                  ) : (
                    <div className="text-gray-600">{form.phone_number || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {editMode ? (
                    <input type="email" name="email" value={form.email || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  ) : (
                    <div className="text-gray-600">{form.email || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  {editMode ? (
                    <input type="text" name="relationship" value={form.relationship || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  ) : (
                    <div className="text-gray-600">{form.relationship || '-'}</div>
                  )}
                </div>
              </div>
            </div>
            {/* Blind Person Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Person You'll Monitor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {editMode ? (
                    <input type="text" name="blind_full_name" value={form.blind_full_name || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  ) : (
                    <div className="text-gray-600">{form.blind_full_name || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {editMode ? (
                    <input type="tel" name="blind_phone_number" value={form.blind_phone_number || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" maxLength={11} />
                  ) : (
                    <div className="text-gray-600">{form.blind_phone_number || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  {editMode ? (
                    <input type="number" name="blind_age" value={form.blind_age || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min={1} max={120} required />
                  ) : (
                    <div className="text-gray-600">{form.blind_age ? form.blind_age : <span className="italic text-gray-400">Age pending</span>}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Impairment Level</label>
                  {editMode ? (
                    <select name="impairment_level" value={form.impairment_level || ''} onChange={handleChange} className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select impairment level</option>
                      <option value="Totally Blind">Totally Blind</option>
                      <option value="Partially Sighted">Partially Sighted</option>
                      <option value="Low Vision">Low Vision</option>
                    </select>
                  ) : (
                    <div className="text-gray-600">{form.impairment_level || '-'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device Serial Number</label>
                  <div className="text-gray-600">{form.device_id || '--'}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="btn-primary px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold transition-all" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
              {editMode && (
                <button type="submit" className="btn-primary ml-4 py-2 px-6 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 text-lg font-semibold transition-all" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
            {successMsg && <div className="success-notification text-green-600 mt-4 flex items-center"><i className="fas fa-check-circle mr-2"></i>{successMsg}</div>}
            {errorMsg && <div className="error-notification text-red-600 mt-4 flex items-center"><i className="fas fa-exclamation-circle mr-2"></i>{errorMsg}</div>}
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
