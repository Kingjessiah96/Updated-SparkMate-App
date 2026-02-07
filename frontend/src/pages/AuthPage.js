import { useState, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Heart, Mail, Lock, Phone } from 'lucide-react';

const AuthPage = () => {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, formData);
      login(response.data.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-testid="auth-page">
      <div className="glass-card p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 mb-4 animate-pulse">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk'}}>PrideConnect</h1>
          <p className="text-white text-lg opacity-90">For gay, bi & trans men</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                data-testid="email-input"
                type="email"
                placeholder="Email"
                className="input-field pl-12"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  data-testid="phone-input"
                  type="tel"
                  placeholder="Phone (optional)"
                  className="input-field pl-12"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                data-testid="password-input"
                type="password"
                placeholder="Password"
                className="input-field pl-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button
            data-testid="submit-button"
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            data-testid="toggle-auth-mode"
            className="text-white font-medium hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;