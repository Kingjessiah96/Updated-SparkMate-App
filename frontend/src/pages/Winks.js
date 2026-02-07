import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Smile, ArrowLeft, Eye, Heart, Crown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/ProfileView';

const Winks = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('winks'); // 'winks', 'viewed', 'smashes'
  const [winks, setWinks] = useState([]);
  const [views, setViews] = useState([]);
  const [smashes, setSmashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetchWinks();
    checkProStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'viewed' && isPro) {
      fetchViews();
    } else if (activeTab === 'smashes' && isPro) {
      fetchSmashes();
    }
  }, [activeTab]);

  const checkProStatus = async () => {
    try {
      const response = await axios.get(`${API}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsPro(response.data.is_pro);
    } catch (error) {
      console.error('Failed to check pro status');
    }
  };

  const fetchWinks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/winks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWinks(response.data);
    } catch (error) {
      toast.error('Failed to load winks');
    } finally {
      setLoading(false);
    }
  };

  const fetchViews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/profile-views`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViews(response.data);
    } catch (error) {
      toast.error('Failed to load profile views');
    } finally {
      setLoading(false);
    }
  };

  const fetchSmashes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSmashes(response.data);
    } catch (error) {
      toast.error('Failed to load smashes');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/who-liked-me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikes(response.data);
    } catch (error) {
      toast.error('Failed to load likes');
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

  const handleWinkBack = async (userId) => {
    try {
      await axios.post(
        `${API}/wink`,
        { target_user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Winked back! 😉');
    } catch (error) {
      toast.error('Failed to wink back');
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

  const renderContent = () => {
    if (activeTab === 'viewed') {
      if (!isPro) {
        return (
          <div className="glass-card p-12 text-center">
            <Crown className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <p className="text-white text-xl mb-4">Pro Feature</p>
            <p className="text-white/70 mb-6">Upgrade to Pro to see who viewed your profile</p>
            <button onClick={() => navigate('/subscription/upgrade')} className="btn-primary">
              Upgrade to Pro
            </button>
          </div>
        );
      }

      if (loading) return <div className="text-center text-white text-xl py-20">Loading...</div>;

      if (views.length === 0) {
        return (
          <div className="glass-card p-12 text-center">
            <Eye className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No profile views yet</p>
            <p className="text-white/70">When someone views your profile, they'll appear here</p>
          </div>
        );
      }

      return (
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
      );
    }

    if (activeTab === 'smashes') {
      if (!isPro) {
        return (
          <div className="glass-card p-12 text-center">
            <Crown className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <p className="text-white text-xl mb-4">Pro Feature</p>
            <p className="text-white/70 mb-6">Upgrade to Pro to see who wants to hookup with you</p>
            <button onClick={() => navigate('/subscription/upgrade')} className="btn-primary">
              Upgrade to Pro
            </button>
          </div>
        );
      }

      if (loading) return <div className="text-center text-white text-xl py-20">Loading...</div>;

      if (smashes.length === 0) {
        return (
          <div className="glass-card p-12 text-center">
            <Heart className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No smashes yet</p>
            <p className="text-white/70">This will show you when someone wants to hookup with you</p>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {smashes.map((smash) => (
            smash.other_user && (
              <div
                key={smash.id}
                className="glass-card-dark p-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => openProfile(smash.other_user.user_id)}
                data-testid="smash-card"
              >
                <img
                  src={smash.other_user.photos[0] || 'https://via.placeholder.com/200'}
                  alt={smash.other_user.username}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="text-white font-bold text-lg">@{smash.other_user.username}, {smash.other_user.age}</h3>
                <p className="text-white/70 text-sm mb-3">
                  Smashed {new Date(smash.matched_at).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chat/${smash.id}`);
                  }}
                  className="btn-primary w-full py-2 text-sm"
                >
                  💬 Message
                </button>
              </div>
            )
          ))}
        </div>
      );
    }

    // Default: Winks tab
    if (loading) return <div className="text-center text-white text-xl py-20">Loading...</div>;

    if (winks.length === 0) {
      return (
        <div className="glass-card p-12 text-center">
          <Smile className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">No winks yet</p>
          <p className="text-white/70">When someone winks at you, they'll appear here</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {winks.map((wink) => (
          wink.sender_profile && (
            <div
              key={wink.id}
              className="glass-card-dark p-3"
              data-testid="wink-card"
            >
              <div
                className="cursor-pointer"
                onClick={() => openProfile(wink.sender_id)}
              >
                <div className="relative">
                  <img
                    src={wink.sender_profile.photos[0] || 'https://via.placeholder.com/200'}
                    alt={wink.sender_profile.username}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-2">
                    <Smile className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg">@{wink.sender_profile.username}, {wink.sender_profile.age}</h3>
                <p className="text-white/70 text-sm mb-3">
                  {new Date(wink.timestamp).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleWinkBack(wink.sender_id)}
                className="btn-secondary w-full py-2 text-sm"
                data-testid="wink-back-button"
              >
                <Smile className="inline w-4 h-4 mr-1" />
                Wink Back
              </button>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-yellow-700 via-yellow-600 to-yellow-800" data-testid="winks-page">
      {selectedProfile && (
        <ProfileView profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}

      <div className="max-w-4xl mx-auto p-4">
        <div className="glass-card p-4 mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex-1" style={{fontFamily: 'Space Grotesk'}}>
            Activity
          </h1>
          {isPro && <Crown className="w-6 h-6 text-yellow-300" />}
        </div>

        {/* Tabs */}
        <div className="glass-card p-2 mb-6 flex gap-2" data-testid="tabs">
          <button
            onClick={() => setActiveTab('winks')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'winks'
                ? 'bg-white text-purple-600'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            data-testid="winks-tab"
          >
            <span className="text-xl mr-1">😉</span>
            Winks
          </button>
          <button
            onClick={() => setActiveTab('viewed')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'viewed'
                ? 'bg-white text-purple-600'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            data-testid="viewed-tab"
          >
            <span className="text-xl mr-1">👀</span>
            Viewed Me
            {!isPro && <Crown className="inline w-4 h-4 ml-1 text-yellow-300" />}
          </button>
          <button
            onClick={() => setActiveTab('smashes')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'smashes'
                ? 'bg-white text-purple-600'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            data-testid="smashes-tab"
          >
            <span className="text-xl mr-1">💥</span>
            Smashes
            {!isPro && <Crown className="inline w-4 h-4 ml-1 text-yellow-300" />}
          </button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Winks;