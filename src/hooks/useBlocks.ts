
import { useState, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { Block, TelegramUser } from '@/types/mining';
import { supabase } from "@/integrations/supabase/client";
import { 
  DIFFICULTY_ADJUSTMENT_BLOCKS,
  TARGET_BLOCK_TIME,
  INITIAL_BLOCK,
  BASE_REWARD,
  MAIN_REWARD_SHARE,
  getNextBlockNumber 
} from '@/constants/mining';
import { haptic } from '@/utils/telegram';

export interface UseBlocksReturn {
  blocks: Block[];
  lastBlockRef: React.MutableRefObject<Block | null>;
  handleNewBlock: (block: Block) => void;
  calculateNewDifficulty: (blocks: Block[]) => number;
  createNewBlock: (params: {
    hash: string;
    user: TelegramUser | null;
    currentDifficulty: number;
    shares: number;
    hash64: string;
  }) => Block;
}

export const useBlocks = (currentDifficulty: number): UseBlocksReturn => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const lastBlockRef = useRef<Block | null>(null);

  // Загружаем последние блоки при инициализации
  const fetchBlocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedBlocks: Block[] = data.map(item => ({
          id: item.id,
          number: item.number,
          hash: item.hash,
          previousHash: item.previous_hash,
          timestamp: item.timestamp,
          difficulty: item.difficulty,
          minerProfileId: item.miner_id,
          totalShares: item.total_shares,
          reward: Number(item.reward),
          miner: {
            username: item.miner_username,
            reward: Number(item.reward) * MAIN_REWARD_SHARE
          },
          time: new Date(item.timestamp).toLocaleTimeString()
        }));
        
        setBlocks(formattedBlocks);
        lastBlockRef.current = formattedBlocks[0];
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  }, []);

  // Вызываем загрузку блоков при монтировании компонента
  useState(() => {
    fetchBlocks();
  });

  const calculateNewDifficulty = useCallback((blocks: Block[]) => {
    if (blocks.length < DIFFICULTY_ADJUSTMENT_BLOCKS) return currentDifficulty;

    const relevantBlocks = blocks.slice(0, DIFFICULTY_ADJUSTMENT_BLOCKS);
    const averageTime = relevantBlocks.reduce((sum, block, index, arr) => {
      if (index === 0) return sum;
      const timeDiff = block.timestamp - arr[index - 1].timestamp;
      return sum + timeDiff;
    }, 0) / (DIFFICULTY_ADJUSTMENT_BLOCKS - 1);

    const timeRatio = TARGET_BLOCK_TIME / averageTime;
    let newDifficulty = currentDifficulty * timeRatio;
    newDifficulty = Math.max(1, Math.min(newDifficulty, currentDifficulty * 2));

    return Math.round(newDifficulty);
  }, [currentDifficulty]);

  const handleNewBlock = useCallback(async (block: Block) => {
    // Сохраняем блок в базу данных
    try {
      const { error } = await supabase
        .from('blocks')
        .insert({
          id: block.id,
          number: block.number,
          hash: block.hash,
          previous_hash: block.previousHash,
          timestamp: block.timestamp,
          difficulty: block.difficulty,
          miner_id: block.minerProfileId,
          miner_username: block.miner.username,
          total_shares: block.totalShares,
          reward: block.reward
        });
      
      if (error) throw error;
      
      // Обновляем статистику пользователя
      const userId = block.minerProfileId;
      const username = block.miner.username;
      const reward = block.miner.reward || 0;
      
      // Обновляем или создаем запись в таблице balances
      const { data: existingBalance, error: balanceError } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', userId)
        .single();
      
      if (balanceError && balanceError.code !== 'PGRST116') { // PGRST116 - запись не найдена
        console.error('Error checking balance:', balanceError);
      }
      
      if (existingBalance) {
        // Обновляем существующий баланс
        const { error: updateError } = await supabase
          .from('balances')
          .update({ 
            amount: Number(existingBalance.amount) + reward,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
      } else {
        // Создаем новую запись баланса
        const { error: insertError } = await supabase
          .from('balances')
          .insert({ 
            user_id: userId,
            username: username,
            amount: reward
          });
          
        if (insertError) throw insertError;
      }
      
      // Обновляем статистику майнинга
      const { data: existingStats, error: statsError } = await supabase
        .from('mining_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error checking mining stats:', statsError);
      }
      
      const currentTimeStr = new Date().toISOString();
      
      if (existingStats) {
        // Обновляем существующую статистику
        const { error: updateStatsError } = await supabase
          .from('mining_stats')
          .update({ 
            total_blocks_mined: existingStats.total_blocks_mined + 1,
            total_shares: existingStats.total_shares + block.totalShares,
            best_hashrate: Math.max(existingStats.best_hashrate, block.miner.hashrate || 0),
            total_reward: Number(existingStats.total_reward) + reward,
            last_share_at: currentTimeStr,
            updated_at: currentTimeStr
          })
          .eq('user_id', userId);
          
        if (updateStatsError) throw updateStatsError;
      } else {
        // Создаем новую запись статистики
        const { error: insertStatsError } = await supabase
          .from('mining_stats')
          .insert({ 
            user_id: userId,
            username: username,
            total_blocks_mined: 1,
            total_shares: block.totalShares,
            best_hashrate: block.miner.hashrate || 0,
            total_reward: reward,
            last_share_at: currentTimeStr
          });
          
        if (insertStatsError) throw insertStatsError;
      }
    } catch (error) {
      console.error('Error saving block data:', error);
    }

    // Обновляем локальное состояние
    setBlocks(prev => {
      const newBlocks = [block, ...prev].slice(0, 50);
      return newBlocks;
    });
  }, []);

  const createNewBlock = useCallback(({ 
    hash, 
    user, 
    currentDifficulty, 
    shares, 
    hash64 
  }: {
    hash: string;
    user: TelegramUser | null;
    currentDifficulty: number;
    shares: number;
    hash64: string;
  }): Block => {
    haptic.notification('success');
    const now = Date.now();
    const blockNum = lastBlockRef.current 
      ? getNextBlockNumber(lastBlockRef.current.number)
      : INITIAL_BLOCK;

    const mainReward = BASE_REWARD * MAIN_REWARD_SHARE;
    const newBlock: Block = {
      id: crypto.randomUUID(),
      number: blockNum,
      hash,
      previousHash: lastBlockRef.current?.hash || hash64,
      timestamp: now,
      difficulty: currentDifficulty,
      minerProfileId: user?.id.toString() || 'anonymous',
      totalShares: shares,
      reward: BASE_REWARD,
      miner: {
        username: user?.username || 'anonymous',
        reward: mainReward,
        hashrate: 0 // Добавляем hashrate для статистики
      },
      time: new Date().toLocaleTimeString(),
      shares: { [user?.id.toString() || 'anonymous']: shares },
      rewards: {
        main: mainReward,
        shares: BASE_REWARD * (1 - MAIN_REWARD_SHARE)
      }
    };

    toast({
      title: "Блок найден!",
      description: `Награда: ${(newBlock.miner.reward || 0).toFixed(8)}`,
      variant: "default",
    });

    lastBlockRef.current = newBlock;
    handleNewBlock(newBlock);
    
    return newBlock;
  }, [handleNewBlock]);

  return {
    blocks,
    lastBlockRef,
    handleNewBlock,
    calculateNewDifficulty,
    createNewBlock
  };
};
