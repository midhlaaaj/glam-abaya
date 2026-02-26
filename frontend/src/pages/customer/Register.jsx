import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const Register = () => {
    const [name, setName] = useState('');
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
            // 1. Sign up the user in auth schema
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            // 2. Add profile metadata (defaults to standard 'user' role)
            if (authData?.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { id: authData.user.id, name, email, role: 'user' }
                    ]);

                if (profileError) throw profileError;
            }

            navigate('/profile');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Create Account</h2>
                    <p style={{ color: 'var(--color-black-light)' }}>Join the Glam Abaya luxury experience</p>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input
                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
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
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-purple)', fontWeight: 600 }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--color-gray)', fontSize: '15px' };

export default Register;
