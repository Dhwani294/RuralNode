import React, { useState, useEffect } from 'react';
import { LogOut, Truck, MapPin, Eye, X, Activity } from 'lucide-react';
import LogisticsMap from '../components/LogisticsMap';
import { fetchOrders, fetchAllRetailers, updateOrderStatus, getOptimizedPools } from '../services/api';

const DistributorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allOrders, setAllOrders] = useState([]);
  const [orderPools, setOrderPools] = useState([]);
  const [retailers, setRetailers] = useState([]); 
  const [selectedPool, setSelectedPool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [orders, retailerList] = await Promise.all([
          fetchOrders(),
          fetchAllRetailers()
        ]);
        setAllOrders(orders);
        setRetailers(retailerList);

        const pendingOrders = orders.filter(o => o.status === 'pending');
        if (pendingOrders.length > 0) {
          const serverPools = await getOptimizedPools(pendingOrders);
          const hydratedPools = serverPools.map(p => {
            const poolOrders = pendingOrders.filter(o => p.shops.includes(o.retailer_id));
            const poolRetailers = retailerList.filter(r => p.shops.includes(r.id));
            const poolValue = poolOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

            return {
              pool_id: p.pool_id,
              discount: p.discount,
              radius_km: p.radius_km || 0,
              final_amount: poolValue,
              orders: poolOrders,
              retailers: poolRetailers
            };
          });
          setOrderPools(hydratedPools);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDispatchPool = async (pool) => {
    if (!pool || !pool.orders) return;
    for (const order of pool.orders) {
      if (order.docId) await updateOrderStatus(order.docId, 'in_transit');
    }
    const updatedOrders = allOrders.map(o =>
      pool.orders.some(po => po.id === o.id) ? { ...o, status: 'in_transit' } : o
    );
    setAllOrders(updatedOrders);
    setOrderPools(orderPools.filter(p => p.pool_id !== pool.pool_id));
    setSelectedPool(null);
    alert(`✅ Pool ${pool.pool_id} dispatched!`);
  };

  if (loading) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <Activity className="animate-spin text-emerald-600 mb-4" size={40} />
      <p className="text-emerald-900 font-bold">Synchronizing Logistics...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HEADER: Forest Green --- */}
      <div className="bg-emerald-900 text-white p-5 flex justify-between items-center shadow-xl relative z-30">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Hub Controller</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all font-bold">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="bg-white border-b px-4 flex gap-8 sticky top-0 z-30 shadow-sm">
        {['overview', 'delivery-pools', 'orders'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`py-5 px-1 border-b-4 font-bold text-sm uppercase tracking-wider transition-all ${
              activeTab === tab ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-emerald-600'
            }`}
          >
            {tab.replace('-', ' ')}
            {tab === 'delivery-pools' && orderPools.length > 0 && (
              <span className="ml-2 bg-emerald-600 text-white rounded-full px-2 py-0.5 text-[10px]">{orderPools.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-6 py-10">
        
        {/* --- OVERVIEW TAB (With Blurry Rural Background) --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 relative p-8 rounded-3xl overflow-hidden min-h-[80vh]">
            {/* The Blurry Background - Scoped only to Overview */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center scale-110 blur-[20px] opacity-1000" 
              style={{ backgroundImage: "url('/shady_rural_path2.jpg')" }} 
            />
            <div className="absolute inset-0 z-10 bg-emerald-50/60" />

            <div className="relative z-20 space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-emerald-100">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Pending</p>
                  <p className="text-4xl font-black text-orange-500 mt-2">{allOrders.filter(o => o.status === 'pending').length}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-emerald-100">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Optimized Routes</p>
                  <p className="text-4xl font-black text-emerald-600 mt-2">{orderPools.length}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-emerald-100">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Revenue</p>
                  <p className="text-4xl font-black text-emerald-800 mt-2">₹{allOrders.filter(o => o.status === 'completed').reduce((a, b) => a + b.total_amount, 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-emerald-100">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <MapPin className="text-emerald-600" /> Rural Connectivity Network
                </h2>
                <div className="rounded-2xl overflow-hidden border-2 border-emerald-50">
                   <LogisticsMap retailers={retailers} pools={orderPools} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DELIVERY POOLS TAB (Clean Background) --- */}
        {activeTab === 'delivery-pools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orderPools.map(pool => (
              <div key={pool.pool_id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{pool.pool_id}</h3>
                    <p className="text-xs font-bold text-slate-400">{pool.retailers.length} Retailers Linked</p>
                  </div>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-black ${pool.discount.includes('WHOLESALE') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {pool.discount}
                  </span>
                </div>
                <div className="space-y-3 text-sm mb-6 bg-slate-50 p-4 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Radius:</span> 
                    <span className="font-bold">{pool.radius_km.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Value:</span> 
                    <span className="font-black text-emerald-700">₹{pool.final_amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setSelectedPool(pool)} className="flex-1 border-2 border-emerald-100 text-emerald-700 py-3 rounded-xl font-bold text-xs hover:bg-emerald-50">View Details</button>
                  <button onClick={() => handleDispatchPool(pool)} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-100">Dispatch</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- ORDERS TAB (Clean Background) --- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {allOrders.map(order => (
              <div key={order.docId} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="font-black text-slate-800">{order.product_name}</p>
                  <p className="text-sm text-slate-500">{order.retailer_name}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-emerald-700">₹{order.total_amount?.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">{order.quantity} Units</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-700'
                  }`}>{order.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- POOL DETAILS MODAL --- */}
      {selectedPool && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 border-b bg-emerald-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-emerald-900">Pool Details</h2>
                <p className="text-sm font-bold text-emerald-600">ID: {selectedPool.pool_id}</p>
              </div>
              <button onClick={() => setSelectedPool(null)} className="p-2 bg-white rounded-full shadow-sm text-emerald-900 hover:scale-110 transition-transform"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-4">
              {selectedPool.retailers.map((r, i) => (
                <div key={r.id || i} className="flex items-center gap-5 border border-slate-100 p-5 rounded-2xl hover:bg-emerald-50 transition-all">
                  <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl"><MapPin size={22} /></div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-700">₹{selectedPool.orders.find(o => o.retailer_id === r.id)?.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 border-t">
              <button onClick={() => handleDispatchPool(selectedPool)} className="w-full bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3">
                <Truck size={24} /> Start Dispatch Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorDashboard;