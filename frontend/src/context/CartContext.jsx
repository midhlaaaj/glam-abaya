import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Initialize cart state directly from localStorage to prevent race conditions
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('glam_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Failed to parse cart:', e);
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Save to local storage whenever cart changes
    useEffect(() => {
        localStorage.setItem('glam_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = async (product, quantity = 1, size = null) => {
        setCart((prevCart) => {
            // Check if item already exists in cart with same size
            const existingItemIndex = prevCart.findIndex(
                (item) => item.product.id === product.id && item.size === size
            );

            if (existingItemIndex > -1) {
                // Update quantity
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                // Add new item
                return [...prevCart, { product, quantity, size }];
            }
        });
        setIsCartOpen(true); // Auto-open cart on add

        // Log "add_to_cart" to product_analytics for Admin Analytics
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await supabase.from('product_analytics').insert({
                product_id: product.id,
                event_type: 'add_to_cart',
                user_id: session?.user?.id || null
            });
        } catch (error) {
            console.error('Failed to log product analytics event:', error);
        }
    };

    const removeFromCart = (productId, size = null) => {
        setCart((prevCart) => prevCart.filter(
            (item) => !(item.product.id === productId && item.size === size)
        ));
    };

    const updateQuantity = (productId, size, newQuantity) => {
        if (newQuantity < 1) return;
        setCart((prevCart) => prevCart.map((item) => {
            if (item.product.id === productId && item.size === size) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.product.final_price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            toggleCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
