import { useState, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { User, Cake, Heart, MapPin, Tag, Image, Lock } from 'lucide-react';

const ProfileSetup = () => {
  const { token, fetchUserData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    age: '',
    bio: '',
    gender_identity: '',
    pronouns: '',
    height: '',
    weight: '',
    interests: [],
    looking_for: '',
    tribe: '',
    position: '',
    hiv_status: '',
    available_now: false,
    hosting: '',
    photos: [],
    private_photos: [],
    social_links: {},
    latitude: null,
    longitude: null
  });
  const [interestInput, setInterestInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const [privatePhotoInput, setPrivatePhotoInput] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialUsername, setSocialUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Location added!');
        },
        (error) => {
          toast.error('Could not get location');
        }
      );
    }
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      });
      setInterestInput('');
    }
  };

  const removeInterest = (index) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index)
    });
  };

  const addPhoto = () => {
    if (photoInput.trim()) {
      if (formData.photos.length >= 5) {
        toast.error('Maximum 5 photos allowed');
        return;
      }
      setFormData({
        ...formData,
        photos: [...formData.photos, photoInput.trim()]
      });
      setPhotoInput('');
    }
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index)
    });
  };

  const addPrivatePhoto = () => {
    if (privatePhotoInput.trim()) {
      setFormData({
        ...formData,
        private_photos: [...formData.private_photos, privatePhotoInput.trim()]
      });
      setPrivatePhotoInput('');
    }
  };

  const removePrivatePhoto = (index) => {
    setFormData({
      ...formData,
      private_photos: formData.private_photos.filter((_, i) => i !== index)
    });
  };

  const addSocialLink = () => {
    if (socialPlatform && socialUsername.trim()) {
      setFormData({
        ...formData,
        social_links: {
          ...formData.social_links,
          [socialPlatform]: socialUsername.trim()
        }
      });
      setSocialPlatform('');
      setSocialUsername('');
    }
  };

  const removeSocialLink = (platform) => {
    const { [platform]: removed, ...rest } = formData.social_links;
    setFormData({
      ...formData,
      social_links: rest
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/profile`, {
        ...formData,
        age: parseInt(formData.age)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile created!');
      await fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24" data-testid="profile-setup-page">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-6 md:p-8 mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center" style={{fontFamily: 'Space Grotesk'}}>Create Your Profile</h1>
          <p className="text-white opacity-90 text-center mb-8">Let's get to know you!</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block"><User className="inline w-4 h-4 mr-2" />Username</label>
              <input
                data-testid="username-input"
                type="text"
                className="input-field"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Your unique username"
                required
              />
              <p className="text-white/60 text-sm mt-1">This will be displayed on your profile</p>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block"><User className="inline w-4 h-4 mr-2" />Full Name</label>
              <input
                data-testid="name-input"
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Your real name (private)"
                required
              />
              <p className="text-white/60 text-sm mt-1">This will be kept private</p>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block"><Cake className="inline w-4 h-4 mr-2" />Age</label>
              <input
                data-testid="age-input"
                type="number"
                className="input-field"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
                min="18"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Bio</label>
              <textarea
                data-testid="bio-input"
                className="input-field"
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white font-medium mb-2 block">Height</label>
                <select
                  data-testid="height-input"
                  className="input-field"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                >
                  <option value="">Select height...</option>
                  <option value="4'10&quot; (147cm)">4'10" (147cm)</option>
                  <option value="4'11&quot; (150cm)">4'11" (150cm)</option>
                  <option value="5'0&quot; (152cm)">5'0" (152cm)</option>
                  <option value="5'1&quot; (155cm)">5'1" (155cm)</option>
                  <option value="5'2&quot; (157cm)">5'2" (157cm)</option>
                  <option value="5'3&quot; (160cm)">5'3" (160cm)</option>
                  <option value="5'4&quot; (163cm)">5'4" (163cm)</option>
                  <option value="5'5&quot; (165cm)">5'5" (165cm)</option>
                  <option value="5'6&quot; (168cm)">5'6" (168cm)</option>
                  <option value="5'7&quot; (170cm)">5'7" (170cm)</option>
                  <option value="5'8&quot; (173cm)">5'8" (173cm)</option>
                  <option value="5'9&quot; (175cm)">5'9" (175cm)</option>
                  <option value="5'10&quot; (178cm)">5'10" (178cm)</option>
                  <option value="5'11&quot; (180cm)">5'11" (180cm)</option>
                  <option value="6'0&quot; (183cm)">6'0" (183cm)</option>
                  <option value="6'1&quot; (185cm)">6'1" (185cm)</option>
                  <option value="6'2&quot; (188cm)">6'2" (188cm)</option>
                  <option value="6'3&quot; (191cm)">6'3" (191cm)</option>
                  <option value="6'4&quot; (193cm)">6'4" (193cm)</option>
                  <option value="6'5&quot; (196cm)">6'5" (196cm)</option>
                  <option value="6'6&quot; (198cm)">6'6" (198cm)</option>
                  <option value="6'7&quot; (201cm)">6'7" (201cm)</option>
                  <option value="6'8&quot; (203cm)">6'8" (203cm)</option>
                  <option value="6'9&quot; (206cm)">6'9" (206cm)</option>
                  <option value="6'10&quot; (208cm)">6'10" (208cm)</option>
                  <option value="6'11&quot; (211cm)">6'11" (211cm)</option>
                  <option value="7'0&quot; (213cm)">7'0" (213cm)</option>
                </select>
              </div>
              <div>
                <label className="text-white font-medium mb-2 block">Weight</label>
                <select
                  data-testid="weight-input"
                  className="input-field"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                >
                  <option value="">Select weight...</option>
                  <option value="100-120 lbs (45-54 kg)">100-120 lbs (45-54 kg)</option>
                  <option value="120-140 lbs (54-64 kg)">120-140 lbs (54-64 kg)</option>
                  <option value="140-160 lbs (64-73 kg)">140-160 lbs (64-73 kg)</option>
                  <option value="160-180 lbs (73-82 kg)">160-180 lbs (73-82 kg)</option>
                  <option value="180-200 lbs (82-91 kg)">180-200 lbs (82-91 kg)</option>
                  <option value="200-220 lbs (91-100 kg)">200-220 lbs (91-100 kg)</option>
                  <option value="220-240 lbs (100-109 kg)">220-240 lbs (100-109 kg)</option>
                  <option value="240-260 lbs (109-118 kg)">240-260 lbs (109-118 kg)</option>
                  <option value="260-280 lbs (118-127 kg)">260-280 lbs (118-127 kg)</option>
                  <option value="280-300 lbs (127-136 kg)">280-300 lbs (127-136 kg)</option>
                  <option value="300+ lbs (136+ kg)">300+ lbs (136+ kg)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Gender Identity</label>
              <select
                data-testid="gender-input"
                className="input-field"
                value={formData.gender_identity}
                onChange={(e) => setFormData({...formData, gender_identity: e.target.value})}
                required
              >
                <option value="">Select...</option>
                <option value="Man">Man</option>
                <option value="Trans Man">Trans Man</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Genderqueer">Genderqueer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Pronouns</label>
              <select
                data-testid="pronouns-input"
                className="input-field"
                value={formData.pronouns}
                onChange={(e) => setFormData({...formData, pronouns: e.target.value})}
                required
              >
                <option value="">Select...</option>
                <option value="he/him">he/him</option>
                <option value="they/them">they/them</option>
                <option value="he/they">he/they</option>
                <option value="any pronouns">any pronouns</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Position</label>
              <select
                data-testid="position-input"
                className="input-field"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              >
                <option value="">Prefer not to say</option>
                <option value="Top">Top</option>
                <option value="Bottom">Bottom</option>
                <option value="Verse">Verse</option>
                <option value="Side">Side</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Tribe</label>
              <select
                data-testid="tribe-input"
                className="input-field"
                value={formData.tribe}
                onChange={(e) => setFormData({...formData, tribe: e.target.value})}
              >
                <option value="">Prefer not to say</option>
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

            <div>
              <label className="text-white font-medium mb-2 block">HIV Status</label>
              <select
                data-testid="hiv-status-input"
                className="input-field"
                value={formData.hiv_status}
                onChange={(e) => setFormData({...formData, hiv_status: e.target.value})}
              >
                <option value="">Prefer not to say</option>
                <option value="Negative">Negative</option>
                <option value="Negative on PrEP">Negative (on PrEP)</option>
                <option value="Positive">Positive</option>
                <option value="Positive Undetectable">Positive (Undetectable)</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>

            <div>
              <label className="flex items-center text-white font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available_now}
                  onChange={(e) => setFormData({...formData, available_now: e.target.checked})}
                  className="mr-3 w-5 h-5"
                  data-testid="available-now-checkbox"
                />
                Available Right Now
              </label>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block"><Tag className="inline w-4 h-4 mr-2" />Interests</label>
              <div className="flex gap-2 mb-2">
                <input
                  data-testid="interest-input"
                  type="text"
                  className="input-field flex-1"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="Add an interest"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <button type="button" onClick={addInterest} className="btn-secondary" data-testid="add-interest-button">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <span key={index} className="badge cursor-pointer" onClick={() => removeInterest(index)}>
                    {interest} ×
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block"><Heart className="inline w-4 h-4 mr-2" />Looking For</label>
              <select
                data-testid="looking-for-select"
                className="input-field"
                value={formData.looking_for}
                onChange={(e) => setFormData({...formData, looking_for: e.target.value})}
                required
              >
                <option value="">Select...</option>
                <option value="Smash RN">Smash RN</option>
                <option value="Dating">Dating / Casual</option>
                <option value="Friends with Benefits">Friends with Benefits</option>
                <option value="Relationship">Long-term Relationship</option>
                <option value="Friends">Friends Only</option>
                <option value="Chat">Chat / Online</option>
                <option value="Networking">Networking</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Hosting</label>
              <select
                data-testid="hosting-select"
                className="input-field"
                value={formData.hosting}
                onChange={(e) => setFormData({...formData, hosting: e.target.value})}
              >
                <option value="">Select...</option>
                <option value="Can Host">Can Host</option>
                <option value="Cannot Host">Cannot Host</option>
                <option value="Sometimes">Sometimes</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block"><Image className="inline w-4 h-4 mr-2" />Photos (Max 5)</label>
              <div className="flex gap-2 mb-2">
                <input
                  data-testid="photo-input"
                  type="url"
                  className="input-field flex-1"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="Enter photo URL"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
                />
                <button type="button" onClick={addPhoto} className="btn-success" data-testid="add-photo-button">Add</button>
              </div>
              <p className="text-white/70 text-sm mb-2">{formData.photos.length}/5 photos</p>
              <div className="grid grid-cols-3 gap-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt="Profile" className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Private Album (Optional)
              </label>
              <p className="text-white/70 text-sm mb-2">These photos require permission to view</p>
              <div className="flex gap-2 mb-2">
                <input
                  data-testid="private-photo-input"
                  type="url"
                  className="input-field flex-1"
                  value={privatePhotoInput}
                  onChange={(e) => setPrivatePhotoInput(e.target.value)}
                  placeholder="Enter private photo URL"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrivatePhoto())}
                />
                <button type="button" onClick={addPrivatePhoto} className="btn-secondary" data-testid="add-private-photo-button">Add</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {formData.private_photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt="Private" className="w-full h-24 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePrivatePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={getLocation}
                className="btn-success w-full"
                data-testid="location-button"
              >
                <MapPin className="inline w-4 h-4 mr-2" />
                {formData.latitude ? 'Location Added ✓' : 'Add Location'}
              </button>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Social Media Links</label>
              <div className="flex gap-2 mb-2">
                <select
                  value={socialPlatform}
                  onChange={(e) => setSocialPlatform(e.target.value)}
                  className="input-field flex-1"
                  data-testid="social-platform-select"
                >
                  <option value="">Select Platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="Snapchat">Snapchat</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="OnlyFans">OnlyFans</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  value={socialUsername}
                  onChange={(e) => setSocialUsername(e.target.value)}
                  placeholder="Username or link"
                  className="input-field flex-1"
                  data-testid="social-username-input"
                />
                <button type="button" onClick={addSocialLink} className="btn-primary" data-testid="add-social-button">
                  Add
                </button>
              </div>
              {Object.keys(formData.social_links).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(formData.social_links).map(([platform, username]) => (
                    <div key={platform} className="bg-white/10 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">{platform}</p>
                        <p className="text-white/70 text-sm">{username}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(platform)}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              data-testid="create-profile-button"
              type="submit"
              className="btn-primary w-full text-lg py-4"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;