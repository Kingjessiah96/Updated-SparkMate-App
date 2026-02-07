import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Eye, ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/ProfileView';

const WhoViewedMe = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    fetchViews();
  }, []);

  const fetchViews = async () => {
    try {
      const response = await axios.get(`${API}/profile-views`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViews(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('This is a Pro feature!');
        navigate('/subscription/upgrade');
      } else {
        toast.error('Failed to load profile views');
      }
    } finally {
      setLoading(false);
    }
  };

  const openProfile = async (userId) => {
    try {
      const response = await axios.get(`${API}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  return (
    <div className="min-h-screen pb-24" data-testid="who-viewed-me-page">
      {selectedProfile && (
        <ProfileView profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}

      <div className="max-w-4xl mx-auto p-4">
        <div className="glass-card p-4 mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex-1" style={{fontFamily: 'Space Grotesk'}}>
            <Eye className="inline w-7 h-7 mr-2" />
            Who Viewed Me
          </h1>
          <Crown className="w-6 h-6 text-yellow-300" />
        </div>

        {loading ? (
          <div className="text-center text-white text-xl py-20">Loading...</div>
        ) : views.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Eye className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No profile views yet</p>
            <p className="text-white/70">When someone views your profile, they'll appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {views.map((view) => (
              view.viewer_profile && (
                <div
                  key={view.id}
                  className="glass-card-dark p-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => openProfile(view.viewer_id)}
                  data-testid="profile-view-card"
                >
                  <img
                    src={view.viewer_profile.photos[0] || 'https://via.placeholder.com/200'}
                    alt={view.viewer_profile.username}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h3 className="text-white font-bold text-lg">@{view.viewer_profile.username}, {view.viewer_profile.age}</h3>
                  <p className="text-white/70 text-sm">
                    {new Date(view.timestamp).toLocaleDateString()}
                  </p>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhoViewedMe;