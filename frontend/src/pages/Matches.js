import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Matches = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(response.data);
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" data-testid="matches-page">
      <div className="max-w-4xl mx-auto p-4">
        <div className="glass-card p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center" style={{fontFamily: 'Space Grotesk'}}>
            <Heart className="inline w-8 h-8 mr-2" fill="white" />
            Your Matches
          </h1>
        </div>

        {loading ? (
          <div className="text-center text-white text-xl py-20">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white text-xl mb-4">No matches yet</p>
            <p className="text-white/70 mb-6">Keep swiping to find your perfect match!</p>
            <button onClick={() => navigate('/discover')} className="btn-primary" data-testid="discover-button">Start Browsing</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="matches-grid">
            {matches.map((match) => (
              <div
                key={match.id}
                className="glass-card-dark p-4 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate(`/chat/${match.id}`)}
                data-testid="match-card"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={match.other_user?.photos[0] || 'https://via.placeholder.com/100'}
                    alt={match.other_user?.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-1">
                      {match.other_user?.name}, {match.other_user?.age}
                    </h3>
                    <p className="text-white/70 text-sm mb-2">{match.other_user?.gender_identity}</p>
                    <div className="flex flex-wrap gap-1">
                      {match.other_user?.interests.slice(0, 3).map((interest, i) => (
                        <span key={i} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default Matches;