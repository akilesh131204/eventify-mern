import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiEye, FiUserX, FiUserCheck, FiShield } from 'react-icons/fi';
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
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
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

  if (loading) return <Spinner full />;

  // Filter users based on search and role
  const displayUsers = users.filter(u => {
    const matchSearch = search === '' ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Users</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{users.length}</p>
          <p className="text-xs text-slate-500">Total Users</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'organizer').length}</p>
          <p className="text-xs text-slate-500">Organizers</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{users.filter(u => u.isBlocked).length}</p>
          <p className="text-xs text-slate-500">Blocked</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '10px 14px',
            border: '2px solid #e5e7eb', borderRadius: '10px',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '10px 14px', border: '2px solid #e5e7eb',
            borderRadius: '10px', fontSize: '14px', outline: 'none',
            background: 'white', cursor: 'pointer'
          }}
        >
          <option value="all">All Roles</option>
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
        Showing {displayUsers.length} of {users.length} users
      </p>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#64748b' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#64748b' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#64748b' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#64748b' }}>Joined</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((u) => (
              <tr key={u._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: '#eef2ff', color: '#4f46e5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '14px', flexShrink: 0
                    }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  {u.role !== 'admin' ? (
                    <select
                      value={u.role}
                      onChange={e => handleChangeRole(u._id, e.target.value)}
                      style={{
                        fontSize: '12px', border: '1px solid #e5e7eb',
                        borderRadius: '8px', padding: '4px 8px',
                        background: 'white', cursor: 'pointer'
                      }}
                    >
                      <option value="attendee">Attendee</option>
                      <option value="organizer">Organizer</option>
                    </select>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#7c3aed', fontWeight: '600' }}>
                      <FiShield size={12} /> Admin
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '600', padding: '4px 10px',
                    borderRadius: '20px',
                    background: u.isBlocked ? '#fee2e2' : '#dcfce7',
                    color: u.isBlocked ? '#dc2626' : '#16a34a'
                  }}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => { setSelectedUser(u); setViewModal(true); }}
                      style={{ padding: '6px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                      title="View details"
                    >
                      <FiEye size={14} />
                    </button>
                    {u.role !== 'admin' && (
                      <>
                        <button
                          onClick={() => handleToggleBlock(u._id)}
                          style={{
                            padding: '6px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                            background: u.isBlocked ? '#dcfce7' : '#fef9c3',
                            color: u.isBlocked ? '#16a34a' : '#ca8a04'
                          }}
                          title={u.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {u.isBlocked ? <FiUserCheck size={14} /> : <FiUserX size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          style={{ padding: '6px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#dc2626' }}
                          title="Delete user"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {displayUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View User Modal */}
      {viewModal && selectedUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px'
        }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '18px', margin: 0 }}>User Details</h3>
              <button onClick={() => setViewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: '#eef2ff', color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '24px'
              }}>
                {selectedUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>{selectedUser.name}</p>
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{selectedUser.email}</p>
              </div>
            </div>
            {[
              { label: 'Role', value: selectedUser.role },
              { label: 'Phone', value: selectedUser.phone || 'Not provided' },
              { label: 'Organization', value: selectedUser.organizationName || 'N/A' },
              { label: 'Status', value: selectedUser.isBlocked ? 'Blocked' : 'Active' },
              { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{item.label}</span>
                <span style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{item.value}</span>
              </div>
            ))}
            <button onClick={() => setViewModal(false)} style={{
              width: '100%', marginTop: '16px', padding: '12px',
              background: '#f1f5f9', border: 'none', borderRadius: '10px',
              cursor: 'pointer', fontWeight: '600', fontSize: '14px'
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;