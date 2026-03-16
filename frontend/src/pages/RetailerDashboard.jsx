import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
    ShoppingCart, Package, TrendingUp, LogOut, CheckCircle,
    Truck, Home, History, Plus, Zap, Users, X, Check
} from 'lucide-react';
import { fetchInventory, fetchOrders, createOrder, getAIRecommendation } from '../services/api';
import SimulationChart from '../components/SimulationChart';

// Hardcoded Catalog
const CATALOG = [
    { id: 'P001', name: 'Rice (50kg)', category: 'Grains', unit_price: 2500, reorder_level: 10 },
    { id: 'P002', name: 'Wheat Flour (40kg)', category: 'Grains', unit_price: 1800, reorder_level: 15 },
    { id: 'P003', name: 'Sugar (50kg)', category: 'Sweeteners', unit_price: 2200, reorder_level: 12 },
    { id: 'P004', name: 'Cooking Oil (15L)', category: 'Oils', unit_price: 1500, reorder_level: 20 },
    { id: 'P005', name: 'Pulses Mix (25kg)', category: 'Pulses', unit_price: 3000, reorder_level: 8 },
];

const RetailerDashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [stockData, setStockData] = useState([]);
    const [orders, setOrders] = useState([]);
    const [aiInsight, setAiInsight] = useState(null);
    const [pooledOffer, setPooledOffer] = useState(null);
    const [cartQty, setCartQty] = useState({});
    const [loading, setLoading] = useState(false);

    // --- LOAD DATA (Wrapped in useCallback to fix Linting & Infinite Loops) ---
    const loadData = useCallback(async () => {
        try {
            const stock = await fetchInventory(user.id);
            const orderList = await fetchOrders(user.id);
            
            setStockData(stock || []);
            setOrders(orderList || []);

            // --- AI LOGIC: Only run if we have stock and haven't found an insight yet ---
            if (stock && stock.length > 0) {
                const lowStockItem = stock.find(i => i.current_stock < 20) || stock[0];

                if (lowStockItem && !aiInsight) {
                    const aiResponse = await getAIRecommendation({
                        id: user.id,
                        lat: user.lat,
                        lon: user.lon,
                        stock: lowStockItem.current_stock,
                        is_festival: false
                    });

                    if (aiResponse) {
                        setAiInsight({ ...aiResponse, item: lowStockItem });

                        const standardPrice = lowStockItem.unit_price || 0;
                        const pooledPrice = Math.floor(standardPrice * 0.85); 

                        setPooledOffer({
                            item: lowStockItem,
                            neighbors: 3,
                            standard_price: standardPrice,
                            pooled_price: pooledPrice,
                            savings_per_unit: standardPrice - pooledPrice,
                            distributor: aiResponse.top_pick
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        }
    }, [user.id, user.lat, user.lon, aiInsight]); // Dependencies for stability

    useEffect(() => {
        loadData();
    }, [loadData]); // loadData is now stable

    // --- HANDLERS ---
    const handleAcceptPool = async () => {
        if (!pooledOffer) return;
        const qty = 20; 
        setLoading(true);

        const orderPayload = {
            retailer_id: user.id,
            retailer_name: user.name,
            retailer_location: user.location,
            retailer_lat: user.lat,
            retailer_lon: user.lon,
            product_id: pooledOffer.item.id,
            product_name: pooledOffer.item.name,
            quantity: qty,
            unit_price: pooledOffer.pooled_price,
            total_amount: qty * pooledOffer.pooled_price,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            source: 'Pool-Deal'
        };

        try {
            await createOrder(orderPayload);
            alert(`🎉 POOL JOINED! You saved ₹${(pooledOffer.savings_per_unit * qty).toLocaleString()}`);
            setAiInsight(null); 
            setPooledOffer(null);
            await loadData();
        } catch (err) {
            console.error("Order failed:", err);
            alert("Order failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleDenyPool = () => {
        if (window.confirm("Reject 15% savings? You will have to pay full delivery fees later.")) {
            setAiInsight(null);
            setPooledOffer(null);
        }
    };

    const handlePlaceOrder = async (product) => {
        const qty = cartQty[product.id] || 0;
        if (qty <= 0) return alert("Enter Qty");

        const orderPayload = {
            retailer_id: user.id,
            retailer_name: user.name,
            retailer_location: user.location,
            retailer_lat: user.lat,
            retailer_lon: user.lon,
            product_id: product.id,
            product_name: product.name,
            quantity: parseInt(qty),
            unit_price: product.unit_price,
            total_amount: parseInt(qty) * product.unit_price,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            source: 'Manual-Web'
        };
        
        try {
            await createOrder(orderPayload);
            alert("Standard Order Placed");
            await loadData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
            {/* HEADER */}
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div>
                    <h1 className="text-2xl font-extrabold text-green-700 tracking-tight">RuralNode</h1>
                    <p className="text-xs text-gray-500 font-medium">SMART RETAILER NETWORK</p>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition ${activeTab === 'home' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}><Home size={16} /> Home</button>
                    <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition ${activeTab === 'catalog' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><ShoppingCart size={16} /> Catalog</button>
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition ${activeTab === 'history' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><History size={16} /> Orders</button>
                </div>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><LogOut size={16} /></button>
            </div>

            <div className="max-w-6xl mx-auto w-full p-6 space-y-8 flex-grow">
                {/* TAB 1: HOME */}
                {activeTab === 'home' && (
                    <>
                        {pooledOffer && aiInsight && (
                            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden relative animate-in fade-in slide-in-from-top-4">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Zap size={20} className="text-yellow-300" fill="currentColor" />
                                        <span className="font-bold tracking-wide">SMART POOL DETECTED</span>
                                    </div>
                                    <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <Users size={12} /> {pooledOffer.neighbors} Neighbors Joining
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Restock {pooledOffer.item.name}</h2>
                                        <p className="text-gray-600 mb-4">
                                            Your stock is low ({aiInsight.stock} units).
                                            A truck is passing by {user.location} soon!
                                        </p>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Price Breakdown</p>
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <p className="text-sm text-gray-400 line-through">Standard</p>
                                                    <p className="text-lg font-bold text-gray-400">₹{pooledOffer.standard_price}</p>
                                                </div>
                                                <div className="text-2xl text-gray-300">→</div>
                                                <div>
                                                    <p className="text-sm text-green-600 font-bold">Pool Price</p>
                                                    <p className="text-2xl font-extrabold text-green-700">₹{pooledOffer.pooled_price}</p>
                                                </div>
                                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold ml-auto">SAVE 15%</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] flex flex-col gap-3">
                                        <div className="text-center mb-2">
                                            <span className="text-sm text-gray-500">Proposed Order: 20 Units</span>
                                            <div className="text-3xl font-bold text-blue-900 mt-1">₹{(20 * pooledOffer.pooled_price).toLocaleString()}</div>
                                            <div className="text-xs text-green-600 font-bold">Total Savings: ₹{(20 * pooledOffer.savings_per_unit).toLocaleString()}</div>
                                        </div>
                                        <button onClick={handleAcceptPool} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg flex justify-center items-center gap-2 transition transform hover:scale-105 disabled:opacity-50">
                                            <Check size={20} /> {loading ? "Processing..." : "Accept & Join Pool"}
                                        </button>
                                        <button onClick={handleDenyPool} className="w-full bg-white border border-gray-200 text-gray-500 py-3 rounded-lg font-semibold hover:bg-gray-50 flex justify-center items-center gap-2 transition">
                                            <X size={20} /> Deny
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <h3 className="font-bold text-lg mb-4 text-gray-700">Profit Projection</h3>
                                <SimulationChart />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-gray-700">Shop Health</h3>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                                    <p className="text-gray-500 text-xs font-bold uppercase">Total Inventory Value</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">
                                        ₹{stockData.reduce((s, i) => s + (i.current_stock * (i.unit_price || 0)), 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-200 p-2 rounded-lg text-blue-700"><Truck size={24} /></div>
                                        <div>
                                            <h4 className="font-bold text-blue-900">Delivery Status</h4>
                                            <p className="text-sm text-blue-800 mt-1">Next truck to {user.location}: <span className="font-bold">Tomorrow 10 AM</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* TAB 2: CATALOG */}
                {activeTab === 'catalog' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CATALOG.map((product) => (
                            <div key={product.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">₹{product.unit_price} / unit</p>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Qty" className="border p-2 rounded w-20" value={cartQty[product.id] || ''} onChange={(e) => setCartQty({ ...cartQty, [product.id]: e.target.value })} />
                                    <button onClick={() => handlePlaceOrder(product)} className="bg-gray-900 text-white px-4 py-2 rounded flex-1">Order</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 3: HISTORY */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4">Order History</h3>
                        {orders.length === 0 ? <p className="text-gray-400">No orders yet.</p> : orders.map(o => (
                            <div key={o.id || o.docId} className="flex justify-between border-b py-3 last:border-0">
                                <div>
                                    <p className="font-bold">{o.product_name} (x{o.quantity})</p>
                                    <p className="text-xs text-gray-500">{o.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{o.total_amount?.toLocaleString()}</p>
                                    {o.source === 'Pool-Deal' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">POOLED SAVINGS</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RetailerDashboard;