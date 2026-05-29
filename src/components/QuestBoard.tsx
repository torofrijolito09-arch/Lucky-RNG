/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Trophy, Sparkles, Clock, Lock } from 'lucide-react';
import { Quest, ActiveBuff } from '../types';
import { playClickSound } from '../utils/audio';

interface QuestBoardProps {
  quest: Quest;
  onClaimReward: () => void;
  activeBuffs: ActiveBuff[];
}

export const QuestBoard: React.FC<QuestBoardProps> = ({
  quest,
  onClaimReward,
  activeBuffs
}) => {
  // Check if reward booster is active
  const voidWalkerBuff = activeBuffs.find(b => b.id === 'VOID_WALKER_REWARD');
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div id="quest-board" className="bg-[#0f0f12] border border-white/5 rounded-xl p-4 shadow-lg relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 blur-[80px] pointer-events-none -z-10" />

      {/* Title */}
      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5 justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-purple-400 animate-pulse" />
          <h3 className="font-extrabold tracking-widest text-[11px] uppercase text-purple-400 font-sans">
            Void Walker Quest Board
          </h3>
        </div>
        <span className="text-[9px] font-mono uppercase bg-purple-950/45 text-purple-300 px-2 py-0.5 rounded border border-purple-900/50">
          Void Series [Part 1]
        </span>
      </div>

      {/* Active Buff State Timer Banner */}
      {voidWalkerBuff && (
        <div className="mb-3 bg-purple-950/20 border border-purple-500/20 rounded-lg p-2.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="bg-purple-500/10 p-1 rounded border border-purple-400/20">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <div>
              <div className="font-sans font-bold text-[11px] text-purple-200">Void walker Mastery Active</div>
              <div className="text-[9px] text-gray-500 font-mono">Status modifier active: <b className="text-purple-300">+30 Luck</b></div>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-purple-300 bg-purple-900/30 px-2.5 py-1 rounded">
            <Clock className="w-3 h-3 animate-spin-slow text-purple-450" />
            <span>{formatTime(voidWalkerBuff.durationLeft)}</span>
          </div>
        </div>
      )}

      {/* Quest Item Row */}
      <div className={`p-3.5 rounded-lg border transition-all duration-300 ${
        quest.completed 
          ? 'bg-purple-950/10 border-purple-900/40' 
          : 'bg-[#131216]/65 border-white/5'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h4 className="font-bold text-zinc-100 font-sans text-xs flex items-center gap-1.5">
              {quest.name}
              {quest.completed && (
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 fill-purple-400/10" />
              )}
            </h4>
            <p className="text-[10px] text-gray-405 leading-relaxed">
              {quest.description}
            </p>
          </div>

          <div className="text-right font-mono self-end sm:self-auto text-[10px]">
            <span className="text-gray-500">Progress: </span>
            <span className={`text-xs font-bold ${quest.completed ? 'text-purple-400 font-sans' : 'text-zinc-300'}`}>
              {quest.current}
            </span>
            <span className="text-gray-500"> / {quest.target} Rolls</span>
          </div>
        </div>

        {/* Quest Progress Bar */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 mb-3">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
            style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
          />
        </div>

        {/* Rewards and Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-white/5 text-[10px]">
          <div>
            <span className="text-gray-500 font-mono">Completion Reward: </span>
            <span className="text-yellow-500 font-mono font-bold">{quest.rewardDescription}</span>
          </div>

          {quest.completed ? (
            quest.rewardClaimed ? (
              <span className="text-gray-500 font-mono italic flex items-center gap-1 bg-[#1a1a1e] px-2 py-0.5 rounded border border-white/5">
                Claimed & Active
              </span>
            ) : (
              <button
                id="claim-quest-reward"
                onClick={() => {
                  playClickSound();
                  onClaimReward();
                }}
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white text-[9px] font-sans font-black uppercase px-2.5 py-1 rounded transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse"
              >
                Claim Reward
              </button>
            )
          ) : (
            <span className="text-zinc-500 font-mono text-[10px] flex items-center gap-1.5 py-1 px-2 border border-zinc-850 bg-zinc-900/40 rounded">
              <Lock className="w-3" /> In Progress
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
