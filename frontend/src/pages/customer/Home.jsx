import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '../../services/supabase';

const Home = () => {
    const [hero, setHero] = useState(null);
    const [featured, setFeatured] = useState([]);
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            let heroResult = null;
            let featuredResult = [];
            let influencerResult = [];

            try {
                const { data: heroData, error: heroError } = await supabase
                    .from('hero_section')
                    .select('*')
                    .eq('is_active', true)
                    .single();

                if (heroError && heroError.code !== 'PGRST116') {
                    console.error('Error fetching hero:', heroError);
                } else {
                    heroResult = heroData || null;
                }
            } catch (err) {
                console.error('Unexpected error fetching hero:', err);
            }

            try {
                const { data: prodData, error: prodError } = await supabase
                    .from('products')
                    .select(`*, product_images(url, display_order)`)
                    .eq('is_featured', true)
                    .limit(4);

                if (prodError) {
                    console.error('Error fetching featured products:', prodError);
                } else {
                    featuredResult = prodData || [];
                }
            } catch (err) {
                console.error('Unexpected error fetching products:', err);
            }

            try {
                const { data: infData, error: infError } = await supabase
                    .from('influencers')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (infError) {
                    console.error('Error fetching influencers:', infError);
                } else {
                    influencerResult = infData || [];
                }
            } catch (err) {
                console.error('Unexpected error fetching influencers:', err);
            }

            setHero(heroResult);
            setFeatured(featuredResult);
            setInfluencers(influencerResult);
            setLoading(false);
        };
        fetchHomeData();
    }, []);

    // Scroll Lock for Video Modal
    useEffect(() => {
        if (activeVideo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [activeVideo]);

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Dynamic Hero Section or Fallback */}
            {hero && Object.keys(hero).length > 0 ? (
                <section style={{
                    position: 'relative',
                    height: '80vh',
                    minHeight: '600px',
                    backgroundImage: `url(${hero.image_url || 'https://placehold.co/1920x1080?text=Glam+Abaya'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'var(--color-white)',
                    padding: '0 20px'
                }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', animation: 'fadeIn 1.5s ease' }}>
                        {hero.pre_heading && <p style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px' }}>{hero.pre_heading}</p>}

                        <h1 className="gold-text" style={{ fontSize: 'clamp(40px, 6vw, 70px)', marginBottom: '20px', lineHeight: 1.1 }}>
                            {hero.title}
                        </h1>

                        {hero.description && <p style={{ fontSize: '18px', marginBottom: '40px', fontWeight: 300, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{hero.description}</p>}

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            {hero.button1_text && (
                                <Link to={hero.button1_link || '/shop'} className="btn-primary" style={{ padding: '15px 40px', fontSize: '16px' }}>
                                    {hero.button1_text}
                                </Link>
                            )}
                            {hero.button2_text && (
                                <Link to={hero.button2_link || '/shop'} className="btn-secondary" style={{ padding: '15px 40px', fontSize: '16px', backgroundColor: 'var(--color-white)', color: 'var(--color-purple)' }}>
                                    {hero.button2_text}
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            ) : (
                <section style={{
                    position: 'relative',
                    height: '80vh',
                    minHeight: '600px',
                    backgroundColor: 'var(--color-black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'var(--color-white)',
                    padding: '0 20px'
                }}>
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                        <h1 className="gold-text" style={{ fontSize: 'clamp(40px, 6vw, 70px)', marginBottom: '20px', lineHeight: 1.1 }}>
                            Welcome to Glam Abaya
                        </h1>
                        <p style={{ fontSize: '18px', marginBottom: '40px', fontWeight: 300 }}>
                            Discover our exclusive collection. Our hero section is currently being updated.
                        </p>
                        <Link to="/shop" className="btn-primary" style={{ padding: '15px 40px', fontSize: '16px' }}>
                            Shop Now
                        </Link>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="container" style={{ padding: '80px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '36px', marginBottom: '15px' }}>Featured Collection</h2>
                    <div style={{ width: '60px', height: '3px', background: 'var(--gradient-gold)', margin: '0 auto' }}></div>
                </div>

                <div className="product-grid">
                    {featured.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
                            <div className="card product-card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'relative', paddingTop: '130%', backgroundColor: '#f9f9f9' }}>
                                    <img
                                        src={product.product_images && product.product_images.length > 0 ? product.product_images.sort((a, b) => a.display_order - b.display_order)[0].url : 'https://placehold.co/400x600?text=Glam+Abaya'}
                                        alt={product.name}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {product.is_on_sale && (
                                        <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'var(--color-gold-start)', color: 'white', padding: '5px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '4px' }}>
                                            SALE
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{product.name}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--color-black)', fontSize: '16px' }}>₹{product.final_price}</span>
                                        {product.discount_type !== 'none' && (
                                            <span style={{ color: 'var(--color-black-light)', textDecoration: 'line-through', fontSize: '14px' }}>₹{product.base_price}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Link to="/shop" className="btn-secondary">View All Products</Link>
                </div>
            </section>

            {/* Voices That Inspire Us (Influencers) */}
            {influencers.length > 0 && (
                <section style={{ padding: '80px 0', backgroundColor: '#fff' }}>
                    <div className="container" style={{ textAlign: 'center', marginBottom: '40px', padding: '0 20px' }}>
                        <h2 style={{ fontSize: '36px', marginBottom: '15px' }}>Our Influencers</h2>
                        <div style={{ width: '60px', height: '3px', background: 'var(--gradient-gold)', margin: '0 auto' }}></div>
                    </div>

                    <div className="influencer-scroll-container">
                        <div className="influencer-track">
                            {influencers.map(inf => {
                                const isDirectVideo = inf.video_url && !inf.video_url.includes('youtube.com') && !inf.video_url.includes('youtu.be');
                                return (
                                    <div
                                        key={inf.id}
                                        className="influencer-card"
                                        onClick={() => setActiveVideo(inf.video_url)}
                                        onMouseEnter={() => setHoveredId(inf.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="influencer-media">
                                            <img
                                                src={inf.thumbnail_url || 'https://placehold.co/400x600'}
                                                alt={inf.name}
                                                className={hoveredId === inf.id && isDirectVideo ? 'media-hidden' : ''}
                                            />
                                            {isDirectVideo && hoveredId === inf.id && (
                                                <video
                                                    src={inf.video_url}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="hover-video-preview"
                                                />
                                            )}
                                            <div className="play-button">
                                                <div className="play-icon"></div>
                                            </div>
                                        </div>
                                        <h3 className="influencer-name">{inf.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Video Modal */}
            {activeVideo && (
                <div className="video-modal-overlay" onClick={() => setActiveVideo(null)}>
                    <div className="video-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveVideo(null)}>
                            <X size={30} />
                        </button>
                        <div className="video-container">
                            {activeVideo.includes('youtube.com') || activeVideo.includes('youtu.be') ? (
                                <iframe
                                    src={activeVideo.replace('watch?v=', 'embed/').split('&')[0]}
                                    title="Influencer Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video src={activeVideo} controls autoPlay className="main-video"></video>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-card {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        .product-card img {
          transition: transform 0.6s ease;
        }
        .product-card:hover img {
          transform: scale(1.05);
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

        /* Influencer Section Styles */
        .influencer-scroll-container {
            width: 100%;
            overflow-x: auto;
            padding: 20px 0 40px;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
        
        /* Custom Scrollbar */
        .influencer-scroll-container::-webkit-scrollbar {
            height: 4px;
        }
        .influencer-scroll-container::-webkit-scrollbar-track {
            background: #f0f0f0;
            margin: 0 20%;
        }
        .influencer-scroll-container::-webkit-scrollbar-thumb {
            background: var(--color-gold-start);
            border-radius: 10px;
        }

        .influencer-track {
            display: flex;
            gap: 20px;
            padding: 0 20px;
            width: max-content;
            margin: 0 auto;
        }

        .influencer-card {
            width: 260px;
            flex-shrink: 0;
            text-align: center;
        }

        .influencer-media {
            position: relative;
            padding-top: 150%;
            border-radius: 12px;
            overflow: hidden;
            background: #eee;
            margin-bottom: 15px;
            box-shadow: var(--shadow-soft);
        }

        .influencer-media img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease, opacity 0.3s ease;
        }

        .influencer-media img.media-hidden {
            opacity: 0;
        }

        .hover-video-preview {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            animation: fadeIn 0.4s ease;
        }

        .influencer-card:hover img {
            transform: scale(1.05);
        }

        .play-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 2;
            transition: all 0.3s ease;
        }

        .influencer-card:hover .play-button {
            background: #fff;
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }

        .play-icon {
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-left: 12px solid var(--color-purple);
            margin-left: 4px;
        }

        .influencer-name {
            font-size: 16px;
            font-weight: 500;
            color: var(--color-black);
        }

        @media (max-width: 768px) {
            .influencer-card {
                width: 200px;
            }
            .influencer-track {
                margin: 0;
            }
        }

        /* Video Modal Styles */
        .video-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        .video-modal-content {
            position: relative;
            width: 100%;
            max-width: 500px;
            aspect-ratio: 9/16;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }

        .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: rgba(255,255,255,0.4);
            transform: rotate(90deg);
        }

        .video-container {
            width: 100%;
            height: 100%;
        }

        .video-container iframe, .main-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        @media (min-width: 768px) {
            .video-modal-content {
                max-width: 400px;
            }
        }
      `}</style>
        </div>
    );
};

export default Home;
