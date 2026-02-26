import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const checkSession = async () => {
            // Safeguard timeout: If Supabase hangs for more than 5s, 
            // force-stop the loading state so the app can at least show the guest UI
            const timeoutId = setTimeout(() => {
                if (loading) {
                    console.warn('Auth session check timed out. Proceeding as guest.');
                    setLoading(false);
                }
            }, 3000);

            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    await fetchProfile(session.user);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Session check error:', err);
                setLoading(false);
            } finally {
                clearTimeout(timeoutId);
            }
        };

        checkSession();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setUser(null);
                setAdmin(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            const sessionUser = {
                ...authUser,
                profileData: data || null,
                role: data?.role || 'user'
            };

            setUser(sessionUser);

            // Check Admin Roles (admin or superadmin)
            if (data && (data.role === 'admin' || data.role === 'superadmin')) {
                setAdmin(sessionUser);
            } else {
                setAdmin(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = admin !== null;
    const isSuperAdmin = user?.role === 'superadmin';

    const logoutUser = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAdmin(null);
    };

    const logoutAdmin = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            admin,
            setAdmin,
            logoutUser,
            logoutAdmin,
            loading,
            isAdmin,
            isSuperAdmin,
            userRole: user?.role || 'user'
        }}>
            {loading ? (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-beige)',
                    fontFamily: 'var(--font-serif)'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid var(--color-gray)',
                        borderTop: '3px solid #D4AF37',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '20px'
                    }}></div>
                    <h2 style={{ color: 'var(--color-purple)', fontSize: '20px', letterSpacing: '2px' }}>
                        GLAM ABAYA
                    </h2>
                    <p style={{ color: 'var(--color-black-light)', fontSize: '14px', marginTop: '10px' }}>
                        Loading your workspace...
                    </p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
