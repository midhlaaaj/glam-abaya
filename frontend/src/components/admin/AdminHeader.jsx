import { Menu, LogOut, User } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ toggleSidebar }) => {
    const { logoutAdmin, admin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    return (
        <header style={{
            backgroundColor: 'var(--color-white)',
            padding: '16px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-gray)',
            position: 'sticky',
            top: 0,
            zIndex: 900
        }}>
            <button onClick={toggleSidebar}>
                <Menu size={24} color="var(--color-purple)" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        borderRadius: '50%', backgroundColor: 'var(--color-beige)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <User size={16} color="var(--color-purple)" />
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{admin?.name || 'Admin'}</span>
                </div>

                <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)' }}
                >
                    <LogOut size={18} />
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
