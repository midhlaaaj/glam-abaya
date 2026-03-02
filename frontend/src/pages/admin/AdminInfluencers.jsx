import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { compressImage } from '../../services/imageUtils';
import { Plus, Trash2, Edit2, Check, X, Video, Image as ImageIcon, GripVertical, AlertCircle } from 'lucide-react';

const AdminInfluencers = () => {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        video_url: '',
        thumbnail_url: '',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchInfluencers();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchInfluencers();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchInfluencers = async () => {
        try {
            // Force token refresh if the tab was suspended for a long time
            const retry = async (fn, retries = 2) => {
                for (let i = 0; i <= retries; i++) {
                    try {
                        const res = await fn();
                        if (!res.error || res.error.code === 'PGRST116') return res;
                        if (i === retries) throw res.error;
                        await new Promise(r => setTimeout(r, 1000));
                    } catch (e) {
                        if (i === retries) throw e;
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            };

            const { data } = await retry(() => supabase
                .from('influencers')
                .select('*')
                .order('display_order', { ascending: true })
            );

            setInfluencers(data || []);
        } catch (err) {
            console.error('Error fetching influencers:', err);
        } finally {
            setLoading(false);
        }
    };

    const extractThumbnail = (videoSource) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = videoSource;
            video.crossOrigin = 'anonymous';
            video.currentTime = 0.5; // Seek a bit to avoid black frame
            video.muted = true;
            video.play();

            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                video.pause();
                resolve(dataUrl);
            };

            video.onerror = (e) => reject('Failed to load video for thumbnail: ' + e.message);
            // Timeout after 5 seconds
            setTimeout(() => reject('Thumbnail extraction timed out'), 5000);
        });
    };

    const autoGenerateThumbnail = async (videoUrl) => {
        if (!videoUrl || formData.thumbnail_url) return;

        // Skip YouTube for auto-extraction (CORS)
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) return;

        try {
            const thumbDataUrl = await extractThumbnail(videoUrl);

            // Convert DataURL to File for upload
            const response = await fetch(thumbDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'auto_thumb.jpg', { type: 'image/jpeg' });

            setUploading(true);
            const fileName = `auto_thumb_${Date.now()}.jpg`;
            const path = `influencers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('glam_assets')
                .upload(path, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('glam_assets').getPublicUrl(path);
            setFormData(prev => ({ ...prev, thumbnail_url: data.publicUrl }));
        } catch (err) {
            console.warn('Auto-thumbnail failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Video Size Limit (50MB)
        if (type === 'video' && file.size > 50 * 1024 * 1024) {
            alert('File too large! Direct video uploads are limited to 50MB for performance. Please use a YouTube/Google Drive link or compress the video first.');
            return;
        }

        setUploading(true);
        try {
            let processedFile = file;
            if (type === 'thumbnail') {
                processedFile = await compressImage(file, 600, 0.7);
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `ugc_${Date.now()}.${fileExt}`;
            const path = `influencers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('glam_assets')
                .upload(path, processedFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('glam_assets').getPublicUrl(path);

            if (type === 'thumbnail') {
                setFormData({ ...formData, thumbnail_url: data.publicUrl });
            } else {
                setFormData({ ...formData, video_url: data.publicUrl });
                // Trigger auto-thumbnail if thumbnail is empty
                if (!formData.thumbnail_url) {
                    autoGenerateThumbnail(data.publicUrl);
                }
            }
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('influencers')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('influencers')
                    .insert([formData]);
                if (error) throw error;
            }

            setIsEditing(false);
            setEditingId(null);
            resetForm();
            fetchInfluencers();
        } catch (err) {
            alert('Error saving influencer: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (inf) => {
        setFormData({
            name: inf.name,
            video_url: inf.video_url,
            thumbnail_url: inf.thumbnail_url,
            is_active: inf.is_active,
            display_order: inf.display_order
        });
        setEditingId(inf.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this influencer?')) return;
        try {
            const { error } = await supabase.from('influencers').delete().eq('id', id);
            if (error) throw error;
            fetchInfluencers();
        } catch (err) {
            alert('Error deleting: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            video_url: '',
            thumbnail_url: '',
            is_active: true,
            display_order: influencers.length // Default to end
        });
    };

    // Drag and Drop Handlers
    const [draggedItem, setDraggedItem] = useState(null);

    const onDragStart = (e, index) => {
        setDraggedItem(influencers[index]);
        e.dataTransfer.effectAllowed = 'move';
        // HTML5 drag effect
        e.target.style.opacity = '0.5';
    };

    const onDragEnd = (e) => {
        e.target.style.opacity = '1';
    };

    const onDragOver = (index) => {
        const item = influencers[index];

        // if the item is dragged over itself, ignore
        if (draggedItem === item) return;

        // filter out the currently dragged item of the list
        let items = influencers.filter(i => i !== draggedItem);

        // add the dragged item after the hovered item
        items.splice(index, 0, draggedItem);

        setInfluencers(items);
    };

    const saveNewOrder = async () => {
        setLoading(true);
        try {
            const updates = influencers.map((inf, idx) => ({
                ...inf,
                display_order: idx
            }));

            // Perform bulk update (Supabase allows multiple objects with IDs)
            const { error } = await supabase
                .from('influencers')
                .upsert(updates, { onConflict: 'id' });

            if (error) throw error;
            alert('New order saved successfully!');
        } catch (err) {
            alert('Failed to save order: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginTop: '5px'
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', margin: 0 }}>Influencer UGC Management</h1>
                {!isEditing && (
                    <button
                        onClick={() => { setIsEditing(true); resetForm(); setEditingId(null); }}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={20} /> Add New Influencer
                    </button>
                )}
            </div>

            {isEditing && (
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>{editingId ? 'Edit Influencer' : 'Add New Influencer Video'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Influencer Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g. Sarah J."
                            />
                        </div>

                        <div>
                            <label>Thumbnail Image (UGC Photo)</label>
                            <div style={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleFileUpload(e, 'thumbnail')}
                                    style={{ display: 'none' }}
                                    id="thumbnail-upload"
                                />
                                <label htmlFor="thumbnail-upload" style={{
                                    padding: '10px 15px',
                                    border: '1px dashed var(--color-purple)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flex: 1
                                }}>
                                    <ImageIcon size={18} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                                </label>
                                {formData.thumbnail_url && <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                    <img src={formData.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>}
                                {formData.video_url && !formData.video_url.includes('youtube') && (
                                    <button
                                        type="button"
                                        onClick={() => autoGenerateThumbnail(formData.video_url)}
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            background: '#f9f9f9',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                        title="Auto-extract from video"
                                    >
                                        Auto-Extract
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label>Video Content (URL or Upload)</label>
                            <div style={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={e => handleFileUpload(e, 'video')}
                                    style={{ display: 'none' }}
                                    id="video-upload"
                                />
                                <label htmlFor="video-upload" style={{
                                    padding: '10px 15px',
                                    border: '1px dashed var(--color-purple)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flex: 1
                                }}>
                                    <Video size={18} /> {uploading ? 'Uploading...' : 'Upload Video'}
                                </label>
                            </div>
                            <input
                                type="text"
                                value={formData.video_url}
                                onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                onBlur={e => autoGenerateThumbnail(e.target.value)}
                                style={{ ...inputStyle, marginTop: '10px' }}
                                placeholder="Or paste video URL here"
                            />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <AlertCircle size={14} /> <strong>Pro Tip:</strong> Using YouTube/Drive/Cloudinary links is faster than direct uploads.
                            </p>
                        </div>


                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="is_active" style={{ margin: 0 }}>Active / Visible</label>
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" className="btn-primary" disabled={loading || uploading}>
                                {loading ? 'Saving...' : (editingId ? 'Update Influencer' : 'Add Influencer')}
                            </button>
                            <button type="button" onClick={() => { setIsEditing(false); resetForm(); }} style={{
                                padding: '12px 25px',
                                border: '1px solid #ddd',
                                borderRadius: '30px',
                                background: 'none',
                                cursor: 'pointer'
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={saveNewOrder}
                    className="btn-secondary"
                    style={{ fontSize: '13px', padding: '8px 20px' }}
                    disabled={loading}
                >
                    Save Dragged Order
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                        Loading influencers...
                    </div>
                ) : influencers.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                        No influencers added yet. Click "Add New Influencer" to start.
                    </div>
                ) : (
                    influencers.map((inf, idx) => (
                        <div
                            key={inf.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, idx)}
                            onDragEnd={onDragEnd}
                            onDragOver={(e) => { e.preventDefault(); onDragOver(idx); }}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-soft)',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'move',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ height: '200px', position: 'relative', background: '#f5f5f5' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    zIndex: 2,
                                    background: 'rgba(255,255,255,0.8)',
                                    borderRadius: '4px',
                                    padding: '4px'
                                }}>
                                    <GripVertical size={20} color="#666" />
                                </div>
                                {inf.thumbnail_url ? (
                                    <img src={inf.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={inf.name} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                        <ImageIcon size={40} />
                                    </div>
                                )}
                                {!inf.is_active && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4d4d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                        INACTIVE
                                    </div>
                                )}
                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Video size={14} /> Video {inf.video_url ? 'Linked' : 'Missing'}
                                </div>
                            </div>
                            <div style={{ padding: '20px', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{inf.name}</h3>
                                        <span style={{ fontSize: '13px', color: '#777' }}>Order: {inf.display_order}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleEdit(inf)} style={{ padding: '8px', color: 'var(--color-purple)', border: 'none', background: 'none', cursor: 'pointer' }}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(inf.id)} style={{ padding: '8px', color: '#ff4d4d', border: 'none', background: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminInfluencers;
