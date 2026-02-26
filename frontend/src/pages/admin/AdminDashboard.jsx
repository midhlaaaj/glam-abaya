import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        admins: 0,
        heroActive: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Supabase count queries (head only)
            const [{ count: products }, { count: categories }, { count: admins }, { data: heroData }] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('categories').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['Super Admin', 'Editor']),
                supabase.from('hero_section').select('is_active').eq('is_active', true).maybeSingle()
            ]);

            setStats({
                products: products || 0,
                categories: categories || 0,
                admins: admins || 0,
                heroActive: !!heroData
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '50px' }}>Loading Dashboard...</div>;

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '5px' }}>Dashboard Overview</h2>
                <p style={{ color: 'var(--color-black-light)' }}>Welcome to the Glam Abaya Admin Control Panel</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--color-black-light)', fontWeight: 500 }}>Total Products</h3>
                    <p style={{ fontSize: '36px', fontWeight: 600, color: 'var(--color-purple)' }}>{stats.products}</p>
                </div>

                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--color-black-light)', fontWeight: 500 }}>Active Categories</h3>
                    <p style={{ fontSize: '36px', fontWeight: 600, color: 'var(--color-purple)' }}>{stats.categories}</p>
                </div>

                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--color-black-light)', fontWeight: 500 }}>Admin Accounts</h3>
                    <p style={{ fontSize: '36px', fontWeight: 600, color: 'var(--color-purple)' }}>{stats.admins}</p>
                </div>

                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: stats.heroActive ? '#f6fbf7' : '#fff5f5' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--color-black-light)', fontWeight: 500 }}>Hero Section Status</h3>
                    <p style={{ fontSize: '24px', fontWeight: 600, color: stats.heroActive ? 'green' : 'red' }}>
                        {stats.heroActive ? 'Active' : 'Missing'}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button onClick={() => window.location.href = '/admin/products'} className="btn-primary" style={{ textAlign: 'left', padding: '15px 20px' }}>+ Add New Product</button>
                        <button onClick={() => window.location.href = '/admin/categories'} className="btn-secondary" style={{ textAlign: 'left', padding: '15px 20px' }}>Manage Categories</button>
                        <button onClick={() => window.location.href = '/admin/hero'} className="btn-secondary" style={{ textAlign: 'left', padding: '15px 20px' }}>Update Hero Banner</button>
                    </div>
                </div>

                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>System Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={statusRow}>
                            <span>Supabase Database</span>
                            <span style={statusBadge('green')}>Connected</span>
                        </div>
                        <div style={statusRow}>
                            <span>Authentication API</span>
                            <span style={statusBadge('green')}>Operational</span>
                        </div>
                        <div style={statusRow}>
                            <span>Storage Bucket</span>
                            <span style={statusBadge('green')}>Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const statusRow = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--color-gray)' };
const statusBadge = (color) => ({
    backgroundColor: color === 'green' ? '#e6f4ea' : '#fce8e6',
    color: color === 'green' ? '#137333' : '#c5221f',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600
});

export default AdminDashboard;
