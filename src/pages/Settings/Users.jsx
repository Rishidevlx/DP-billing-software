import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Shield, User, Users as UsersIcon, Edit, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsersAndRoles = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/roles')
      ]);
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      setUsers(usersData);
      setRolesList(rolesData);
      
      // Set default role for new user
      if (rolesData.length > 0 && newUser.role === 'user') {
        const standardRole = rolesData.find(r => r.name === 'Standard User') || rolesData[0];
        setNewUser(prev => ({ ...prev, role: standardRole.id }));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, name: newUser.name.trim(), email: newUser.email.trim() })
      });
      if (res.ok) {
        setNewUser({ name: '', email: '', password: '', role: 'user' });
        fetchUsersAndRoles();
        Swal.fire({ title: 'Success', text: 'User added successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        const data = await res.json();
        Swal.fire('Error', data.error || 'Failed to add user', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  
  const handleEditClick = (user) => {
    setEditingUser({ ...user });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser.name.trim() || !editingUser.password.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${editingUser.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsersAndRoles();
        Swal.fire({ title: 'Success', text: 'User updated successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('Error', 'Failed to update user', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  const handleDeleteUser = (email) => {
    // Prevent deleting the main admin
    if (email.toLowerCase() === 'admin@dp.com') {
      Swal.fire('Error', 'Cannot delete the primary admin account.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Delete user ${email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/api/users/${email}`, { method: 'DELETE' })
          .then(res => {
            if (res.ok) {
              fetchUsersAndRoles();
              Swal.fire('Deleted!', 'User deleted.', 'success');
            } else {
              Swal.fire('Error', 'Failed to delete user', 'error');
            }
          })
          .catch(() => Swal.fire('Error', 'Server connection failed', 'error'));
      }
    });
  };

  return (
    <>

      {/* Edit User Section */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit className="text-blue-500" size={20} />
                Edit User ({editingUser.email})
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
                  <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Password *</label>
                  <input type="text" value={editingUser.password} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role *</label>
                  <select value={editingUser.role_id || ''} onChange={(e) => setEditingUser({...editingUser, role_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" required>
                    {rolesList.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors w-full justify-center">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">User Management</h1>
        <p className="text-slate-500 text-sm">Create and manage access for admins and users</p>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col mb-8">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserPlus className="text-blue-500" size={20} />
            Create New User
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
              <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="e.g. John Doe" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address *</label>
              <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="e.g. john@dp.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Password *</label>
              <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="Enter password" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role *</label>
              <select value={newUser.role || ''} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" required>
                {rolesList.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 mt-2 flex justify-end">
              <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors">
                <Plus size={18} /> Create User
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UsersIcon className="text-green-500" size={20} />
            Registered Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm w-1/4">Name</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm w-1/3">Email</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm w-1/4">Role</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-right w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]">
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <User size={16} />
                    </div>
                    {u.name}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{u.email}</td>
                  <td className="p-4 text-sm">
                    {u.role === 'Admin' ? (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold flex items-center gap-1 w-max">
                        <Shield size={12} /> Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1 w-max">
                        <User size={12} /> {u.role || 'User'}
                      </span>
                    )}
                  </td>
                                    <td className="p-4 text-right">
                    {u.email.toLowerCase() !== 'admin@dp.com' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(u)} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md transition-colors" title="Edit User">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.email)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors" title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>
  );
}