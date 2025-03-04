
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const fetchUserBalance = useCallback(async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 - запись не найдена
        console.error('Error fetching user balance:', error);
        return;
      }
      
      if (data) {
        setStats(prev => ({
          ...prev,
          balance: Number(data.amount)
        }));
      }
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
    }
  }, []);

  // Загружаем баланс при монтировании компонента, если есть userId
  useEffect(() => {
    if (userId) {
      fetchUserBalance(userId);
    }
  }, [userId, fetchUserBalance]);

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

  const addReward = useCallback(async (reward: number) => {
    setStats(prev => ({
      ...prev,
      balance: prev.balance + reward
    }));
    
    // Синхронизируем обновление баланса с базой данных, если есть userId
    if (userId) {
      try {
        // Получаем текущий баланс
        const { data, error } = await supabase
          .from('balances')
          .select('amount')
          .eq('user_id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching balance for update:', error);
          return;
        }
        
        const currentBalance = data ? Number(data.amount) : 0;
        const newBalance = currentBalance + reward;
        
        // Обновляем баланс в базе данных
        if (data) {
          // Обновляем существующую запись
          const { error: updateError } = await supabase
            .from('balances')
            .update({ 
              amount: newBalance, 
              updated_at: new Date().toISOString() 
            })
            .eq('user_id', userId);
          
          if (updateError) {
            console.error('Error updating balance:', updateError);
          }
        }
        // Если записи нет, она будет создана при сохранении блока
      } catch (error) {
        console.error('Error in addReward:', error);
      }
    }
  }, [userId]);

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
    resetShares,
    fetchUserBalance
  };
};
