import React, { useEffect, useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { ShieldAlert, Plus, Edit3, TrendingUp, TrendingDown, RefreshCcw, Activity, Info } from 'lucide-react';

const AdminView: React.FC = () => {
  const { adminAssets, fetchAdminAssets, addAsset, editAsset, setMarketBias } = useMarketStore();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newAsset, setNewAsset] = useState({
    ticker: '',
    name: '',
    type: 'CRYPTO',
    currentPrice: 1.0,
    totalSupply: 1000000,
    volatility: 1.0
  });

  useEffect(() => {
    fetchAdminAssets();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAsset(newAsset);
    setShowAddModal(false);
    setNewAsset({ ticker: '', name: '', type: 'CRYPTO', currentPrice: 1.0, totalSupply: 1000000, volatility: 1.0 });
  };

  const triggerMarketEvent = async (assetId: string, bias: number) => {
    await setMarketBias(assetId, bias);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#08090D] p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Admin Header */}
        <header className="flex justify-between items-center bg-apex/5 border border-apex/20 p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert size={100} className="text-apex" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
              <ShieldAlert className="text-apex" />
              Global Market Control
            </h1>
            <p className="pro-label !text-apex mt-2">Level 4 Authorization Detected // Terminal Node: Admin</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="relative z-10 px-6 py-3 bg-apex text-[#08090D] font-black rounded-xl flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-2xl shadow-apex/20"
          >
            <Plus size={20} />
            Initialize New Asset Node
          </button>
        </header>

        {/* Asset Management Grid */}
        <section className="grid grid-cols-1 gap-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/[0.05]">
                  <th className="px-8 py-5 pro-label">Asset Identity</th>
                  <th className="px-8 py-5 pro-label">Type</th>
                  <th className="px-8 py-5 pro-label">Live Parameters</th>
                  <th className="px-8 py-5 pro-label text-center">Market Manipulation</th>
                  <th className="px-8 py-5 pro-label text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {adminAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-white tracking-tight">{asset.ticker}</span>
                        <span className="text-[10px] text-white/30 uppercase font-medium">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 uppercase tracking-widest">{asset.type}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                          <span className="pro-label !text-[8px]">Price</span>
                          <span className="text-sm font-mono font-bold text-apex">${asset.currentPrice.toFixed(4)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="pro-label !text-[8px]">Volatility</span>
                          <span className="text-sm font-mono font-bold text-white/60">{asset.volatility}x</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="pro-label !text-[8px]">Current Bias</span>
                          <span className={`text-sm font-mono font-bold ${asset.manualBias > 0 ? 'text-bull' : (asset.manualBias < 0 ? 'text-bear' : 'text-white/20')}`}>
                            {(asset.manualBias * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => triggerMarketEvent(asset.id, 0.005)}
                          className="px-3 py-1.5 rounded-lg bg-bull/10 border border-bull/20 text-bull text-[9px] font-black uppercase hover:bg-bull hover:text-[#08090D] transition-all flex items-center gap-1.5"
                        >
                          <TrendingUp size={12} />
                          Apex Pump
                        </button>
                        <button 
                          onClick={() => triggerMarketEvent(asset.id, -0.005)}
                          className="px-3 py-1.5 rounded-lg bg-bear/10 border border-bear/20 text-bear text-[9px] font-black uppercase hover:bg-bear hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <TrendingDown size={12} />
                          Nuclear Crash
                        </button>
                        <button 
                          onClick={() => triggerMarketEvent(asset.id, 0)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <RefreshCcw size={12} />
                          Stabilize
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <Edit3 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Info Box */}
        <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex gap-4 items-start">
          <Info className="text-apex shrink-0" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white/80">Market Bias Protocol</h4>
            <p className="text-xs text-white/30 leading-relaxed">Applying a "Pump" or "Crash" sets a persistent directional drift on the asset price. This bias is applied every engine tick until stabilized. Extreme caution advised when manipulating high-volatility assets.</p>
          </div>
        </div>

      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#08090D]/80 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#11131A] border border-white/[0.1] rounded-2xl shadow-2xl p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Initialize Asset Node</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/20 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="pro-label">Ticker Symbol</label>
                  <input 
                    type="text" required
                    value={newAsset.ticker}
                    onChange={e => setNewAsset({...newAsset, ticker: e.target.value.toUpperCase()})}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:border-apex/40 transition-all outline-none"
                    placeholder="e.g. GOON"
                  />
                </div>
                <div className="space-y-2">
                  <label className="pro-label">Asset Name</label>
                  <input 
                    type="text" required
                    value={newAsset.name}
                    onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:border-apex/40 transition-all outline-none"
                    placeholder="e.g. GoonCoin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="pro-label">Initial Price (USD)</label>
                <input 
                  type="number" step="any" required
                  value={newAsset.currentPrice}
                  onChange={e => setNewAsset({...newAsset, currentPrice: parseFloat(e.target.value)})}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:border-apex/40 transition-all outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="pro-label">Total Supply</label>
                  <input 
                    type="number" required
                    value={newAsset.totalSupply}
                    onChange={e => setNewAsset({...newAsset, totalSupply: parseFloat(e.target.value)})}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:border-apex/40 transition-all outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="pro-label">Volatility Scale</label>
                  <input 
                    type="number" step="0.1" required
                    value={newAsset.volatility}
                    onChange={e => setNewAsset({...newAsset, volatility: parseFloat(e.target.value)})}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:border-apex/40 transition-all outline-none font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-apex text-[#08090D] font-black py-4 rounded-xl uppercase tracking-widest text-sm hover:brightness-110 transition-all"
              >
                Execute Initialization
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
