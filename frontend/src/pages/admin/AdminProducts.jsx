import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { compressImage } from '../../services/imageUtils';
import { GripVertical, Trash2 } from 'lucide-react';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentImages, setCurrentImages] = useState([]); // Array of { url, display_order, file? }
    const [productToDelete, setProductToDelete] = useState(null);

    const [draggedItem, setDraggedItem] = useState(null);

    const onDragStart = (e, index) => {
        setDraggedItem(currentImages[index]);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
    };

    const onDragEnd = (e) => {
        e.target.style.opacity = '1';
    };

    const onDragOver = (index) => {
        const item = currentImages[index];
        if (draggedItem === item) return;
        let items = currentImages.filter(i => i !== draggedItem);
        items.splice(index, 0, draggedItem);
        setCurrentImages(items);
    };

    const [formData, setFormData] = useState({
        name: '', description: '', category_id: '',
        base_price: '', discount_type: 'none', discount_value: '', stock: '',
        is_featured: false
    });

    useEffect(() => {
        fetchData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchData = async () => {
        try {
            // Force token refresh if the tab was suspended for a long time
            const { data: prodData, error: prodError } = await supabase
                .from('products')
                .select(`*, category:categories(name), product_images(id, url, display_order)`)
                .order('created_at', { ascending: false });

            const { data: catData, error: catError } = await supabase.from('categories').select('*');

            if (prodError || catError) throw new Error('Data fetch failed');

            setProducts(prodData || []);
            setCategories(catData || []);
        } catch (err) {
            console.error(err);
        }
    };

    // Calculate final price logic
    const calculateFinalPrice = (base, type, value) => {
        let final = base;
        if (type === 'percentage') {
            final = base - (base * (value / 100));
        } else if (type === 'flat') {
            final = base - value;
        }
        return Math.max(0, final);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const basePrice = Number(formData.base_price);
            const discValue = Number(formData.discount_value);
            const payload = {
                name: formData.name,
                description: formData.description,
                category_id: formData.category_id,
                sizes: ['S', 'M', 'L', 'XL'],
                base_price: basePrice,
                discount_type: formData.discount_type,
                discount_value: discValue,
                final_price: calculateFinalPrice(basePrice, formData.discount_type, discValue),
                stock: Number(formData.stock),
                is_featured: formData.is_featured,
            };

            let productId = editingId;

            if (editingId) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('products').insert([payload]).select().single();
                if (error) throw error;
                productId = data.id;
            }

            // Sync images if any exist in the local state buffer
            // For simplicity in this demo, we wipe old images and re-insert if changed, or append
            if (currentImages.length > 0) {
                // Delete existing records for this product
                if (editingId) {
                    await supabase.from('product_images').delete().eq('product_id', productId);
                }

                // Insert the new mapped array
                const imageInserts = currentImages.map((img, idx) => ({
                    product_id: productId,
                    url: img.url,
                    display_order: idx
                }));

                const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
                if (imgError) throw imgError;
            }


            setShowForm(false);
            setEditingId(null);
            resetForm();
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error saving product: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', category_id: '',
            base_price: '', discount_type: 'none', discount_value: '', stock: '',
            is_featured: false
        });
        setCurrentImages([]);
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description,
            category_id: product.category_id || '',
            base_price: product.base_price,
            discount_type: product.discount_type || 'none',
            discount_value: product.discount_value || '',
            stock: product.stock || 0,
            is_featured: product.is_featured || false
        });

        // Load existing images into buffer
        if (product.product_images) {
            const sorted = [...product.product_images].sort((a, b) => a.display_order - b.display_order);
            setCurrentImages(sorted);
        } else {
            setCurrentImages([]);
        }

        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await supabase.from('products').delete().eq('id', id);
            setProductToDelete(null);
            fetchData();
        } catch (err) {
            alert('Error deleting product: ' + err.message);
        }
    };

    const handleStockUpdate = async (id, currentStock, delta) => {
        const newStock = Math.max(0, currentStock + delta);
        try {
            await supabase.from('products').update({ stock: newStock }).eq('id', id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        try {
            const uploadedUrls = [];

            for (const file of files) {
                console.log(`Original size for ${file.name}: ${(file.size / 1024).toFixed(2)}KB`);
                const compressedFile = await compressImage(file, 1000, 0.7);
                console.log(`Compressed size for ${file.name}: ${(compressedFile.size / 1024).toFixed(2)}KB`);

                const fileExt = file.name.split('.').pop();
                const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;

                const { error } = await supabase.storage.from('glam_assets').upload(fileName, compressedFile);
                if (error) throw error;

                const { data } = supabase.storage.from('glam_assets').getPublicUrl(fileName);
                uploadedUrls.push({ url: data.publicUrl });
            }

            setCurrentImages([...currentImages, ...uploadedUrls]);
        } catch (err) {
            alert('Image upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImageFromBuffer = (index) => {
        const newImgs = [...currentImages];
        newImgs.splice(index, 1);
        setCurrentImages(newImgs);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Manage Products</h2>
                <button
                    className="btn-primary"
                    onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}
                >
                    {showForm ? 'Cancel' : '+ Add Product'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ padding: '24px', marginBottom: '30px' }}>
                    <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Product Name</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <textarea required rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inputStyle} />
                        </div>

                        <div>
                            <label>Category</label>
                            <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} style={inputStyle}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label>Base Price (₹)</label>
                            <input type="number" required value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: e.target.value })} style={inputStyle} />
                        </div>

                        <div>
                            <label>Discount Type</label>
                            <select value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })} style={inputStyle}>
                                <option value="none">None</option>
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat (₹)</option>
                            </select>
                        </div>

                        <div>
                            <label>Discount Value</label>
                            <input type="number" disabled={formData.discount_type === 'none'} value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: e.target.value })} style={inputStyle} />
                        </div>

                        <div>
                            <label>Initial Stock</label>
                            <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} style={inputStyle} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="is_featured"
                                checked={formData.is_featured}
                                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="is_featured" style={{ margin: 0 }}>Feature on Home Page</label>
                        </div>

                        {/* Image Uploader */}
                        <div style={{ gridColumn: '1 / -1', border: '1px dashed var(--color-gray)', padding: '20px', borderRadius: '8px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Product Images (Auto-uploads to Supabase)</label>

                            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', marginBottom: '15px', paddingBottom: '10px' }}>
                                {currentImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, idx)}
                                        onDragEnd={onDragEnd}
                                        onDragOver={(e) => { e.preventDefault(); onDragOver(idx); }}
                                        className="image-upload-preview"
                                        style={{ position: 'relative', width: '100px', height: '120px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', cursor: 'move', boxShadow: 'var(--shadow-soft)', transition: 'all 0.2s ease', background: '#fff', border: '1px solid #eee' }}
                                    >
                                        <div style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderBottom: '1px solid #eee' }}>
                                            <GripVertical size={16} color="#aaa" />
                                        </div>
                                        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 24px)' }}>
                                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div className="hover-delete-overlay" onClick={() => removeImageFromBuffer(idx)}>
                                                <Trash2 size={24} color="white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                {uploading ? 'Uploading...' : 'Browse Images'}
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                            </label>
                        </div>


                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" className="btn-primary" disabled={loading || uploading}>
                                {loading ? 'Saving...' : 'Save Product Data'}
                            </button>
                        </div>
                    </form>
                </div>
            )}


            {/* Products Table */}
            <style>{`
                .image-upload-preview:hover {
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
                    transform: translateY(-2px);
                }
                .hover-delete-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 77, 77, 0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    cursor: pointer;
                }
                .image-upload-preview:hover .hover-delete-overlay {
                    opacity: 1;
                }
            `}</style>
            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-beige)' }}>
                        <tr>
                            <th style={thStyle}>Product</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>Price</th>
                            <th style={thStyle}>Stock</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td style={tdStyle}>
                                    <p style={{ fontWeight: 500, margin: 0 }}>{p.name}</p>
                                </td>
                                <td style={tdStyle}>{p.category?.name || 'Uncategorized'}</td>
                                <td style={tdStyle}>
                                    <div>
                                        ₹{p.final_price}
                                        {p.discount_type !== 'none' && <span style={{ fontSize: '10px', color: 'gray', display: 'block', textDecoration: 'line-through' }}>₹{p.base_price}</span>}
                                    </div>
                                    {p.is_featured && (
                                        <span style={{ fontSize: '10px', background: 'var(--color-gold-start)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                            FEATURED
                                        </span>
                                    )}
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button onClick={() => handleStockUpdate(p.id, p.stock, -1)} style={stockBtn}>-</button>
                                        <span>{p.stock}</span>
                                        <button onClick={() => handleStockUpdate(p.id, p.stock, 1)} style={stockBtn}>+</button>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <button className="btn-secondary" onClick={() => handleEdit(p)} style={{ padding: '6px 12px', marginRight: '10px' }}>Edit</button>
                                    <button onClick={() => setProductToDelete(p)} style={{ padding: '6px 12px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No products found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {productToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="card" style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '12px',
                        maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        animation: 'fadeIn 0.2s ease'
                    }}>
                        <h3 style={{ marginBottom: '15px', color: 'var(--color-black)' }}>Confirm Deletion</h3>
                        <p style={{ marginBottom: '25px', color: 'var(--color-black-light)', lineHeight: '1.5' }}>
                            Are you sure you want to permanently delete <strong>{productToDelete.name}</strong>?<br />This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setProductToDelete(null)}
                                style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--color-gray)', background: 'white', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(productToDelete.id)}
                                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#ff4d4d', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Yes, Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-gray)', marginTop: '4px'
};
const thStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };
const tdStyle = { padding: '15px 20px', borderBottom: '1px solid var(--color-gray)' };
const stockBtn = { background: '#eee', border: '1px solid #ccc', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' };

export default AdminProducts;
