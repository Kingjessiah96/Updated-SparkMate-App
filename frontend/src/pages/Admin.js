import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Shield, Users, Flag, Ban, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [reports, setReports] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'blocks') {
      fetchBlocks();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/blocks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlocks(response.data);
    } catch (error) {
      toast.error('Failed to load blocks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (reportId, action) => {
    try {
      await axios.post(
        `${API}/admin/report/${reportId}/resolve`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Report marked as ${action}`);
      fetchReports();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-24">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Space Grotesk'}}>
              Admin Panel
            </h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="btn-secondary"
          >
            Back to App
          </button>
        </div>

        {/* Tabs */}
        <div className="glass-card p-2 mb-6 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'stats'
                ? 'bg-yellow-500 text-black'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'bg-yellow-500 text-black'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
          >
            <Flag className="w-5 h-5" />
            Reports ({stats.pending_reports || 0})
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'blocks'
                ? 'bg-yellow-500 text-black'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
          >
            <Ban className="w-5 h-5" />
            Blocks
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'bg-yellow-500 text-black'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center text-white text-xl py-20">Loading...</div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                  <Users className="w-10 h-10 text-blue-400 mb-3" />
                  <h3 className="text-white/70 text-sm mb-1">Total Users</h3>
                  <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                </div>
                <div className="glass-card p-6">
                  <Shield className="w-10 h-10 text-yellow-400 mb-3" />
                  <h3 className="text-white/70 text-sm mb-1">Pro Users</h3>
                  <p className="text-3xl font-bold text-white">{stats.pro_users}</p>
                </div>
                <div className="glass-card p-6">
                  <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
                  <h3 className="text-white/70 text-sm mb-1">Total Matches</h3>
                  <p className="text-3xl font-bold text-white">{stats.total_matches}</p>
                </div>
                <div className="glass-card p-6">
                  <Flag className="w-10 h-10 text-red-400 mb-3" />
                  <h3 className="text-white/70 text-sm mb-1">Pending Reports</h3>
                  <p className="text-3xl font-bold text-white">{stats.pending_reports}</p>
                </div>
                <div className="glass-card p-6">
                  <Ban className="w-10 h-10 text-orange-400 mb-3" />
                  <h3 className="text-white/70 text-sm mb-1">Total Blocks</h3>
                  <p className="text-3xl font-bold text-white">{stats.total_blocks}</p>
                </div>
                <div className="glass-card p-6">
                  <Users className="w-10 h-10 text-purple-400 mb-3" />
                  <h3 className="text-white/70 text-sm mb-1">Total Reports</h3>
                  <p className="text-3xl font-bold text-white">{stats.total_reports}</p>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Flag className="w-16 h-16 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-xl">No reports yet</p>
                  </div>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="glass-card p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div>
                              <img
                                src={report.reporter_profile?.photos?.[0] || 'https://via.placeholder.com/50'}
                                alt="Reporter"
                                className="w-12 h-12 rounded-full"
                              />
                            </div>
                            <div>
                              <p className="text-white font-bold">
                                @{report.reporter_profile?.username || 'Unknown'} reported
                              </p>
                              <p className="text-white/70 text-sm">{formatDate(report.timestamp)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4 ml-16">
                            <div>
                              <img
                                src={report.reported_profile?.photos?.[0] || 'https://via.placeholder.com/50'}
                                alt="Reported"
                                className="w-12 h-12 rounded-full border-2 border-red-500"
                              />
                            </div>
                            <div>
                              <p className="text-white font-bold">
                                @{report.reported_profile?.username || 'Unknown'}
                              </p>
                              <p className="text-red-400 text-sm">Reported User</p>
                            </div>
                          </div>

                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <p className="text-white/70 text-sm font-bold mb-2">Reason:</p>
                            <p className="text-white">{report.reason}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              report.status === 'pending' ? 'bg-yellow-500 text-black' :
                              report.status === 'reviewed' ? 'bg-blue-500 text-white' :
                              report.status === 'actioned' ? 'bg-green-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                        </div>

                        {report.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => resolveReport(report.id, 'reviewed')}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Reviewed
                            </button>
                            <button
                              onClick={() => resolveReport(report.id, 'actioned')}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Action Taken
                            </button>
                            <button
                              onClick={() => resolveReport(report.id, 'dismissed')}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Blocks Tab */}
            {activeTab === 'blocks' && (
              <div className="space-y-4">
                {blocks.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Ban className="w-16 h-16 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-xl">No blocks yet</p>
                  </div>
                ) : (
                  blocks.map((block) => (
                    <div key={block.id} className="glass-card p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <p className="text-white">
                            <span className="font-bold">@{block.blocker_profile?.username || 'Unknown'}</span>
                            <span className="text-white/60 mx-2">blocked</span>
                            <span className="font-bold">@{block.blocked_profile?.username || 'Unknown'}</span>
                          </p>
                        </div>
                        <p className="text-white/60 text-sm">{formatDate(block.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-xl">No users yet</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="glass-card p-6">
                      <div className="flex items-center gap-4">
                        {user.profile && (
                          <img
                            src={user.profile.photos?.[0] || 'https://via.placeholder.com/50'}
                            alt="User"
                            className="w-16 h-16 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-bold">
                              {user.profile ? `@${user.profile.username}` : 'No Profile'}
                            </p>
                            {user.is_pro && (
                              <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                                PRO
                              </span>
                            )}
                          </div>
                          <p className="text-white/70 text-sm">{user.email}</p>
                          <p className="text-white/60 text-xs">
                            Joined: {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
