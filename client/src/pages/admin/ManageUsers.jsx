import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import Spinner from '../../components/common/Spinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      await adminService.toggleBlockUser(id);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="p-3">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleBlock(u._id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                        u.isBlocked ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
