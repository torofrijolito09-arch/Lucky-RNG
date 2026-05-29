/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Aura {
  id: string;
  name: string;
  chance: number; // 1 in chance
  color: string; // Tailwind color class or hex
  glowColor: string; // Glow styling hex or tailwind text-shadow
  negativeColor: string; // Inversion color
  invertedName: string; // Special name during NULL Biome inversion
  description: string;
  soundFreq: number; // Audio frequency for web audio API synth
  relatedBiome?: BiomeType;
}

export type BiomeType = 'STANDARD' | 'NULL' | 'RAINY' | 'WINDY' | 'FIRE' | 'CORRUPTED' | 'ETERNITY';

export interface BiomeState {
  current: BiomeType;
  timeLeft: number; // duration in seconds
  passiveLuckMultiplier: number; // e.g. 1.0 or 1.15 for Null
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  rewardClaimed: boolean;
  rewardDescription: string;
}

export type ItemType = 'LUCKY_POTION' | 'SPEED_POTION' | 'BLUE_ELIXIR' | 'VOID_BREW' | 'NOVA_SPARK' | 'STELLAR_ELIXIR';

export interface InventoryItem {
  id: ItemType;
  name: string;
  count: number;
  description: string;
  color: string;
  icon: string;
}

export interface ActiveBuff {
  id: string; // same as ItemType or custom
  name: string;
  durationLeft: number; // in seconds
  luckModifier: number; // luck added or multiplier
  speedModifier: number; // e.g. roll time multiplier (less is faster)
}

export interface EggDrop {
  id: string;
  type: 'SMALL' | 'NORMAL' | 'GILDED' | 'VOID' | 'GOLDEN';
  x: number; // position as % (0-100)
  y: number; // position as % (0-100)
  scale: number;
  color: string;
  pulseSpeed: number;
}

export interface RollResult {
  id: string;
  aura: Aura;
  timestamp: string;
  isSpecial: boolean;
}

export interface StoredAura {
  id: string;
  aura: Aura;
  savedAt?: string;
}

export type GauntletId = 'LUCKY_GAUNTLET' | 'ARCHANGEL_GAUNTLET' | 'REAPER_GAUNTLET' | 'HEAVIL_GAUNTLET' | 'BOOSTER_GAUNTLET';

export interface Gauntlet {
  id: GauntletId;
  name: string;
  costEggs: number;
  description: string;
  color: string;
  luckMultiplier: number;
}
