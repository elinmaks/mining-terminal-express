
import { useState, useCallback, useEffect } from 'react';
import type { Block, TelegramUser } from '@/types/mining';
import { DIFFICULTY_ADJUSTMENT_BLOCKS } from '@/constants/mining';
import { useBlocks } from './useBlocks';
import { useMiningWorker } from './useMiningWorker';
import { useNetworkStats } from './useNetworkStats';
import { useMiningStats } from './useMiningStats';

export const useMining = (user: TelegramUser | null) => {
  const [isMining, setIsMining] = useState(false);
  const [activeMiners, setActiveMiners] = useState<Set<string>>(new Set());
  
  // Инициализируем подхуки
  const { stats, incrementShares, incrementAttempts, updateHashrate, addReward, resetShares } = useMiningStats();
  
  const { networkStats, updateDifficulty } = useNetworkStats({
    activeMiners,
    personalHashrate: stats.hashrate
  });
  
  const { 
    blocks, 
    lastBlockRef, 
    calculateNewDifficulty, 
    createNewBlock 
  } = useBlocks(networkStats.currentDifficulty);
  
  const { 
    currentHash, 
    currentNonce, 
    currentHashrate 
  } = useMiningWorker({
    isMining,
    difficulty: networkStats.currentDifficulty,
    lastBlock: lastBlockRef.current,
    onShare: incrementShares,
    onMiningProgress: (data) => {
      incrementAttempts(1000);
      updateHashrate(data.totalHashrate);
    },
    onBlockFound: (data) => {
      const block = createNewBlock({
        hash: data.hash,
        user,
        currentDifficulty: networkStats.currentDifficulty,
        shares: stats.shares,
        hash64: '0'.repeat(64)
      });
      
      addReward(block.miner.reward || 0);
      resetShares();
    }
  });

  const handleBlockCreated = useCallback((block: Block) => {
    if (block.miner.username) {
      setActiveMiners(prev => new Set(prev).add(block.miner.username));
    }
    
    if (blocks.length % DIFFICULTY_ADJUSTMENT_BLOCKS === 0) {
      const newDifficulty = calculateNewDifficulty(blocks);
      updateDifficulty(newDifficulty);
    }
  }, [blocks, calculateNewDifficulty, updateDifficulty]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const now = Date.now();
      setActiveMiners(prev => {
        const active = new Set(prev);
        Array.from(active).forEach(miner => {
          const lastBlock = blocks.find(b => b.miner.username === miner);
          if (lastBlock && now - lastBlock.timestamp > 5 * 60 * 1000) {
            active.delete(miner);
          }
        });
        return active;
      });
    }, 30000);

    return () => clearInterval(updateInterval);
  }, [blocks]);

  useEffect(() => {
    if (blocks.length > 0) {
      handleBlockCreated(blocks[0]);
    }
  }, [blocks, handleBlockCreated]);

  return {
    isMining,
    setIsMining,
    currentHash,
    currentNonce,
    currentHashrate,
    stats,
    networkStats,
    blocks,
    activeMiners
  };
};
