import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Send, ArrowLeft, MapPin, Image as ImageIcon, X, Trash2, Check, CheckCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const Chat = () => {
  const { token, profile } = useContext(AuthContext);
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMatch();
    fetchMessages();
    fetchUploadedPhotos();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatch = async () => {
    try {
      const response = await axios.get(`${API}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundMatch = response.data.find(m => m.id === matchId);
      setMatch(foundMatch);
    } catch (error) {
      toast.error('Failed to load match');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedPhotos = async () => {
    try {
      const response = await axios.get(`${API}/uploaded-photos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadedPhotos(response.data);
    } catch (error) {
      console.error('Failed to load uploaded photos');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API}/messages`, 
        { 
          match_id: matchId, 
          content: newMessage,
          message_type: 'text'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const sendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await axios.post(`${API}/messages`, 
              { 
                match_id: matchId, 
                content: 'Shared location',
                message_type: 'location',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Location sent!');
            fetchMessages();
          } catch (error) {
            toast.error('Failed to send location');
          }
        },
        (error) => {
          toast.error('Could not get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const uploadAndSendPhoto = async () => {
    if (!photoUrlInput.trim()) {
      toast.error('Please enter a photo URL');
      return;
    }

    try {
      // Save to uploaded photos
      await axios.post(
        `${API}/uploaded-photos`,
        { photo_url: photoUrlInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Send as message
      await axios.post(
        `${API}/messages`,
        {
          match_id: matchId,
          content: 'Sent a photo',
          message_type: 'photo',
          photo_url: photoUrlInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPhotoUrlInput('');
      setShowPhotoMenu(false);
      toast.success('Photo sent!');
      fetchMessages();
      fetchUploadedPhotos();
    } catch (error) {
      toast.error('Failed to send photo');
    }
  };

  const sendExistingPhoto = async (photoUrl) => {
    try {
      await axios.post(
        `${API}/messages`,
        {
          match_id: matchId,
          content: 'Sent a photo',
          message_type: 'photo',
          photo_url: photoUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPhotoMenu(false);
      toast.success('Photo sent!');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send photo');
    }
  };

  const openMap = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="chat-page">
      {/* Header */}
      <div className="glass-card p-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/matches')} className="text-white" data-testid="back-button">
          <ArrowLeft className="w-6 h-6" />
        </button>
        {match?.other_user && (
          <div className="flex items-center gap-3 flex-1">
            <img
              src={match.other_user.photos[0] || 'https://via.placeholder.com/50'}
              alt={match.other_user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
            />
            <div>
              <h2 className="text-white font-bold text-lg">{match.other_user.name}</h2>
              <p className="text-white/70 text-sm">{match.other_user.pronouns}</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{maxHeight: 'calc(100vh - 180px)'}} data-testid="messages-container">
        {loading ? (
          <div className="text-center text-white py-20">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-white/70 py-20">
            <p className="text-xl mb-2">No messages yet</p>
            <p>Say hi to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === profile?.user_id ? 'justify-end' : 'justify-start'}`}
              data-testid="message"
            >
              <div
                className={`max-w-[70%] rounded-2xl overflow-hidden ${
                  message.sender_id === profile?.user_id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'glass-card-dark text-white'
                }`}
              >
                {/* Text message */}
                {message.message_type === 'text' && (
                  <div className="p-3">
                    <p>{message.content}</p>
                  </div>
                )}

                {/* Photo message */}
                {message.message_type === 'photo' && message.photo_url && (
                  <div>
                    <img src={message.photo_url} alt="Shared" className="w-full max-w-xs" />
                    {message.content && message.content !== 'Sent a photo' && (
                      <div className="p-3">
                        <p>{message.content}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Location message */}
                {message.message_type === 'location' && message.latitude && message.longitude && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-bold">Shared Location</span>
                    </div>
                    <button
                      onClick={() => openMap(message.latitude, message.longitude)}
                      className="text-sm underline hover:no-underline"
                    >
                      View on Map
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <div className="px-3 pb-2">
                  <div className="flex items-center gap-1">
                    <p className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {message.read && message.sender_id === profile?.user_id && (
                      <span className="text-xs opacity-70">• Read</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Photo Menu */}
      {showPhotoMenu && (
        <div className="glass-card p-4 border-t border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold">Send Photo</h3>
            <button onClick={() => setShowPhotoMenu(false)} className="text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload new photo */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="Enter photo URL"
                className="input-field flex-1"
                data-testid="photo-url-input"
              />
              <button onClick={uploadAndSendPhoto} className="btn-primary" data-testid="send-new-photo-button">
                Send
              </button>
            </div>
          </div>

          {/* Recently uploaded */}
          {uploadedPhotos.length > 0 && (
            <div>
              <p className="text-white/70 text-sm mb-2">Recently Uploaded</p>
              <div className="grid grid-cols-4 gap-2">
                {uploadedPhotos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.photo_url}
                    alt="Uploaded"
                    className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => sendExistingPhoto(photo.photo_url)}
                    data-testid="recent-photo"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 glass-card" data-testid="message-form">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={sendLocation}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="send-location-button"
          >
            <MapPin className="w-5 h-5 text-white" />
          </button>
          <button
            type="button"
            onClick={() => setShowPhotoMenu(!showPhotoMenu)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="send-photo-button"
          >
            <ImageIcon className="w-5 h-5 text-white" />
          </button>
          <input
            data-testid="message-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary" data-testid="send-button">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;