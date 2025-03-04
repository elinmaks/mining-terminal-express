
import { useState } from 'react';

export interface MiningStatsState {
  balance: number;
  hashrate: number;
  shares: number;
  attempts: number;
}

export interface UseMiningStatsReturn {
  stats: MiningStatsState;
  setStats: React.Dispatch<React.SetStateAction<MiningStatsState>>;
  incrementShares: () => void;
  incrementAttempts: (count: number) => void;
  updateHashrate: (hashrate: number) => void;
  addReward: (reward: number) => void;
  resetShares: () => void;
}

export const useMiningStats = (): UseMiningStatsReturn => {
  const [stats, setStats] = useState<MiningStatsState>({
    balance: 0,
    hashrate: 0,
    shares: 0,
    attempts: 0
  });

  const incrementShares = () => {
    setStats(prev => ({
      ...prev,
      shares: prev.shares + 1
    }));
  };

  const incrementAttempts = (count: number) => {
    setStats(prev => ({
      ...prev,
      attempts: prev.attempts + count
    }));
  };

  const updateHashrate = (hashrate: number) => {
    setStats(prev => ({
      ...prev,
      hashrate
    }));
  };

  const addReward = (reward: number) => {
    setStats(prev => ({
      ...prev,
      balance: prev.balance + reward
    }));
  };

  const resetShares = () => {
    setStats(prev => ({
      ...prev,
      shares: 0
    }));
  };

  return {
    stats,
    setStats,
    incrementShares,
    incrementAttempts,
    updateHashrate,
    addReward,
    resetShares
  };
};
