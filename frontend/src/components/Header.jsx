import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = useContext(AuthContext); // Get user data if available

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.inner}>
                    {/* Hamburger Desktop/Mobile */}
                    <button className={styles.hamburger} onClick={toggleMenu} aria-label="Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    {/* Logo */}
                    <Link to="/" className={styles.logo}>
                        GLAM ABAYA
                    </Link>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <div className={`${styles.searchWrapper} ${isSearchOpen ? styles.searchOpen : ''}`}>
                            <button className={styles.iconBtn} onClick={toggleSearch} aria-label="Search">
                                <Search size={20} />
                            </button>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Link to="/profile" className={styles.iconBtn} aria-label="User Profile">
                            <User size={20} />
                        </Link>

                        <button className={styles.cartBtn} aria-label="Cart">
                            <ShoppingCart size={20} />
                            <span className={styles.badge}>0</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div className={styles.overlay} onClick={closeMenu}></div>
                    <div className={styles.drawer}>
                        <button className={styles.drawerClose} onClick={closeMenu} aria-label="Close menu">
                            <X size={28} />
                        </button>

                        <nav className={styles.drawerNav}>
                            <Link to="/" onClick={closeMenu}>Home</Link>
                            <Link to="/shop" onClick={closeMenu}>Shop</Link>
                            <Link to="/about" onClick={closeMenu}>About Us</Link>
                        </nav>

                        {/* Profile Info in Drawer */}
                        {user ? (
                            <Link to="/profile" className={styles.drawerProfile} onClick={closeMenu}>
                                <div className={styles.drawerAvatar}>
                                    <User size={24} />
                                </div>
                                <div className={styles.drawerProfileInfo}>
                                    <span className={styles.drawerProfileName}>{user.profileData?.name || 'My Account'}</span>
                                    <span className={styles.drawerProfileSub}>{user.email}</span>
                                </div>
                            </Link>
                        ) : (
                            <Link to="/login" className={styles.drawerProfile} onClick={closeMenu}>
                                <div className={styles.drawerAvatar}>
                                    <User size={24} />
                                </div>
                                <div className={styles.drawerProfileInfo}>
                                    <span className={styles.drawerProfileName}>Sign In</span>
                                    <span className={styles.drawerProfileSub}>View account & orders</span>
                                </div>
                            </Link>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default Header;
