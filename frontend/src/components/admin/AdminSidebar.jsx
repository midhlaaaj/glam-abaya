import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, Percent, Image, Users, X, BarChart } from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    if (!isOpen) return null;

    const NavItem = ({ to, icon: Icon, label }) => {
        // Exact match for dashboard, startsWith for others
        const isActive = to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);

        return (
            <Link
                to={to}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    color: isActive ? 'var(--color-white)' : 'var(--color-black-light)',
                    backgroundColor: isActive ? 'var(--color-purple)' : 'transparent',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    transition: 'var(--transition-normal)'
                }}
            >
                <Icon size={20} color={isActive ? 'var(--color-gold-start)' : 'var(--color-purple)'} />
                <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '15px' }}>{label}</span>
            </Link>
        );
    };

    return (
        <aside style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '250px',
            height: '100vh',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid var(--color-gray)',
            boxShadow: 'var(--shadow-soft)',
            padding: '24px 16px',
            zIndex: 1000,
            overflowY: 'auto',
            transition: 'var(--transition-normal)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '0 8px' }}>
                <h2 className="gold-text" style={{ fontSize: '20px', margin: 0, letterSpacing: '1px' }}>GLAM ABAYA</h2>
                {/* Mobile Close Button */}
                <button onClick={() => setIsOpen(false)} style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}>
                    <X size={20} color="var(--color-black-light)" />
                </button>
            </div>

            <nav>
                <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/admin/analytics" icon={BarChart} label="Analytics" />
                <NavItem to="/admin/products" icon={Package} label="Products" />
                <NavItem to="/admin/categories" icon={Tag} label="Categories" />
                <NavItem to="/admin/sales" icon={Percent} label="Products on Sale" />
                <NavItem to="/admin/hero" icon={Image} label="Hero Section" />
                <NavItem to="/admin/influencers" icon={Users} label="Our Influencers" />
                <NavItem to="/admin/users" icon={Users} label="Admin Management" />
            </nav>
        </aside>
    );
};

export default AdminSidebar;
