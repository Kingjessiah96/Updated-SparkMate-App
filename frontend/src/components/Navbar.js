import { Home, User as UserIcon, Sparkles, Smile, Flame, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="max-w-lg mx-auto flex justify-around items-center px-2">
        <button
          data-testid="nav-discover"
          onClick={() => navigate('/discover')}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/discover') ? 'scale-110' : ''
          }`}
          style={{
            color: isActive('/discover') ? '#FF0000' : '#666',
            filter: isActive('/discover') ? 'drop-shadow(0 2px 8px rgba(255, 0, 0, 0.5))' : 'none'
          }}
        >
          <Sparkles className="w-6 h-6" style={{ strokeWidth: isActive('/discover') ? 3 : 2 }} />
          <span className="text-xs font-bold">Nearby</span>
        </button>

        <button
          data-testid="nav-smash-or-pass"
          onClick={() => navigate('/smash-or-pass')}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/smash-or-pass') ? 'scale-110' : ''
          }`}
          style={{
            color: isActive('/smash-or-pass') ? '#FF8C00' : '#666',
            filter: isActive('/smash-or-pass') ? 'drop-shadow(0 2px 8px rgba(255, 140, 0, 0.5))' : 'none'
          }}
        >
          <Flame className="w-6 h-6" style={{ strokeWidth: isActive('/smash-or-pass') ? 3 : 2 }} />
          <span className="text-xs font-bold">Smash</span>
        </button>

        <button
          data-testid="nav-winks"
          onClick={() => navigate('/winks')}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/winks') ? 'scale-110' : ''
          }`}
          style={{
            color: isActive('/winks') ? '#FFD700' : '#666',
            filter: isActive('/winks') ? 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.5))' : 'none',
            textShadow: isActive('/winks') ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
          }}
        >
          <Smile className="w-6 h-6" style={{ strokeWidth: isActive('/winks') ? 3 : 2 }} />
          <span className="text-xs font-bold">Winks</span>
        </button>

        <button
          data-testid="nav-dms"
          onClick={() => navigate('/dms')}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/dms') ? 'scale-110' : ''
          }`}
          style={{
            color: isActive('/dms') ? '#1E90FF' : '#666',
            filter: isActive('/dms') ? 'drop-shadow(0 2px 8px rgba(30, 144, 255, 0.5))' : 'none'
          }}
        >
          <MessageCircle className="w-6 h-6" style={{ strokeWidth: isActive('/dms') ? 3 : 2 }} />
          <span className="text-xs font-bold">DMs</span>
        </button>

        <button
          data-testid="nav-profile"
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/profile') ? 'scale-110' : ''
          }`}
          style={{
            color: isActive('/profile') ? '#9400D3' : '#666',
            filter: isActive('/profile') ? 'drop-shadow(0 2px 8px rgba(148, 0, 211, 0.5))' : 'none'
          }}
        >
          <UserIcon className="w-6 h-6" style={{ strokeWidth: isActive('/profile') ? 3 : 2 }} />
          <span className="text-xs font-bold">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
