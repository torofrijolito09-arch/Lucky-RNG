/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Archive, 
  FlaskConical, 
  Sparkles, 
  Megaphone,
  Trash2,
  Lock,
  HandMetal
} from 'lucide-react';
import { InventoryItem, ActiveBuff, StoredAura, ItemType } from '../types';
import { playClickSound, playRollSound } from '../utils/audio';

interface StorageEconomyProps {
  rubies: number;
  rubyBlocks: number; // condensed Ruby blocks (10,000 value each)
  inventory: InventoryItem[];
  activeBuffs: ActiveBuff[];
  onCondenseWallet: () => void;
  onCraftElixir: () => void;
  onConsumeItem: (id: string) => void;
  // Custom props for advanced items
  voidCoins: number;
  storedAuras: StoredAura[];
  maxAuraSlots: number;
  onBuyAuraSlot: (currency: 'rubies' | 'void_coins') => void;
  onEquipAura: (storedId: string) => void;
  onReleaseAura: (storedId: string) => void;
  onBuyPotion: (id: ItemType, cost: number, currency: 'rubies' | 'void_coins') => void;
  
  // Gauntlet props
  totalEggsCaught: number;
  equippedGauntlet: string | null;
  ownedGauntlets: string[];
  onBuyGauntlet: (gauntletId: string, costEggs: number) => void;
  onEquipGauntlet: (gauntletId: string) => void;

  // Premium Store props
  goldenEggsCount: number;
  onBuyGoldenBasket: () => void;
  onSpawnGoldenEgg: () => void;
}

