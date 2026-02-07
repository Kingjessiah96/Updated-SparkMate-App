import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SmashOrPass = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [swipesRemaining, setSwipesRemaining] = useState(50);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 99,
    maxDistance: 100
  });

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
      const response = await axios.get(
        `${API}/discovery/profiles?min_age=${filters.minAge}&max_age=${filters.maxAge}&max_distance=${filters.maxDistance}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfiles(response.data);
      setCurrentIndex(0);
      setCurrentPhotoIndex(0);
      setShowDetails(false);
    } catch (error) {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchProfiles();
    toast.success('Filters applied!');
  };

  const currentProfile = profiles[currentIndex];

  const handleSmash = async () => {
    if (!currentProfile) return;
    
    // Check swipe limit for non-Pro users
    if (!isPro && swipesRemaining <= 0) {
      toast.error('Daily swipe limit reached! Upgrade to Pro for unlimited swipes.');
      return;
    }
    
    setSwipeDirection('right');
    setTimeout(async () => {
      try {
        const response = await axios.post(
          `${API}/like`,
          { target_user_id: currentProfile.user_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.is_match) {
          toast.success("💥 It's a Match!");
        } else {
          toast.success('💥 Smash!');
        }
        
        // Decrement swipes for non-Pro users
        if (!isPro) {
          setSwipesRemaining(prev => prev - 1);
        }
        
        moveToNext();
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error('Daily swipe limit reached! Upgrade to Pro for unlimited swipes.');
        } else {
          toast.error('Failed to smash');
        }
        setSwipeDirection(null);
      }
    }, 300);
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    
    // Check swipe limit for non-Pro users
    if (!isPro && swipesRemaining <= 0) {
      toast.error('Daily swipe limit reached! Upgrade to Pro for unlimited swipes.');
      return;
    }
    
    setSwipeDirection('left');
    setTimeout(async () => {
      try {
        await axios.post(
          `${API}/pass`,
          { target_user_id: currentProfile.user_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Decrement swipes for non-Pro users
        if (!isPro) {
          setSwipesRemaining(prev => prev - 1);
        }
        
        moveToNext();
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error('Daily swipe limit reached! Upgrade to Pro for unlimited swipes.');
        } else {
          toast.error('Failed to pass');
        }
        setSwipeDirection(null);
      }
    }, 300);
  };

  const moveToNext = () => {
    setSwipeDirection(null);
    setCurrentPhotoIndex(0);
    setShowDetails(false);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setProfiles([]);
      toast('No more profiles! Check back later.');
    }
  };

  const nextPhoto = () => {
    if (currentProfile && currentPhotoIndex < currentProfile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handlePass();
    }
    if (isRightSwipe) {
      handleSmash();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 bg-gradient-to-br from-orange-900 via-orange-700 to-orange-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading profiles...</div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen pb-24 bg-gradient-to-br from-orange-900 via-orange-700 to-orange-950" data-testid="smash-or-pass-page">
        <div className="max-w-2xl mx-auto p-4">
          <div className="glass-card p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4" style={{fontFamily: 'Space Grotesk'}}>
              💥 Smash or Pass
            </h1>
            <p className="text-white/80 text-lg mb-6">No more profiles available right now!</p>
            <button
              onClick={() => navigate('/discover')}
              className="btn-primary"
            >
              Go to Discovery
            </button>
          </div>
        </div>
        <Navbar />
      </div>
    );
  }

  const cardStyle = {
    transform: swipeDirection === 'right' ? 'translateX(100%) rotate(20deg)' : 
                swipeDirection === 'left' ? 'translateX(-100%) rotate(-20deg)' : 
                'translateX(0) rotate(0)',
    transition: swipeDirection ? 'transform 0.3s ease-out' : 'none',
    opacity: swipeDirection ? 0 : 1
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-orange-900 via-orange-700 to-orange-950" data-testid="smash-or-pass-page">
      <div className="max-w-md mx-auto p-4 pt-6">
        {/* Header with Filter Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white" style={{fontFamily: 'Space Grotesk'}}>
            💥 Smash or Pass
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition-all"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Swipe Counter for Non-Pro Users */}
        {!isPro && (
          <div className="glass-card p-3 mb-4 text-center">
            <p className="text-white text-sm">
              {swipesRemaining > 0 ? (
                <>
                  <span className="font-bold text-lg">{swipesRemaining}</span> swipes remaining today
                </>
              ) : (
                <span className="text-red-300 font-bold">Daily limit reached!</span>
              )}
            </p>
            {swipesRemaining <= 10 && swipesRemaining > 0 && (
              <button
                onClick={() => navigate('/subscription/upgrade')}
                className="text-yellow-300 text-xs underline mt-1"
              >
                Get unlimited swipes with Pro
              </button>
            )}
            {swipesRemaining === 0 && (
              <button
                onClick={() => navigate('/subscription/upgrade')}
                className="btn-primary mt-2 text-sm py-2"
              >
                Upgrade to Pro for Unlimited Swipes
              </button>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card p-6 mb-6 animate-slide-up">
            <h2 className="text-white font-bold text-xl mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">Age Range</label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      className="input-field text-center"
                      value={filters.minAge}
                      onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value) || 18})}
                      min="18"
                      max="99"
                    />
                    <p className="text-white/60 text-xs mt-1 text-center">Min</p>
                  </div>
                  <span className="text-white text-xl">-</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      className="input-field text-center"
                      value={filters.maxAge}
                      onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value) || 99})}
                      min="18"
                      max="99"
                    />
                    <p className="text-white/60 text-xs mt-1 text-center">Max</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">
                  Distance: {filters.maxDistance} km
                </label>
                <input
                  type="range"
                  className="w-full"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                  min="1"
                  max="200"
                  step="5"
                />
                <div className="flex justify-between text-white/60 text-xs mt-1">
                  <span>1 km</span>
                  <span>200 km</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={applyFilters}
                  className="btn-primary flex-1"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Stack */}
        <div className="relative">
          {/* Main Card */}
          <div
            className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl"
            style={cardStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Photo */}
            <div className="relative h-full w-full">
              <img
                src={currentProfile.photos[currentPhotoIndex] || 'https://via.placeholder.com/400x600?text=No+Photo'}
                alt={currentProfile.username}
                className="w-full h-full object-cover cursor-pointer"
                onClick={nextPhoto}
              />

              {/* Photo indicators */}
              {currentProfile.photos.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
                  {currentProfile.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-1 rounded-full ${
                        idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo navigation buttons */}
              {currentProfile.photos.length > 1 && (
                <>
                  {currentPhotoIndex > 0 && (
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  {currentPhotoIndex < currentProfile.photos.length - 1 && (
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </>
              )}

              {/* Basic Info - Always visible */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                <div className="flex justify-between items-end">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-1" style={{fontFamily: 'Space Grotesk'}}>
                      @{currentProfile.username}, {currentProfile.age}
                    </h2>
                    <p className="text-white/90 text-base">
                      {currentProfile.gender_identity} • {currentProfile.pronouns}
                    </p>
                    {currentProfile.distance && (
                      <p className="text-white/80 text-sm mt-1">📍 {currentProfile.distance} km away</p>
                    )}
                  </div>
                  
                  {/* Toggle details button */}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30"
                  >
                    {showDetails ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Panel - Slides up from bottom */}
          {showDetails && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg rounded-t-2xl p-6 max-h-[400px] overflow-y-auto animate-slide-up z-10">
              <div className="space-y-4">
                {currentProfile.bio && (
                  <div>
                    <h3 className="text-white font-bold mb-2">About</h3>
                    <p className="text-white/80">{currentProfile.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-white font-bold mb-2">Looking For</h3>
                  <p className="text-white/80">{currentProfile.looking_for}</p>
                </div>

                {currentProfile.interests && currentProfile.interests.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.interests.map((interest, i) => (
                        <span key={i} className="badge">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}

                {currentProfile.position && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Position</h3>
                    <p className="text-white/80">{currentProfile.position}</p>
                  </div>
                )}

                {currentProfile.tribe && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Tribe</h3>
                    <p className="text-white/80">{currentProfile.tribe}</p>
                  </div>
                )}

                {currentProfile.hiv_status && (
                  <div>
                    <h3 className="text-white font-bold mb-2">HIV Status</h3>
                    <p className="text-white/80">{currentProfile.hiv_status}</p>
                  </div>
                )}

                {currentProfile.height && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Height</h3>
                    <p className="text-white/80">{currentProfile.height}</p>
                  </div>
                )}

                {currentProfile.weight && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Weight</h3>
                    <p className="text-white/80">{currentProfile.weight}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-8 mt-8">
          <button
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-red-400 flex items-center justify-center hover:bg-red-400/20 hover:scale-110 transition-all shadow-lg"
            disabled={swipeDirection !== null}
          >
            <span className="text-4xl">🙅🏻</span>
          </button>

          <button
            onClick={handleSmash}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center hover:scale-110 transition-all shadow-2xl"
            disabled={swipeDirection !== null}
          >
            <span className="text-5xl">💥</span>
          </button>
        </div>

        {/* Swipe instructions */}
        <p className="text-white/60 text-center text-sm mt-6">
          Swipe left or tap 🙅🏻 to pass • Swipe right or tap 💥 to smash
        </p>
      </div>

      <Navbar />
    </div>
  );
};

export default SmashOrPass;
