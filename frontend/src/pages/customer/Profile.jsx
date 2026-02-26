import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
    const { user, logoutUser, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) return <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>Loading...</div>;
    if (!user) return null; // Will redirect via useEffect

    const profileData = user.profileData || {};

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>My Account</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '40px' }}>

                    {/* Profile Details */}
                    <div className="card" style={{ padding: '30px', height: 'fit-content' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-gold-start)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '30px', color: 'white', fontWeight: 600 }}>
                                {profileData.name ? profileData.name.charAt(0) : 'U'}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>{profileData.name || 'User'}</h3>
                        <p style={{ color: 'var(--color-black-light)', marginBottom: '30px' }}>{user.email}</p>

                        <button onClick={logoutUser} className="btn-secondary" style={{ width: '100%' }}>Sign Out</button>
                    </div>

                    {/* Order History Stub */}
                    <div>
                        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Order History</h2>
                        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-black-light)', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
                            <button onClick={() => navigate('/shop')} className="btn-primary">Start Shopping</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
