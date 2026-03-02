import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { BarChart3, TrendingUp, ShoppingBag, PackageOpen, Download, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminAnalytics = () => {
    const [timeRange, setTimeRange] = useState('daily');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [activeChart, setActiveChart] = useState('revenue'); // 'revenue', 'orders', 'carted', 'demand'
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [highDemandProducts, setHighDemandProducts] = useState([]);
    const [highlyCartedProducts, setHighlyCartedProducts] = useState([]);
    const [overviewStats, setOverviewStats] = useState({
        totalRevenue: 0,
        totalOrders: 0
    });

    useEffect(() => {
        if (timeRange !== 'custom' || (timeRange === 'custom' && customStartDate && customEndDate)) {
            fetchAnalyticsData();
        }
    }, [timeRange, customStartDate, customEndDate]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            // Fetch Sales Overview
            let salesRpcParams = { time_range: timeRange };
            if (timeRange === 'custom') {
                salesRpcParams = { time_range: timeRange, start_date: customStartDate, end_date: customEndDate };
            }

            const { data: sales, error: salesError } = await supabase
                .rpc('get_sales_overview', salesRpcParams);
            if (salesError) throw salesError;

            // Fetch High Demand Products
            const { data: demand, error: demandError } = await supabase
                .rpc('get_high_demand_products', { limit_num: 5 });
            if (demandError) throw demandError;

            // Fetch Highly Carted Products
            const { data: carted, error: cartedError } = await supabase
                .rpc('get_highly_carted_products', { limit_num: 5 });
            if (cartedError) throw cartedError;

            setSalesData(sales || []);
            setHighDemandProducts(demand || []);
            setHighlyCartedProducts(carted || []);

            // Calculate Overview Stats from Sales Data
            if (sales && sales.length > 0) {
                const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.total_sales || 0), 0);
                const totalOrders = sales.reduce((acc, curr) => acc + Number(curr.order_count || 0), 0);
                setOverviewStats({ totalRevenue, totalOrders });
            } else {
                setOverviewStats({ totalRevenue: 0, totalOrders: 0 });
            }

        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Ignore error so UI still loads for now if functions are missing
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart3 size={28} color="var(--color-purple)" />
                        Store Analytics
                    </h2>
                    <p style={{ color: 'var(--color-black-light)' }}>Track your store's performance and customer behavior</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {timeRange === 'custom' && (
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray)' }}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray)' }}
                            />
                        </div>
                    )}
                    <div style={{ position: 'relative' }}>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={{
                                padding: '10px 35px 10px 15px',
                                borderRadius: '8px',
                                border: '1px solid var(--color-gray)',
                                backgroundColor: '#fff',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                minWidth: '180px'
                            }}
                        >
                            <option value="daily">Daily Performance</option>
                            <option value="weekly">Weekly Performance</option>
                            <option value="monthly">Monthly Performance</option>
                            <option value="custom">Custom Date Range</option>
                        </select>
                        <Calendar size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-black-light)' }} />
                    </div>

                    <button
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px' }}
                        title="Download Report"
                    >
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>Loading Analytics Data...</div>
            ) : (
                <>
                    {/* Top Stats Overview */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                        marginBottom: '40px'
                    }}>
                        {/* Revenue Card */}
                        <div
                            className="card"
                            style={{
                                padding: '25px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px',
                                cursor: 'pointer',
                                border: activeChart === 'revenue' ? '2px solid var(--color-purple)' : '2px solid transparent'
                            }}
                            onClick={() => setActiveChart('revenue')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '16px', color: 'var(--color-black-light)', fontWeight: 500 }}>Total Revenue</h3>
                                <div style={{ padding: '8px', backgroundColor: '#F3E5F5', borderRadius: '8px' }}>
                                    <TrendingUp size={20} color="var(--color-purple)" />
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '36px', fontWeight: 600, color: 'var(--color-black)', margin: 0 }}>
                                    {formatCurrency(overviewStats.totalRevenue)}
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--color-black-light)', marginTop: '5px' }}>
                                    Based on {timeRange} sales
                                </p>
                            </div>
                        </div>

                        {/* Orders Card */}
                        <div
                            className="card"
                            style={{
                                padding: '25px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px',
                                cursor: 'pointer',
                                border: activeChart === 'orders' ? '2px solid var(--color-gold-start)' : '2px solid transparent'
                            }}
                            onClick={() => setActiveChart('orders')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '16px', color: 'var(--color-black-light)', fontWeight: 500 }}>Total Orders</h3>
                                <div style={{ padding: '8px', backgroundColor: '#FFF8E1', borderRadius: '8px' }}>
                                    <ShoppingBag size={20} color="var(--color-gold-start)" />
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '36px', fontWeight: 600, color: 'var(--color-black)', margin: 0 }}>
                                    {overviewStats.totalOrders}
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--color-black-light)', marginTop: '5px' }}>
                                    Completed orders in {timeRange} view
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Highly Carted & High Demand Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>

                        {/* Highly Carted Products */}
                        <div
                            className="card"
                            style={{
                                padding: '30px',
                                cursor: 'pointer',
                                border: activeChart === 'carted' ? '2px solid var(--color-purple)' : '2px solid transparent'
                            }}
                            onClick={() => setActiveChart('carted')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <PackageOpen size={24} color="var(--color-gold-start)" />
                                <h3 style={{ fontSize: '20px', margin: 0 }}>Highly Carted Products</h3>
                            </div>
                            {highlyCartedProducts.length === 0 ? (
                                <p style={{ color: 'var(--color-black-light)' }}>No cart data available yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {highlyCartedProducts.map((item, index) => (
                                        <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#F9F9F9', borderRadius: '8px', border: '1px solid var(--color-gray)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-black)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                                    {index + 1}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{item.product_name}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--color-purple)' }}>{item.cart_count}</span>
                                                <span style={{ fontSize: '12px', color: 'var(--color-black-light)', display: 'block' }}>times added</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* High Demand Products (Sold) */}
                        <div
                            className="card"
                            style={{
                                padding: '30px',
                                cursor: 'pointer',
                                border: activeChart === 'demand' ? '2px solid #137333' : '2px solid transparent'
                            }}
                            onClick={() => setActiveChart('demand')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <TrendingUp size={24} color="#137333" />
                                <h3 style={{ fontSize: '20px', margin: 0 }}>High Demand Products</h3>
                            </div>
                            {highDemandProducts.length === 0 ? (
                                <p style={{ color: 'var(--color-black-light)' }}>No sales data available yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {highDemandProducts.map((item, index) => (
                                        <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#F9F9F9', borderRadius: '8px', border: '1px solid var(--color-gray)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-black)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                                    {index + 1}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{item.product_name}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: 600, color: '#137333' }}>{item.total_quantity_sold}</span>
                                                <span style={{ fontSize: '12px', color: 'var(--color-black-light)', display: 'block' }}>units sold</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Sales Chart Area */}
                    <div className="card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '25px' }}>
                            {activeChart === 'revenue' && `Revenue Performance (${timeRange})`}
                            {activeChart === 'orders' && `Orders Performance (${timeRange})`}
                            {activeChart === 'carted' && 'Highly Carted Products'}
                            {activeChart === 'demand' && 'High Demand Products'}
                        </h3>

                        {(activeChart === 'revenue' || activeChart === 'orders') && salesData.length === 0 && (
                            <p style={{ color: 'var(--color-black-light)' }}>No performance data available yet.</p>
                        )}
                        {activeChart === 'carted' && highlyCartedProducts.length === 0 && (
                            <p style={{ color: 'var(--color-black-light)' }}>No cart data available yet.</p>
                        )}
                        {activeChart === 'demand' && highDemandProducts.length === 0 && (
                            <p style={{ color: 'var(--color-black-light)' }}>No sales data available yet.</p>
                        )}

                        {/* Line Charts for Revenue / Orders */}
                        {(activeChart === 'revenue' || activeChart === 'orders') && salesData.length > 0 && (
                            <div style={{ width: '100%', height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={salesData}
                                        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fill: 'var(--color-black-light)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#ddd' }}
                                        />
                                        <YAxis
                                            tick={{ fill: 'var(--color-black-light)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => activeChart === 'revenue' ? `₹${value}` : value}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                                            formatter={(value) => [activeChart === 'revenue' ? formatCurrency(value) : value, activeChart === 'revenue' ? 'Revenue' : 'Orders']}
                                            labelStyle={{ fontWeight: 600, color: 'var(--color-black)', marginBottom: '5px' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                        {activeChart === 'revenue' ? (
                                            <Line
                                                type="monotone"
                                                dataKey="total_sales"
                                                name="Total Revenue"
                                                stroke="var(--color-purple)"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: 'var(--color-purple)' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        ) : (
                                            <Line
                                                type="monotone"
                                                dataKey="order_count"
                                                name="Number of Orders"
                                                stroke="var(--color-gold-start)"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: 'var(--color-gold-start)' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Bar Chart for Carted Products */}
                        {activeChart === 'carted' && highlyCartedProducts.length > 0 && (
                            <div style={{ width: '100%', height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={highlyCartedProducts}
                                        margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="product_name"
                                            tick={{ fill: 'var(--color-black-light)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#ddd' }}
                                            angle={-45}
                                            textAnchor="end"
                                        />
                                        <YAxis
                                            tick={{ fill: 'var(--color-black-light)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                                            formatter={(value) => [value, 'Times Carted']}
                                            labelStyle={{ fontWeight: 600, color: 'var(--color-black)', marginBottom: '5px' }}
                                        />
                                        <Bar
                                            dataKey="cart_count"
                                            name="Times Added to Cart"
                                            fill="var(--color-purple)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Bar Chart for Demand Products */}
                        {activeChart === 'demand' && highDemandProducts.length > 0 && (
                            <div style={{ width: '100%', height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={highDemandProducts}
                                        margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="product_name"
                                            tick={{ fill: 'var(--color-black-light)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#ddd' }}
                                            angle={-45}
                                            textAnchor="end"
                                        />
                                        <YAxis
                                            tick={{ fill: 'var(--color-black-light)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                                            formatter={(value) => [value, 'Units Sold']}
                                            labelStyle={{ fontWeight: 600, color: 'var(--color-black)', marginBottom: '5px' }}
                                        />
                                        <Bar
                                            dataKey="total_quantity_sold"
                                            name="Total Units Sold"
                                            fill="#137333"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminAnalytics;
