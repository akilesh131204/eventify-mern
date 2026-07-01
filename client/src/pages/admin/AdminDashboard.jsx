import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi';
import { adminService } from '../../services';
import Spinner from '../../components/common/Spinner';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
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
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard icon={<FiUsers className="text-primary-600" />} label="Total Users" value={stats?.totalUsers} color="bg-primary-50" />
        <StatCard icon={<FiUsers className="text-purple-600" />} label="Organizers" value={stats?.totalOrganizers} color="bg-purple-50" />
        <StatCard icon={<FiCalendar className="text-blue-600" />} label="Total Events" value={stats?.totalEvents} color="bg-blue-50" />
        <StatCard icon={<FiClock className="text-amber-600" />} label="Pending Approvals" value={stats?.pendingEvents} color="bg-amber-50" />
        <StatCard icon={<FiCalendar className="text-green-600" />} label="Approved Events" value={stats?.approvedEvents} color="bg-green-50" />
        <StatCard icon={<FiDollarSign className="text-green-600" />} label="Total Revenue" value={`₹${stats?.totalRevenue}`} color="bg-green-50" />
      </div>
    </div>
  );
};

export default AdminDashboard;
