
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Block, TelegramUser } from '@/types/mining';
import { 
  DIFFICULTY_ADJUSTMENT_BLOCKS,
  INITIAL_BLOCK,
  getNextBlockNumber 
} from '@/constants/mining';
import { fetchLatestBlocks, saveBlock } from '@/services/blockService';
import { calculateNewDifficulty, createBlock } from '@/utils/blockUtils';

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
    const fetchedBlocks = await fetchLatestBlocks(50);
    if (fetchedBlocks.length > 0) {
      setBlocks(fetchedBlocks);
      lastBlockRef.current = fetchedBlocks[0];
    }
  }, []);

  // Вызываем загрузку блоков при монтировании компонента
  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleNewBlock = useCallback(async (block: Block) => {
    // Сохраняем блок в базу данных и обновляем статистику пользователя
    await saveBlock(block);

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
    const blockNum = lastBlockRef.current 
      ? getNextBlockNumber(lastBlockRef.current.number)
      : INITIAL_BLOCK;

    const previousHash = lastBlockRef.current?.hash || hash64;
    
    const newBlock = createBlock({
      hash,
      user,
      currentDifficulty,
      shares,
      previousHash,
      blockNum
    });

    lastBlockRef.current = newBlock;
    handleNewBlock(newBlock);
    
    return newBlock;
  }, [handleNewBlock]);

  return {
    blocks,
    lastBlockRef,
    handleNewBlock,
    calculateNewDifficulty: useCallback((blocks: Block[]) => 
      calculateNewDifficulty(blocks, currentDifficulty), [currentDifficulty]),
    createNewBlock
  };
};
