import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Heart, ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/ProfileView';

const WhoLikedMe = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const response = await axios.get(`${API}/who-liked-me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikes(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('This is a Pro feature!');
        navigate('/subscription/upgrade');
      } else {
        toast.error('Failed to load likes');
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

  const handleLikeBack = async (userId) => {
    try {
      const response = await axios.post(
        `${API}/like`,
        { target_user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.is_match) {
        toast.success('🎉 It\'s a Match!');
      }
      fetchLikes();
    } catch (error) {
      toast.error('Failed to like back');
    }
  };

  return (
    <div className="min-h-screen pb-24" data-testid="who-liked-me-page">
      {selectedProfile && (
        <ProfileView profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}

      <div className="max-w-4xl mx-auto p-4">
        <div className="glass-card p-4 mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex-1" style={{fontFamily: 'Space Grotesk'}}>
            <Heart className="inline w-7 h-7 mr-2" fill="white" />
            Who Liked Me
          </h1>
          <Crown className="w-6 h-6 text-yellow-300" />
        </div>

        {loading ? (
          <div className="text-center text-white text-xl py-20">Loading...</div>
        ) : likes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Heart className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No likes yet</p>
            <p className="text-white/70">When someone likes you, they'll appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {likes.map((like) => (
              like.profile && (
                <div
                  key={like.id}
                  className="glass-card-dark p-3"
                  data-testid="like-card"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => openProfile(like.user_id)}
                  >
                    <img
                      src={like.profile.photos[0] || 'https://via.placeholder.com/200'}
                      alt={like.profile.username}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="text-white font-bold text-lg">@{like.profile.username}, {like.profile.age}</h3>
                    <p className="text-white/70 text-sm mb-3">
                      {new Date(like.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {like.already_matched ? (
                    <div className="bg-green-500/30 border border-green-400 rounded-lg py-2 text-center">
                      <p className="text-green-300 font-bold text-sm">✓ Matched</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLikeBack(like.user_id)}
                      className="btn-primary w-full py-2 text-sm"
                      data-testid="like-back-button"
                    >
                      <Heart className="inline w-4 h-4 mr-1" fill="white" />
                      Like Back
                    </button>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhoLikedMe;