import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Save, X, Check } from 'lucide-react';
import Swal from 'sweetalert2';

const MODULES = [
  'Dashboard', 'Bills', 'Returns', 'Books', 'Clients', 
  'Stocks', 'Reports', 'Settings', 'Users', 'Roles'
];

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: MODULES.reduce((acc, mod) => {
      acc[mod] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
      return acc;
    }, {})
  });

  const fetchRoles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/roles');
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenForm = (role = null) => {
    if (role) {
      if (role.name === 'Admin') {
        Swal.fire('Info', 'The core Admin role cannot be modified.', 'info');
        return;
      }
      // Populate form data
      const permsMap = MODULES.reduce((acc, mod) => {
        const found = role.permissions?.find(p => p.module === mod);
        acc[mod] = found ? { 
          can_view: Boolean(found.can_view), 
          can_create: Boolean(found.can_create), 
          can_edit: Boolean(found.can_edit), 
          can_delete: Boolean(found.can_delete) 
        } : { can_view: false, can_create: false, can_edit: false, can_delete: false };
        return acc;
      }, {});
      
      setFormData({ name: role.name, description: role.description || '', permissions: permsMap });
      setEditingRole(role);
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: MODULES.reduce((acc, mod) => {
          acc[mod] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
          return acc;
        }, {})
      });
      setEditingRole(null);
    }
    setIsFormOpen(true);
  };

  const handlePermissionChange = (module, action, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: checked
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Convert permissions map to array format for API
    const permsArray = Object.keys(formData.permissions).map(mod => ({
      module: mod,
      ...formData.permissions[mod]
    })).filter(p => p.can_view || p.can_create || p.can_edit || p.can_delete);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: permsArray
    };

    try {
      let res;
      if (editingRole) {
        res = await fetch(`http://localhost:5000/api/roles/${editingRole.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5000/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsFormOpen(false);
        fetchRoles();
        Swal.fire('Success', `Role ${editingRole ? 'updated' : 'created'} successfully!`, 'success');
      } else {
        const data = await res.json();
        Swal.fire('Error', data.error || 'Failed to save role', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  const handleDelete = (id, name) => {
    if (name === 'Admin') return;
    
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete role ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/api/roles/${id}`, { method: 'DELETE' })
          .then(async res => {
            if (res.ok) {
              fetchRoles();
              Swal.fire('Deleted!', 'Role deleted.', 'success');
            } else {
              const data = await res.json();
              Swal.fire('Error', data.error || 'Failed to delete role', 'error');
            }
          })
          .catch(() => Swal.fire('Error', 'Server connection failed', 'error'));
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Role Permissions</h1>
          <p className="text-slate-500 text-sm">Manage custom roles and access matrices</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> New Role
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roles.map(role => (
          <div key={role.id} className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Shield className={role.name === 'Admin' ? "text-purple-500" : "text-blue-500"} size={20} />
                {role.name}
              </h3>
              <p className="text-slate-500 text-sm mt-1">{role.description || 'No description provided'}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              {role.name !== 'Admin' && (
                <>
                  <button onClick={() => handleOpenForm(role)} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm font-medium">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(role.id, role.name)} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 transition-colors flex items-center gap-1 text-sm font-medium">
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#151521] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Shield className="text-blue-500" size={20} />
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role Name *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                      placeholder="e.g. Cashier" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <input 
                      type="text" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                      placeholder="Brief description of this role" 
                    />
                  </div>
                </div>

                <h3 className="text-md font-bold text-slate-800 dark:text-white mb-3">Permissions Matrix</h3>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm">Module</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-center">View</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-center">Create</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-center">Edit</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map(mod => (
                        <tr key={mod} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300 text-sm">{mod}</td>
                          {['can_view', 'can_create', 'can_edit', 'can_delete'].map(action => (
                            <td key={action} className="p-3 text-center">
                              <label className="inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                  checked={formData.permissions[mod][action]}
                                  onChange={(e) => handlePermissionChange(mod, action, e.target.checked)}
                                />
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors"
                >
                  <Save size={18} /> Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
