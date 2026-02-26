import { Outlet, Navigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminSidebar from '../admin/AdminSidebar';
import AdminHeader from '../admin/AdminHeader';

const AdminLayout = () => {
    const { isAdmin, loading } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Admin Panel...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-beige)' }}>
            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '250px' : '0',
                transition: 'var(--transition-normal)',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}>
                <AdminHeader toggleSidebar={toggleSidebar} />
                <main style={{ padding: '30px', flex: 1, overflowX: 'hidden' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
