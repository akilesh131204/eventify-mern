import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDollarSign, FiTag, FiUserCheck, FiEye } from 'react-icons/fi';
import { analyticsService } from '../../services';
import Spinner from '../../components/common/Spinner';

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const StatCard = ({ icon, label, value }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const EventAnalytics = () => {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getEventAnalytics(eventId);
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  if (loading) return <Spinner full />;
  if (!data) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Event Analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FiDollarSign className="text-primary-600" />} label="Revenue" value={`₹${data.totalRevenue}`} />
        <StatCard icon={<FiTag className="text-primary-600" />} label="Tickets Sold" value={`${data.totalTicketsSold}/${data.totalCapacity}`} />
        <StatCard icon={<FiUserCheck className="text-primary-600" />} label="Attendance Rate" value={`${data.attendanceRate}%`} />
        <StatCard icon={<FiEye className="text-primary-600" />} label="Page Views" value={data.views} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} name="Revenue (₹)" />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="Tickets" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue by Ticket Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.salesByTicketType} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
                {data.salesByTicketType.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Tickets Sold by Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.salesByTicketType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
