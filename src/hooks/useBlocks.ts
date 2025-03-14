
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Block, TelegramUser } from '@/types/mining';
import { 
  DIFFICULTY_ADJUSTMENT_BLOCKS,
  INITIAL_BLOCK,
  getNextBlockNumber 
} from '@/constants/mining';
import { fetchLatestBlocks, saveBlock } from '@/services/blockService';
import { calculateNewDifficulty, createBlock } from '@/utils/blockUtils';
import { supabase } from '@/integrations/supabase/client';

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

  // Настраиваем WebSocket для получения обновлений блоков в реальном времени
  useEffect(() => {
    // Включаем Realtime для таблицы blocks
    const channel = supabase
      .channel('public:blocks')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'blocks' 
      }, async (payload) => {
        console.log('Новый блок получен через WebSocket:', payload);
        
        // Получаем полные данные блока
        const { data: blockData, error } = await supabase
          .from('blocks')
          .select('*')
          .eq('id', payload.new.id)
          .single();
        
        if (error) {
          console.error('Ошибка при получении данных блока:', error);
          return;
        }
        
        if (blockData) {
          // Форматируем данные блока как объект Block
          const newBlock: Block = {
            id: blockData.id,
            number: blockData.number,
            hash: blockData.hash,
            previousHash: blockData.previous_hash,
            timestamp: blockData.timestamp,
            difficulty: blockData.difficulty,
            minerProfileId: blockData.miner_id,
            totalShares: blockData.total_shares,
            reward: Number(blockData.reward),
            miner: {
              username: blockData.miner_username,
              reward: Number(blockData.reward) * 0.7 // MAIN_REWARD_SHARE из констант
            },
            time: new Date(blockData.timestamp).toLocaleTimeString()
          };
          
          // Обновляем состояние только если это не блок, который мы сами создали
          const isOwnBlock = blocks.some(b => b.id === newBlock.id);
          if (!isOwnBlock) {
            setBlocks(prev => {
              // Проверяем, есть ли уже этот блок в списке
              if (prev.some(b => b.id === newBlock.id)) {
                return prev;
              }
              return [newBlock, ...prev].slice(0, 50);
            });
            
            // Обновляем lastBlockRef если это самый новый блок
            if (!lastBlockRef.current || newBlock.timestamp > lastBlockRef.current.timestamp) {
              lastBlockRef.current = newBlock;
            }
          }
        }
      })
      .subscribe();

    // Очищаем подписку при размонтировании
    return () => {
      supabase.removeChannel(channel);
    };
  }, [blocks]);

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
