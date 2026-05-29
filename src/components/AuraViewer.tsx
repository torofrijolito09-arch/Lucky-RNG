/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { HelpCircle, Star, Sparkles, Orbit, Wind } from 'lucide-react';
import { Aura, BiomeType } from '../types';
import { playClickSound } from '../utils/audio';

interface AuraViewerProps {
  currentAura: Aura | null;
  biome: BiomeType;
  luckMultiplier: number;
  onSaveAura: () => void;
  onSellCurrentAura: (payout: number) => void;
}

export const AuraViewer: React.FC<AuraViewerProps> = ({
  currentAura,
  biome,
  luckMultiplier,
  onSaveAura,
  onSellCurrentAura
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isNullBiome = biome === 'NULL';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Handle Resize bounds
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool setup
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
      angle?: number;
      orbitRadius?: number;
      orbitSpeed?: number;
    }

    let particles: Particle[] = [];
    let starOrbitalAngle = 0;

    // Build color maps
    const activeColor = currentAura ? currentAura.glowColor : '#fbbf24';
    const renderColor = isNullBiome ? (currentAura?.negativeColor || '#3b82f6') : activeColor;

    // Set up drawing animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Nebula Backdrops with glowing dark hues
      const centerX = width / 2;
      const centerY = height / 2;

      const radialGrad = ctx.createRadialGradient(
        centerX, centerY, 10,
        centerX, centerY, isNullBiome ? width * 0.7 : width * 0.5
      );
      
      if (isNullBiome) {
        // Inverted Deep purple and black negative nebula
        radialGrad.addColorStop(0, 'rgba(40, 10, 80, 0.35)');
        radialGrad.addColorStop(0.5, 'rgba(15, 5, 35, 0.2)');
        radialGrad.addColorStop(1, 'rgba(3, 3, 3, 1)');
      } else {
        // Star standard radiant cloud
        radialGrad.addColorStop(0, 'rgba(25, 25, 25, 0.4)');
        radialGrad.addColorStop(0.6, 'rgba(8, 8, 8, 0.2)');
        radialGrad.addColorStop(1, 'rgba(3, 3, 3, 1)');
      }

      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Emit new particles from center core
      const emissionRate = isNullBiome ? 4 : 2;
      for (let i = 0; i < emissionRate; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Gravity zero -> particles drift upwards. Gravity normal -> float around
        const speed = Math.random() * 1.5 + 0.2;
        const pvy = isNullBiome 
          ? -(Math.random() * 2.0 + 0.5) // rise fast because gravity is zero
          : (Math.sin(angle) * speed); // normal standard drift

        particles.push({
          x: centerX + (Math.random() * 20 - 10),
          y: centerY + (Math.random() * 20 - 10),
          vx: isNullBiome ? (Math.random() * 1.0 - 0.5) : (Math.cos(angle) * speed),
          vy: pvy,
          size: Math.random() * (isNullBiome ? 6 : 4) + 1,
          color: renderColor,
          alpha: 1.0,
          life: 0,
          maxLife: Math.random() * 60 + 30
        });
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1.0 - (p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        if (isNullBiome) {
          // Pixelated black/purple block trails (Inverted Variant requirement)
          ctx.beginPath();
          ctx.fillStyle = Math.random() > 0.5 ? '#1e1b4b' : '#3b82f6'; // deep dark violet + neon blue pixel
          ctx.rect(p.x - p.size/2, p.y - p.size/2, p.size * 1.5, p.size * 1.5);
          ctx.fill();
        } else {
          // Classic circular glowing sparkles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          // Outer fuzz/glow for sparkles
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
        ctx.restore();
      });

      // Filter dead elements
      particles = particles.filter(p => p.life < p.maxLife);

      // 2. Draw Main Star Core and Orbit Layers
      ctx.save();
      
      if (isNullBiome) {
        // [Aura Spec 2] Inverted Void Star core: Deep neon blue core trailing pixelated star lines
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#3b82f6';
        
        // Inner blue orb core
        ctx.beginPath();
        ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();

        // Highlight layer
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 4, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Pixel core outline cross hair
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1d4ed8';
        ctx.strokeRect(centerX - 24, centerY - 24, 48, 48);

      } else {
        // [Aura Spec 1] Common Star Aura: Glowing yellow/white core with surrounding orbits
        ctx.shadowBlur = 20;
        ctx.shadowColor = renderColor;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.strokeStyle = renderColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw multiple stellar orbit bands
        starOrbitalAngle += 0.02;
        ctx.restore();

        // Orbit Ring Line - Yellow path
        ctx.save();
        ctx.beginPath();
        ctx.translate(centerX, centerY);
        ctx.rotate(0.3); // slant
        ctx.scale(2.5, 0.8);
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Glowing orbital micro beads
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-0.1);
        const beadX = Math.cos(starOrbitalAngle) * 55;
        const beadY = Math.sin(starOrbitalAngle) * 20;
        ctx.beginPath();
        ctx.arc(beadX, beadY, 5, 0, Math.PI * 2);
        ctx.fillStyle = renderColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = renderColor;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentAura, isNullBiome]);

  return (
    <div id="aura-showcase-panel" className="bg-[#0f0f12] border border-white/5 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden h-full min-h-[380px]">
      {/* Background neon style lines */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500" />
      
      {/* HUD Header */}
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
        <div className="flex items-center gap-1">
          <Orbit className={`w-3 h-3 ${isNullBiome ? 'text-purple-400 animate-spin-slow' : 'text-yellow-405 text-amber-405 text-amber-400 animate-spin'}`} />
          <span className="uppercase tracking-widest font-black">Stellar Aura HUD Display</span>
        </div>
        <span className={`px-2 py-0.5 rounded bg-black/45 font-bold text-[9px] border transition-colors duration-500 ${
          isNullBiome ? 'border-purple-900 text-purple-400' : 'border-white/5 text-gray-400'
        }`}>
          {isNullBiome ? 'INVERTED SPECTRAL MATRIX' : 'NORMAL RADIANT STATE'}
        </span>
      </div>

      {/* Actual Live Drawing Screen */}
      <div className="relative flex-1 rounded-xl bg-[#050505] border border-white/5 overflow-hidden min-h-[220px]">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full block"
        />

        {/* Aura Floating Label inside the preview scope */}
        <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
          <div className="inline-block bg-black/85 backdrop-blur-md rounded-xl border border-white/5 p-2.5 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] max-w-full">
            <span className="text-[8px] uppercase font-mono tracking-widest text-[#a855f7] block mb-0.5">
              CURRENT CONFIGURED AURA
            </span>
            <h1 className={`text-lg sm:text-xl font-black tracking-widest uppercase bg-gradient-to-r bg-clip-text text-transparent ${
              isNullBiome && currentAura
                ? 'from-indigo-400 via-purple-300 to-blue-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                : currentAura?.color || 'from-yellow-400 to-white text-yellow-300'
            }`}>
              {isNullBiome && currentAura ? currentAura.invertedName : (currentAura?.name || 'Common Star')}
            </h1>

            <div className="flex justify-center items-center gap-1.5 mt-1 font-mono text-[10px]">
              <span className="text-zinc-500">Stellar Weight:</span>
              <span className={`font-bold ${isNullBiome ? 'text-purple-300' : 'text-zinc-200'}`}>
                1 in {currentAura?.chance || 2}
              </span>
            </div>
          </div>
        </div>

        {/* Level metrics overlay */}
        <div className="absolute top-4 left-4 text-[8px] font-mono text-zinc-500 pointer-events-none space-y-0.5">
          <div>SCALE: 1.00</div>
          <div>LUCK MULTIPLIER: ×{luckMultiplier.toFixed(2)}</div>
          <div>GRAVITY: {isNullBiome ? '0.00g (Void)' : '1.00g (Standard)'}</div>
        </div>
      </div>

      {/* Description caption */}
      <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-gray-400 flex flex-col gap-2">
        <div className="bg-[#050505] p-2 rounded border border-white/5 text-[10px] leading-relaxed">
          {currentAura?.description || 'A simple orbital star. Increase your luck multiplier using rare Blue Elixirs and potions to unfold deeper singularity matrices!'}
        </div>

        {currentAura && (() => {
          // Weight calculation based on rarity
          const getAuraWeight = (chance: number) => {
            if (chance <= 2) return "0.2 kg";
            if (chance <= 5) return "0.8 kg";
            if (chance <= 15) return "4.2 kg";
            if (chance <= 50) return "18.5 kg";
            if (chance <= 150) return "42.1 kg";
            if (chance <= 400) return "120 kg";
            if (chance <= 1000) return "450 kg";
            if (chance <= 2500) return "1.2 t";
            if (chance <= 8000) return "2.8 t";
            if (chance <= 25000) return "7.5 t";
            if (chance <= 100000) return "24 t";
            if (chance <= 500000) return "120 t";
            return "2.1M t";
          };

          // Sell payout value in Rubies
          const getAuraSellValue = (chance: number) => {
            return Math.floor(Math.pow(chance, 0.61) * 2) + 5;
          };

          const auraWeight = getAuraWeight(currentAura.chance);
          const sellPayout = getAuraSellValue(currentAura.chance);
          const customGlowColor = currentAura.glowColor || "#ffffff";

          return (
            <div className="mt-2.5 space-y-3.5 bg-black/40 p-3 rounded-lg border border-white/5">
              {/* Weight Section with Mini Circle */}
              <div className="flex items-center gap-3">
                {/* Mini Circle */}
                <div 
                  id="star-weight-orb"
                  className="w-12 h-12 rounded-full border flex flex-col items-center justify-center text-center shrink-0"
                  style={{
                    borderColor: `${customGlowColor}50`,
                    boxShadow: `0 0 10px ${customGlowColor}20`,
                    backgroundColor: `${customGlowColor}08`
                  }}
                >
                  <span className="text-[7px] font-mono text-zinc-550 tracking-wider">WEIGHT</span>
                  <span className="text-[10px] font-black font-mono text-zinc-200 uppercase">{auraWeight}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Cosmic Gravity Mass</span>
                  <p className="text-[10px] text-zinc-400 truncate">
                    This star exerts a localized gravity well of <span className="text-zinc-200 font-bold">{auraWeight}</span>.
                  </p>
                </div>
              </div>

              {/* Cost vs Sell interactive buttons */}
              <div className="grid grid-cols-2 gap-2">
                {/* Cost/Keep Button */}
                <div className="flex flex-col gap-0.5">
                  <button
                    id="cost-keep-action"
                    onClick={() => {
                      playClickSound();
                      onSaveAura();
                    }}
                    className="cursor-pointer bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/40 hover:border-emerald-500 text-emerald-300 hover:text-white py-1.5 rounded text-[10px] font-black uppercase tracking-wider text-center transition-all"
                    title="Vault this aura (Cost: 1 storage slot)"
                  >
                    Keep / Claim
                  </button>
                  <span className="text-[7.5px] font-mono text-zinc-500 text-center uppercase">Cost: Free (1 Slot)</span>
                </div>

                {/* Sell Button */}
                <div className="flex flex-col gap-0.5">
                  <button
                    id="quick-sell-action"
                    onClick={() => {
                      playClickSound();
                      onSellCurrentAura(sellPayout);
                    }}
                    className="cursor-pointer bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 hover:border-red-500 text-red-350 hover:text-white py-1.5 rounded text-[10px] font-black uppercase tracking-wider text-center transition-all"
                    title={`Sell the currently rolled aura immediately for ${sellPayout} Rubies`}
                  >
                    Sell Star
                  </button>
                  <span className="text-[7.5px] font-mono text-center text-red-400 font-bold uppercase">+{sellPayout} Rubies</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
