import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories(name), product_images(url, display_order)')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Sort images by order
                if (data.product_images) {
                    data.product_images.sort((a, b) => a.display_order - b.display_order);
                }

                setProduct(data);
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>Loading...</div>;
    if (!product) return <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>Product not found.</div>;

    const isOutOfStock = product.stock <= 0;
    const images = product.product_images || [];

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <Link to="/shop" style={{ display: 'inline-block', marginBottom: '30px', color: 'var(--color-purple)', fontWeight: 500 }}>
                &larr; Back to Shop
            </Link>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px' }}>

                {/* Gallery Section */}
                <div style={{ flex: '1 1 400px' }}>
                    <div style={{ position: 'relative', paddingTop: '120%', backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
                        <img
                            src={images[activeImage] ? images[activeImage].url : 'https://placehold.co/600x800?text=Glam+Abaya'}
                            alt={product.name}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    style={{
                                        width: '80px', height: '100px', flexShrink: 0, cursor: 'pointer',
                                        borderRadius: '4px', overflow: 'hidden',
                                        border: activeImage === idx ? '2px solid var(--color-gold-start)' : '2px solid transparent'
                                    }}
                                >
                                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{product.name}</h1>
                    <p style={{ color: 'var(--color-black-light)', marginBottom: '20px' }}>{product.category?.name}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 600 }}>₹{product.final_price}</span>
                        {product.discount_type !== 'none' && (
                            <span style={{ fontSize: '20px', color: 'var(--color-black-light)', textDecoration: 'line-through' }}>
                                ₹{product.base_price}
                            </span>
                        )}
                        {product.is_on_sale && (
                            <span style={{ backgroundColor: 'var(--color-gold-start)', color: 'white', padding: '4px 10px', fontSize: '13px', borderRadius: '4px', fontWeight: 600 }}>
                                SALE
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Select Size</h4>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            {product.sizes?.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    style={{
                                        width: '45px', height: '45px', borderRadius: '50%',
                                        border: selectedSize === size ? '2px solid var(--color-gold-start)' : '1px solid var(--color-gray)',
                                        backgroundColor: selectedSize === size ? 'var(--color-gold-start)' : 'transparent',
                                        color: selectedSize === size ? 'white' : 'inherit',
                                        fontWeight: 500, cursor: 'pointer', transition: 'var(--transition-normal)'
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ color: isOutOfStock ? 'red' : 'green', fontWeight: 500, marginBottom: '20px' }}>
                            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
                        </p>

                        <button
                            className="btn-primary"
                            disabled={isOutOfStock}
                            style={{ width: '100%', padding: '18px', fontSize: '16px', opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                        >
                            {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart — ₹' + product.final_price}
                        </button>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid var(--color-gray)' }}>
                        <h4 style={{ marginBottom: '15px', fontSize: '18px' }}>Description</h4>
                        <p style={{ color: 'var(--color-black-light)', lineHeight: 1.8 }}>
                            {product.description}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
