import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setLoading(true);
        console.log('Category creation started:', newCatName);

        // Timeout safeguard for category creation
        const creationTimeout = setTimeout(() => {
            if (loading) {
                console.warn('Category creation timed out after 10s');
                alert('Request timed out. Please check your connection or database state.');
                setLoading(false);
            }
        }, 10000);

        try {
            console.log('Inserting into categories table...');
            const { error } = await supabase.from('categories').insert([{ name: newCatName }]);
            if (error) {
                console.error('Database error creating category:', error);
                throw error;
            }

            console.log('Category created successfully.');
            setNewCatName('');
            await fetchCategories();
        } catch (err) {
            console.error('Caught category creation error:', err);
            alert(err.message || 'Failed to add category');
        } finally {
            setLoading(false);
            clearTimeout(creationTimeout);
            console.log('Category creation process finished.');
        }
    };

    const toggleVisibility = async (id, currentStatus) => {
        try {
            const { error } = await supabase.from('categories').update({ is_visible: !currentStatus }).eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category? This might drop related products.')) {
            try {
                const { error } = await supabase.from('categories').delete().eq('id', id);
                if (error) throw error;
                fetchCategories();
            } catch (err) {
                alert('Cannot delete: ' + err.message);
            }
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Manage Categories</h2>

            <div className="card" style={{ padding: '24px', marginBottom: '30px', maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '15px' }}>Add New Category</h3>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="e.g. Bridal Collection"
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        style={{ flex: 1, padding: '10px 15px', borderRadius: '6px', border: '1px solid var(--color-gray)' }}
                        disabled={loading}
                    />
                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 20px' }}>
                        {loading ? 'Adding...' : 'Add'}
                    </button>
                </form>
            </div>

            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-beige)' }}>
                        <tr>
                            <th style={thStyle}>Category Name</th>
                            <th style={thStyle}>Visibility Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td style={tdStyle}>{cat.name}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => toggleVisibility(cat.id, cat.is_visible)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', border: 'none',
                                            backgroundColor: cat.is_visible ? '#e6f4ea' : '#fce8e6',
                                            color: cat.is_visible ? '#137333' : '#c5221f',
                                            fontWeight: 500
                                        }}
                                    >
                                        {cat.is_visible ? 'Visible' : 'Hidden'}
                                    </button>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleDelete(cat.id)} style={{ padding: '6px 12px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>No categories found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };
const tdStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };

export default AdminCategories;
