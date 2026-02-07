import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { MessageCircle, Search, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DMs = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'favs'
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchMatches();
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const stored = localStorage.getItem('favorite_matches');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const toggleFavorite = (matchId) => {
    const newFavorites = favorites.includes(matchId)
      ? favorites.filter(id => id !== matchId)
      : [...favorites, matchId];
    setFavorites(newFavorites);
    localStorage.setItem('favorite_matches', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch last message for each match
      const matchesWithMessages = await Promise.all(
        response.data.map(async (match) => {
          try {
            const messagesResponse = await axios.get(`${API}/messages/${match.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const messages = messagesResponse.data;
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            return { ...match, lastMessage };
          } catch (error) {
            return { ...match, lastMessage: null };
          }
        })
      );
      
      // Sort by most recent message
      matchesWithMessages.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
      });
      
      setMatches(matchesWithMessages);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    // Filter by tab
    if (activeTab === 'favs' && !favorites.includes(match.id)) {
      return false;
    }
    
    // Filter by search
    if (searchQuery && !match.other_user?.username?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950" data-testid="dms-page">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4" style={{fontFamily: 'Space Grotesk'}}>
            <MessageCircle className="inline w-8 h-8 mr-2" />
            DMs
          </h1>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-purple-600'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              All DMs
            </button>
            <button
              onClick={() => setActiveTab('favs')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'favs'
                  ? 'bg-white text-purple-600'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xl mr-1">⭐️</span>
              Favs
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="input-field pl-12"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        {filteredMatches.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MessageCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-white/70 mb-6">
              {searchQuery ? 'Try a different search' : 'Start swiping to match with people!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/smash-or-pass')}
                className="btn-primary"
              >
                Start Swiping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match) => (
              match.other_user && (
                <div
                  key={match.id}
                  className="glass-card p-4 hover:scale-[1.02] transition-transform relative"
                  data-testid="conversation-item"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(match.id);
                    }}
                    className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-2 hover:bg-black/70"
                  >
                    <Star
                      className="w-5 h-5"
                      fill={favorites.includes(match.id) ? '#FFD700' : 'none'}
                      stroke={favorites.includes(match.id) ? '#FFD700' : '#fff'}
                    />
                  </button>

                  <div className="flex gap-4 cursor-pointer" onClick={() => navigate(`/chat/${match.id}`)}>
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      <img
                        src={match.other_user.photos[0] || 'https://via.placeholder.com/60'}
                        alt={match.other_user.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>

                    {/* Message Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-white font-bold text-lg truncate">
                          @{match.other_user.username}, {match.other_user.age}
                        </h3>
                        {match.lastMessage && (
                          <span className="text-white/60 text-sm flex-shrink-0 ml-2">
                            {formatTime(match.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {match.lastMessage ? (
                        <p className="text-white/70 text-sm truncate">
                          {match.lastMessage.message_type === 'photo' ? '📷 Photo' :
                           match.lastMessage.message_type === 'location' ? '📍 Location' :
                           match.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-white/50 text-sm italic">
                          Start a conversation...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default DMs;
