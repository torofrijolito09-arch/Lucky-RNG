/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Trophy, Database, HelpCircle, RefreshCcw, Info, Music, Save, Trash2 } from 'lucide-react';
import { 
  Aura, 
  BiomeState, 
  BiomeType,
  Quest, 
  InventoryItem, 
  ActiveBuff, 
  EggDrop, 
  RollResult,
  StoredAura,
  ItemType
} from './types';
import { AURAS } from './data';
import { BiomeDisplay } from './components/BiomeDisplay';
import { QuestBoard } from './components/QuestBoard';
import { StorageEconomy } from './components/StorageEconomy';
import { EggHuntCanvas } from './components/EggHuntCanvas';
import { AuraViewer } from './components/AuraViewer';
import { RollControls } from './components/RollControls';
import { 
  playRollSound, 
  startNullBiomeHum, 
  stopNullBiomeHum, 
  playClickSound,
  startSpaceMusic,
  stopSpaceMusic
} from './utils/audio';

export default function App() {
  // --- Load Game State once during initial synchronous module evaluation ---
  const loadedSave = (() => {
    try {
      const saved = localStorage.getItem('paradox_engine_save_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to read paradox save from localStorage:", e);
    }
    return null;
  })();

  // --- Game Economy State ---
  const [rubies, setRubies] = useState<number>(() => loadedSave?.rubies !== undefined ? loadedSave.rubies : 1000); // Start with 1,000 Rubies for a warm onboarding
  const [rubyBlocks, setRubyBlocks] = useState<number>(() => loadedSave?.rubyBlocks !== undefined ? loadedSave.rubyBlocks : 0); // Starts at 0. Condensed blocks.
  const [voidCoins, setVoidCoins] = useState<number>(() => loadedSave?.voidCoins !== undefined ? loadedSave.voidCoins : 15); // Start with 15 Void Coins so they can test immediately
  const [storedAuras, setStoredAuras] = useState<StoredAura[]>(() => loadedSave?.storedAuras !== undefined ? loadedSave.storedAuras : []);
  const [maxAuraSlots, setMaxAuraSlots] = useState<number>(() => loadedSave?.maxAuraSlots !== undefined ? loadedSave.maxAuraSlots : 4);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // --- Inventory State ---
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadedSave?.inventory !== undefined ? loadedSave.inventory : [
    {
      id: 'LUCKY_POTION',
      name: 'Lucky Potion',
      count: 1, // Pre-gifted
      description: 'Standard potion triggering cosmic static. Grants +100 base Luck.',
      color: 'text-green-404 text-green-400',
      icon: '⚡'
    },
    {
      id: 'SPEED_POTION',
      name: 'Speed Potion',
      count: 1, // Pre-gifted
      description: 'Increases local frequency. Speed up roll delays by ×2.5.',
      color: 'text-amber-404 text-amber-400',
      icon: '🏃'
    },
    {
      id: 'VOID_BREW',
      name: 'Void Brew',
      count: 0,
      description: 'Adds +15 base Luck.',
      color: 'text-purple-400',
      icon: '🔮'
    },
    {
      id: 'NOVA_SPARK',
      name: 'Nova Spark',
      count: 0,
      description: '×1.5 speed booster stack.',
      color: 'text-red-405 text-red-400',
      icon: '💥'
    },
    {
      id: 'STELLAR_ELIXIR',
      name: 'Stellar Elixir',
      count: 0,
      description: 'Adds +250 base Luck.',
      color: 'text-indigo-400',
      icon: '✨'
    },
    {
      id: 'BLUE_ELIXIR',
      name: 'Blue Elixir',
      count: 0,
      description: 'Transparent flask with floating gold stars. Grants +45,000% (+45000) Luck for exactly ONE roll!',
      color: 'text-[#60a5fa] font-bold shadow-[0_0_8px_rgba(59,130,246,0.3)]',
      icon: '🧪'
    }
  ]);

  // --- Active Temporary Buffs ---
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>(() => loadedSave?.activeBuffs !== undefined ? loadedSave.activeBuffs : []);

  // --- Quest State ---
  const [quest, setQuest] = useState<Quest>(() => loadedSave?.quest !== undefined ? loadedSave.quest : {
    id: 'void_harvester',
    name: 'The Void Harvester',
    description: 'Roll 500 times total inside the NULL Biome map event to earn major status.',
    target: 500,
    current: 0,
    completed: false,
    rewardClaimed: false,
    rewardDescription: '+30 Luck (30-Minute Temporary Status Booster)'
  });

  // --- Biome State ---
  const [biome, setBiome] = useState<BiomeState>({
    current: 'STANDARD',
    timeLeft: 0,
    passiveLuckMultiplier: 1.0
  });

  // --- Egg Drops Map State ---
  const [eggDrops, setEggDrops] = useState<EggDrop[]>([]);
  const [totalEggsCaught, setTotalEggsCaught] = useState<number>(() => loadedSave?.totalEggsCaught !== undefined ? loadedSave.totalEggsCaught : 0);

  // --- Gauntlet Shop State ---
  const [equippedGauntlet, setEquippedGauntlet] = useState<string | null>(() => loadedSave?.equippedGauntlet !== undefined ? loadedSave.equippedGauntlet : null);
  const [ownedGauntlets, setOwnedGauntlets] = useState<string[]>(() => loadedSave?.ownedGauntlets !== undefined ? loadedSave.ownedGauntlets : []);

  // --- Rolling Engine State ---
  const [currentAura, setCurrentAura] = useState<Aura | null>(null);
  const [totalRolls, setTotalRolls] = useState<number>(() => loadedSave?.totalRolls !== undefined ? loadedSave.totalRolls : 0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [autoRoll, setAutoRoll] = useState<boolean>(false);
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);
  const [rollsToBoost, setRollsToBoost] = useState<number>(() => loadedSave?.rollsToBoost !== undefined ? loadedSave.rollsToBoost : 15);
  const [boostTimeLeft, setBoostTimeLeft] = useState<number>(() => loadedSave?.boostTimeLeft !== undefined ? loadedSave.boostTimeLeft : 0);

  // Help Modal State
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // --- Premium Stores State ---
  const [goldenEggsCount, setGoldenEggsCount] = useState<number>(() => loadedSave?.goldenEggsCount !== undefined ? loadedSave.goldenEggsCount : 0);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [isStripeProcessing, setIsStripeProcessing] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [ccName, setCcName] = useState<string>('');
  const [ccNumber, setCcNumber] = useState<string>('');
  const [ccExpiry, setCcExpiry] = useState<string>('');
  const [ccCvc, setCcCvc] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [showDeleteConfirm1, setShowDeleteConfirm1] = useState<boolean>(false);
  const [showDeleteConfirm2, setShowDeleteConfirm2] = useState<boolean>(false);

  // Constants
  const WALLET_CAP = 10000;
  const BASE_ROLL_DELAY = 2000; // 2 seconds

  // --- Calculate Luck Modifier ---
  const activeLuckPotion = activeBuffs.find(b => b.id === 'LUCKY_POTION_BUFF');
  const activeBlueElixir = activeBuffs.find(b => b.id === 'BLUE_ELIXIR_BUFF');
  const activeVoidQuestReward = activeBuffs.find(b => b.id === 'VOID_WALKER_REWARD');
  const activeMaxVoidEnergy = activeBuffs.find(b => b.id === 'MAX_VOID_ENERGY_BUFF');
  const activeVoidBrew = activeBuffs.find(b => b.id === 'VOID_BREW_BUFF');
  const activeStellarElixir = activeBuffs.find(b => b.id === 'STELLAR_ELIXIR_BUFF');
  const activeGoldenEggBuff = activeBuffs.find(b => b.id === 'GOLDEN_EGG_LUCK_BUFF');

  let baseLuck = 1;
  if (activeLuckPotion) baseLuck += 100;
  if (activeBlueElixir) baseLuck += 45000;
  if (activeVoidBrew) baseLuck += 15;
  if (activeStellarElixir) baseLuck += 250;
  if (activeVoidQuestReward) baseLuck += 30;
  let gauntletMultiplier = 1.0;
  if (equippedGauntlet === 'LUCKY_GAUNTLET') gauntletMultiplier += 0.475;
  if (equippedGauntlet === 'ARCHANGEL_GAUNTLET') gauntletMultiplier += 0.95;
  if (equippedGauntlet === 'REAPER_GAUNTLET') gauntletMultiplier += 1.90;
  if (equippedGauntlet === 'HEAVIL_GAUNTLET') gauntletMultiplier += 9.50;
  if (equippedGauntlet === 'BOOSTER_GAUNTLET') gauntletMultiplier += 0.25;

  let luckMultiplier = baseLuck * (biome.current === 'NULL' ? 1.15 : 1.0) * gauntletMultiplier;
  if (activeMaxVoidEnergy) luckMultiplier *= 2.5;
  if (activeGoldenEggBuff) luckMultiplier *= 5.0; // 5x Luck booster from direct premium store container!

  // --- Calculate Roll Speed Delay ---
  const activeSpeedPotion = activeBuffs.find(b => b.id === 'SPEED_POTION_BUFF');
  const activeNovaSpark = activeBuffs.find(b => b.id === 'NOVA_SPARK_BUFF');
  
  let speedFactor = 1.0;
  if (activeSpeedPotion) speedFactor *= 2.5;
  if (activeNovaSpark) speedFactor *= 1.5;
  if (equippedGauntlet === 'BOOSTER_GAUNTLET') speedFactor *= 2.5;
  if (boostTimeLeft > 0) speedFactor *= 2.0;
  
  const rollDelay = speedFactor > 1.0 ? Math.ceil(BASE_ROLL_DELAY / speedFactor) : BASE_ROLL_DELAY;

  // --- Core Roll Engine Logic ---
  const executeRoll = useCallback(() => {
    setIsRolling(true);

    const isNullBiome = biome.current === 'NULL';

    // If blue elixir buff is active, consume it before constructing the roll determination so it only works for exactly 1 roll!
    const isBlueElixirActive = activeBuffs.some(b => b.id === 'BLUE_ELIXIR_BUFF');
    if (isBlueElixirActive) {
      setActiveBuffs(prev => prev.filter(b => b.id !== 'BLUE_ELIXIR_BUFF'));
    }

    // Weighted roll calculation formula
    // We check from rarest downwards
    let chosenAura: Aura = AURAS[0]; // fallback to common

    // Reverse list (rarer is at final position)
    const reversedAuras = [...AURAS].reverse();

    for (const aura of reversedAuras) {
      if (aura.id === 'null_star' && !isNullBiome) {
        // Null Star is Null-Exclusive drop table only
        continue;
      }

      // Check if this is an aura relating to the active biome (makes it 50% easier to roll!)
      let finalChance = aura.chance;
      if (aura.relatedBiome && biome.current === aura.relatedBiome) {
        finalChance = Math.ceil(aura.chance / 2);
      }

      // Roll checks
      const processedChance = finalChance / luckMultiplier;
      // Probability formula: Math.random() is standard float between 0 and 1
      if (Math.random() < (1 / processedChance)) {
        chosenAura = aura;
        break; // matched rarest possible match, halt loop
      }
    }

    // Delay visual reveal to convey a retro rolling slot aesthetic
    setTimeout(() => {
      // 1. Play synthesize twinkle matching aura sound frequency rating
      const isRare = chosenAura.chance >= 50;
      playRollSound(chosenAura.soundFreq, isRare);

      // 2. Set newly unveiled aura
      setCurrentAura(chosenAura);

      // Award Void Coins depending on the aura
      const getVoidCoinsForAura = (chance: number) => {
        if (chance <= 2) return 1;
        if (chance <= 5) return 2;
        if (chance <= 15) return 3;
        if (chance <= 50) return 5;
        if (chance <= 150) return 8;
        if (chance <= 400) return 12;
        if (chance <= 1000) return 20;
        if (chance <= 2500) return 35;
        if (chance <= 8000) return 60;
        if (chance <= 25000) return 100;
        if (chance <= 100000) return 250;
        if (chance <= 500000) return 500;
        return 1000;
      };
      const coinsEarned = getVoidCoinsForAura(chosenAura.chance);
      setVoidCoins(prev => prev + coinsEarned);

      // 3. Increment counters
      setTotalRolls(prev => prev + 1);

      // Trigger/advance booster sequence if not currently boosted
      setBoostTimeLeft(currentBoost => {
        if (currentBoost > 0) {
          return currentBoost;
        }
        setRollsToBoost(currentRolls => {
          if (currentRolls <= 1) {
            setBoostTimeLeft(25);
            return 15;
          }
          return currentRolls - 1;
        });
        return currentBoost;
      });

      // 4. If NULL Biome active, increment quest tracker
      if (isNullBiome) {
        setQuest(prev => {
          if (prev.completed) return prev;
          const nextCount = prev.current + 1;
          const completed = nextCount >= prev.target;
          return {
            ...prev,
            current: Math.min(prev.target, nextCount),
            completed
          };
        });
      }

      // 5. Build recent high value find rolls history log
      if (chosenAura.chance >= 50) {
        setRollHistory(prev => [
          {
            id: Math.random().toString(36).substring(2),
            aura: chosenAura,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            isSpecial: true
          },
          ...prev.slice(0, 48) // Limit to 50 logs of history space
        ]);
      }

      setIsRolling(false);
    }, 280); // Quick dynamic slot machine spin time
  }, [biome, luckMultiplier]);

  // --- Background Clock Ticker Core Loop ---
  useEffect(() => {
    const mainInterval = setInterval(() => {
      // 1. Tick down active buffs
      setActiveBuffs(prev => 
        prev
          .map(b => ({ ...b, durationLeft: b.durationLeft - 1 }))
          .filter(b => b.durationLeft > 0)
      );

      // Decrement reactor engine speed boost timer
      setBoostTimeLeft(prev => (prev > 0 ? prev - 1 : 0));

      // 2. Tick down active Biomes
      setBiome(prev => {
        if (prev.current !== 'STANDARD') {
          const nextTime = prev.timeLeft - 1;
          if (nextTime <= 0) {
            return {
              current: 'STANDARD',
              timeLeft: 0,
              passiveLuckMultiplier: 1.0
            };
          }
          return { ...prev, timeLeft: nextTime };
        } else {
          // Organically check for standard-to-event biome transition (1 in 4000 probability per second)
          if (Math.random() < (1 / 4000)) {
            const types: BiomeType[] = ['NULL', 'RAINY', 'WINDY', 'FIRE', 'CORRUPTED', 'ETERNITY'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            return {
              current: randomType,
              timeLeft: 600, // 10 minutes duration requested (600s)
              passiveLuckMultiplier: randomType === 'NULL' ? 1.15 : 1.0
            };
          }
        }
        return prev;
      });

      // 3. Organically spawn physical eggs on field (15% chance of spawning an egg every second, max 10 concurrently)
      setEggDrops(prev => {
        if (prev.length >= 10) return prev;
        
        if (Math.random() < 0.15) {
          // Decides egg weights: 50% small, 30% normal, 12% gilded, 8% void (Galaxy Void Egg!)
          const roll = Math.random();
          let type: 'SMALL' | 'NORMAL' | 'GILDED' | 'VOID' = 'SMALL';
          let color = '#71717a'; // gray

          if (roll < 0.08) {
            type = 'VOID';
            color = '#c084fc';
          } else if (roll < 0.20) {
            type = 'GILDED';
            color = '#fbbf24';
          } else if (roll < 0.50) {
            type = 'NORMAL';
            color = '#06b6d4';
          } else {
            type = 'SMALL';
            color = '#ef4444';
          }

          const newEgg: EggDrop = {
            id: Math.random().toString(36).substring(2),
            type,
            x: Math.floor(Math.random() * 80) + 10, // 10% to 90%
            y: Math.floor(Math.random() * 70) + 15, // 15% to 85%
            scale: type === 'VOID' ? 1.3 : type === 'GILDED' ? 1.2 : type === 'NORMAL' ? 1.0 : 0.8,
            color,
            pulseSpeed: Math.random() * 2 + 2 // 2 to 4 seconds oscillation speed
          };

          return [...prev, newEgg];
        }
        return prev;
      });

    }, 1000);

    return () => clearInterval(mainInterval);
  }, []);

  // --- Auto-Roll Ticker Sub-Loop ---
  useEffect(() => {
    let rollTimeout: NodeJS.Timeout;

    if (autoRoll && !isRolling) {
      rollTimeout = setTimeout(() => {
        executeRoll();
      }, rollDelay);
    }

    return () => clearTimeout(rollTimeout);
  }, [autoRoll, isRolling, rollDelay, executeRoll]);

  // --- Handlers & Click Actions ---

  // Manual biome state force trigger (For testing and user evaluation)
  const handleForceBiome = (type: BiomeType) => {
    if (biome.current === type) {
      setBiome({
        current: 'STANDARD',
        timeLeft: 0,
        passiveLuckMultiplier: 1.0
      });
    } else {
      setBiome({
        current: type,
        timeLeft: 600, // 10 minutes (600s)
        passiveLuckMultiplier: type === 'NULL' ? 1.15 : 1.0
      });
    }
  };

  // Sync Audio alerts with active Biome state changes
  useEffect(() => {
    if (biome.current === 'NULL') {
      startNullBiomeHum();
    } else {
      stopNullBiomeHum();
    }

    if (biome.current === 'ETERNITY') {
      startSpaceMusic();
      setIsMusicPlaying(true);
    } else {
      // Revert space music if they left Eternity AND they had manually chosen music off
      if (!isMusicPlaying) {
        stopSpaceMusic();
      }
    }
  }, [biome.current]);

  // Consume status booster liquid potion from Inventory bag
  const handleConsumeItem = (id: string) => {
    setInventory(prev => {
      const match = prev.find(item => item.id === id);
      if (!match || match.count <= 0) return prev;
      
      // Update count
      return prev.map(item => 
        item.id === id ? { ...item, count: item.count - 1 } : item
      );
    });

    // Write active timer booster
    if (id === 'LUCKY_POTION') {
      setActiveBuffs(prev => {
        const existing = prev.filter(b => b.id !== 'LUCKY_POTION_BUFF');
        return [
          ...existing,
          {
            id: 'LUCKY_POTION_BUFF',
            name: 'Lucky Spark Active',
            durationLeft: 300, // 5 minutes
            luckModifier: 100,
            speedModifier: 1.0
          }
        ];
      });
    } else if (id === 'SPEED_POTION') {
      setActiveBuffs(prev => {
        const existing = prev.filter(b => b.id !== 'SPEED_POTION_BUFF');
        return [
          ...existing,
          {
            id: 'SPEED_POTION_BUFF',
            name: 'Warp Speed Active',
            durationLeft: 180, // 3 minutes
            luckModifier: 0,
            speedModifier: 2.5
          }
        ];
      });
    } else if (id === 'VOID_BREW') {
      setActiveBuffs(prev => {
        const existing = prev.filter(b => b.id !== 'VOID_BREW_BUFF');
        return [
          ...existing,
          {
            id: 'VOID_BREW_BUFF',
            name: 'Void Brew Active',
            durationLeft: 300, // 5 minutes
            luckModifier: 15,
            speedModifier: 1.0
          }
        ];
      });
    } else if (id === 'NOVA_SPARK') {
      setActiveBuffs(prev => {
        const existing = prev.filter(b => b.id !== 'NOVA_SPARK_BUFF');
        return [
          ...existing,
          {
            id: 'NOVA_SPARK_BUFF',
            name: 'Nova Spark Active',
            durationLeft: 120, // 2 minutes
            luckModifier: 0,
            speedModifier: 1.5
          }
        ];
      });
    } else if (id === 'STELLAR_ELIXIR') {
      setActiveBuffs(prev => {
        const existing = prev.filter(b => b.id !== 'STELLAR_ELIXIR_BUFF');
        return [
          ...existing,
          {
            id: 'STELLAR_ELIXIR_BUFF',
            name: 'Stellar Elixir Active',
            durationLeft: 120, // 2 minutes
            luckModifier: 250,
            speedModifier: 1.0
          }
        ];
      });
    } else if (id === 'BLUE_ELIXIR') {
      setActiveBuffs(prev => {
        const existing = prev.filter(b => b.id !== 'BLUE_ELIXIR_BUFF');
        return [
          ...existing,
          {
            id: 'BLUE_ELIXIR_BUFF',
            name: 'Blue Elixir (1 Roll) 🧪',
            durationLeft: 99999, // Stays active until next roll triggers!
            luckModifier: 45000,
            speedModifier: 1.0
          }
        ];
      });
    }
  };

  // Claim Reward from completed board quest
  const handleClaimReward = () => {
    if (!quest.completed || quest.rewardClaimed) return;

    setQuest(prev => ({ ...prev, rewardClaimed: true }));

    // Activate +30 Luck 30-minute booster! (1800 seconds)
    setActiveBuffs(prev => {
      const existing = prev.filter(b => b.id !== 'VOID_WALKER_REWARD');
      return [
        ...existing,
        {
          id: 'VOID_WALKER_REWARD',
          name: 'Void Harvester Mastery',
          durationLeft: 1800, // 30 minutes
          luckModifier: 30,
          speedModifier: 1.0
        }
      ];
    });
  };

  // --- Brand New Storage Operations ---
  const handleBuyAuraSlot = (currency: 'rubies' | 'void_coins') => {
    const costRubies = Math.floor(1500 * Math.pow(1.2, maxAuraSlots - 4));
    const costCoins = Math.floor(40 * Math.pow(1.2, maxAuraSlots - 4));
    
    if (currency === 'rubies') {
      if (rubies < costRubies) return;
      setRubies(prev => prev - costRubies);
    } else {
      if (voidCoins < costCoins) return;
      setVoidCoins(prev => prev - costCoins);
    }
    setMaxAuraSlots(prev => prev + 1);
  };

  const handleEquipAura = (storedId: string) => {
    const found = storedAuras.find(s => s.id === storedId);
    if (found) {
      setCurrentAura(found.aura);
    }
  };

  const handleReleaseAura = (storedId: string) => {
    setStoredAuras(prev => prev.filter(s => s.id !== storedId));
    setVoidCoins(prev => prev + 10);
  };

  const handleBuyPotion = (id: ItemType, cost: number, currency: 'rubies' | 'void_coins') => {
    if (currency === 'rubies') {
      if (rubies < cost) return;
      setRubies(prev => prev - cost);
    } else {
      if (voidCoins < cost) return;
      setVoidCoins(prev => prev - cost);
    }

    setInventory(prev =>
      prev.map(item => (item.id === id ? { ...item, count: item.count + 1 } : item))
    );
  };

  const handleBuyGauntlet = (gauntletId: string, costEggs: number) => {
    if (totalEggsCaught >= costEggs && !ownedGauntlets.includes(gauntletId)) {
      setTotalEggsCaught(prev => prev - costEggs);
      setOwnedGauntlets(prev => [...prev, gauntletId]);
    }
  };

  const handleEquipGauntlet = (gauntletId: string) => {
    setEquippedGauntlet(prev => prev === gauntletId ? null : gauntletId);
  };

  const handleSaveCurrentAura = () => {
    if (!currentAura) return;
    if (storedAuras.length >= maxAuraSlots) {
      alert('Your aura vault is full! Purchase additional slots inside Section 1 of the Storage panel.');
      return;
    }
    const newStored: StoredAura = {
      id: Math.random().toString(36).substring(2),
      aura: currentAura,
      savedAt: new Date().toLocaleTimeString()
    };
    setStoredAuras(prev => [...prev, newStored]);
  };

  const handleSellCurrentAura = (payout: number) => {
    setRubies(prev => Math.min(WALLET_CAP, prev + payout));
    setCurrentAura(null);
  };

  // Solid block condensation (Takes 10,000 handheld rubies out, outputs 1 Ruby Block)
  const handleCondenseWallet = () => {
    if (rubies < WALLET_CAP) return;

    setRubies(prev => prev - WALLET_CAP);
    setRubyBlocks(prev => prev + 1);
  };

  // Brew the Blue Elixir using 5 Blocks (equivalent to 50,000 Rubies)
  const handleCraftElixir = () => {
    const BLOCK_COST = 5;
    if (rubyBlocks < BLOCK_COST) return;

    setRubyBlocks(prev => prev - BLOCK_COST);

    // Increment inventory count
    setInventory(prev => 
      prev.map(item => 
        item.id === 'BLUE_ELIXIR' ? { ...item, count: item.count + 1 } : item
      )
    );
  };

  // Physically collect eggs from canvas map coordinates
  const handleCollectEgg = (eggId: string, decimalRoll?: number, isVoidSuccess?: boolean) => {
    const target = eggDrops.find(e => e.id === eggId);
    if (!target) return;

    // Filter out target egg
    setEggDrops(prev => prev.filter(e => e.id !== eggId));
    setTotalEggsCaught(prev => prev + 1);

    if (target.type === 'GOLDEN') {
      // Activate stackable 5x Luck booster for 30 minutes (1800 seconds)
      setActiveBuffs(prev => {
        const existing = prev.find(b => b.id === 'GOLDEN_EGG_LUCK_BUFF');
        if (existing) {
          // Stack the duration! Excellent value.
          return prev.map(b => b.id === 'GOLDEN_EGG_LUCK_BUFF' ? { ...b, durationLeft: b.durationLeft + 1800 } : b);
        } else {
          return [
            ...prev,
            {
              id: 'GOLDEN_EGG_LUCK_BUFF',
              name: '🔥 5x Golden Egg Luck Active',
              durationLeft: 1800,
              luckModifier: 0,
              speedModifier: 1.0
            }
          ];
        }
      });
    } else if (target.type === 'SMALL') {
      // 1-250 rubies payout requested
      const payout = Math.floor(Math.random() * 250) + 1;
      setRubies(prev => Math.min(WALLET_CAP, prev + payout));
    } else if (target.type === 'VOID') {
      // Void Egg collection: 250 rubies & 15 void coins
      setRubies(prev => Math.min(WALLET_CAP, prev + 250));
      setVoidCoins(prev => prev + 15);

      if (isVoidSuccess) {
        setActiveBuffs(prev => {
          const existing = prev.filter(b => b.id !== 'MAX_VOID_ENERGY_BUFF');
          return [
            ...existing,
            {
              id: 'MAX_VOID_ENERGY_BUFF',
              name: 'Max Void Energy Active ✨',
              durationLeft: 120, // 2 minutes active buffer duration (120s)
              luckModifier: 0,
              speedModifier: 1.0
            }
          ];
        });
      }
    } else if (target.type === 'NORMAL') {
      // Decimal assessment mapped inside EggHuntCanvas
      // Roll <= 50.0: Lucky Potion (50%)
      // Roll <= 85.0: Speed Potion (35%)
      // Roll <= 99.9: 1000 Rubies bundle (14.9%)
      // Roll > 99.9: Blue Elixir direct drop (0.1% chance)
      if (decimalRoll !== undefined) {
        if (decimalRoll <= 50.0) {
          setInventory(prev => prev.map(i => i.id === 'LUCKY_POTION' ? { ...i, count: i.count + 1 } : i));
        } else if (decimalRoll <= 85.0) {
          setInventory(prev => prev.map(i => i.id === 'SPEED_POTION' ? { ...i, count: i.count + 1 } : i));
        } else if (decimalRoll <= 99.9) {
          setRubies(prev => Math.min(WALLET_CAP, prev + 1000));
        } else {
          setInventory(prev => prev.map(i => i.id === 'BLUE_ELIXIR' ? { ...i, count: i.count + 1 } : i));
        }
      }
    } else {
      // Gilded Egg: Great Holiday reward
      setRubies(prev => Math.min(WALLET_CAP, prev + 2500));
      
      // Blue Elixir direct drop: 0.1% chance on Gilded Egg
      const rollItem = Math.random();
      if (rollItem < 0.001) {
        setInventory(prev => prev.map(i => i.id === 'BLUE_ELIXIR' ? { ...i, count: i.count + 1 } : i));
      } else if (rollItem < 0.500) {
        setInventory(prev => prev.map(i => i.id === 'SPEED_POTION' ? { ...i, count: i.count + 1 } : i));
      } else {
        setInventory(prev => prev.map(i => i.id === 'LUCKY_POTION' ? { ...i, count: i.count + 1 } : i));
      }
    }
  };

  // Simulates egg rain - forces 6 random eggs directly onto the map canvas field coordinate
  const handleSimulateEggRain = () => {
    const rainTypes: Array<'SMALL' | 'NORMAL' | 'GILDED' | 'VOID'> = ['SMALL', 'NORMAL', 'GILDED', 'VOID', 'NORMAL', 'VOID'];
    
    const newEggs: EggDrop[] = rainTypes.map((type) => {
      let color = '#71717a';
      if (type === 'GILDED') color = '#fbbf24';
      if (type === 'NORMAL') color = '#06b6d4';
      if (type === 'VOID') color = '#c084fc';

      return {
        id: Math.random().toString(36).substring(2),
        type,
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 65) + 15,
        scale: type === 'VOID' ? 1.3 : type === 'GILDED' ? 1.2 : type === 'NORMAL' ? 1.0 : 0.8,
        color,
        pulseSpeed: Math.random() * 1.5 + 1.5
      };
    });

    setEggDrops(prev => [...prev, ...newEggs].slice(0, 10)); // Clamp at 10 total
  };

  // --- Premium Golden Eggs & Checkout Custom Mechanics ---
  const handleBuyGoldenBasket = () => {
    // Open high fidelity simulated checkout modal!
    setCcName('');
    setCcNumber('');
    setCcExpiry('');
    setCcCvc('');
    setCheckoutError('');
    setShowCheckoutModal(true);
  };

  const handleSpawnGoldenEgg = () => {
    if (goldenEggsCount <= 0) return;
    
    // Decrement reserve count
    setGoldenEggsCount(prev => prev - 1);

    // Create a physical shimmering GOLDEN Egg on the map coordinates
    const goldenEgg: EggDrop = {
      id: Math.random().toString(36).substring(2),
      type: 'GOLDEN',
      x: Math.floor(Math.random() * 70) + 15, // 15% to 85% range
      y: Math.floor(Math.random() * 55) + 20, // 20% to 75% range
      scale: 1.4,
      color: '#fbbf24',
      pulseSpeed: 1.2
    };

    setEggDrops(prev => [...prev, goldenEgg]);
  };

  // --- Dynamic State Synchronization Ref for Lossless Unload Execution ---
  const stateRef = useRef({
    rubies,
    rubyBlocks,
    voidCoins,
    maxAuraSlots,
    totalEggsCaught,
    totalRolls,
    rollsToBoost,
    boostTimeLeft,
    goldenEggsCount,
    equippedGauntlet,
    ownedGauntlets,
    storedAuras,
    inventory,
    activeBuffs,
    quest
  });

  useEffect(() => {
    stateRef.current = {
      rubies,
      rubyBlocks,
      voidCoins,
      maxAuraSlots,
      totalEggsCaught,
      totalRolls,
      rollsToBoost,
      boostTimeLeft,
      goldenEggsCount,
      equippedGauntlet,
      ownedGauntlets,
      storedAuras,
      inventory,
      activeBuffs,
      quest
    };
  }, [
    rubies,
    rubyBlocks,
    voidCoins,
    maxAuraSlots,
    totalEggsCaught,
    totalRolls,
    rollsToBoost,
    boostTimeLeft,
    goldenEggsCount,
    equippedGauntlet,
    ownedGauntlets,
    storedAuras,
    inventory,
    activeBuffs,
    quest
  ]);

  const handleSaveGameLogless = () => {
    const gameState = {
      ...stateRef.current,
      savedAt: new Date().toLocaleTimeString()
    };
    try {
      localStorage.setItem('paradox_engine_save_v1', JSON.stringify(gameState));
    } catch (e) {
      console.error("Failed custom silent background auto-save:", e);
    }
  };

  // --- Manual and Automatic State Persistence Engine ---
  const handleSaveGame = () => {
    const gameState = {
      ...stateRef.current,
      savedAt: new Date().toLocaleTimeString()
    };
    try {
      localStorage.setItem('paradox_engine_save_v1', JSON.stringify(gameState));
      setSaveMessage('Game progress successfully saved to LocalStorage!');
      setTimeout(() => setSaveMessage(''), 3500);
    } catch (e) {
      console.error("Failed to persist save state:", e);
      setSaveMessage('Error: Could not access game save!');
      setTimeout(() => setSaveMessage(''), 3500);
    }
  };

  const handleDeleteProgress = () => {
    try {
      localStorage.removeItem('paradox_engine_save_v1');
    } catch (e) {}

    const defaultState = {
      rubies: 1000,
      rubyBlocks: 0,
      voidCoins: 15,
      maxAuraSlots: 4,
      totalEggsCaught: 0,
      totalRolls: 0,
      rollsToBoost: 15,
      boostTimeLeft: 0,
      goldenEggsCount: 0,
      equippedGauntlet: null,
      ownedGauntlets: [],
      storedAuras: [],
      inventory: [
        {
          id: 'LUCKY_POTION',
          name: 'Lucky Potion',
          count: 1,
          description: 'Standard potion triggering cosmic static. Grants +100 base Luck.',
          color: 'text-green-404 text-green-400',
          icon: '⚡'
        },
        {
          id: 'SPEED_POTION',
          name: 'Speed Potion',
          count: 1,
          description: 'Increases local frequency. Speed up roll delays by ×2.5.',
          color: 'text-amber-404 text-amber-400',
          icon: '🏃'
        },
        {
          id: 'VOID_BREW',
          name: 'Void Brew',
          count: 0,
          description: 'Adds +15 base Luck.',
          color: 'text-purple-400',
          icon: '🔮'
        },
        {
          id: 'NOVA_SPARK',
          name: 'Nova Spark',
          count: 0,
          description: '×1.5 speed booster stack.',
          color: 'text-red-405 text-red-400',
          icon: '💥'
        },
        {
          id: 'STELLAR_ELIXIR',
          name: 'Stellar Elixir',
          count: 0,
          description: 'Adds +250 base Luck.',
          color: 'text-indigo-400',
          icon: '✨'
        },
        {
          id: 'BLUE_ELIXIR',
          name: 'Blue Elixir',
          count: 0,
          description: 'Transparent flask with floating gold stars. Grants +45,000% (+45000) Luck for exactly ONE roll!',
          color: 'text-[#60a5fa] font-bold shadow-[0_0_8px_rgba(59,130,246,0.3)]',
          icon: '🧪'
        }
      ],
      activeBuffs: [],
      quest: {
        id: 'void_harvester',
        name: 'The Void Harvester',
        description: 'Roll 500 times total inside the NULL Biome map event to earn major status.',
        target: 500,
        current: 0,
        completed: false,
        rewardClaimed: false,
        rewardDescription: '+30 Luck (30-Minute Temporary Status Booster)'
      }
    };

    stateRef.current = defaultState as any;
    try {
      localStorage.setItem('paradox_engine_save_v1', JSON.stringify(defaultState));
    } catch (err) {}

    // Reset components & react state
    setRubies(1000);
    setRubyBlocks(0);
    setVoidCoins(15);
    setStoredAuras([]);
    setMaxAuraSlots(4);
    setInventory(defaultState.inventory);
    setActiveBuffs([]);
    setTotalEggsCaught(0);
    setEquippedGauntlet(null);
    setOwnedGauntlets([]);
    setCurrentAura(null);
    setTotalRolls(0);
    setIsRolling(false);
    setAutoRoll(false);
    setRollHistory([]);
    setRollsToBoost(15);
    setBoostTimeLeft(0);
    setGoldenEggsCount(0);
    setEggDrops([]);
    setQuest(defaultState.quest);

    setSaveMessage('Your progress has been entirely destroyed & restarted!');
    setTimeout(() => setSaveMessage(''), 4500);
  };

  // Register Automatic Lifecycle Auto-save hooks (Refresh, Tab deletes, pagehide, and 5-sec heartbeat)
  useEffect(() => {
    const handleUnloadOrHide = () => {
      handleSaveGameLogless();
    };

    window.addEventListener('beforeunload', handleUnloadOrHide);
    window.addEventListener('pagehide', handleUnloadOrHide);
    
    const handleVisChange = () => {
      if (document.visibilityState === 'hidden') {
        handleUnloadOrHide();
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);

    // Continuous 5-Second Heartbeat Auto-save interval to prevent telemetry disruption/crashing losses
    const autoSaveInterval = setInterval(() => {
      handleUnloadOrHide();
    }, 5000);

    return () => {
      window.removeEventListener('beforeunload', handleUnloadOrHide);
      window.removeEventListener('pagehide', handleUnloadOrHide);
      document.removeEventListener('visibilitychange', handleVisChange);
      clearInterval(autoSaveInterval);
    };
  }, []);

  // Check for successful Stripe checkout redirect on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      let processedSessions: string[] = [];
      try {
        processedSessions = JSON.parse(localStorage.getItem('paradox_processed_stripe_sessions') || '[]');
      } catch (err) {}
      
      if (processedSessions.includes(sessionId)) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        return;
      }

      setSaveMessage('Verifying Stripe payment securely...');
      fetch(`/api/verify-checkout-session?session_id=${sessionId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Server returned verification error');
          }
          return res.json();
        })
        .then(data => {
          if (data.verified) {
            setGoldenEggsCount(prev => prev + 5);
            processedSessions.push(sessionId);
            try {
              localStorage.setItem('paradox_processed_stripe_sessions', JSON.stringify(processedSessions));
            } catch (err) {}
            
            setSaveMessage('Payment Verified! +5 Golden Eggs added!');
            try {
              playRollSound(880, true);
            } catch(e){}
            
            setTimeout(() => {
              setSaveMessage('');
              handleSaveGameLogless();
            }, 4500);
          } else {
            setSaveMessage(`Stripe Verification Failed: ${data.reason || 'Pending'}`);
            setTimeout(() => setSaveMessage(''), 4500);
          }
        })
        .catch(err => {
          console.error('Stripe Verification Error:', err);
          setSaveMessage('Stripe verification failed.');
          setTimeout(() => setSaveMessage(''), 4500);
        })
        .finally(() => {
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        });
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-black font-sans text-stone-100 flex flex-col justify-between selection:bg-purple-900 selection:text-purple-100">
      
      {/* Dynamic Environmental Biome Overlays */}
      {biome.current === 'RAINY' && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {Array.from({ length: 45 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 1.2 + Math.random() * 1.2;
            return (
              <div 
                key={i}
                className="absolute w-[1.5px] h-[22px] bg-[#60a5fa]/40 rounded animate-pulse"
                style={{
                  left: `${left}%`,
                  top: `-30px`,
                  animation: `rain-fall ${duration}s linear infinite`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}

      {biome.current === 'WINDY' && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => {
            const top = Math.random() * 100;
            const delay = Math.random() * 6;
            const duration = 2.0 + Math.random() * 2.5;
            const width = 80 + Math.random() * 140;
            return (
              <div 
                key={i}
                className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-teal-300/25 to-transparent rounded-full"
                style={{
                  top: `${top}%`,
                  left: `-200px`,
                  width: `${width}px`,
                  animation: `wind-whoosh ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}

      {biome.current === 'FIRE' && (
        <div className="fixed bottom-0 inset-x-0 h-10 pointer-events-none z-40 overflow-hidden flex justify-around items-end opacity-70">
          {Array.from({ length: 30 }).map((_, i) => {
            const height = 15 + Math.random() * 25;
            const width = 12 + Math.random() * 12;
            const delay = Math.random() * -2;
            const duration = 1.0 + Math.random() * 1.5;
            return (
              <div 
                key={i}
                className="bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-t-full blur-[1px]"
                style={{
                  height: `${height}px`,
                  width: `${width}px`,
                  animation: `fire-flicker ${duration}s ease-in-out infinite alternate`,
                  animationDelay: `${delay}s`,
                  transformOrigin: 'bottom center'
                }}
              />
            );
          })}
        </div>
      )}

      {biome.current === 'CORRUPTED' && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {/* Absolute Purple Vignette border */}
          <div className="fixed inset-0 pointer-events-none border-[20px] sm:border-[30px] border-purple-950/20 ring-inset ring-8 ring-fuchsia-950/15" />
          {/* Scanline pattern */}
          <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,10,36,0)_95%,rgba(168,85,247,0.05)_95%)] bg-[size:100%_12px] opacity-75 animate-scanline" />
          {/* Subtle Skew Glitch Overlay */}
          <div className="fixed inset-0 pointer-events-none bg-[#701a75]/3 mix-blend-color-dodge opacity-25 animate-glitch-flash" />
        </div>
      )}

      {/* Top ambient status overlay and visual state indicator */}
      <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b -z-50 pointer-events-none transition-all duration-1000 ${
        biome.current === 'NULL' 
          ? 'from-purple-950/20 via-purple-900/5 to-transparent' 
          : biome.current === 'RAINY'
            ? 'from-blue-950/25 via-blue-900/5 to-transparent'
            : biome.current === 'WINDY'
              ? 'from-teal-950/25 via-teal-900/5 to-transparent'
              : biome.current === 'FIRE'
                ? 'from-red-950/25 via-red-900/5 to-transparent'
                : biome.current === 'CORRUPTED'
                  ? 'from-fuchsia-950/25 via-fuchsia-900/5 to-transparent'
                  : biome.current === 'ETERNITY'
                    ? 'from-indigo-950/25 via-indigo-900/5 to-transparent'
                    : 'from-amber-950/10 via-zinc-900/5 to-transparent'
      }`} />

      {/* Main Container Layout */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation / Header Branding bar */}
        <header id="main-navigation-bar" className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-950/40">
              <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                <span className="text-sm font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 font-sans">
                  PRNG
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5 leading-none">
                Lucky RNG <span className="text-[10px] bg-purple-900/50 text-purple-300 font-mono py-0.5 px-1.5 rounded-full border border-purple-800 font-semibold tracking-wider uppercase">Paradox v1.4</span>
              </h1>
              <span className="text-xs text-zinc-500 leading-none">Stellar Probability Engine Blueprint Game</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <button
              id="toggle-space-music"
              onClick={() => {
                playClickSound();
                if (isMusicPlaying) {
                  stopSpaceMusic();
                } else {
                  startSpaceMusic();
                }
                setIsMusicPlaying(!isMusicPlaying);
              }}
              className={`cursor-pointer text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 ${
                isMusicPlaying
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Music className={`w-3.5 h-3.5 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
              <span>{isMusicPlaying ? 'Music: ON' : 'Music: OFF'}</span>
            </button>

            <button
              id="manual-save-game"
              onClick={() => {
                playClickSound();
                handleSaveGame();
              }}
              className="cursor-pointer text-xs text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 font-sans bg-[#12100a] border border-yellow-900/30 hover:border-yellow-600/40 px-3.5 py-1.5 rounded-lg active:scale-95 text-amber-300 shadow-[0_0_8px_rgba(234,179,8,0.08)] font-black uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5 text-yellow-400" />
              <span>Save Game</span>
            </button>

            <button
              id="delete-game-progress"
              onClick={() => {
                playClickSound();
                setShowDeleteConfirm1(true);
              }}
              className="cursor-pointer text-xs text-red-400 hover:text-red-300 transition-all flex items-center gap-1.5 font-sans bg-[#1a0808] border border-red-900/30 hover:border-red-600/40 px-3.5 py-1.5 rounded-lg active:scale-95 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.08)] font-black uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400 font-bold" />
              <span>Delete Progress</span>
            </button>

            <button
              id="open-help-modal"
              onClick={() => {
                playClickSound();
                setShowHelpModal(true);
              }}
              className="cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 font-mono bg-[#0c0c0f] border border-zinc-800 px-3 py-1.5 rounded-lg hover:border-zinc-700"
            >
              <Info className="w-3.5 h-3.5 text-zinc-500" />
              <span>Blueprint Specs</span>
            </button>
          </div>
        </header>

        {/* React Engine Boosting Banner */}
        <div id="engine-boosting-reactor-bar" className="relative overflow-hidden rounded-xl border transition-all duration-500 shadow-lg border-zinc-800">
          {boostTimeLeft > 0 ? (
            /* Active Hyper Speed mode */
            <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border border-red-500/30 p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15),transparent)] pointer-events-none animate-pulse" />
              <div className="flex items-center gap-3 relative z-10 text-left">
                <span className="text-xl sm:text-2xl animate-bounce">⚡</span>
                <div>
                  <h4 className="font-sans font-black text-xs uppercase tracking-widest text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                    engine in fast mode. 2x speed for {boostTimeLeft} seconds.
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-300">
                    Auto roll frequency is doubled! Feel the continuous tachyon acceleration.
                  </p>
                </div>
              </div>
              <div className="relative z-10 w-full sm:w-48 bg-black/40 h-2 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(boostTimeLeft / 25) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* Standard progressive accumulation mode */
            <div className="bg-[#0b0c10] p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3 text-left">
                <span className="text-lg text-zinc-500">⚙️</span>
                <div>
                  <h4 className="font-sans font-extrabold text-xs uppercase tracking-widest text-zinc-300">
                    engine boosting in {rollsToBoost} rolls
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Complete rolls to automatically activate the transient 25-second turbo-booster.
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-48 bg-zinc-950 h-2 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((15 - rollsToBoost) / 15) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 1. Biome system status console */}
        <BiomeDisplay 
          biome={biome} 
          onForceBiome={handleForceBiome}
          totalRolls={totalRolls}
        />

        {/* 2. Primary layout board for Visual HUD Viewer + Core mechanics controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Star Aura HUD Canvas particles animation */}
          <AuraViewer 
            currentAura={currentAura} 
            biome={biome.current} 
            luckMultiplier={luckMultiplier}
            onSaveAura={handleSaveCurrentAura}
            onSellCurrentAura={handleSellCurrentAura}
          />

          {/* Right: Paradox Roll Controls and History ledger */}
          <RollControls 
            onRoll={executeRoll} 
            isRolling={isRolling} 
            autoRoll={autoRoll} 
            onToggleAutoRoll={() => setAutoRoll(prev => !prev)} 
            rollDelay={rollDelay} 
            luckMultiplier={luckMultiplier} 
            rollHistory={rollHistory}
            onClearHistory={() => setRollHistory([])}
          />
        </div>

        {/* 3. The Active Walkers Quest board interface */}
        <QuestBoard 
          quest={quest} 
          onClaimReward={handleClaimReward} 
          activeBuffs={activeBuffs}
        />

        {/* 4. Active Live Egg Hunt stellar coordinates canvas */}
        <EggHuntCanvas 
          eggDrops={eggDrops} 
          onCollectEgg={handleCollectEgg} 
          onSimulateEggRain={handleSimulateEggRain}
        />

        {/* 5. Ruby Storage Hacks reactor condensator and active potions inventory */}
        <StorageEconomy 
          rubies={rubies} 
          rubyBlocks={rubyBlocks} 
          inventory={inventory} 
          activeBuffs={activeBuffs} 
          onCondenseWallet={handleCondenseWallet} 
          onCraftElixir={handleCraftElixir} 
          onConsumeItem={handleConsumeItem} 
          voidCoins={voidCoins}
          storedAuras={storedAuras}
          maxAuraSlots={maxAuraSlots}
          onBuyAuraSlot={handleBuyAuraSlot}
          onEquipAura={handleEquipAura}
          onReleaseAura={handleReleaseAura}
          onBuyPotion={handleBuyPotion}
          totalEggsCaught={totalEggsCaught}
          equippedGauntlet={equippedGauntlet}
          ownedGauntlets={ownedGauntlets}
          onBuyGauntlet={handleBuyGauntlet}
          onEquipGauntlet={handleEquipGauntlet}
          goldenEggsCount={goldenEggsCount}
          onBuyGoldenBasket={handleBuyGoldenBasket}
          onSpawnGoldenEgg={handleSpawnGoldenEgg}
        />

      </div>

      {/* Aesthetic human literal credits / Footer */}
      <footer className="w-full py-6 mt-12 border-t border-zinc-850 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-zinc-500 font-mono space-y-1">
          <div>Lucky RNG Game &copy; 2026. Designed from Master Keep Blueprint specifications.</div>
          <div className="text-[10px] text-zinc-700">All calculations rendered client-side. Zero simulated pity trackers found.</div>
        </div>
      </footer>

      {/* Master Keep Blueprint Specifications Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 text-xs leading-relaxed overflow-y-auto max-h-[85vh] shadow-[0_0_50px_rgba(168,85,247,0.15)] font-mono">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                LUCKY RNG / PARADOX RNG - MASTER DEV BLUEPRINT NOTES
              </h3>
              <button
                onClick={() => {
                  playClickSound();
                  setShowHelpModal(false);
                }}
                className="cursor-pointer text-zinc-400 hover:text-white font-black text-sm px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-zinc-300">
              <div>
                <b className="text-white text-xs block mb-1 uppercase">[1] BIOME SYSTEM (THE NULL BIOME)</b>
                • Spawn Chance: 1 in 25,000 per second. Active for 2 minutes of active "Void Energy."<br />
                • Inverted color shift changes the Star Aura visuals, gravity becomes 0 (causing particles to rise up), and grants +15% passive luck multiplier!
              </div>

              <div>
                <b className="text-white text-xs block mb-1 uppercase">[2] QUEST: VOID HARVESTER</b>
                • Roll 500 times total while standing inside the NULL Biome map event. Grants a 30-minute status effect adding +30 base Luck!
              </div>

              <div>
                <b className="text-white text-xs block mb-1 uppercase">[3] STORAGE MECHANICS (THE BLUE ELIXIR)</b>
                • Standard Rubies are limited to a wallet cap of 10,000. Any rubies past 10,000 are lost.<br />
                • To avoid losing rubies, players click "Condense" to convert 10,000 Rubies into 1 portable Ruby Block.<br />
                • Consume 5 Ruby Blocks (equivalent to 50,000 Rubies) to brew **The Blue Elixir** in the Reactor! Consuming grants +50,000 Luck for 1 minute with mini gold stars floating inside!
              </div>

              <div>
                <b className="text-white text-xs block mb-1 uppercase">[4] EGG HUNT LOGIC (DECIMAL PROBABILITY)</b>
                • Small Eggs hold flat Ruby payouts (50–500 Rubies).<br />
                • Normal Eggs use a standalone random decimal roll engine (Scale 0.0 to 100.0) with strict 2% Blue Elixir drop chances, 18% Ruby Bundle, 30% Speed, 50% Lucky potions!<br />
                • Gilded Eggs hold rare holiday exclusive rewards scaling past 1 in 40M+.
              </div>
            </div>

            <div className="text-center pt-5 border-t border-zinc-900 mt-6 text-[10px] text-zinc-500">
              *Designed and built exactly from Keep specification outlines. All systems fully compiled.
            </div>

          </div>
        </div>
      )}

      {/* Simulated Checkout Payment Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0b0c10] border border-amber-500/20 rounded-2xl max-w-md w-full p-6 text-xs leading-relaxed shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden flex flex-col justify-between">
            {/* Top gold bar asset decoration */}
            <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <h3 className="text-xs uppercase tracking-widest font-black text-yellow-400 flex items-center gap-1.5 font-sans">
                  💳 Galactic Encrypted Checkout
                </h3>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowCheckoutModal(false);
                    setCheckoutError('');
                  }}
                  disabled={isProcessingCheckout}
                  className="cursor-pointer text-zinc-400 hover:text-white font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 disabled:opacity-50"
                >
                  ✕ Cancel
                </button>
              </div>

              {/* Product breakdown */}
              <div className="bg-black/50 border border-white/5 p-3 rounded-lg mb-4 space-y-1">
                <div className="flex justify-between font-bold text-gray-100">
                  <span>🧺 Basket of Golden Eggs (5-Qty)</span>
                  <span className="text-yellow-400">$0.15 USD</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                  Direct microtransaction value. Instantly credits 5 premium golden eggs into your reserves to release stackable 5x Luck active multipliers!
                </p>
              </div>

              {/* Error HUD */}
              {checkoutError && (
                <div className="bg-red-950/85 border border-red-500/40 p-3 rounded-lg text-red-200 text-[11px] mb-4 flex flex-col gap-1 shadow-inner animate-[shake_0.3s_ease-in-out]">
                  <div className="font-extrabold uppercase tracking-wide text-red-400 flex items-center gap-1.5 font-sans">
                    🚨 (purchase failed!)
                  </div>
                  <p className="leading-snug text-red-300/90 font-mono">{checkoutError}</p>
                </div>
              )}

              {/* Payment Details Form Mockup with high fidelity transition blurring when transacting */}
              <div className={`space-y-3 transition-all duration-500 ${isProcessingCheckout ? 'blur-md opacity-20 pointer-events-none scale-95 select-none' : ''}`}>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-mono">Cardholder Name (First and Last name)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    value={ccName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setCcName(val);
                    }}
                    disabled={isProcessingCheckout}
                    className="w-full bg-[#050505] border border-zinc-800 focus:border-yellow-500/50 rounded-lg p-2.5 outline-none font-sans text-[11px] text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-mono">Card Details (Visa/Mastercard format)</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      placeholder="Card Number (16-digits)" 
                      value={ccNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const grouped = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                        setCcNumber(grouped);
                      }}
                      disabled={isProcessingCheckout}
                      className="col-span-2 w-full bg-[#050505] border border-zinc-800 focus:border-yellow-500/50 rounded-lg p-2.5 outline-none font-mono text-[11px] text-gray-200 text-center"
                    />
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      value={ccExpiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        let formatted = val;
                        if (val.length > 2) {
                          formatted = val.slice(0, 2) + '/' + val.slice(2);
                        }
                        setCcExpiry(formatted);
                      }}
                      disabled={isProcessingCheckout}
                      className="col-span-1 w-full bg-[#050505] border border-zinc-800 focus:border-yellow-500/50 rounded-lg p-2.5 outline-none font-mono text-[11px] text-gray-200 text-center"
                    />
                    <input 
                      type="text" 
                      placeholder="CVC" 
                      value={ccCvc}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCcCvc(val);
                      }}
                      disabled={isProcessingCheckout}
                      className="col-span-1 w-full bg-[#050505] border border-[#1a1a24] focus:border-yellow-500/50 rounded-lg p-2.5 outline-none font-mono text-[11px] text-gray-200 text-center"
                    />
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-lg border border-zinc-900 flex items-start gap-2">
                  <span className="text-emerald-500">🛡️</span>
                  <p className="text-[9px] text-zinc-500 leading-normal font-mono">
                    Sandbox processing channel. Card details are validated locally with enterprise safety checksum standard (Luhn checksum algorithms).
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Checkout Button and spinner */}
            <div className="mt-5 pt-3.5 border-t border-white/5 space-y-3">
              {/* Option A: Sandbox Simulation */}
              <button
                onClick={() => {
                  playClickSound();
                  setCheckoutError('');

                  // 1) Validate Name
                  const trimmedName = ccName.trim();
                  const nameParts = trimmedName.split(/\s+/);
                  if (!trimmedName) {
                    setCheckoutError('Please enter the Cardholder Name.');
                    return;
                  }
                  if (nameParts.length < 2) {
                    setCheckoutError('Invalid cardholder name. Enter both first and last name.');
                    return;
                  }
                  const nameFormatValid = nameParts.every(part => /^[A-Za-z]{2,}$/.test(part));
                  if (!nameFormatValid) {
                    setCheckoutError('Invalid Name characters or too short. Use real alphabetical first/last names.');
                    return;
                  }

                  // 2) Validate Card Number
                  const plainCardNumber = ccNumber.replace(/\s+/g, '');
                  if (!plainCardNumber) {
                    setCheckoutError('Please enter your card number.');
                    return;
                  }
                  if (!/^\d{13,19}$/.test(plainCardNumber)) {
                    setCheckoutError('Incorrect card length. Card numbers must represent standard credit card sequences (13-19 digits).');
                    return;
                  }

                  // Luhn checksum calculation standard
                  let sum = 0;
                  let shouldDouble = false;
                  for (let i = plainCardNumber.length - 1; i >= 0; i--) {
                    let digit = parseInt(plainCardNumber.charAt(i), 10);
                    if (shouldDouble) {
                      digit *= 2;
                      if (digit > 9) digit -= 9;
                    }
                    sum += digit;
                    shouldDouble = !shouldDouble;
                  }
                  const isLuhnValid = (sum % 10 === 0);
                  if (!isLuhnValid) {
                    setCheckoutError('Luhn verification failed. The card number is mathematically invalid (typo check failed).');
                    return;
                  }

                  // 3) Validate Expiry Code MM/YY
                  const expiryMatch = ccExpiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
                  if (!expiryMatch) {
                    setCheckoutError('Invalid expiration date format. Use MM/YY.');
                    return;
                  }
                  const expMonth = parseInt(expiryMatch[1], 10);
                  const expYear = 2000 + parseInt(expiryMatch[2], 10);

                  const currentDate = new Date();
                  const currentYear = currentDate.getFullYear();
                  const currentMonth = currentDate.getMonth() + 1; // 1-indexed

                  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                    setCheckoutError('The entered card has expired.');
                    return;
                  }

                  // 4) Validate CVC code numeric check
                  if (!ccCvc || !/^\d{3,4}$/.test(ccCvc)) {
                    setCheckoutError('Incorrect CVC digits. Please enter a valid 3 or 4-digit code.');
                    return;
                  }

                  // Validation passed! Proceed to simulate payment processing:
                  setIsProcessingCheckout(true);
                  setTimeout(() => {
                    setIsProcessingCheckout(false);
                    setShowCheckoutModal(false);
                    setGoldenEggsCount(prev => prev + 5);
                    
                    // SECURITY FIRST: Immediately delete/wipe all sensitive card indicators from React state memory so hackers can never capture it
                    setCcName('');
                    setCcNumber('');
                    setCcExpiry('');
                    setCcCvc('');
                    setCheckoutError('');

                    // play success chime sound
                    try {
                      playRollSound(880, true);
                    } catch(e){}
                    
                    // Trigger custom save notifications automatically
                    setSaveMessage('Payment Processed Successfully! +5 Golden Eggs added!');
                    setTimeout(() => setSaveMessage(''), 3500);
                  }, 1500);
                }}
                disabled={isProcessingCheckout || isStripeProcessing}
                className="w-full cursor-pointer bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold uppercase text-[10px] tracking-wider py-2.5 rounded-lg hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2 font-mono"
              >
                {isProcessingCheckout ? (
                  <>
                    <span className="animate-spin w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-transparent" />
                    <span>Processing Sandbox Verification...</span>
                  </>
                ) : (
                  <span>Test Sandbox Gate (Free Demo)</span>
                )}
              </button>

              <div className="flex items-center gap-2 text-zinc-700 my-1 font-mono text-[9px] uppercase tracking-wider select-none">
                <div className="h-[1px] bg-zinc-800/60 flex-1" />
                <span>OR Real Commerce Link</span>
                <div className="h-[1px] bg-zinc-800/60 flex-1" />
              </div>

              {/* Option B: SECURE STRIPE CHECKOUT API (Real money charges) */}
              <button
                onClick={() => {
                  playClickSound();
                  setCheckoutError('');
                  setIsStripeProcessing(true);

                  // Send session request to backend proxy
                  fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || 'Could not launch Stripe Checkout Session.');
                    }
                    if (data.url) {
                      setSaveMessage('Redirecting to Stripe Gateway...');
                      // Graceful redirection out of iframe if possible, fallback to standard link
                      try {
                        window.top!.location.href = data.url;
                      } catch (e) {
                        window.location.href = data.url;
                      }
                    } else {
                      throw new Error('API server returned empty redirect URL.');
                    }
                  })
                  .catch((err) => {
                    console.error('Stripe Checkout Error:', err);
                    setCheckoutError(err.message || 'Stripe API Connection timed out.');
                  })
                  .finally(() => {
                    setIsStripeProcessing(false);
                  });
                }}
                disabled={isProcessingCheckout || isStripeProcessing}
                className="w-full cursor-pointer bg-gradient-to-r from-[#635bff] to-[#4339ca] text-white font-extrabold uppercase text-xs tracking-widest py-3 rounded-xl hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(99,91,255,0.25)] font-sans"
              >
                {isStripeProcessing ? (
                  <>
                    <span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
                    <span>Launching Secure Stripe Gateway...</span>
                  </>
                ) : (
                  <span>💳 Buy Gamepass with Stripe ($4.99)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Notification HUD overlays */}
      {saveMessage && (
        <div id="save-notification-banner" className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#050508]/90 border border-emerald-500/30 px-5 py-3 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.2)] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-xs font-mono text-zinc-100 font-black">{saveMessage}</p>
          </div>
        </div>
      )}

      {/* Warning Modal 1 */}
      {showDeleteConfirm1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-950 border border-red-500/30 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] font-mono">
            <div className="w-14 h-14 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-sans font-black text-red-500 uppercase tracking-wider mb-2">
              ⚠️ Confirm Progress Wipe
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed mb-6 font-mono text-center">
              "are you sure? Grinded for this."
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  playClickSound();
                  setShowDeleteConfirm1(false);
                  setShowDeleteConfirm2(true);
                }}
                className="cursor-pointer bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-200 text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition-all font-sans"
              >
                Yes, continue
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setShowDeleteConfirm1(false);
                }}
                className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all"
              >
                No, keep my grind
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal 2 */}
      {showDeleteConfirm2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in">
          <div className="bg-zinc-950 border-2 border-red-500 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_60px_rgba(239,68,68,0.3)] font-mono">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-xl">🚨</span>
            </div>
            <h3 className="text-lg font-sans font-black text-red-500 uppercase tracking-widest mb-2 animate-pulse">
              CRITICAL VERIFICATION
            </h3>
            <p className="text-zinc-100 text-xs font-black leading-relaxed mb-6 uppercase tracking-wider text-center">
              "are you super super sure? Ur choice."
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  playClickSound();
                  setShowDeleteConfirm2(false);
                  handleDeleteProgress();
                }}
                className="cursor-pointer bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(239,68,68,0.4)] animate-pulse hover:brightness-110 font-sans"
              >
                Yes, delete everything! 💥
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setShowDeleteConfirm2(false);
                }}
                className="cursor-pointer bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all"
              >
                Wait, take me back!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
