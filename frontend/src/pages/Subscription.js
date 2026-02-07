import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Crown, Check, ArrowLeft } from 'lucide-react';
import { useNavigate, Routes, Route, useSearchParams } from 'react-router-dom';

const SubscriptionUpgrade = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/subscription/checkout`,
        { origin_url: originUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-testid="subscription-upgrade-page">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/profile')}
          className="text-white mb-6 flex items-center gap-2 hover:underline"
          data-testid="back-to-profile-button"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Profile
        </button>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk'}}>Go Pro</h1>
            <p className="text-white/80 text-lg">Unlock unlimited features</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <span className="text-5xl font-bold text-white">$9.99</span>
              <span className="text-white/70 text-lg">/month</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <p className="text-white"><strong>Get unlimited smashes</strong> - No daily swipe limits</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <p className="text-white"><strong>See who wants to smash you</strong> - View all your smashes</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <p className="text-white"><strong>Extended reach</strong> - See profiles up to 100km away</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <p className="text-white"><strong>See who viewed you</strong> - Know who's interested</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <p className="text-white"><strong>Read receipts</strong> - See when messages are read</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <p className="text-white"><strong>"Smash RN" filter</strong> - Find people ready right now</p>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            className="btn-primary w-full text-lg py-4"
            disabled={loading}
            data-testid="checkout-button"
          >
            {loading ? 'Loading...' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubscriptionSuccess = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [searchParams]);

  const checkPaymentStatus = async (sessionId) => {
    let attempts = 0;
    const maxAttempts = 5;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('timeout');
        return;
      }

      try {
        const response = await axios.get(
          `${API}/subscription/checkout/status/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.payment_status === 'paid') {
          setStatus('success');
          toast.success('Welcome to Pro!');
        } else if (response.data.status === 'expired') {
          setStatus('failed');
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        setStatus('error');
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-testid="subscription-success-page">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment...</h2>
            <p className="text-white/70">Please wait while we confirm your subscription</p>
          </>
        )}

        {status === 'success' && (
          <>
            <Crown className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to Pro!</h2>
            <p className="text-white/70 mb-6">Your subscription is now active</p>
            <button onClick={() => navigate('/discover')} className="btn-primary" data-testid="continue-button">
              Start Exploring
            </button>
          </>
        )}

        {(status === 'failed' || status === 'error' || status === 'timeout') && (
          <>
            <div className="text-red-400 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-white/70 mb-6">Something went wrong. Please try again.</p>
            <button onClick={() => navigate('/subscription/upgrade')} className="btn-primary" data-testid="retry-button">
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-testid="subscription-cancel-page">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="text-yellow-400 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Subscription Cancelled</h2>
        <p className="text-white/70 mb-6">You cancelled the subscription process</p>
        <button onClick={() => navigate('/profile')} className="btn-primary" data-testid="back-button">
          Back to Profile
        </button>
      </div>
    </div>
  );
};

const Subscription = () => {
  return (
    <Routes>
      <Route path="upgrade" element={<SubscriptionUpgrade />} />
      <Route path="success" element={<SubscriptionSuccess />} />
      <Route path="cancel" element={<SubscriptionCancel />} />
    </Routes>
  );
};

export default Subscription;