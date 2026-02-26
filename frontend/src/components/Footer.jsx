import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.brand}>
                    <h2 className={`gold-text ${styles.logo}`}>Glam Abaya</h2>
                    <p className={styles.tagline}>Redefining elegance in every thread.</p>
                </div>
                <div className={styles.links}>
                    <div className={styles.col}>
                        <h4>Shop</h4>
                        <Link to="/shop">All Abayas</Link>
                        <Link to="/shop">Sale</Link>
                        <Link to="/shop">Featured</Link>
                    </div>
                    <div className={styles.col}>
                        <h4>Help</h4>
                        <Link to="#">Sizing Guide</Link>
                        <Link to="#">Shipping & Returns</Link>
                        <Link to="#">Contact</Link>
                    </div>
                    <div className={styles.col}>
                        <h4>Follow Us</h4>
                        <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">TikTok</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">Pinterest</a>
                    </div>
                </div>
            </div>
            <div className={styles.bottom}>
                <p>© {new Date().getFullYear()} Glam Abaya. All rights reserved.</p>
            </div>
        </footer>
    );
}
