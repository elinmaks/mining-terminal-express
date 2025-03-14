
import { toast } from '@/components/ui/use-toast';
import type { Block, TelegramUser } from '@/types/mining';
import { haptic } from '@/utils/telegram';
import {
  DIFFICULTY_ADJUSTMENT_BLOCKS,
  TARGET_BLOCK_TIME,
  BASE_REWARD,
  MAIN_REWARD_SHARE
} from '@/constants/mining';

/**
 * Создает новый блок на основе хеша и других параметров
 * @param params Параметры для создания блока
 * @returns Новый блок
 */
export const createBlock = ({ 
  hash, 
  user, 
  currentDifficulty, 
  shares, 
  previousHash,
  blockNum,
}: {
  hash: string;
  user: TelegramUser | null;
  currentDifficulty: number;
  shares: number;
  previousHash: string;
  blockNum: string;
}): Block => {
  haptic.notification('success');
  const now = Date.now();

  const mainReward = BASE_REWARD * MAIN_REWARD_SHARE;
  const newBlock: Block = {
    id: crypto.randomUUID(),
    number: blockNum,
    hash,
    previousHash,
    timestamp: now,
    difficulty: currentDifficulty,
    minerProfileId: user?.id.toString() || 'anonymous',
    totalShares: shares,
    reward: BASE_REWARD,
    miner: {
      username: user?.username || 'anonymous',
      reward: mainReward,
      hashrate: 0
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
  
  return newBlock;
};

/**
 * Рассчитывает новую сложность на основе истории блоков
 * @param blocks Массив блоков для расчета сложности
 * @param currentDifficulty Текущая сложность
 * @returns Новая сложность
 */
export const calculateNewDifficulty = (blocks: Block[], currentDifficulty: number): number => {
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
};
