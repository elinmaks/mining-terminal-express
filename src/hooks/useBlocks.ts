
import { useState, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { Block, TelegramUser } from '@/types/mining';
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

  const handleNewBlock = useCallback((block: Block) => {
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
        reward: mainReward
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
