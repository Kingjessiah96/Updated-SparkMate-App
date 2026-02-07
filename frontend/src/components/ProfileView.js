import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { X, ChevronLeft, ChevronRight, Lock, ChevronUp, Smile, ExternalLink, MoreVertical } from 'lucide-react';

const ProfileView = ({ profile, onClose }) => {
  const { token, profile: myProfile } = useContext(AuthContext);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [viewingPrivate, setViewingPrivate] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [winkSent, setWinkSent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    // Detect potential screenshot attempts on private photos
    const handleVisibilityChange = () => {
      if (viewingPrivate && document.hidden) {
        setShowWarning(true);
        logScreenshotAttempt();
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    const handleBlur = () => {
      if (viewingPrivate) {
        setShowWarning(true);
        logScreenshotAttempt();
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [viewingPrivate]);

  const logScreenshotAttempt = async () => {
    try {
      await axios.post(
        `${API}/log-screenshot-attempt`,
        { target_user_id: profile.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to log screenshot attempt');
    }
  };

  if (!profile) return null;

  const allPhotos = profile.photos || [];
  const hasPrivateAlbum = profile.has_private_album;
  const canViewPrivate = profile.private_photos && profile.private_photos.length > 0;

  const nextPhoto = () => {
    if (currentPhotoIndex < allPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const requestPrivateAlbum = async () => {
    try {
      await axios.post(
        `${API}/private-album/request`,
        { target_user_id: profile.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Request sent!');
      setRequestSent(true);
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  const sendWink = async () => {
    try {
      await axios.post(
        `${API}/wink`,
        { target_user_id: profile.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Wink sent! 😉');
      setWinkSent(true);
    } catch (error) {
      toast.error('Failed to send wink');
    }
  };

  const handleBlock = async () => {
    try {
      await axios.post(
        `${API}/block-user`,
        { blocked_user_id: profile.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User blocked successfully');
      setShowMenu(false);
      onClose();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }
    
    try {
      await axios.post(
        `${API}/report-user`,
        { 
          reported_user_id: profile.user_id,
          reason: reportReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Report submitted successfully');
      setShowReportModal(false);
      setReportReason('');
      setShowMenu(false);
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden" data-testid="profile-view">
      {/* Screenshot Warning */}
      {showWarning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl">
          <p className="font-bold text-lg">⚠️ Screenshot Detected</p>
          <p className="text-sm">This action has been logged</p>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-bold mb-4">Report User</h3>
            <textarea
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 mb-4 min-h-32"
              placeholder="Please describe the reason for reporting this user..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReport}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600"
              >
                Submit Report
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg font-bold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Three-dot menu */}
      <div className="absolute top-4 right-20 z-50">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-12 h-12 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/80"
          data-testid="menu-button"
        >
          <MoreVertical className="w-6 h-6" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            <button
              onClick={handleBlock}
              className="w-full px-4 py-3 text-left text-white hover:bg-red-600 transition-colors flex items-center gap-2"
              data-testid="block-button"
            >
              <X className="w-4 h-4" />
              Block User
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                setShowReportModal(true);
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-red-600 transition-colors flex items-center gap-2 border-t border-gray-700"
              data-testid="report-button"
            >
              ⚠️ Report User
            </button>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm"
        data-testid="close-profile-button"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Wink button */}
      <button
        onClick={sendWink}
        disabled={winkSent}
        className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full bg-yellow-400 text-white font-bold flex items-center gap-2 backdrop-blur-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
        data-testid="wink-button"
      >
        <Smile className="w-5 h-5" />
        {winkSent ? 'Winked!' : 'Wink'}
      </button>

      {/* Photo viewer - Full screen */}
      <div className="relative h-full w-full">
        {allPhotos.length > 0 ? (
          <>
            <img
              src={allPhotos[currentPhotoIndex]}
              alt={profile.username}
              className="w-full h-full object-cover"
            />

            {/* Photo navigation */}
            {allPhotos.length > 1 && (
              <>
                {currentPhotoIndex > 0 && (
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm"
                    data-testid="prev-photo-button"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}
                {currentPhotoIndex < allPhotos.length - 1 && (
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm"
                    data-testid="next-photo-button"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}

                {/* Photo indicators */}
                <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 px-4">
                  {allPhotos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentPhotoIndex ? 'w-10 bg-white' : 'w-6 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <p className="text-white text-2xl">No Photos</p>
          </div>
        )}

        {/* Profile info panel - Collapsible from bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent transition-all duration-300 ease-out ${
            infoExpanded ? 'h-[80vh]' : 'h-[140px]'
          } overflow-y-auto`}
          data-testid="profile-info"
        >
          {/* Swipe up indicator */}
          <div className="flex justify-center py-2">
            <button
              onClick={() => setInfoExpanded(!infoExpanded)}
              className="w-12 h-1 bg-white/50 rounded-full mb-2"
              data-testid="expand-toggle"
            />
          </div>

          <div className="px-6 pb-6">
            {/* Basic info - always visible */}
            <div className="mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                @{profile.username}, {profile.age}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-white/90 text-base">
                  {profile.gender_identity} • {profile.pronouns}
                </p>
                {profile.distance && (
                  <p className="text-white/80 text-sm">📍 {profile.distance} km away</p>
                )}
              </div>
              {(profile.height || profile.weight) && (
                <p className="text-white/80 text-sm mt-1">
                  {profile.height && <span>{profile.height}</span>}
                  {profile.height && profile.weight && <span> • </span>}
                  {profile.weight && <span>{profile.weight}</span>}
                </p>
              )}
            </div>

            {/* Expanded info */}
            {infoExpanded && (
              <div className="space-y-6 animate-fadeIn">
                {profile.available_now && (
                  <div className="bg-green-500/30 border-2 border-green-400 rounded-xl p-4">
                    <p className="text-green-300 font-bold text-lg">✨ Available Right Now</p>
                  </div>
                )}

                {profile.bio && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">About</h3>
                    <p className="text-white/90 text-base leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {profile.position && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Position</h3>
                    <p className="text-white/90 text-base">{profile.position}</p>
                  </div>
                )}

                {profile.tribe && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Tribe</h3>
                    <p className="text-white/90 text-base">{profile.tribe}</p>
                  </div>
                )}

                {profile.hiv_status && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">HIV Status</h3>
                    <p className="text-white/90 text-base">{profile.hiv_status}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-white font-bold text-xl mb-3">Looking For</h3>
                  <p className="text-white/90 text-base">{profile.looking_for}</p>
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, i) => (
                        <span key={i} className="badge">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Social Media</h3>
                    <div className="space-y-2">
                      {Object.entries(profile.social_links).map(([platform, username]) => (
                        <a
                          key={platform}
                          href={username.startsWith('http') ? username : `https://${username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors"
                        >
                          <div>
                            <p className="text-white font-bold">{platform}</p>
                            <p className="text-white/70 text-sm">{username}</p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-white/70" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Private Album Section */}
                {hasPrivateAlbum && !canViewPrivate && (
                  <div className="bg-purple-500/30 border-2 border-purple-400 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="w-7 h-7 text-purple-300" />
                      <h3 className="text-white font-bold text-xl">Private Album</h3>
                    </div>
                    <p className="text-white/80 mb-4 text-base">This user has private photos. Request access to view them.</p>
                    <button
                      onClick={requestPrivateAlbum}
                      disabled={requestSent}
                      className="btn-primary w-full py-3"
                      data-testid="request-private-album-button"
                    >
                      {requestSent ? 'Request Sent' : 'Request Access'}
                    </button>
                  </div>
                )}

                {canViewPrivate && (
                  <div className="bg-purple-500/30 border-2 border-purple-400 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="w-7 h-7 text-purple-300" />
                      <h3 className="text-white font-bold text-xl">Private Album (Unlocked)</h3>
                    </div>
                    <div className="bg-yellow-500/30 border-2 border-yellow-400 rounded-lg p-3 mb-4">
                      <p className="text-yellow-300 text-sm font-bold">⚠️ Screenshots are monitored and logged</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {profile.private_photos.map((photo, i) => (
                        <div 
                          key={i} 
                          className="relative"
                          onMouseEnter={() => setViewingPrivate(true)}
                          onMouseLeave={() => setViewingPrivate(false)}
                          onClick={() => setViewingPrivate(true)}
                        >
                          <img src={photo} alt="Private" className="w-full h-28 object-cover rounded-lg" />
                          {/* Watermark overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-white/40 font-bold text-xs transform -rotate-45">
                              {myProfile?.name || 'VIEWER'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Swipe up hint */}
            {!infoExpanded && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => setInfoExpanded(true)}
                  className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-6 h-6 animate-bounce" />
                  <span className="text-xs font-medium">Swipe up for more</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;