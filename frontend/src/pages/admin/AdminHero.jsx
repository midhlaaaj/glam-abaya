import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { compressImage } from '../../services/imageUtils';

const AdminHero = () => {
    const [heroData, setHeroData] = useState({
        id: '',
        pre_heading: '',
        title: '',
        description: '',
        button1_text: '',
        button1_link: '',
        button2_text: '',
        button2_link: '',
        image_url: ''
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchHero();
    }, []);

    const fetchHero = async () => {
        try {
            const { data, error } = await supabase.from('hero_section').select('*').eq('is_active', true).single();
            if (data) {
                setHeroData(data);
                setPreview(data.image_url);
            }
        } catch (err) {
            console.error('No active hero setting found or error fetching.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { ...heroData, is_active: true };

            if (payload.id) {
                const { error } = await supabase.from('hero_section').update(payload).eq('id', payload.id);
                if (error) throw error;
            } else {
                delete payload.id; // ensure we get a new UUID if it was blank
                const { error } = await supabase.from('hero_section').insert([payload]);
                if (error) throw error;
            }

            alert('Hero section updated successfully');
            fetchHero(); // Refresh to get the generated ID if it was an insert
        } catch (err) {
            alert('Error updating hero section: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        console.log('Starting image upload to glam_assets...');

        // Image upload safeguard timeout
        const uploadTimeout = setTimeout(() => {
            if (uploading) {
                console.warn('Image upload timed out after 30s');
                alert('Image upload timed out. Please verify your connection or if the "glam_assets" bucket exists.');
                setUploading(false);
            }
        }, 30000);

        try {
            console.log(`Original size: ${(file.size / 1024).toFixed(2)}KB`);
            const compressedFile = await compressImage(file, 1920, 0.7); // Higher res for hero
            console.log(`Compressed size: ${(compressedFile.size / 1024).toFixed(2)}KB`);

            const fileExt = file.name.split('.').pop();
            const fileName = `hero_${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('glam_assets')
                .upload(fileName, compressedFile);

            if (error) {
                console.error('Supabase storage error details:', error);
                throw error;
            }

            console.log('Upload successful. Retrieving public URL...');
            const { data: publicUrlData } = supabase.storage.from('glam_assets').getPublicUrl(fileName);

            setPreview(publicUrlData.publicUrl);
            setHeroData({ ...heroData, image_url: publicUrlData.publicUrl });
            console.log('Image URL applied:', publicUrlData.publicUrl);
        } catch (err) {
            console.error('Caught upload error:', err);
            alert('Image upload failed: ' + (err.message || 'Unknown error occurred.'));
        } finally {
            setUploading(false);
            clearTimeout(uploadTimeout);
            console.log('Image upload process finished.');
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Hero Section Configuration</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                <div className="card" style={{ padding: '30px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '20px' }}>Live Preview Content</h3>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Small Pre-Heading</label>
                            <input value={heroData.pre_heading || ''} onChange={e => setHeroData({ ...heroData, pre_heading: e.target.value })} style={inputStyle} placeholder="e.g. NEW COLLECTION" />
                        </div>
                        <div>
                            <label style={labelStyle}>Main Title</label>
                            <input value={heroData.title || ''} onChange={e => setHeroData({ ...heroData, title: e.target.value })} style={inputStyle} placeholder="e.g. Elegance Redefined." required />
                        </div>
                        <div>
                            <label style={labelStyle}>Description Text</label>
                            <textarea rows="3" value={heroData.description || ''} onChange={e => setHeroData({ ...heroData, description: e.target.value })} style={inputStyle} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                            <div>
                                <label style={labelStyle}>Primary Button Text</label>
                                <input value={heroData.button1_text || ''} onChange={e => setHeroData({ ...heroData, button1_text: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Primary Button Link</label>
                                <input value={heroData.button1_link || ''} onChange={e => setHeroData({ ...heroData, button1_link: e.target.value })} style={inputStyle} placeholder="/shop" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Secondary Button Text</label>
                                <input value={heroData.button2_text || ''} onChange={e => setHeroData({ ...heroData, button2_text: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Secondary Button Link</label>
                                <input value={heroData.button2_link || ''} onChange={e => setHeroData({ ...heroData, button2_link: e.target.value })} style={inputStyle} placeholder="/collections" />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </form>
                </div>


                <div className="card" style={{ padding: '30px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '20px' }}>Background Image</h3>

                    <div style={{
                        width: '100%', height: '300px', backgroundColor: '#f0f0f0',
                        borderRadius: '8px', overflow: 'hidden', position: 'relative', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {preview ? (
                            <img src={preview} alt="Hero Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: 'var(--color-gray)' }}>No image uploaded</span>
                        )}
                    </div>

                    <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
                        {uploading ? 'Uploading...' : 'Upload New Image'}
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                </div>

            </div>
        </div>
    );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--color-black-light)' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--color-gray)' };

export default AdminHero;