export const StorageEconomy: React.FC<StorageEconomyProps> = ({
  rubies,
  rubyBlocks,
  inventory,
  activeBuffs,
  onCondenseWallet,
  onCraftElixir,
  onConsumeItem,
  voidCoins,
  storedAuras,
  maxAuraSlots,
  onBuyAuraSlot,
  onEquipAura,
  onReleaseAura,
  onBuyPotion,
  totalEggsCaught,
  equippedGauntlet,
  ownedGauntlets,
  onBuyGauntlet,
  onEquipGauntlet,
  goldenEggsCount,
  onBuyGoldenBasket,
  onSpawnGoldenEgg
}) => {
  const [activeTab, setActiveTab] = useState<'auras' | 'potions' | 'popup' | 'gauntlets' | 'golden'>('auras');
  const [showSection3Popup, setShowSection3Popup] = useState<boolean>(false);

  const WALLET_CAP = 10000;
  const blocksNeeded = 5;

  // Retrieve current counts
  const blueElixir = inventory.find(i => i.id === 'BLUE_ELIXIR');
  const luckyPotion = inventory.find(i => i.id === 'LUCKY_POTION');
  const speedPotion = inventory.find(i => i.id === 'SPEED_POTION');
  const voidBrew = inventory.find(i => i.id === 'VOID_BREW');
  const novaSpark = inventory.find(i => i.id === 'NOVA_SPARK');
  const stellarElixir = inventory.find(i => i.id === 'STELLAR_ELIXIR');

  const activeElixir = activeBuffs.find(b => b.id === 'BLUE_ELIXIR_BUFF');
  const activeLuck = activeBuffs.find(b => b.id === 'LUCKY_POTION_BUFF');
  const activeSpeed = activeBuffs.find(b => b.id === 'SPEED_POTION_BUFF');
  const activeVoidBrew = activeBuffs.find(b => b.id === 'VOID_BREW_BUFF');
  const activeNovaSpark = activeBuffs.find(b => b.id === 'NOVA_SPARK_BUFF');
  const activeStellarElixir = activeBuffs.find(b => b.id === 'STELLAR_ELIXIR_BUFF');

  const handleBuySlotLocal = (currency: 'rubies' | 'void_coins') => {
    playClickSound();
    onBuyAuraSlot(currency);
  };

  const handleBuyPotionLocal = (id: ItemType, cost: number, currency: 'rubies' | 'void_coins') => {
    playClickSound();
    onBuyPotion(id, cost, currency);
  };

  return (
    <div id="storage-economy-module" className="bg-[#0c0c0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-5 relative overflow-hidden">
      
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-950/10 blur-[100px] pointer-events-none -z-15" />

      {/* Top Currencies Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-white/5 pb-4">
        {/* Rubies Handheld */}
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between col-span-1">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Rubies (10k Limit)</div>
            <div className="text-lg font-mono font-black text-red-500 animate-pulse mt-0.5">
              {rubies.toLocaleString()} <span className="text-[10px] text-zinc-650">/ 10,000</span>
            </div>
          </div>
          <button
            id="condense-shortcut"
            onClick={() => {
              playClickSound();
              onCondenseWallet();
            }}
            disabled={rubies < WALLET_CAP}
            className={`px-2.5 py-1.5 rounded font-mono text-[9px] font-bold uppercase border transition-all ${
              rubies >= WALLET_CAP
                ? 'bg-red-900/80 border-red-500 text-white shadow-lg animate-pulse hover:bg-red-800 cursor-pointer'
                : 'bg-[#121115] border-white/5 text-zinc-600 cursor-not-allowed'
            }`}
            title="Convert 10k Rubies into a compact Block"
          >
            Condense
          </button>
        </div>

        {/* Condensed Blocks */}
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between col-span-1">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Condensed Blocks</div>
            <div className="text-lg font-mono font-black text-indigo-400 mt-0.5">
              {rubyBlocks} <span className="text-[10px] text-zinc-500">Blocks</span>
            </div>
          </div>
          <button
            id="brew-elixir-shortcut"
            onClick={() => {
              playClickSound();
              onCraftElixir();
            }}
            disabled={rubyBlocks < blocksNeeded}
            className={`px-2.5 py-1.5 rounded font-mono text-[9px] font-bold uppercase border transition-all ${
              rubyBlocks >= blocksNeeded
                ? 'bg-indigo-900 border-indigo-500 text-white shadow-lg shadow-indigo-950/50 hover:bg-indigo-800 cursor-pointer'
                : 'bg-[#121115] border-white/5 text-zinc-600 cursor-not-allowed'
            }`}
            title="Use 5 Blocks to forge a premium Blue Elixir"
          >
            Forge Elixir
          </button>
        </div>

        {/* Void Coins */}
        <div className="p-3 bg-[#110e14]/80 rounded-xl border border-purple-900/10 border-purple-900/30 flex items-center justify-between shadow-lg col-span-1">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400">Void Coins 🪙</div>
            <div className="text-lg font-mono font-black text-purple-300 mt-0.5">
              {voidCoins.toLocaleString()} <span className="text-[10px] text-zinc-550">Coins</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-sm">
            🪙
          </div>
        </div>
      </div>

      {/* Tabs list with 3 sections */}
      <div className="flex items-center gap-2 p-1 bg-[#050505] rounded-xl border border-white/5">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('auras');
          }}
          className={`flex-1 cursor-pointer py-2 px-3 rounded-lg font-sans text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'auras'
              ? 'bg-gradient-to-r from-purple-900 to-[#191129] border border-purple-700/50 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Archive className="w-4 h-4 text-purple-400" />
          Section 1: Auras Storage
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('potions');
          }}
          className={`flex-1 cursor-pointer py-2 px-3 rounded-lg font-sans text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'potions'
              ? 'bg-gradient-to-r from-cyan-950 to-[#0e171c] border border-cyan-800/50 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-cyan-400" />
          Section 2: Alchemy Shop
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('popup');
          }}
          className={`flex-1 cursor-pointer py-2 px-3 rounded-lg font-sans text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'popup'
              ? 'bg-gradient-to-r from-amber-950 to-[#1c130d] border border-amber-800/50 text-white shadow-lg animate-pulse'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Section 3: Roll Bonus
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('gauntlets');
          }}
          className={`flex-1 cursor-pointer py-2 px-3 rounded-lg font-sans text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'gauntlets'
              ? 'bg-gradient-to-r from-red-950 to-orange-950 border border-red-800/50 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <HandMetal className="w-4 h-4 text-red-500" />
          Gauntlets
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('golden');
          }}
          className={`flex-1 cursor-pointer py-2 px-3 rounded-lg font-sans text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'golden'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-500 border border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] font-black'
              : 'text-amber-400/80 hover:text-amber-300 hover:bg-yellow-500/5'
          }`}
        >
          <span className="text-sm">🧺</span>
          Premium Shop
        </button>
      </div>

      {/* Panels rendering based on state */}
      <div className="bg-[#050505]/40 rounded-xl p-4 border border-white/5">
        
        {/* PREMIUM GOLDEN SHOP */}
        {activeTab === 'golden' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Purchase basket card */}
            <div className="bg-[#0b0a0a]/90 border border-red-950 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between opacity-75">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[45px] pointer-events-none" />
              
              {/* Corner COMING SOON Ribbon */}
              <div className="absolute top-3 right-3 bg-red-950/80 border border-red-500/30 text-red-400 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md font-black flex items-center gap-1 shadow-md select-none animate-pulse">
                <span>❌ COMING SOON!!!!</span>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-red-500/80 block mb-1">
                  EXPIRED / INACTIVE OFFER
                </span>
                <h3 className="text-lg font-black font-sans text-stone-400 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="line-through">Basket of Golden Eggs</span>
                </h3>
                <p className="text-xs text-zinc-500 leading-normal mt-2">
                  Crack open legendary, gold-plated eggs that guarantee extreme probability enhancement. This purchase channel is currently <span className="text-red-400 underline font-mono">disabled</span> pending real merchant onboarding.
                </p>

                <div className="mt-4 p-3 bg-black/60 rounded-lg border border-red-900/10 space-y-2 select-none filter grayscale opacity-45">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="text-base text-yellow-400">✨</span>
                    <span className="text-zinc-300"><b>5x total Luck multiplier</b> per egg consumed!</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="text-base text-yellow-400">⏱️</span>
                    <span className="text-zinc-300">Each egg gives <b>30 minutes</b> of passive acceleration.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="text-base text-yellow-400">⏸️</span>
                    <span className="text-zinc-300 font-mono"><b>TIMER PAUSES</b> automatically when you stop playing.</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-red-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="font-mono text-zinc-500 text-xs line-through">
                  Direct Cost: <span className="text-zinc-600 text-base font-black font-sans">$4.99</span> <span className="text-[10px] uppercase text-zinc-650">USD</span>
                </div>
                <button
                  disabled
                  className="cursor-not-allowed bg-red-950/20 border border-red-900/30 text-red-400 font-extrabold uppercase text-[10px] tracking-widest py-2 px-3.5 rounded-lg flex items-center gap-1 shadow-none transition-all"
                >
                  <span>❌ COMING SOON!!!!</span>
                </button>
              </div>
            </div>

            {/* Reserves / Spawn controller */}
            <div className="bg-[#05060a] border border-blue-500/10 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 block mb-1">
                  PREMIUM MANIFEST INVENTORY
                </span>
                <h3 className="text-base font-black text-gray-100 flex items-center gap-2">
                  🧺 Premium Bag Reserves
                </h3>
                <p className="text-xs text-zinc-400 leading-normal mt-2">
                  Once purchased, release eggs onto your Quantum Field. Catch them during gameplay to activate the luck benefits!
                </p>

                {/* Counter block */}
                <div className="my-5 p-4 bg-black/50 border border-white/5 rounded-xl text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />
                  <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                    Unreleased Eggs Ready
                  </div>
                  <div className="text-3xl font-mono font-black text-yellow-400 mt-1 drop-shadow-[0_0_12px_rgba(234,179,8,0.45)]">
                    🥚 {goldenEggsCount} <span className="text-sm text-zinc-400 font-normal">in Reserve</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  onSpawnGoldenEgg();
                }}
                disabled={goldenEggsCount <= 0}
                className={`w-full py-3 px-4 rounded-xl font-sans font-black uppercase text-xs tracking-widest transition-all duration-300 relative text-center border overflow-hidden ${
                  goldenEggsCount > 0
                    ? 'cursor-pointer bg-gradient-to-r from-yellow-950 via-zinc-950 to-yellow-950 border-yellow-500/40 text-yellow-400 hover:border-yellow-400 hover:text-white shadow-lg shadow-yellow-950/20'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-650 cursor-not-allowed'
                }`}
              >
                {goldenEggsCount > 0 && (
                  <span className="absolute inset-x-0 h-full bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 animate-pulse pointer-events-none" />
                )}
                👉 Release 1 Golden Egg (Spawn on Field)
              </button>
            </div>
          </div>
        )}

        {/* SECTION 4: GAUNTLETS */}
        {activeTab === 'gauntlets' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-black/50 border border-red-900/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 py-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-red-500 block mb-1">
                  DIMENSIONAL ARSENAL
                </span>
                <p className="text-xs text-zinc-400 font-mono">
                  Purchase legendary gauntlets using eggs collected from the map.
                </p>
              </div>
              <div className="bg-zinc-950 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 shadow-inner">
                <span className="text-xl">🥚</span>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block leading-tight">Total Caught</span>
                  <span className="font-mono text-zinc-200 font-extrabold text-sm leading-tight">{totalEggsCaught.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lucky Gauntlet */}
              <div className="bg-[#08080a] border border-white/5 rounded-xl p-4 relative overflow-hidden transition-all hover:border-green-500/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-sans font-black text-green-400 uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                      Lucky Gauntlet
                    </h3>
                    <div className="text-[10px] font-mono text-zinc-500 mb-1">Adds +47.5% Luck passively</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-950/40 border border-green-500/20 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                    🧤
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                    Cost: <span className="text-zinc-200">25 Eggs</span> 🥚
                  </div>
                  
                  {ownedGauntlets.includes('LUCKY_GAUNTLET') ? (
                    <button
                      onClick={() => {
                        playClickSound();
                        onEquipGauntlet('LUCKY_GAUNTLET');
                      }}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all ${
                        equippedGauntlet === 'LUCKY_GAUNTLET'
                          ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)] border border-green-400'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:text-white'
                      }`}
                    >
                      {equippedGauntlet === 'LUCKY_GAUNTLET' ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound();
                        onBuyGauntlet('LUCKY_GAUNTLET', 25);
                      }}
                      disabled={totalEggsCaught < 25}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all border ${
                        totalEggsCaught >= 25
                          ? 'bg-green-950/50 hover:bg-green-900/80 border-green-700 text-green-400 shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Buy Gauntlet
                    </button>
                  )}
                </div>
              </div>

              {/* Archangel Gauntlet */}
              <div className="bg-[#08080a] border border-white/5 rounded-xl p-4 relative overflow-hidden transition-all hover:border-yellow-500/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-sans font-black text-yellow-400 uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                      Archangel Gauntlet
                    </h3>
                    <div className="text-[10px] font-mono text-zinc-500 mb-1">Right Hand. +95% Luck. Blinding Flash.</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-yellow-950/40 border border-yellow-500/20 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                    👼
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                    Cost: <span className="text-zinc-200">125 Eggs</span> 🥚
                  </div>
                  
                  {ownedGauntlets.includes('ARCHANGEL_GAUNTLET') ? (
                    <button
                      onClick={() => {
                        playClickSound();
                        onEquipGauntlet('ARCHANGEL_GAUNTLET');
                      }}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all ${
                        equippedGauntlet === 'ARCHANGEL_GAUNTLET'
                          ? 'bg-yellow-600 text-white shadow-[0_0_10px_rgba(202,138,4,0.5)] border border-yellow-400'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:text-white'
                      }`}
                    >
                      {equippedGauntlet === 'ARCHANGEL_GAUNTLET' ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound();
                        onBuyGauntlet('ARCHANGEL_GAUNTLET', 125);
                      }}
                      disabled={totalEggsCaught < 125}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all border ${
                        totalEggsCaught >= 125
                          ? 'bg-yellow-950/50 hover:bg-yellow-900/80 border-yellow-700 text-yellow-400 shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Buy Gauntlet
                    </button>
                  )}
                </div>
              </div>

              {/* Reaper Gauntlet */}
              <div className="bg-[#08080a] border border-white/5 rounded-xl p-4 relative overflow-hidden transition-all hover:border-purple-500/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-sans font-black text-[#a855f7] uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                      Reaper Gauntlet
                    </h3>
                    <div className="text-[10px] font-mono text-zinc-500 mb-1">Left Hand. +190% Luck. Soul Siphon.</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    💀
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                    Cost: <span className="text-zinc-200">250 Eggs</span> 🥚
                  </div>
                  
                  {ownedGauntlets.includes('REAPER_GAUNTLET') ? (
                    <button
                      onClick={() => {
                        playClickSound();
                        onEquipGauntlet('REAPER_GAUNTLET');
                      }}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all ${
                        equippedGauntlet === 'REAPER_GAUNTLET'
                          ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)] border border-purple-400'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:text-white'
                      }`}
                    >
                      {equippedGauntlet === 'REAPER_GAUNTLET' ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound();
                        onBuyGauntlet('REAPER_GAUNTLET', 250);
                      }}
                      disabled={totalEggsCaught < 250}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all border ${
                        totalEggsCaught >= 250
                          ? 'bg-purple-950/50 hover:bg-purple-900/80 border-purple-700 text-purple-400 shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Buy Gauntlet
                    </button>
                  )}
                </div>
              </div>

              {/* Heavil Gauntlet (Endgame) */}
              <div className="bg-gradient-to-br from-[#0c0512] to-[#120000] border border-red-900/40 rounded-xl p-4 relative overflow-hidden transition-all hover:border-red-500/50 ring-1 ring-inset ring-red-500/10">
                <div className="absolute inset-x-0 -top-10 h-20 bg-red-500/10 blur-[30px] rounded-full" />
                <div className="flex items-start justify-between mb-2 relative">
                  <div>
                    <h3 className="font-sans font-black text-red-500 uppercase tracking-widest text-sm drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse">
                      Heavil Gauntlet
                    </h3>
                    <div className="text-[10px] font-mono text-zinc-400 mb-1">Endgame. +950% Luck. Double Laser.</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-bounce font-mono">
                    ☢️
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-red-900/30 flex items-center justify-between relative">
                  <div className="text-[11px] font-mono font-bold text-red-300 flex items-center gap-1.5">
                    Cost: <span className="text-zinc-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">1,250 Eggs</span> 🥚
                  </div>
                  
                  {ownedGauntlets.includes('HEAVIL_GAUNTLET') ? (
                    <button
                      onClick={() => {
                        playClickSound();
                        onEquipGauntlet('HEAVIL_GAUNTLET');
                      }}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] ${
                        equippedGauntlet === 'HEAVIL_GAUNTLET'
                          ? 'bg-red-600 text-white border border-red-400'
                          : 'bg-zinc-900 text-zinc-300 border border-red-900 hover:text-white'
                      }`}
                    >
                      {equippedGauntlet === 'HEAVIL_GAUNTLET' ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound();
                        onBuyGauntlet('HEAVIL_GAUNTLET', 1250);
                      }}
                      disabled={totalEggsCaught < 1250}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all border ${
                        totalEggsCaught >= 1250
                          ? 'bg-gradient-to-r from-red-800 to-red-600 hover:brightness-110 border-red-400 text-white shadow-lg shadow-red-900/50'
                          : 'bg-zinc-950 border-red-900/50 text-red-900/50 cursor-not-allowed'
                      }`}
                    >
                      Buy Gauntlet
                    </button>
                  )}
                </div>
              </div>

              {/* Booster Gauntlet */}
              <div className="bg-[#08080a] border border-white/5 rounded-xl p-4 relative overflow-hidden transition-all hover:border-cyan-500/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-sans font-black text-cyan-400 uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                      Booster Gauntlet
                    </h3>
                    <div className="text-[10px] font-mono text-zinc-500 mb-1">Adds +25% Luck and x2.5 Speed Boost</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    🚀
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                    Cost: <span className="text-zinc-200">60 Eggs</span> 🥚
                  </div>
                  
                  {ownedGauntlets.includes('BOOSTER_GAUNTLET') ? (
                    <button
                      onClick={() => {
                        playClickSound();
                        onEquipGauntlet('BOOSTER_GAUNTLET');
                      }}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all ${
                        equippedGauntlet === 'BOOSTER_GAUNTLET'
                          ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)] border border-cyan-400'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:text-white'
                      }`}
                    >
                      {equippedGauntlet === 'BOOSTER_GAUNTLET' ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound();
                        onBuyGauntlet('BOOSTER_GAUNTLET', 60);
                      }}
                      disabled={totalEggsCaught < 60}
                      className={`cursor-pointer px-3 py-1.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wider transition-all border ${
                        totalEggsCaught >= 60
                          ? 'bg-cyan-950/50 hover:bg-cyan-900/80 border-cyan-700 text-cyan-400 shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Buy Gauntlet
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SECTION 1: AURAS STORAGE PANEL */}
        {activeTab === 'auras' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Slot purchasing and metrics details */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between col-span-1">
              <div>
                <span className="text-[9px] font-mono tracking-widest uppercase text-purple-400 block mb-1">
                  DIMENSIONAL STORAGE
                </span>
                <h4 className="text-sm font-black text-gray-100 flex items-center gap-1">
                  Aura Holding Capacity
                </h4>
                
                {/* Stats */}
                <div className="my-3.5 p-3 bg-[#050505] rounded-lg border border-white/5 text-center">
                  <div className="text-xl font-mono font-black text-purple-300">
                    {storedAuras.length} <span className="text-xs text-zinc-500 font-normal">/ {maxAuraSlots} Slots Used</span>
                  </div>
                  {/* Slots dots visual representing occupancy */}
                  <div className="flex justify-center items-center gap-1.5 mt-2 flex-wrap">
                    {Array.from({ length: maxAuraSlots }).map((_, idx) => (
                      <div 
                        key={idx}
                        className={`w-3 h-3 rounded-full border transition-all ${
                          idx < storedAuras.length
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400'
                            : 'bg-zinc-950 border-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 leading-normal mb-4 font-sans">
                  Each saved celestial aura occupies <b>1 storage slot</b>. You start off with 4 slots. Buy extra space dynamically below to store more unique configurations!
                </p>
              </div>

              {/* Buy Capacity section */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase block">Expand Aura Inventory (+1 limit):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBuySlotLocal('rubies')}
                    className="cursor-pointer bg-red-950/20 hover:bg-red-900/40 border border-red-900/55 rounded p-2 text-center transition-all duration-200"
                    title="Buy aura space slot with standard Rubies"
                  >
                    <div className="text-[8px] font-mono text-zinc-400">In Rubies</div>
                    <div className="text-[10px] font-black text-red-400 font-mono">
                      {Math.floor(1500 * Math.pow(1.2, maxAuraSlots - 4)).toLocaleString()} Rubies
                    </div>
                  </button>

                  <button
                    onClick={() => handleBuySlotLocal('void_coins')}
                    className="cursor-pointer bg-purple-950/20 hover:bg-purple-900/40 border border-purple-900/55 rounded p-2 text-center transition-all duration-200"
                    title="Buy aura space slot with spatial Void Coins"
                  >
                    <div className="text-[8px] font-mono text-zinc-400">In Coins</div>
                    <div className="text-[10px] font-black text-purple-300 font-mono">
                      {Math.floor(40 * Math.pow(1.2, maxAuraSlots - 4)).toLocaleString()}¢
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* List of slots/auras */}
            <div className="md:col-span-2 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Saved Aura Registry ({storedAuras.length} saved)</span>
              
              {storedAuras.length === 0 ? (
                <div className="bg-black/30 border border-dashed border-white/10 rounded-2xl h-44 flex flex-col items-center justify-center text-center p-6">
                  <Lock className="w-7 h-7 text-zinc-750 animate-pulse mb-1.5" />
                  <span className="text-[10px] text-zinc-500 font-mono">No Saved Auras in Vault.</span>
                  <span className="text-[9px] text-purple-400 font-mono mt-1">Roll an aura and hit 'Keep / Claim' in the active preview card to save it!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[224px] overflow-y-auto custom-scrollbar pr-1">
                  {storedAuras.map((stored) => (
                    <div 
                      key={stored.id} 
                      className="p-3 bg-[#050505] border border-white/5 rounded-xl flex flex-col justify-between hover:border-purple-900/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div>
                          <span className={`font-black uppercase tracking-wider text-[11px] block truncate max-w-[140px] bg-gradient-to-r bg-clip-text text-transparent ${stored.aura.color}`}>
                            {stored.aura.name}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500 text-zinc-400">Chance: 1/{stored.aura.chance.toLocaleString()}</span>
                        </div>
                        <span className="text-[11px] filter drop-shadow-[0_0_5px_#a855f7]/30 text-purple-400 font-mono">✦</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5 mt-1.5">
                        <button
                          onClick={() => {
                            playClickSound();
                            onEquipAura(stored.id);
                          }}
                          className="cursor-pointer bg-purple-950/40 hover:bg-purple-900/50 font-sans text-[9px] font-extrabold tracking-widest text-purple-300 py-1.5 px-2 rounded border border-purple-800/40 hover:text-white uppercase transition-all"
                        >
                          Equip
                        </button>
                        <button
                          onClick={() => {
                            playClickSound();
                            onReleaseAura(stored.id);
                          }}
                          className="cursor-pointer bg-zinc-950 hover:bg-red-950/20 font-sans text-[8px] text-zinc-500 hover:text-red-400 py-1.5 px-2 rounded border border-white/5 hover:border-red-900/40 uppercase transition-all flex items-center justify-center gap-0.5"
                          title="Release aura and reclaim 10 Void Coins"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Sell (+10¢)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: ALCHEMY SHOP & CONSUMABLES */}
        {activeTab === 'potions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
            {/* Consumables Inventory list */}
            <div className="space-y-3 col-span-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Inventory Bag with Consumables</span>
              
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {/* Lucky Potion */}
                <div className="p-2.5 bg-[#050505] border border-white/5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-black/50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded bg-green-950/30 border border-green-800/40 flex items-center justify-center text-green-404 text-green-400 text-sm">⚡</span>
                    <div>
                      <div className="font-extrabold text-gray-200 text-[11px]">Lucky Potion</div>
                      <div className="text-[9px] text-[#22c55e] font-mono">
                        Owned: {luckyPotion?.count || 0} flask | +100 Base Luck (5m)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onConsumeItem('LUCKY_POTION');
                    }}
                    disabled={!luckyPotion || luckyPotion.count <= 0}
                    className={`cursor-pointer px-2.5 py-1.5 rounded font-mono text-[9px] font-extrabold uppercase transition-all ${
                      luckyPotion && luckyPotion.count > 0 
                        ? 'bg-emerald-650 hover:bg-emerald-600 text-white shadow-md shadow-emerald-950/50' 
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {activeLuck ? 'ACTIVE' : 'USE FLASK'}
                  </button>
                </div>

                {/* Speed Potion */}
                <div className="p-2.5 bg-[#050505] border border-white/5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-black/50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded bg-amber-950/30 border border-amber-800/40 flex items-center justify-center text-amber-400 text-sm">🏃</span>
                    <div>
                      <div className="font-extrabold text-[#fda4af] text-amber-300 text-[11px]">Speed Potion</div>
                      <div className="text-[9px] text-amber-405 text-amber-400 font-mono">
                        Owned: {speedPotion?.count || 0} flask | ×2.5 Speed Boost (3m)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onConsumeItem('SPEED_POTION');
                    }}
                    disabled={!speedPotion || speedPotion.count <= 0}
                    className={`cursor-pointer px-2.5 py-1.5 rounded font-mono text-[9px] font-extrabold uppercase transition-all ${
                      speedPotion && speedPotion.count > 0 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-955 shadow-amber-955' 
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {activeSpeed ? 'ACTIVE' : 'USE FLASK'}
                  </button>
                </div>

                {/* Void Brew */}
                <div className="p-2.5 bg-[#050505] border border-white/5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-black/50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded bg-purple-950/30 border border-purple-800/40 flex items-center justify-center text-purple-400 text-sm">🔮</span>
                    <div>
                      <div className="font-extrabold text-purple-305 text-purple-300 text-[11px]">Void Brew</div>
                      <div className="text-[9px] text-purple-400 font-mono">
                        Owned: {voidBrew?.count || 0} brew | +15 Base Luck (5m)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onConsumeItem('VOID_BREW');
                    }}
                    disabled={!voidBrew || voidBrew.count <= 0}
                    className={`cursor-pointer px-2.5 py-1.5 rounded font-mono text-[9px] font-extrabold uppercase transition-all ${
                      voidBrew && voidBrew.count > 0 
                        ? 'bg-purple-900 hover:bg-purple-800 text-white shadow-md' 
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {activeVoidBrew ? 'ACTIVE' : 'DRINK'}
                  </button>
                </div>

                {/* Nova Spark */}
                <div className="p-2.5 bg-[#050505] border border-white/5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-black/50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-400 text-sm">💥</span>
                    <div>
                      <div className="font-extrabold text-red-305 text-red-300 text-[11px]">Nova Spark</div>
                      <div className="text-[9px] text-red-400 font-mono font-bold">
                        Owned: {novaSpark?.count || 0} shot | ×1.5 Speed Boost (2m)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onConsumeItem('NOVA_SPARK');
                    }}
                    disabled={!novaSpark || novaSpark.count <= 0}
                    className={`cursor-pointer px-2.5 py-1.5 rounded font-mono text-[9px] font-extrabold uppercase transition-all ${
                      novaSpark && novaSpark.count > 0 
                        ? 'bg-red-900 hover:bg-red-800 text-white shadow-md' 
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {activeNovaSpark ? 'ACTIVE' : 'CRACK'}
                  </button>
                </div>

                {/* Stellar Elixir */}
                <div className="p-2.5 bg-[#050505] border border-white/5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-black/50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-center text-indigo-400 text-sm">✨</span>
                    <div>
                      <div className="font-extrabold text-indigo-305 text-indigo-300 text-[11px]">Stellar Elixir</div>
                      <div className="text-[9px] text-indigo-400 font-mono">
                        Owned: {stellarElixir?.count || 0} elixir | +250 Base Luck (2m)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onConsumeItem('STELLAR_ELIXIR');
                    }}
                    disabled={!stellarElixir || stellarElixir.count <= 0}
                    className={`cursor-pointer px-2.5 py-1.5 rounded font-mono text-[9px] font-extrabold uppercase transition-all ${
                      stellarElixir && stellarElixir.count > 0 
                        ? 'bg-indigo-900 hover:bg-indigo-800 text-white shadow-md' 
                        : 'bg-zinc-900 text-zinc-650 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {activeStellarElixir ? 'ACTIVE' : 'DRINK'}
                  </button>
                </div>

                {/* Blue Elixir */}
                <div className="p-3 bg-[#0d1324] border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2.5 relative">
                    <div className="w-8 h-8 rounded bg-cyan-950/30 border border-cyan-800/50 flex items-center justify-center text-cyan-400 text-sm">🧪</div>
                    <div>
                      <div className="font-extrabold text-cyan-300">Blue Elixir</div>
                      <div className="text-[9px] text-cyan-405 text-cyan-400 font-mono">
                        Owned: {blueElixir?.count || 0} elixir | +45,000 extreme luck
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onConsumeItem('BLUE_ELIXIR');
                    }}
                    disabled={!blueElixir || blueElixir.count <= 0}
                    className={`cursor-pointer px-3 py-1.5 rounded font-mono text-[9px] font-black uppercase transition-all ${
                      blueElixir && blueElixir.count > 0 
                        ? 'bg-cyan-500 text-zinc-955 text-zinc-950 hover:brightness-115 shadow-[0_0_10px_rgba(6,182,212,0.6)]' 
                        : 'bg-zinc-900 text-zinc-650 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {activeElixir ? 'ACTIVE' : 'DRINK FLASK'}
                  </button>
                </div>
              </div>
            </div>

            {/* Potion Purchase Store */}
            <div className="bg-[#0b0a0e] p-3.5 rounded-xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-405 text-cyan-400 block mb-1">
                  ALCHEMY SHIELD STORE
                </span>
                <h4 className="text-xs font-black text-gray-100 mb-2.5">
                  Concoct Standard potions or Craft 3 Balanced Custom Brews:
                </h4>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {/* Buy Lucky potion */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-[11px] font-mono text-zinc-300">
                    <div className="flex flex-col">
                      <span className="font-extrabold">Lucky Potion x1 ⚡</span>
                      <span className="text-[8px] text-zinc-500">Adds +100 base Luck (5m)</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleBuyPotionLocal('LUCKY_POTION', 1500, 'rubies')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-red-900/30 hover:border-red-500 rounded px-2 py-1 text-red-400 transition-all font-bold"
                      >
                        1,500 R
                      </button>
                      <button
                        onClick={() => handleBuyPotionLocal('LUCKY_POTION', 40, 'void_coins')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-purple-900/30 hover:border-purple-500 rounded px-2 py-1 text-purple-300 transition-all font-bold"
                      >
                        40¢
                      </button>
                    </div>
                  </div>

                  {/* Buy Speed potion */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-[11px] font-mono text-zinc-300">
                    <div className="flex flex-col">
                      <span className="font-extrabold">Speed Potion x1 🏃</span>
                      <span className="text-[8px] text-zinc-500 flex items-center">×2.5 dynamic roll speed (3m)</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleBuyPotionLocal('SPEED_POTION', 3000, 'rubies')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-red-900/30 hover:border-red-500 rounded px-2 py-1 text-red-400 transition-all font-bold"
                      >
                        3,000 R
                      </button>
                      <button
                        onClick={() => handleBuyPotionLocal('SPEED_POTION', 80, 'void_coins')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-purple-900/30 hover:border-purple-500 rounded px-2 py-1 text-purple-300 transition-all font-bold"
                      >
                        80¢
                      </button>
                    </div>
                  </div>

                  {/* Buy Custom Potion 1: Void Brew */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-[11px] font-mono text-zinc-300">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-purple-400">Void Brew (Custom) 🔮</span>
                      <span className="text-[8px] text-zinc-500">Adds +15 base Luck for 5 Mins</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleBuyPotionLocal('VOID_BREW', 2500, 'rubies')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-red-900/30 hover:border-red-500 rounded px-2 py-1 text-red-400 transition-all font-bold"
                      >
                        2,500 R
                      </button>
                      <button
                        onClick={() => handleBuyPotionLocal('VOID_BREW', 60, 'void_coins')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-purple-900/30 hover:border-purple-500 rounded px-2 py-1 text-purple-300 transition-all font-bold"
                      >
                        60¢
                      </button>
                    </div>
                  </div>

                  {/* Buy Custom Potion 2: Nova Spark */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-[11px] font-mono text-[#fda4af] text-zinc-300">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-red-400">Nova Spark (Custom) 💥</span>
                      <span className="text-[8px] text-zinc-500">×1.5 Speed booster stack (2m)</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleBuyPotionLocal('NOVA_SPARK', 4000, 'rubies')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-red-900/30 hover:border-red-500 rounded px-2 py-1 text-red-400 transition-all font-bold"
                      >
                        4,000 R
                      </button>
                      <button
                        onClick={() => handleBuyPotionLocal('NOVA_SPARK', 100, 'void_coins')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-purple-900/30 hover:border-purple-500 rounded px-2 py-1 text-purple-300 transition-all font-bold"
                      >
                        100¢
                      </button>
                    </div>
                  </div>

                  {/* Buy Custom Potion 3: Stellar Elixir */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-[11px] font-mono text-zinc-300">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-indigo-400">Stellar Elixir (Custom) ✨</span>
                      <span className="text-[8px] text-zinc-500">Adds +250 base Luck modifier (2m)</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleBuyPotionLocal('STELLAR_ELIXIR', 5000, 'rubies')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-red-900/30 hover:border-red-500 rounded px-2 py-1 text-red-400 transition-all font-bold"
                      >
                        5,000 R
                      </button>
                      <button
                        onClick={() => handleBuyPotionLocal('STELLAR_ELIXIR', 150, 'void_coins')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-purple-900/30 hover:border-purple-500 rounded px-2 py-1 text-purple-300 transition-all font-bold"
                      >
                        150¢
                      </button>
                    </div>
                  </div>

                  {/* Buy Blue Elixir */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-cyan-300">Blue Elixir (ULTIMATE) 🧪</span>
                      <span className="text-[8px] text-zinc-500">Extreme +45,000% luck on ONE roll</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleBuyPotionLocal('BLUE_ELIXIR', 800, 'void_coins')}
                        className="cursor-pointer text-[9px] bg-[#121216] border border-purple-900/30 hover:border-fuchsia-500 rounded px-2.5 py-1 text-fuchsia-300 transition-all font-bold shrink-0"
                        title="Buy directly using coins"
                      >
                        800¢ Premium
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Temporary Buffs Confirmation panel */}
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-zinc-500">
                <span className="block mb-1 uppercase text-[8px] font-bold">Active Time Boosts Status:</span>
                <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                  {activeBuffs.length === 0 ? (
                    <span className="text-zinc-650 italic text-[9px]">No physical buffs currently orbiting.</span>
                  ) : (
                    activeBuffs.map(buff => {
                      const mins = Math.floor(buff.durationLeft / 60);
                      const secs = Math.floor(buff.durationLeft % 60);
                      const displayTime = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                      
                      return (
                        <div 
                          key={buff.id}
                          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border bg-[#030303] text-[9px] uppercase ${
                            buff.id === 'MAX_VOID_ENERGY_BUFF' 
                              ? 'border-fuchsia-900/70 text-fuchsia-300 text-[10px] scale-[1.03] shadow-[0_0_8px_rgba(240,70,240,0.3)] font-sans font-black ring-1 ring-purple-600/30 animate-pulse'
                              : buff.id === 'GOLDEN_EGG_LUCK_BUFF'
                                ? 'border-yellow-500/80 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.25)] font-sans font-black ring-1 ring-yellow-500/40 animate-pulse'
                                : 'border-white/5 text-zinc-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            buff.id === 'MAX_VOID_ENERGY_BUFF' 
                              ? 'bg-fuchsia-400' 
                              : buff.id === 'GOLDEN_EGG_LUCK_BUFF'
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                          }`} />
                          <span>{buff.name}:</span>
                          <span className="text-amber-400 font-bold ml-0.5">{displayTime}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 3: POP-UP INTERACTIVE BANNER */}
        {activeTab === 'popup' && (
          <div className="p-4 flex flex-col items-center justify-center text-center relative overflow-hidden h-44 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent)] border border-purple-900/20">
            
            {/* Background grid lines */}
            <div className="absolute inset-0 bg-[#000] opacity-50 bg-[size:10px_10px] bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] -z-10" />

            <Megaphone className="w-8 h-8 text-amber-400 animate-bounce mb-2" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">BONUS CAMPAIGN DETAILS</span>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-250 mt-1 uppercase mb-3">
              MINT SPY COINS IN MULTIPLIERS!
            </h2>

            <button
              id="section3-popup-trigger"
              onClick={() => {
                playClickSound();
                // Synthesize rare twinkle chord when clicked for satisfying UX
                playRollSound(880.00, true);
                setShowSection3Popup(true);
              }}
              className="cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-955 text-zinc-950 text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-all duration-300"
            >
              Roll for coins!
            </button>
          </div>
        )}

      </div>

      {/* MODAL DIALOG POP-UP OVERLAY FOR SECTION 3 */}
      {showSection3Popup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in animate-duration-300">
          <div className="bg-[#050508] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
            
            {/* Top gold bar decorative */}
            <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />
            
            <div className="flex justify-center mb-3">
              <span className="text-4xl animate-bounce">🪙</span>
            </div>

            <h3 className="text-lg font-black tracking-widest text-yellow-400 uppercase font-sans mb-2">
              Roll for Coins Campaign!
            </h3>

            <p className="text-zinc-300 text-xs leading-relaxed font-mono mb-5">
              "Roll for Coins! 🌌 Every single roll of the Paradox Engine automatically mints brand-new **Void Coins** directly into your spatial payload! <br /><br />
              Yielding a **Common Star** awards **1¢**, while finding an **Eternal Infinity** or any ultra-rare celestial configuration mints up to **10,000¢** instantly! No caps. Use your coins dynamically inside Section 2 to buy Lucky and Speed potions, or Section 1 to acquire persistent aura storage capacity!"
            </p>

            <button
              onClick={() => {
                playClickSound();
                setShowSection3Popup(false);
              }}
              className="cursor-pointer w-full bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-955 text-zinc-950 font-black text-xs uppercase tracking-widest py-2.5 rounded-lg border border-amber-300/30 hover:brightness-110 active:scale-95 transition-all"
            >
              Start Rolling Now!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
