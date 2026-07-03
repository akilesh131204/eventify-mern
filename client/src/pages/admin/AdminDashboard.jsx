import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiDollarSign, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { adminService } from '../../services';
import Spinner from '../../components/common/Spinner';

const StatCard = ({ icon, label, value, color, bg, link }) => (
  <Link to={link || '#'} className={`card p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}>
    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${bg}`}>{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
    {link && <FiArrowRight className="text-slate-400" />}
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening on Eventify.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard icon={<FiUsers className="text-primary-600" size={24} />} label="Total Users" value={stats?.totalUsers || 0} bg="bg-primary-50" link="/admin/users" />
        <StatCard icon={<FiUsers className="text-purple-600" size={24} />} label="Organizers" value={stats?.totalOrganizers || 0} bg="bg-purple-50" link="/admin/users" />
        <StatCard icon={<FiCalendar className="text-blue-600" size={24} />} label="Total Events" value={stats?.totalEvents || 0} bg="bg-blue-50" link="/admin/events" />
        <StatCard icon={<FiClock className="text-amber-600" size={24} />} label="Pending Approvals" value={stats?.pendingEvents || 0} bg="bg-amber-50" link="/admin/events" />
        <StatCard icon={<FiCheckCircle className="text-green-600" size={24} />} label="Approved Events" value={stats?.approvedEvents || 0} bg="bg-green-50" link="/admin/events" />
        <StatCard icon={<FiDollarSign className="text-emerald-600" size={24} />} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} bg="bg-emerald-50" link="/admin/payments" />
      </div>

      {stats?.pendingEvents > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
              {stats.pendingEvents}
            </div>
            <div>
              <p className="font-semibold text-amber-900">Events awaiting approval</p>
              <p className="text-sm text-amber-700">Review and approve event listings submitted by organizers</p>
            </div>
          </div>
          <Link to="/admin/events" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Review Now
          </Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/events" className="card p-5 text-center hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-2">📋</div>
          <p className="font-semibold text-slate-800 group-hover:text-primary-600">Manage Events</p>
          <p className="text-sm text-slate-500 mt-1">Approve or reject event listings</p>
        </Link>
        <Link to="/admin/users" className="card p-5 text-center hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-2">👥</div>
          <p className="font-semibold text-slate-800 group-hover:text-primary-600">Manage Users</p>
          <p className="text-sm text-slate-500 mt-1">Block or unblock user accounts</p>
        </Link>
        <Link to="/admin/payments" className="card p-5 text-center hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-2">💳</div>
          <p className="font-semibold text-slate-800 group-hover:text-primary-600">Payment Transactions</p>
          <p className="text-sm text-slate-500 mt-1">Monitor all payment activity</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
