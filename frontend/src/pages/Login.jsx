import React, { useState } from 'react';
import { loginUser, seedDatabase } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [userType, setUserType] = useState('retailer');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginUser(userId, password, userType);
      if (user) {
        onLogin(userType, user);
      } else {
        setError('Invalid credentials or user not found');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Check console.');
    }
    setLoading(false);
  };

  return (
    /* --- CHANGE 1: Added relative positioning and background image container --- */
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 blur-[2px]" 
        style={{ backgroundImage: "url('/shady_rural_path.jpg')" }} 
      />
      {/* Dark Green Overlay to make text readable */}
      <div className="absolute inset-0 z-10 bg-emerald-900/40" />

      {/* --- CHANGE 2: Changed bg-white to bg-white/90 for glass effect --- */}
      <div className="relative z-20 bg-white/95 rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm border border-white/20">
        <div className="text-center mb-8">
          {/* --- CHANGE 3: Swapped text-green-700 for text-emerald-800 --- */}
          <h1 className="text-4xl font-extrabold text-emerald-800 mb-2 tracking-tight">RuralNode</h1>
          <p className="text-emerald-600 font-medium">B2B Supply Chain Platform</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUserType('retailer')}
            /* --- CHANGE 4: Refined Retailer Green Colors --- */
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 ${
              userType === 'retailer' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >Retailer</button>
          <button
            onClick={() => setUserType('distributor')}
            /* --- CHANGE 5: Swapped Blue for Slate-Green to match theme --- */
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 ${
              userType === 'distributor' ? 'bg-slate-700 text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >Distributor</button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            /* --- CHANGE 6: Added subtle emerald border focus --- */
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            placeholder={userType === 'retailer' ? 'Retailer ID (R001)' : 'Distributor ID (D001)'}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            placeholder="Password"
          />
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}
          
          <button
            onClick={handleLogin}
            disabled={loading}
            /* --- CHANGE 7: Deep Forest Green for Login Button --- */
            className="w-full bg-emerald-700 text-white py-3 rounded-lg font-bold hover:bg-emerald-800 transform active:scale-[0.98] transition-all disabled:bg-gray-300"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-widest">System Initialization</p>
            <button onClick={seedDatabase} className="text-xs text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">
                Click here to Seed Database (Create Test Users)
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;