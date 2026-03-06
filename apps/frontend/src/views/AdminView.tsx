import React, { useEffect, useState, useRef } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { ShieldAlert, Plus, Edit3, TrendingUp, TrendingDown, RefreshCcw, Activity, Info, Upload, Image as ImageIcon, X, Trash2 } from 'lucide-react';

const AdminView: React.FC = () => {
  const { adminAssets, fetchAdminAssets, addAsset, editAsset, setMarketEvent, clearMarketEvents, resetEconomy } = useMarketStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  
  const [magnitude, setMagnitude] = useState(0.5); 
  const [duration, setDuration] = useState(30);

  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    type: 'CRYPTO',
    currentPrice: 1.0,
    totalSupply: 1000000,
    volatility: 1.0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdminAssets();
  }, [fetchAdminAssets]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ ticker: '', name: '', type: 'CRYPTO', currentPrice: 1.0, totalSupply: 1000000, volatility: 1.0 });
    setImageFile(null);
    setPreviewUrl(null);
    setEditingAsset(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('data', JSON.stringify(formData));
    if (imageFile) data.append('image', imageFile);

    if (editingAsset) {
      await editAsset(editingAsset.id, data);
    } else {
      await addAsset(data);
    }
    
    setShowModal(false);
    resetForm();
  };

  const openEdit = (asset: any) => {
    setEditingAsset(asset);
    setFormData({
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      currentPrice: asset.currentPrice,
      totalSupply: asset.totalSupply,
      volatility: asset.volatility
    });
    setPreviewUrl(asset.imageUrl ? `http://${window.location.hostname}:28081${asset.imageUrl}` : null);
    setShowModal(true);
  };

  const handleResetEconomy = () => {
    if (window.confirm("CRITICAL: This will reset all user balances to $100 and clear ALL trade history. Continue?")) {
      resetEconomy();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#08090D] font-sans relative overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
          
          <header className="flex justify-between items-center bg-apex/5 border border-apex/20 p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert size={100} className="text-apex" />
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                <ShieldAlert className="text-apex" />
                Institutional Control
              </h1>
              <p className="pro-label !text-apex mt-2">Level 4 Authorization Verified // Terminal Node: root</p>
            </div>
            
            <div className="flex gap-4 relative z-10">
              <button 
                onClick={handleResetEconomy}
                className="px-6 py-3 bg-bear/10 border border-bear/20 text-bear font-black rounded-xl flex items-center gap-2 hover:bg-bear hover:text-white transition-all active:scale-95 shadow-xl shadow-bear/10"
              >
                <Trash2 size={20} />
                Hard Reset Economy
              </button>
              <button 
                onClick={() => { resetForm(); setShowModal(true); }}
                className="px-6 py-3 bg-apex text-[#08090D] font-black rounded-xl flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-2xl shadow-apex/20"
              >
                <Plus size={20} />
                Provision Asset
              </button>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-1 bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl space-y-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                   <Activity size={16} className="text-apex" />
                   <h3 className="pro-label">Event Parameters</h3>
                </div>
                <div className="space-y-6">
                   <div className="space-y-3">
                      <div className="flex justify-between pro-label !text-[8px]">
                         <span>Magnitude (per tick)</span>
                         <span className="text-apex font-mono">{magnitude}%</span>
                      </div>
                      <input type="range" min="0.1" max="5" step="0.1" value={magnitude} onChange={e => setMagnitude(parseFloat(e.target.value))} className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-apex" />
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between pro-label !text-[8px]">
                         <span>Duration (seconds)</span>
                         <span className="text-apex font-mono">{duration}s</span>
                      </div>
                      <input type="range" min="5" max="300" step="5" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-apex" />
                   </div>
                </div>
             </div>

             <div className="md:col-span-2 bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                   <TrendingUp size={16} className="text-bull" />
                   <h3 className="pro-label">Live Inventory</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="pro-label !text-[8px] border-b border-white/5">
                        <th className="pb-3 px-2">Asset</th>
                        <th className="pb-3 text-center">Intervention</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {adminAssets.map((asset) => (
                        <tr key={asset.id} className="group hover:bg-white/[0.01]">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                 {asset.imageUrl ? (
                                   <img src={`http://${window.location.hostname}:28081${asset.imageUrl}`} className="w-full h-full object-cover" />
                                 ) : <ImageIcon size={14} className="opacity-20" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white tracking-tight">{asset.ticker}</span>
                                <span className="text-[9px] text-white/20 uppercase font-medium">{asset.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => setMarketEvent(asset.id, magnitude / 100, duration)} className="px-3 py-1.5 rounded-lg bg-bull/10 border border-bull/20 text-bull text-[9px] font-black uppercase hover:bg-bull hover:text-black transition-all active:scale-95">Pump</button>
                              <button onClick={() => setMarketEvent(asset.id, -(magnitude / 100), duration)} className="px-3 py-1.5 rounded-lg bg-bear/10 border border-bear/20 text-bear text-[9px] font-black uppercase hover:bg-bear hover:text-white transition-all active:scale-95">Crash</button>
                              <button onClick={() => clearMarketEvents(asset.id)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase hover:bg-white/10 transition-all active:scale-95">Reset</button>
                            </div>
                          </td>
                          <td className="py-4 text-right pr-2">
                            <button onClick={() => openEdit(asset)} className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Edit3 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </section>

          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex gap-4 items-start">
            <Info className="text-apex shrink-0" size={20} />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white/80 uppercase tracking-tight">Protocol Warning</h4>
              <p className="text-xs text-white/30 leading-relaxed font-medium">Interventions are cumulative. Setting a pump while a crash is active will neutralize or skew the trajectory. A Hard Reset will purge all temporary network state.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#08090D]/95 backdrop-blur-2xl p-6">
          <div className="w-full max-w-lg bg-[#11131A] border border-white/[0.1] rounded-2xl shadow-2xl p-10 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                {editingAsset ? 'Modify Asset Node' : 'Initialize Asset Node'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center">
                 <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl bg-white/[0.02] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.04] hover:border-apex/40 transition-all overflow-hidden group">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : (
                      <>
                        <Upload size={24} className="text-white/20 mb-2 group-hover:text-apex" />
                        <span className="text-[8px] font-black uppercase text-white/20 group-hover:text-apex">Upload Icon</span>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="pro-label px-1">Ticker Symbol</label>
                  <input type="text" required value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm text-white focus:border-apex/40 outline-none font-bold" placeholder="GOON" />
                </div>
                <div className="space-y-2">
                  <label className="pro-label px-1">Display Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm text-white focus:border-apex/40 outline-none font-bold" placeholder="GoonCoin" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="pro-label px-1">Initial Price</label>
                  <input type="number" step="any" required value={formData.currentPrice} onChange={e => setFormData({...formData, currentPrice: parseFloat(e.target.value)})} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm text-white focus:border-apex/40 outline-none font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="pro-label px-1">Volatility</label>
                  <input type="number" step="0.1" required value={formData.volatility} onChange={e => setFormData({...formData, volatility: parseFloat(e.target.value)})} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 px-5 text-sm text-white focus:border-apex/40 outline-none font-mono" />
                </div>
              </div>

              <button type="submit" className="w-full bg-apex text-[#08090D] font-black py-5 rounded-xl uppercase tracking-widest text-sm hover:brightness-110 shadow-2xl shadow-apex/20 active:scale-[0.98]">
                {editingAsset ? 'Commit Protocol Changes' : 'Execute Asset Deployment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
