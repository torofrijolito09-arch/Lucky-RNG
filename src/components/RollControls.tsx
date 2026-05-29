/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Square, RefreshCcw, Sparkles, Flame, History, Trash2 } from 'lucide-react';
import { Aura, RollResult } from '../types';
import { playClickSound } from '../utils/audio';

interface RollControlsProps {
  onRoll: () => void;
  isRolling: boolean;
  autoRoll: boolean;
  onToggleAutoRoll: () => void;
  rollDelay: number;
  luckMultiplier: number;
  rollHistory: RollResult[];
  onClearHistory: () => void;
}

export const RollControls: React.FC<RollControlsProps> = ({
  onRoll,
  isRolling,
  autoRoll,
  onToggleAutoRoll,
  rollDelay,
  luckMultiplier,
  rollHistory,
  onClearHistory
}) => {
  return (
    <div id="roll-controls-console" className="bg-[#0f0f12] border border-white/5 rounded-xl p-4 shadow-lg flex flex-col justify-between h-full">
      {/* 1. Primary Action Grid */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
            <h3 className="font-extrabold tracking-widest text-[11px] uppercase text-purple-400 font-sans">
              Paradox RNG Rolling Core
            </h3>
          </div>
          <span className="text-[9px] font-mono bg-black/45 border border-white/5 px-2 py-0.5 rounded text-gray-400">
            Engine Frequency: <b className="text-purple-450 text-purple-400">{(rollDelay / 1000).toFixed(1)}s</b>
          </span>
        </div>

        {/* Rolling Status / Engine Display */}
        <div className="flex flex-col gap-2.5 mb-3">
          {/* Main Huge Roll Button rendered as an amazing high-energy sphere */}
          <div className="flex flex-col items-center justify-center py-3 relative">
            {/* Deep purple grid bg decoration */}
            <div className="absolute inset-x-0 -top-1 -bottom-1 bg-[radial-gradient(circle,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-80 rounded-full pointer-events-none" />
            
            <button
              id="roll-aura-trigger"
              onClick={() => {
                playClickSound();
                onRoll();
              }}
              disabled={isRolling || autoRoll}
              className={`cursor-pointer w-36 h-36 rounded-full p-1 shadow-[0_0_35px_rgba(168,85,247,0.35)] hover:scale-[1.03] active:scale-95 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-center relative group z-10 border ${
                isRolling || autoRoll
                  ? 'bg-[#111115] border-white/5 text-gray-500 pointer-events-none'
                  : 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-fuchsia-600 text-white border-white/20 hover:shadow-[0_0_45px_rgba(168,85,247,0.55)]'
              }`}
            >
              {/* Gloss shine animation on hover */}
              <div className="absolute inset-0 rounded-full w-full h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-full duration-1000 opacity-20 transition-transform pointer-events-none" />
              
              <RefreshCcw className={`w-6 h-6 text-white ${isRolling || autoRoll ? 'animate-spin' : 'animate-float'}`} />
              <span className="font-black text-xs tracking-widest leading-none drop-shadow-md">
                {isRolling ? 'ROLLING...' : autoRoll ? 'AUTO MODE' : 'SPIN SPHERE'}
              </span>
              <span className="text-[8px] font-mono tracking-tight text-purple-100 uppercase font-black leading-none max-w-[95px] mt-1.5">
                Luck modifier: ×{luckMultiplier.toFixed(2)}
              </span>
            </button>
          </div>

          {/* Auto Roll toggle */}
          <button
            id="toggle-auto-roll"
            onClick={() => {
              playClickSound();
              onToggleAutoRoll();
            }}
            className={`cursor-pointer w-full py-2.5 px-4 rounded-lg border font-sans text-[10px] font-extrabold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
              autoRoll
                ? 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/40 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                : 'bg-black/30 border-white/5 text-[#d4af37] hover:border-[#d4af37]/45 hover:text-white'
            }`}
          >
            {autoRoll ? (
              <>
                <Square className="w-3.5 h-3.5 fill-red-450/20 text-red-400" />
                <span>Deactivate Engine</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-zinc-400/10 text-[#d4af37]" />
                <span>Ignite Automatic Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Roll Feed/History panel */}
      <div className="flex-1 flex flex-col min-h-[140px] justify-between border-t border-white/5 pt-3.5 mt-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
          <div className="flex items-center gap-1">
            <History className="w-3 h-3 text-zinc-500" />
            <span>Stellar Yield Log Stream</span>
          </div>
          {rollHistory.length > 0 && (
            <button 
              id="clear-roll-history"
              onClick={() => {
                playClickSound();
                onClearHistory();
              }}
              className="hover:text-red-400 cursor-pointer transition-colors"
              title="Clear log history Feed"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="bg-[#050505] rounded border border-white/5 p-2 h-36 overflow-y-auto space-y-1 custom-scrollbar">
          {rollHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-3">
              <History className="w-5 h-5 text-zinc-800 mb-1" />
              <span className="text-[9px] text-zinc-650 font-mono italic">Log channel vacant. Trigger roll matrices.</span>
            </div>
          ) : (
            rollHistory.map((item, idx) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between border-b border-white/5 pb-1 last:border-b-0 text-[10px] font-mono leading-none"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-[8px] text-zinc-600 bg-white/5 px-1 py-0.2 rounded font-sans">
                    #{rollHistory.length - idx}
                  </span>
                  <span className={`font-bold uppercase truncate max-w-[130px] ${item.aura.color}`}>
                    {item.aura.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end shrink-0 pl-1">
                  <span className="text-zinc-500 text-[9px] font-mono">1/{item.aura.chance.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-600 font-sans">{item.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tip text */}
        <p className="text-[9px] font-mono text-zinc-550 text-zinc-500 mt-2 italic text-center leading-tight">
          *Critical yields (1 in 50+) invoke harmonic visualizers automatically.
        </p>
      </div>
    </div>
  );
};
