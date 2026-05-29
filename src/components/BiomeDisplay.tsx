/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Timer, Zap } from 'lucide-react';
import { BiomeState, BiomeType } from '../types';

interface BiomeDisplayProps {
  biome: BiomeState;
  totalRolls: number;
}

export const BiomeDisplay: React.FC<BiomeDisplayProps> = ({
  biome,
  totalRolls
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Details configuration per biome
  const BIOME_DETAILS: Record<BiomeType, { 
    title: string; 
    icon: string; 
    colorClass: string; 
    borderColor: string;
    bgColor: string;
    description: string;
    rateLabel: string;
  }> = {
    STANDARD: {
      title: '🪐 Standard Cosmic',
      icon: '🪐',
      colorClass: 'text-zinc-100',
      borderColor: 'border-white/5',
      bgColor: 'bg-gradient-to-tr from-zinc-950 to-[#0c0c0e]',
      description: 'Standard calm atmosphere. Active weathering element will cycle automatically every 5 minutes! Keep rolling.',
      rateLabel: 'Rotates in 5 Min'
    },
    NULL: {
      title: '🌌 The Null Void (SUPREME EVENT)',
      icon: '🌌',
      colorClass: 'text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-pulse',
      borderColor: 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-pulse',
      bgColor: 'bg-[#110c1f]',
      description: 'COSMIC EXTREME FIELD DETECTED! Passive Void energy: Star inversion activated. Grants an absolute ×25.00 passive Luck multiplier!',
      rateLabel: '1 in 25,000 / sec'
    },
    RAINY: {
      title: '🌧️ Monsoon Storm',
      icon: '🌧️',
      colorClass: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
      borderColor: 'border-blue-800/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      bgColor: 'bg-[#0d1624]',
      description: 'Water elements condense! All Rain/Storm themed Auras are 50% easier to Roll (e.g. Rainy Aura becomes 1 in 125!).',
      rateLabel: 'Rain drops active'
    },
    WINDY: {
      title: '💨 Cyclone Tempest',
      icon: '💨',
      colorClass: 'text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]',
      borderColor: 'border-teal-800/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
      bgColor: 'bg-[#0e2124]',
      description: 'Whooshing wind streamlines! All Wind and Cyclone themed Auras are 50% easier to Roll.',
      rateLabel: 'Wind gale whoosh'
    },
    FIRE: {
      title: '🔥 Sacred Pyre',
      icon: '🔥',
      colorClass: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      borderColor: 'border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      bgColor: 'bg-[#1e0d0c]',
      description: 'Flickering thermal embers! All Flame and Lava themed Auras are 50% easier to Roll.',
      rateLabel: 'Mini edge flames'
    },
    CORRUPTED: {
      title: '☣️ Toxic Cyber Decadence',
      icon: '☣️',
      colorClass: 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]',
      borderColor: 'border-fuchsia-800/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]',
      bgColor: 'bg-[#140c1e]',
      description: 'System glitches detected! All Mutant and Corrupted Auras are 50% easier. Glitched CRT overlays activated.',
      rateLabel: 'Glitch scanlines'
    },
    ETERNITY: {
      title: '⌛ Cosmic Eternity Continuum',
      icon: '⌛',
      colorClass: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]',
      borderColor: 'border-indigo-800/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
      bgColor: 'bg-[#050510]',
      description: 'Temporal distortion: Ambient Void Music plays. Eternity-themed high-tier singularities are 50% easier.',
      rateLabel: 'Ambience music'
    }
  };

  const currDetails = BIOME_DETAILS[biome.current] || BIOME_DETAILS.STANDARD;

  return (
    <div 
      id="biome-console"
      className={`relative p-4 rounded-xl border transition-all duration-700 overflow-hidden ${currDetails.borderColor} ${currDetails.bgColor}`}
    >
      {/* Decorative Nebula Background */}
      <div 
        className="absolute inset-0 -z-10 transition-all duration-1000 opacity-20 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-black"
      />

      {/* Header Channel */}
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2">
          {biome.current !== 'STANDARD' ? (
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${biome.current === 'NULL' ? 'bg-purple-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${biome.current === 'NULL' ? 'bg-purple-500' : 'bg-amber-500'}`}></span>
            </div>
          ) : (
            <div className="h-2 w-2 rounded-full bg-[#1a1a1a] border border-white/10 animate-pulse" />
          )}
          <span className="text-[10px] tracking-widest text-[#a855f7] font-mono uppercase font-black">
            Stellar Biome Sync Node
          </span>
        </div>
        
        {/* Chance indicator */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/5 text-gray-400">
          Sync Status: <span className="text-[#a855f7] font-bold">{currDetails.rateLabel}</span>
        </span>
      </div>

      {/* Main Status Display */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className={`text-xl font-black tracking-tight italic uppercase transition-colors duration-700 ${currDetails.colorClass}`}>
            {currDetails.title}
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5 max-w-xl leading-relaxed">
            {currDetails.description}
          </p>
        </div>

        {/* Dynamic Timer / Status Counter */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <div className="bg-purple-950/45 border border-purple-500/20 rounded-lg px-3 py-1.5 font-mono text-center shadow-inner">
            <div className="text-[9px] text-purple-300 uppercase tracking-widest font-extrabold flex items-center justify-center gap-1">
              <Timer className="w-2.5 h-2.5 animate-spin" /> Cycle Time
            </div>
            <div className="text-lg font-black text-fuchsia-305 text-fuchsia-300">
              {formatTime(biome.timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Info footer bar */}
      <div className="mt-3.5 pt-2.5 border-t border-zinc-900 flex flex-wrap gap-4 text-[10px] font-mono text-zinc-500 justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span>Active Luck Benefit: </span>
          <span className={`font-bold font-mono px-2 py-0.5 rounded ${
            biome.current === 'NULL' 
              ? 'text-purple-355 text-purple-300 bg-purple-950 border border-purple-800/40 shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse' 
              : 'text-zinc-400 bg-zinc-950/50'
          }`}>
            {biome.current === 'NULL' ? '×25.00 (+2400% Supreme Bonus!)' : '×1.00 (Standard element rate)'}
          </span>
        </div>
        
        <div className="text-zinc-600">
          Rotation: <span className="text-zinc-450 font-bold">5 Min Cycles</span> | Rolls: <span className="text-zinc-400 font-bold">{totalRolls}</span>
        </div>
      </div>
    </div>
  );
};
