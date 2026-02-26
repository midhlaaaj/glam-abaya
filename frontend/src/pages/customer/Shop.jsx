import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: catData, error: catError } = await supabase
                .from('categories')
                .select('*')
                .eq('is_visible', true);

            if (catError) throw catError;

            const { data: prodData, error: prodError } = await supabase
                .from('products')
                .select(`*, product_images(url, display_order)`);

            if (prodError) throw prodError;

            setCategories([{ id: 'All', name: 'All Collection' }, ...catData]);
            setProducts(prodData || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category_id === activeCategory);

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '42px', marginBottom: '15px' }}>Our Collection</h1>
                <p style={{ color: 'var(--color-black-light)', maxWidth: '600px', margin: '0 auto' }}>
                    Explore our exclusive range of luxury abayas, designed with elegance and perfection in Dubai.
                </p>
            </div>

            {/* Category Filter */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '50px',
                flexWrap: 'wrap'
            }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '30px',
                            border: activeCategory === cat.id ? 'none' : '1px solid var(--color-gray)',
                            backgroundColor: activeCategory === cat.id ? 'var(--color-purple)' : 'transparent',
                            color: activeCategory === cat.id ? 'var(--color-white)' : 'var(--color-black)',
                            fontWeight: activeCategory === cat.id ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'var(--transition-normal)'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading Collection...</div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
                            <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                                <div style={{ position: 'relative', paddingTop: '120%', overflow: 'hidden', borderRadius: '4px' }}>
                                    <img
                                        src={product.product_images && product.product_images.length > 0 ? product.product_images.sort((a, b) => a.display_order - b.display_order)[0].url : 'https://placehold.co/600x800?text=Glam+Abaya'}
                                        alt={product.name}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {product.is_on_sale && (
                                        <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'var(--color-gold-start)', color: 'white', padding: '6px 14px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                                            SALE
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '24px 10px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 400 }}>{product.name}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 500, color: 'var(--color-black)', fontSize: '18px' }}>₹{product.final_price}</span>
                                        {product.discount_type !== 'none' && (
                                            <span style={{ color: 'var(--color-black-light)', textDecoration: 'line-through', fontSize: '15px' }}>₹{product.base_price}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--color-black-light)' }}>
                            No products available in this category.
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .product-card:hover img {
          transform: scale(1.05);
          transition: transform 0.6s ease;
        }
        .product-card img {
          transition: transform 0.6s ease;
        }
        .product-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
          }
        }
      `}</style>
        </div>
    );
};

export default Shop;
