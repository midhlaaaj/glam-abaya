import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log('Login attempt started for:', email);

        // Timeout safeguard for the login process
        const loginTimeout = setTimeout(() => {
            if (loading) {
                console.error('Login process timed out after 10s');
                setError('Login timed out. Please check your connection or try again.');
                setLoading(false);
            }
        }, 10000);

        try {
            console.log('Calling supabase.auth.signInWithPassword...');
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error('Auth error returned:', authError);
                throw authError;
            }

            console.log('Auth successful, user ID:', authData.user.id);
            console.log('Fetching user profile...');

            // Verify they have admin rights
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
                throw profileError;
            }

            console.log('Profile fetched, role:', profileData.role);

            if (profileData.role === 'admin' || profileData.role === 'superadmin') {
                console.log('Role verified. Navigating to admin dashboard...');
                clearTimeout(loginTimeout);
                navigate('/admin');
            } else {
                console.warn('Non-admin user attempted login:', profileData.role);
                await supabase.auth.signOut();
                setError('Unauthorized: Admin access required.');
            }
        } catch (err) {
            console.error('Login flow catch block:', err);
            if (err.message === 'Failed to fetch') {
                setError('Connection Error: Unable to reach the server.');
            } else {
                setError(err.message || 'Login failed');
            }
        } finally {
            console.log('Login flow finished.');
            setLoading(false);
            clearTimeout(loginTimeout);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-beige)',
            fontFamily: 'var(--font-serif)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: 'var(--color-purple)', fontSize: '28px', marginBottom: '8px', letterSpacing: '1px' }}>
                        GLAM ABAYA
                    </h1>
                    <h2 style={{ fontSize: '18px', fontWeight: 300, color: 'var(--color-black-light)' }}>Admin Workspace</h2>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fff5f5', color: '#e53e3e', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #feb2b2' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 500, color: 'var(--color-black)' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="admin@glamabaya.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-gray)', outline: 'none', transition: 'border-color 0.2s' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 500, color: 'var(--color-black)' }}>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-gray)', marginBottom: '10px', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="show-password"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor="show-password" style={{ fontSize: '12px', color: 'var(--color-black-light)', cursor: 'pointer' }}>
                                Show Password
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            marginTop: '10px',
                            padding: '14px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            background: '#D4AF37', // Solid gold, no gradient
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                        }}
                    >
                        {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
