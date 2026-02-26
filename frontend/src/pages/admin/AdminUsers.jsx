import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../services/supabase';
import { AuthContext } from '../../context/AuthContext';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const { admin: loggedInAdmin } = useContext(AuthContext);

    useEffect(() => {
        if (loggedInAdmin?.role === 'Super Admin') {
            fetchUsers();
        }
    }, [loggedInAdmin]);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
            if (error) throw error;
            fetchUsers();
            alert('Role updated successfully');
        } catch (err) {
            alert('Failed to update role: ' + err.message);
        }
    };

    if (loggedInAdmin?.role !== 'Super Admin') {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2 style={{ color: 'red' }}>Access Denied</h2>
                <p>Only Super Admins can manage user roles.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2>User Management</h2>
                <p style={{ color: 'var(--color-black-light)' }}>
                    Note: To add a new Admin, first have them register a standard account, then elevate their role here.
                </p>
            </div>

            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-beige)' }}>
                        <tr>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td style={tdStyle}>{u.name}</td>
                                <td style={tdStyle}>{u.email}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                                        backgroundColor: u.role === 'Super Admin' ? 'var(--color-purple)' : (u.role === 'Editor' ? '#4CAF50' : 'var(--color-gray)'),
                                        color: (u.role === 'Super Admin' || u.role === 'Editor') ? 'white' : 'black'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        disabled={u.id === loggedInAdmin?.id}
                                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--color-gray)', marginRight: '10px' }}
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Super Admin">Super Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };
const tdStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };

export default AdminUsers;
