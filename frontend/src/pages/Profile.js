import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { User, LogOut, Edit, Crown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProfileView from '../components/ProfileView';

const Profile = () => {
  const { token, profile, logout, fetchUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
    fetchSubscription();
  }, [profile]);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription');
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/profile/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated!');
      await fetchUserData();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const viewMyProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViewingProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950" data-testid="profile-page">
      {viewingProfile && (
        <ProfileView profile={viewingProfile} onClose={() => setViewingProfile(false)} />
      )}

      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="glass-card p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white" style={{fontFamily: 'Space Grotesk'}}>
            <User className="inline w-7 h-7 mr-2" />
            My Profile
          </h1>
          <div className="flex gap-2">
            <button
              onClick={viewMyProfile}
              className="text-white hover:text-blue-300 transition-colors"
              data-testid="view-profile-button"
              title="Preview Profile"
            >
              <Eye className="w-6 h-6" />
            </button>
            <button
              onClick={logout}
              className="text-white hover:text-red-300 transition-colors"
              data-testid="logout-button"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Subscription Badge */}
        {subscription?.is_pro && (
          <div className="glass-card p-4 mb-6 text-center" data-testid="pro-badge">
            <Crown className="inline w-6 h-6 text-yellow-300 mr-2" />
            <span className="text-white font-bold text-lg">Pro Member</span>
          </div>
        )}

        {!subscription?.is_pro && (
          <div className="glass-card p-6 mb-6 text-center">
            <p className="text-white text-lg mb-4">Upgrade to Pro for unlimited features!</p>
            <button
              onClick={() => navigate('/subscription/upgrade')}
              className="btn-primary"
              data-testid="upgrade-button"
            >
              <Crown className="inline w-5 h-5 mr-2" />
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* Profile Content */}
        <div className="glass-card p-6">
          {!isEditing ? (
            <div data-testid="profile-view">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">@{profile.username}, {profile.age}</h2>
                  <p className="text-white/80 text-lg">{profile.gender_identity} • {profile.pronouns}</p>
                  {profile.height && <p className="text-white/60 text-sm mt-1">Height: {profile.height}</p>}
                  {profile.weight && <p className="text-white/60 text-sm">Weight: {profile.weight}</p>}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                  data-testid="edit-button"
                >
                  <Edit className="inline w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>

              {profile.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {profile.photos.map((photo, i) => (
                    <img key={i} src={photo} alt="Profile" className="w-full h-40 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">Bio</h3>
                  <p className="text-white/80">{profile.bio || 'No bio yet'}</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Looking For</h3>
                  <p className="text-white/80">{profile.looking_for}</p>
                </div>

                {profile.position && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Position</h3>
                    <p className="text-white/80">{profile.position}</p>
                  </div>
                )}

                {profile.hiv_status && (
                  <div>
                    <h3 className="text-white font-bold mb-2">HIV Status</h3>
                    <p className="text-white/80">{profile.hiv_status}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-white font-bold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="badge">{interest}</span>
                    ))}
                  </div>
                </div>

                {profile.private_photos && profile.private_photos.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Private Album</h3>
                    <p className="text-white/80">{profile.private_photos.length} private photos</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div data-testid="profile-edit">
              <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-2 block">Username</label>
                  <input
                    data-testid="edit-username-input"
                    type="text"
                    className="input-field"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                  <p className="text-white/60 text-sm mt-1">Your public username</p>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Bio</label>
                  <textarea
                    data-testid="edit-bio-input"
                    className="input-field"
                    rows="4"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell others about yourself..."
                  />
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Looking For</label>
                  <select
                    data-testid="edit-looking-for-select"
                    className="input-field"
                    value={formData.looking_for || ''}
                    onChange={(e) => setFormData({...formData, looking_for: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Smash RN">Smash RN</option>
                    <option value="Dating">Dating</option>
                    <option value="Friends">Friends</option>
                    <option value="Relationship">Relationship</option>
                    <option value="Networking">Networking</option>
                    <option value="Chat">Chat</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Hosting</label>
                  <select
                    data-testid="edit-hosting-select"
                    className="input-field"
                    value={formData.hosting || ''}
                    onChange={(e) => setFormData({...formData, hosting: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Can Host">Can Host</option>
                    <option value="Cannot Host">Cannot Host</option>
                    <option value="Sometimes">Sometimes</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Tribe (Optional)</label>
                  <select
                    data-testid="edit-tribe-select"
                    className="input-field"
                    value={formData.tribe || ''}
                    onChange={(e) => setFormData({...formData, tribe: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Bear">Bear</option>
                    <option value="Otter">Otter</option>
                    <option value="Twink">Twink</option>
                    <option value="Jock">Jock</option>
                    <option value="Leather">Leather</option>
                    <option value="Geek">Geek</option>
                    <option value="Clean-Cut">Clean-Cut</option>
                    <option value="Rugged">Rugged</option>
                    <option value="Discreet">Discreet</option>
                    <option value="Poz">Poz</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Position (Optional)</label>
                  <select
                    data-testid="edit-position-select"
                    className="input-field"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Top">Top</option>
                    <option value="Bottom">Bottom</option>
                    <option value="Versatile">Versatile</option>
                    <option value="Side">Side</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">HIV Status (Optional)</label>
                  <select
                    data-testid="edit-hiv-status-select"
                    className="input-field"
                    value={formData.hiv_status || ''}
                    onChange={(e) => setFormData({...formData, hiv_status: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Negative">Negative</option>
                    <option value="Negative, On PrEP">Negative, On PrEP</option>
                    <option value="Positive">Positive</option>
                    <option value="Positive, Undetectable">Positive, Undetectable</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.available_now || false}
                      onChange={(e) => setFormData({...formData, available_now: e.target.checked})}
                      className="mr-2"
                    />
                    Available Now
                  </label>
                  <p className="text-white/60 text-sm mt-1">Let others know you're available to meet</p>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Interests</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.interests || []).map((interest, i) => (
                      <span key={i} className="badge cursor-pointer" onClick={() => {
                        setFormData({
                          ...formData,
                          interests: formData.interests.filter((_, idx) => idx !== i)
                        });
                      }}>
                        {interest} ×
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="Add interest"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !formData.interests?.includes(val)) {
                            setFormData({
                              ...formData,
                              interests: [...(formData.interests || []), val]
                            });
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-1">Press Enter to add</p>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Public Photos (Max 5)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {(formData.photos || []).map((photo, i) => (
                      <div key={i} className="relative">
                        <img src={photo} alt="Profile" className="w-full h-32 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              photos: formData.photos.filter((_, idx) => idx !== i)
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="Add photo URL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val && (formData.photos?.length || 0) < 5) {
                          setFormData({
                            ...formData,
                            photos: [...(formData.photos || []), val]
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <p className="text-white/60 text-sm mt-1">Press Enter to add photo URL</p>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Private Photos</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {(formData.private_photos || []).map((photo, i) => (
                      <div key={i} className="relative">
                        <img src={photo} alt="Private" className="w-full h-32 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              private_photos: formData.private_photos.filter((_, idx) => idx !== i)
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="Add private photo URL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val) {
                          setFormData({
                            ...formData,
                            private_photos: [...(formData.private_photos || []), val]
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <p className="text-white/60 text-sm mt-1">Press Enter to add private photo URL</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="btn-primary flex-1"
                    disabled={loading}
                    data-testid="save-button"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile);
                    }}
                    className="btn-secondary flex-1"
                    data-testid="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Profile;