import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Heart, X, Grid3x3, Map as MapIcon, Sparkles, Crown, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProfileView from '../components/ProfileView';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const Discovery = () => {
  const { token, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [filters, setFilters] = useState({
    online_only: false,
    min_age: 18,
    max_age: 99,
    max_distance: 25,
    position: '',
    tribe: '',
    looking_for: ''
  });

  // Fix Leaflet default icon issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    checkProStatus();
    fetchProfiles();
  }, []);

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

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.online_only) params.append('online_only', 'true');
      if (filters.min_age) params.append('min_age', filters.min_age);
      if (filters.max_age) params.append('max_age', filters.max_age);
      if (filters.max_distance) params.append('max_distance', filters.max_distance);
      if (filters.position) params.append('position', filters.position);
      if (filters.tribe) params.append('tribe', filters.tribe);
      if (filters.looking_for) params.append('looking_for', filters.looking_for);

      const response = await axios.get(`${API}/discovery/profiles?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(response.data);
      setCurrentIndex(0);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail, {
          action: {
            label: 'Go Pro',
            onClick: () => navigate('/subscription/upgrade')
          }
        });
      } else {
        toast.error('Failed to load profiles');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchProfiles();
  };

  const handleLike = async (userId) => {
    try {
      const response = await axios.post(`${API}/like`, 
        { target_user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.is_match) {
        toast.success('🎉 It\'s a Match!', {
          description: 'You can now start chatting!'
        });
      }
      
      if (viewMode === 'swipe') {
        setSwipeDirection('right');
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setSwipeDirection(null);
        }, 300);
      } else {
        setProfiles(profiles.filter(p => p.user_id !== userId));
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to like');
    }
  };

  const handlePass = async (userId) => {
    try {
      await axios.post(`${API}/pass`, 
        { target_user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (viewMode === 'swipe') {
        setSwipeDirection('left');
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setSwipeDirection(null);
        }, 300);
      } else {
        setProfiles(profiles.filter(p => p.user_id !== userId));
      }
    } catch (error) {
      toast.error('Failed to pass');
    }
  };

  const currentProfile = profiles[currentIndex];

  const openProfile = async (profile) => {
    try {
      const response = await axios.get(`${API}/profile/${profile.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-red-900 via-red-800 to-red-950" data-testid="discovery-page">
      {selectedProfile && (
        <ProfileView profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="glass-card p-4 mb-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{fontFamily: 'Space Grotesk'}}>
            <Sparkles className="inline w-6 h-6 mr-2" />Nearby
          </h1>
          <div className="flex gap-2">
            <button
              data-testid="filter-button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-full transition-all ${showFilters ? 'bg-white text-purple-600' : 'bg-white/30 text-white'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              data-testid="grid-view-button"
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-purple-600' : 'bg-white/30 text-white'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              data-testid="map-view-button"
              onClick={() => setViewMode('map')}
              className={`p-3 rounded-full transition-all ${viewMode === 'map' ? 'bg-white text-purple-600' : 'bg-white/30 text-white'}`}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-card p-6 mb-6" data-testid="filter-panel">
            <h2 className="text-xl font-bold text-white mb-4">Filters</h2>
            <div className="space-y-4">
              {/* Online Only */}
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.online_only}
                  onChange={(e) => setFilters({...filters, online_only: e.target.checked})}
                  className="mr-3 w-5 h-5"
                  data-testid="online-filter"
                />
                <span className="font-medium">Show only online users</span>
              </label>

              {/* Age Range */}
              <div>
                <label className="text-white font-medium mb-2 block">Age Range: {filters.min_age} - {filters.max_age}</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={filters.min_age}
                      onChange={(e) => setFilters({...filters, min_age: parseInt(e.target.value)})}
                      className="w-full"
                      data-testid="min-age-slider"
                    />
                    <p className="text-white/70 text-sm">Min: {filters.min_age}</p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={filters.max_age}
                      onChange={(e) => setFilters({...filters, max_age: parseInt(e.target.value)})}
                      className="w-full"
                      data-testid="max-age-slider"
                    />
                    <p className="text-white/70 text-sm">Max: {filters.max_age}</p>
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="text-white font-medium mb-2 block">Distance: {filters.max_distance} km</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={filters.max_distance}
                  onChange={(e) => setFilters({...filters, max_distance: parseInt(e.target.value)})}
                  className="w-full"
                  data-testid="distance-slider"
                />
                <p className="text-white/70 text-sm">Max distance: {filters.max_distance} km</p>
              </div>

              {/* Position */}
              <div>
                <label className="text-white font-medium mb-2 block">Position</label>
                <select
                  value={filters.position}
                  onChange={(e) => setFilters({...filters, position: e.target.value})}
                  className="input-field"
                  data-testid="position-filter"
                >
                  <option value="">All</option>
                  <option value="Top">Top</option>
                  <option value="Bottom">Bottom</option>
                  <option value="Verse">Verse</option>
                  <option value="Side">Side</option>
                </select>
              </div>

              {/* Tribe */}
              <div>
                <label className="text-white font-medium mb-2 block">Tribe</label>
                <select
                  value={filters.tribe}
                  onChange={(e) => setFilters({...filters, tribe: e.target.value})}
                  className="input-field"
                  data-testid="tribe-filter"
                >
                  <option value="">All</option>
                  <option value="Twink">Twink</option>
                  <option value="Bear">Bear</option>
                  <option value="Otter">Otter</option>
                  <option value="Daddy">Daddy</option>
                  <option value="Jock">Jock</option>
                  <option value="Pup">Pup</option>
                  <option value="Geek">Geek</option>
                  <option value="Leather">Leather</option>
                  <option value="Muscle">Muscle</option>
                  <option value="Chub">Chub</option>
                  <option value="Trans">Trans</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Looking For */}
              <div>
                <label className="text-white font-medium mb-2 block">Looking For</label>
                <select
                  value={filters.looking_for}
                  onChange={(e) => {
                    if (e.target.value === 'Smash RN' && !isPro) {
                      toast.error('Upgrade to Pro to filter by "Smash RN"');
                      return;
                    }
                    setFilters({...filters, looking_for: e.target.value});
                  }}
                  className="input-field"
                  data-testid="looking-for-filter"
                >
                  <option value="">All</option>
                  <option value="Smash RN">
                    Smash RN {!isPro && '👑'}
                  </option>
                  <option value="Dating">Dating / Casual</option>
                  <option value="Friends with Benefits">Friends with Benefits</option>
                  <option value="Relationship">Long-term Relationship</option>
                  <option value="Friends">Friends Only</option>
                  <option value="Chat">Chat / Online</option>
                  <option value="Networking">Networking</option>
                </select>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyFilters}
                className="btn-primary w-full"
                data-testid="apply-filters-button"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-white text-xl py-20">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white text-xl mb-4">No profiles to show</p>
            <button onClick={fetchProfiles} className="btn-primary" data-testid="reload-button">Reload</button>
          </div>
        ) : viewMode === 'map' ? (
          /* Map View */
          <div className="glass-card p-2" style={{height: '70vh'}} data-testid="map-view">
            <MapContainer
              center={profile?.latitude ? [profile.latitude, profile.longitude] : [37.7749, -122.4194]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '20px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {profiles.map((prof) => (
                prof.latitude && prof.longitude && (
                  <Marker
                    key={prof.user_id}
                    position={[prof.latitude, prof.longitude]}
                  >
                    <Popup>
                      <div className="text-center cursor-pointer" onClick={() => openProfile(prof)}>
                        <img
                          src={prof.photos[0] || 'https://via.placeholder.com/100'}
                          alt={prof.name}
                          className="w-24 h-24 object-cover rounded-lg mb-2 mx-auto"
                        />
                        <p className="font-bold">{prof.name}, {prof.age}</p>
                        {prof.distance && <p className="text-sm text-gray-600">{prof.distance} km away</p>}
                        <button className="mt-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                          View Profile
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="grid-view">
            {profiles.map((profile) => (
              <div
                key={profile.user_id}
                className="glass-card-dark p-3 group hover:scale-105 transition-transform cursor-pointer"
                data-testid="profile-card"
                onClick={() => openProfile(profile)}
              >
                <div className="relative mb-3">
                  <img
                    src={profile.photos[0] || 'https://via.placeholder.com/300x400?text=No+Photo'}
                    alt={profile.username}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  {profile.distance && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {profile.distance} km
                    </div>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">@{profile.username}, {profile.age}</h3>
                <p className="text-white/70 text-sm mb-3">{profile.gender_identity}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePass(profile.user_id)}
                    className="flex-1 py-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                  >
                    <X className="inline w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleLike(profile.user_id)}
                    className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white hover:scale-105 transition-transform"
                  >
                    <Heart className="inline w-4 h-4" fill="white" />
                  </button>
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

export default Discovery;