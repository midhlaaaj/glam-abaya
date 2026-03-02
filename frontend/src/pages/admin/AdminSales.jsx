import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const AdminSales = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchProducts();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                setProducts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleSale = async (id, currentState) => {
        const { error } = await supabase.from('products').update({ is_on_sale: !currentState }).eq('id', id);
        if (!error) fetchProducts();
    };

    const handleToggleFeatured = async (id, currentState) => {
        const { error } = await supabase.from('products').update({ is_featured: !currentState }).eq('id', id);
        if (!error) fetchProducts();
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Sales & Featured Products</h2>
            <p style={{ marginBottom: '20px', color: 'var(--color-black-light)' }}>
                Toggle products to appear in the "Sale" or "Featured" sections on the customer homepage.
            </p>

            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-beige)' }}>
                        <tr>
                            <th style={thStyle}>Product</th>
                            <th style={thStyle}>Price</th>
                            <th style={thStyle}>On Sale Badge</th>
                            <th style={thStyle}>Featured Badge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td style={tdStyle}>{p.name}</td>
                                <td style={tdStyle}>₹{p.final_price}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => handleToggleSale(p.id, p.is_on_sale)}
                                        style={{
                                            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none',
                                            backgroundColor: p.is_on_sale ? '#e6f4ea' : '#fce8e6',
                                            color: p.is_on_sale ? '#137333' : '#c5221f',
                                            fontWeight: 500
                                        }}
                                    >
                                        {p.is_on_sale ? 'Active Sale' : 'Inactive'}
                                    </button>
                                </td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                                        style={{
                                            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none',
                                            backgroundColor: p.is_featured ? 'var(--color-gold-start)' : '#eee',
                                            color: p.is_featured ? 'white' : '#666',
                                            fontWeight: 500
                                        }}
                                    >
                                        {p.is_featured ? 'Featured' : 'Not Featured'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No products found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };
const tdStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };

export default AdminSales;
