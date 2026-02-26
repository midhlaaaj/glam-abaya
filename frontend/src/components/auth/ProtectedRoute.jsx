import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * ProtectedRoute component to restrict access based on authentication and roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string} props.requiredRole - Minimum role required ('user', 'admin', 'superadmin')
 */
const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
    const { user, loading, isAdmin, isSuperAdmin } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-beige)'
            }}>
                <div className="text-purple-600 font-medium">Verifying Credentials...</div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the current location
        const loginPath = requiredRole === 'user' ? '/login' : '/admin/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Role-based checks
    if (requiredRole === 'superadmin' && !isSuperAdmin) {
        return <Navigate to="/admin" replace />;
    }

    if (requiredRole === 'admin' && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
