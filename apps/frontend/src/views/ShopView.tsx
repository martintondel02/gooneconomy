import React from 'react';

const ShopView: React.FC = () => {
  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
      <div className="glass-panel p-12 flex flex-col items-center gap-6 max-w-2xl text-center">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white/50">Lifestyle Shop</h2>
        <p className="text-white/30 uppercase tracking-[0.2em] text-sm">Convert your liquid wealth into permanent status.</p>
        <div className="w-full h-px bg-white/5"></div>
        <p className="text-cyan-400 font-mono text-xs">COMMING SOON: REAL ESTATE, VEHICLES, AND FLEX ITEMS.</p>
      </div>
    </div>
  );
};

export default ShopView;
