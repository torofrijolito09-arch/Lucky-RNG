/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Egg, Sparkles, HelpCircle, Flame, Umbrella, Wand } from 'lucide-react';
import { EggDrop } from '../types';
import { playClickSound, playEggCollectSound } from '../utils/audio';

interface EggHuntCanvasProps {
  eggDrops: EggDrop[];
  onCollectEgg: (eggId: string, decimalRoll?: number, isVoidSuccess?: boolean) => void;
  onSimulateEggRain: () => void;
}

export const EggHuntCanvas: React.FC<EggHuntCanvasProps> = ({
  eggDrops,
  onCollectEgg,
  onSimulateEggRain
}) => {
  const [lastRewardInfo, setLastRewardInfo] = useState<{
    type: 'SMALL' | 'NORMAL' | 'GILDED' | 'VOID' | 'GOLDEN';
    rollValue?: number;
    zoneName?: string;
    rewardLabel: string;
  } | null>(null);

  const handleEggClick = (egg: EggDrop) => {
    playClickSound();
    playEggCollectSound(egg.type === 'VOID' || egg.type === 'GOLDEN' ? 'GILDED' : egg.type);

    let rollValue: number | undefined;
    let zoneName: string | undefined;
    let rewardLabel = '';
    let isVoidSuccess = false;

    if (egg.type === 'GOLDEN') {
      rewardLabel = '🌟 5x LUCK BOOSTER UNLOCKED! (+30 mins stackable)';
    } else if (egg.type === 'SMALL') {
      // Small Eggs: 50-500 Rubies
      const payout = Math.floor(Math.random() * 451) + 50;
      rewardLabel = `${payout} Rubies`;
    } else if (egg.type === 'VOID') {
      // Void Egg logic: 1/25 chance of Max Void Energy
      isVoidSuccess = Math.random() < 1/25;
      if (isVoidSuccess) {
        rewardLabel = '🌌 MAX VOID ENERGY TRIGGERED! (2.5x Luck Booster for 2m!)';
      } else {
        rewardLabel = '+250 Rubies & 15 Void Coins (1/25 Luck missed)';
      }
    } else if (egg.type === 'NORMAL') {
      // Standalone random decimal calculation engine (0.0 to 100.0)
      rollValue = Math.round(Math.random() * 1000) / 10; // decimal rounded to 1 decimal place e.g. 45.3 or 98.2
      if (rollValue <= 50.0) {
        zoneName = 'The Common Zone (0.0 - 50.0)';
        rewardLabel = 'Lucky Potion (50% Drop)';
      } else if (rollValue <= 80.0) {
        zoneName = 'The Rare Zone (50.1 - 80.0)';
        rewardLabel = 'Speed Potion (30% Drop)';
      } else if (rollValue <= 98.0) {
        zoneName = 'The Epic Zone (80.1 - 98.0)';
        rewardLabel = '1,000 Ruby Bundle (18% Drop)';
      } else {
        zoneName = 'The Elixir Zone (98.1 - 100.0)';
        rewardLabel = '1x Blue Elixir (Strict 2% Drop)';
      }
    } else {
      // Gilded Egg
      const pool = ['Astral Deity Aura', 'Eternal Infinity Aura Booster', '5,000 Ruby Hyper Bundle'];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      rewardLabel = pick;
    }

    setLastRewardInfo({
      type: egg.type,
      rollValue,
      zoneName,
      rewardLabel
    });

    // Bubble up to trigger the actual inventory changes
    onCollectEgg(egg.id, rollValue, isVoidSuccess);
  };

  return (
    <div id="egg-hunting-field" className="bg-[#0f0f12] border border-white/5 rounded-xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-white/5 pb-2.5">
        <div>
          <h3 className="font-extrabold tracking-widest text-[11px] uppercase text-cyan-400 font-sans flex items-center gap-1.5">
            <Egg className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            Live Stellar Egg Hunt Active
          </h3>
          <p className="text-[10px] text-zinc-400 leading-normal mt-0.5 max-w-md">
            Click floating physical eggs directly inside the Quantum Space Map to grab them! Spawns continuously in general gameplay.
          </p>
        </div>

        {/* Rain Simulator Helper for convenient testing */}
        <button
          id="simulate-egg-rain"
          onClick={() => {
            playClickSound();
            onSimulateEggRain();
          }}
          className="cursor-pointer bg-[#16141a] hover:bg-[#201c25] text-cyan-400 text-[10px] font-mono font-bold uppercase px-3 py-1.5 rounded border border-white/5 transition-all duration-300 flex items-center gap-1 shadow-md"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Simulate Egg Rain
        </button>
      </div>

      {/* Actual Live Canvas map drop zone */}
      <div className="h-48 sm:h-56 w-full relative bg-[#050505] rounded-lg border border-white/5 overflow-hidden mb-3 shadow-inner">
        {/* Spatial Grid background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        {/* Floating background stars */}
        <div className="absolute w-1 h-1 bg-zinc-500 rounded-full top-8 left-20 animate-pulse" />
        <div className="absolute w-1 h-1 bg-zinc-400 rounded-full top-28 left-44" />
        <div className="absolute w-1 h-1 bg-zinc-600 rounded-full top-16 left-80 animate-pulse" />
        <div className="absolute w-1 h-1 bg-zinc-500 rounded-full top-36 left-10" />

        {eggDrops.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/85">
            <Egg className="w-8 h-8 text-zinc-705 text-zinc-700 animate-pulse mb-1.5" />
            <span className="text-[10px] text-zinc-500 font-mono">Scanning stellar grid for spawns...</span>
            <span className="text-[9px] text-[#a855f7]/70 font-mono mt-1">Simulate rain using the header trigger above</span>
          </div>
        ) : (
          eggDrops.map((egg) => {
            let eggUrl = '';
            let eggTitle = '';
            let eggStyle = '';

            if (egg.type === 'GOLDEN') {
              eggTitle = 'Golden Premium Booster Egg';
              eggStyle = 'text-amber-400 fill-amber-300 drop-shadow-[0_0_18px_#fa0] hover:scale-135 animate-pulse duration-500';
            } else if (egg.type === 'GILDED') {
              eggTitle = 'Gilded Holiday Egg';
              eggStyle = 'text-yellow-450 fill-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.7)] hover:scale-130 animate-pulse';
            } else if (egg.type === 'VOID') {
              eggTitle = 'Galaxy Void Egg (1/25 Max Void Energy)';
              eggStyle = 'text-[#c084fc] fill-[#1e1b4b] drop-shadow-[0_0_16px_#c084fc] hover:scale-135 animate-bounce';
            } else if (egg.type === 'NORMAL') {
              eggTitle = 'Normal Decimal Egg';
              eggStyle = 'text-cyan-405 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] hover:scale-130 animate-bounce';
            } else {
              eggTitle = 'Small Ruby Container';
              eggStyle = 'text-zinc-405 fill-zinc-500 hover:scale-130';
            }

            return (
              <button
                key={egg.id}
                id={`egg-${egg.id}`}
                onClick={() => handleEggClick(egg)}
                className="absolute cursor-pointer transition-transform duration-200 transform-gpu p-1.5"
                style={{ 
                  left: `${egg.x}%`, 
                  top: `${egg.y}%`,
                  animation: `float ${egg.pulseSpeed}s ease-in-out infinite`
                }}
                title={`Click to open! Type: ${eggTitle}`}
              >
                <div className="relative">
                  {egg.type === 'VOID' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-md rounded-full -z-10 scale-125 animate-pulse" />
                  )}
                  {egg.type === 'GOLDEN' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-yellow-500 opacity-70 blur-md rounded-full -z-10 scale-125 animate-spin duration-1000" />
                  )}
                  <Egg 
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-all hover:brightness-125 ${eggStyle}`} 
                  />
                  {egg.type === 'GILDED' && (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-350 absolute -top-1.5 -right-1.5 animate-spin" />
                  )}
                  {egg.type === 'GOLDEN' && (
                    <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
                  )}
                  {egg.type === 'VOID' && (
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-300 absolute -top-1.5 -right-1.5 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })
        )}

        {/* Bottom map watermark */}
        <span className="absolute bottom-2 right-3 text-[8px] font-mono text-zinc-705 text-zinc-700 tracking-widest uppercase font-bold">
          Sector-RNG-Grid-A
        </span>
      </div>

      {/* Interactive standalone decimal engine log & rewards confirmation banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Real-time decimal log table */}
        <div className="p-3 bg-[#131216]/60 rounded-lg border border-white/5">
          <h4 className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mb-1 flex items-center justify-between">
            <span>Decimal Probability Log Engine</span>
            <span className="text-[8px] text-[#a855f7] font-bold uppercase font-sans">100% pure luck model</span>
          </h4>

          {lastRewardInfo ? (
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Spawn Opened:</span>
                <span className={`font-black ${
                  lastRewardInfo.type === 'GILDED' 
                    ? 'text-yellow-405 text-yellow-400' 
                    : lastRewardInfo.type === 'NORMAL' 
                      ? 'text-cyan-405 text-cyan-400' 
                      : 'text-zinc-300'
                }`}>
                  {lastRewardInfo.type} Container
                </span>
              </div>

              {lastRewardInfo.type === 'NORMAL' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Decimal Roll:</span>
                    <span className="text-cyan-300 font-extrabold font-mono bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-900/30">
                      {lastRewardInfo.rollValue?.toFixed(1)} / 100.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">Assigned Zone:</span>
                    <span className="text-indigo-400 font-sans font-black">{lastRewardInfo.zoneName}</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5 mt-1">
                <span className="text-zinc-400">Awarded Asset:</span>
                <span className="text-green-400 font-sans font-bold flex items-center gap-1 text-[10px]">
                  <Sparkles className="w-3 h-3 text-green-400 animate-pulse" />
                  {lastRewardInfo.rewardLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-12 text-center text-[9px] text-zinc-600 font-mono italic">
              Crack open any egg containers above to log exact real-time decimal probabilities.
            </div>
          )}
        </div>

        {/* Probability specifications mapping */}
        <div id="decimal-roll-mapping" className="bg-[#131216]/60 p-3 rounded-lg border border-white/5 text-[9px] font-mono leading-normal space-y-0.5">
          <div className="text-[8px] uppercase text-[#a855f7] font-bold border-b border-white/5 pb-1 mb-1 flex items-center justify-between">
            <span>Normal Egg Roll Table Mapping</span>
            <span>Chance</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>[00.0 - 50.0] Common Zone: <b className="text-zinc-300">Lucky Potion</b></span>
            <span className="text-zinc-450">50%</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>[50.1 - 80.0] Rare Zone: <b className="text-zinc-300">Speed Potion</b></span>
            <span className="text-zinc-450">30%</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>[80.1 - 98.0] Epic Zone: <b className="text-zinc-300">1kb Ruby Bundle</b></span>
            <span className="text-zinc-450">18%</span>
          </div>
          <div className="flex justify-between items-center text-cyan-405 font-bold">
            <span>[98.1 - 100.0] Elixir Zone: <b className="text-cyan-300 font-extrabold uppercase">1x Blue Elixir</b></span>
            <span className="text-cyan-400 font-black">2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
