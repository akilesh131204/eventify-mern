import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiEye, FiUserX, FiUserCheck, FiShield } from 'react-icons/fi';
import { adminService } from '../../services';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModal, setViewModal] = useState(false);

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

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleBlock = async (id) => {
    try {
      await adminService.toggleBlockUser(id);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" permanently? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error('Role change failed');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <Spinner full />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Users</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, color: 'text-primary-600' },
          { label: 'Organizers', value: users.filter(u => u.role === 'organizer').length, color: 'text-purple-600' },
          { label: 'Blocked', value: users.filter(u => u.isBlocked).length, color: 'text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field sm:w-40">
          <option value="all">All Roles</option>
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Joined</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {u.role !== 'admin' ? (
                    <select value={u.role} onChange={e => handleChangeRole(u._id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white capitalize">
                      <option value="attendee">Attendee</option>
                      <option value="organizer">Organizer</option>
                    </select>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-purple-700">
                      <FiShield size={12} /> Admin
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="p-3 text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelectedUser(u); setViewModal(true); }}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="View details">
                      <FiEye size={14} />
                    </button>
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={() => handleToggleBlock(u._id)}
                          className={`p-1.5 rounded-lg ${u.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
                          title={u.isBlocked ? 'Unblock' : 'Block'}>
                          {u.isBlocked ? <FiUserCheck size={14} /> : <FiUserX size={14} />}
                        </button>
                        <button onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete user">
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View User Modal */}
      {viewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">User Details</h3>
              <button onClick={() => setViewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl">
                {selectedUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{selectedUser.name}</h4>
                <p className="text-slate-500 text-sm">{selectedUser.email}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                  selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  selectedUser.role === 'organizer' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Phone</span>
                <span className="font-medium">{selectedUser.phone || 'Not provided'}</span>
              </div>
              {selectedUser.organizationName && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Organization</span>
                  <span className="font-medium">{selectedUser.organizationName}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className={`font-medium ${selectedUser.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Joined</span>
                <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            <button onClick={() => setViewModal(false)} className="btn-secondary w-full mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
