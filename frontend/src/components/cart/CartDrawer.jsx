import { useContext, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import styles from './CartDrawer.module.css';

const CartDrawer = () => {
    const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, toggleCart, getCartTotal, getCartCount } = useContext(CartContext);

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    return (
        <div className={styles.cartOverlay}>
            <div className={styles.backdrop} onClick={toggleCart}></div>
            <div className={styles.cartDrawer}>
                <div className={styles.cartHeader}>
                    <h2>Your Bag ({getCartCount()})</h2>
                    <button className={styles.closeBtn} onClick={toggleCart}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.cartItemsScrollable}>
                    {cart.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <ShoppingBag size={48} className={styles.emptyIcon} />
                            <p>Your bag is empty.</p>
                            <button className="btn-primary" onClick={toggleCart} style={{ marginTop: '20px' }}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={`${item.product.id}-${item.size}-${index}`} className={styles.cartItem}>
                                <div className={styles.itemImageContainer}>
                                    <img
                                        src={item.product.product_images?.[0]?.url || 'https://placehold.co/100x120?text=Glam'}
                                        alt={item.product.name}
                                        className={styles.itemImage}
                                    />
                                </div>
                                <div className={styles.itemDetails}>
                                    <div className={styles.itemHeader}>
                                        <h3 className={styles.itemName}>{item.product.name}</h3>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.product.id, item.size)}
                                            title="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className={styles.itemSize}>Size: {item.size || 'Standard'}</p>

                                    <div className={styles.itemFooter}>
                                        <div className={styles.quantityControls}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className={styles.qtyValue}>{item.quantity}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className={styles.itemPrice}>₹{item.product.final_price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className={styles.cartFooter}>
                        <div className={styles.subtotalRow}>
                            <span>Subtotal</span>
                            <span className={styles.subtotalValue}>₹{getCartTotal().toLocaleString()}</span>
                        </div>
                        <p className={styles.taxNotice}>Taxes and shipping calculated at checkout.</p>
                        <button className={`btn-primary ${styles.checkoutBtn}`}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
