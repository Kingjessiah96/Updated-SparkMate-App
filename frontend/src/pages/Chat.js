import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Send, ArrowLeft, MapPin, Image as ImageIcon, X, Trash2, Check, CheckCheck, Crown } from 'lucide-react';
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
  const [isPro, setIsPro] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const messagesEndRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    fetchMatch();
    fetchMessages();
    fetchUploadedPhotos();
    fetchUserStatus();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserStatus = async () => {
    try {
      const response = await axios.get(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsPro(response.data.is_pro);
    } catch (error) {
      console.error('Failed to fetch user status');
    }
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
      await axios.post(
        `${API}/uploaded-photos`,
        { photo_url: photoUrlInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  // Long press handlers for message deletion
  const handleMessagePressStart = (message) => {
    // Only allow long press on own messages
    if (message.sender_id !== profile?.user_id) return;
    
    longPressTimer.current = setTimeout(() => {
      setSelectedMessage(message);
      setShowDeleteModal(true);
    }, 500); // 500ms long press
  };

  const handleMessagePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const deleteMessage = async () => {
    if (!selectedMessage) return;
    
    if (!isPro) {
      setShowDeleteModal(false);
      toast.error('Pro subscription required to unsend messages');
      navigate('/subscription');
      return;
    }
    
    setDeletingId(selectedMessage.id);
    try {
      await axios.delete(`${API}/messages/${selectedMessage.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Message unsent');
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to unsend message');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedMessage(null);
    }
  };

  const formatReadTime = (readAt) => {
    if (!readAt) return null;
    const date = new Date(readAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Read at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Read ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="chat-page">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
          data-testid="delete-modal-overlay"
        >
          <div 
            className="glass-card p-6 rounded-2xl max-w-sm w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            data-testid="delete-modal"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Unsend Message?</h3>
              <p className="text-white/70 text-sm">
                This message will be removed from the conversation for both you and {match?.other_user?.name}.
              </p>
              
              {!isPro && (
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
                    <Crown className="w-5 h-5" />
                    <span className="font-bold">Pro Feature</span>
                  </div>
                  <p className="text-white/70 text-xs">
                    Upgrade to Pro to unsend messages and photos
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMessage(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                data-testid="cancel-delete-button"
              >
                Cancel
              </button>
              <button
                onClick={deleteMessage}
                disabled={deletingId === selectedMessage?.id}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  isPro 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                } disabled:opacity-50`}
                data-testid="confirm-delete-button"
              >
                {deletingId === selectedMessage?.id ? (
                  <span>Deleting...</span>
                ) : isPro ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Unsend</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Upgrade</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-card p-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/dms')} className="text-white" data-testid="back-button">
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
                className={`relative max-w-[70%] ${message.sender_id === profile?.user_id ? 'cursor-pointer select-none' : ''}`}
                onMouseDown={() => handleMessagePressStart(message)}
                onMouseUp={handleMessagePressEnd}
                onMouseLeave={handleMessagePressEnd}
                onTouchStart={() => handleMessagePressStart(message)}
                onTouchEnd={handleMessagePressEnd}
                onContextMenu={(e) => {
                  if (message.sender_id === profile?.user_id) {
                    e.preventDefault();
                    setSelectedMessage(message);
                    setShowDeleteModal(true);
                  }
                }}
              >
                <div
                  className={`rounded-2xl overflow-hidden ${
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

                  {/* Timestamp and Read Receipt */}
                  <div className="px-3 pb-2">
                    <div className="flex items-center gap-1 justify-end">
                      <p className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {/* Read receipts for sent messages (Pro feature) */}
                      {message.sender_id === profile?.user_id && isPro && (
                        <span className="ml-1" title={message.read ? formatReadTime(message.read_at) : 'Sent'}>
                          {message.read ? (
                            <CheckCheck className="w-4 h-4 text-blue-300" />
                          ) : (
                            <Check className="w-4 h-4 opacity-70" />
                          )}
                        </span>
                      )}
                    </div>
                    {/* Show read time for Pro users */}
                    {message.sender_id === profile?.user_id && isPro && message.read && message.read_at && (
                      <p className="text-xs opacity-60 text-right">
                        {formatReadTime(message.read_at)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Long press hint for own messages */}
                {message.sender_id === profile?.user_id && (
                  <p className="text-xs text-white/40 text-right mt-1 opacity-0 hover:opacity-100 transition-opacity">
                    Hold to unsend
                  </p>
                )}
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
