import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import CartDrawer from '../cart/CartDrawer';

const CustomerLayout = () => {
    return (
        <div className="customer-layout">
            <Header />
            <main style={{ paddingTop: '72px' }}>
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
        </div>
    );
};

export default CustomerLayout;
