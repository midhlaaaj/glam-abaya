import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // AuthContext listener will pick up the session and set the user automatically
            navigate('/profile');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--color-black-light)' }}>Sign in to your Glam Abaya account</p>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--color-purple)', fontWeight: 600 }}>Create Account</Link>
                </p>
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--color-gray)', fontSize: '15px' };

export default Login;
