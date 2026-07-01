import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import Spinner from '../../components/common/Spinner';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await adminService.getPayments();
        setPayments(res.data);
      } catch (err) {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Payment Transactions</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Event</th>
              <th className="text-left p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Order ID</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="p-3">{p.user?.name}</td>
                <td className="p-3">{p.event?.title}</td>
                <td className="p-3">₹{p.amount}</td>
                <td className="p-3 capitalize">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{p.razorpayOrderId}</td>
                <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePayments;
