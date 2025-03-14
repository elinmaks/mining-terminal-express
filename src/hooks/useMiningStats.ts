
import { useState, useCallback, useEffect } from 'react';
import { fetchUserBalance, updateUserBalance } from '@/services/balanceService';
import { 
  incrementShares, 
  incrementAttempts, 
  updateHashrate, 
  addReward, 
  resetShares, 
  updateBalance 
} from '@/utils/miningStatsUtils';

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
  fetchUserBalance: (userId: string) => Promise<void>;
}

export const useMiningStats = (userId?: string): UseMiningStatsReturn => {
  const [stats, setStats] = useState<MiningStatsState>({
    balance: 0,
    hashrate: 0,
    shares: 0,
    attempts: 0
  });

  // Загружаем баланс пользователя при инициализации и при изменении userId
  const fetchUserBalanceAndUpdate = useCallback(async (userId: string) => {
    if (!userId) return;
    
    const balance = await fetchUserBalance(userId);
    if (balance !== null) {
      setStats(prev => updateBalance(prev, balance));
    }
  }, []);

  // Загружаем баланс при монтировании компонента, если есть userId
  useEffect(() => {
    if (userId) {
      fetchUserBalanceAndUpdate(userId);
    }
  }, [userId, fetchUserBalanceAndUpdate]);

  const handleIncrementShares = useCallback(() => {
    setStats(prev => incrementShares(prev));
  }, []);

  const handleIncrementAttempts = useCallback((count: number) => {
    setStats(prev => incrementAttempts(prev, count));
  }, []);

  const handleUpdateHashrate = useCallback((hashrate: number) => {
    setStats(prev => updateHashrate(prev, hashrate));
  }, []);

  const handleAddReward = useCallback(async (reward: number) => {
    setStats(prev => addReward(prev, reward));
    
    // Синхронизируем обновление баланса с базой данных, если есть userId
    if (userId) {
      const newBalance = await updateUserBalance(userId, 'anonymous', reward);
      if (newBalance !== null) {
        setStats(prev => updateBalance(prev, newBalance));
      }
    }
  }, [userId]);

  const handleResetShares = useCallback(() => {
    setStats(prev => resetShares(prev));
  }, []);

  return {
    stats,
    setStats,
    incrementShares: handleIncrementShares,
    incrementAttempts: handleIncrementAttempts,
    updateHashrate: handleUpdateHashrate,
    addReward: handleAddReward,
    resetShares: handleResetShares,
    fetchUserBalance: fetchUserBalanceAndUpdate
  };
};
