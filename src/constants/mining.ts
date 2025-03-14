
export const INITIAL_DIFFICULTY = 5;
export const TARGET_BLOCK_TIME = 30;
export const DIFFICULTY_ADJUSTMENT_BLOCKS = 10;
export const BASE_REWARD = 0.1;
export const MAIN_REWARD_SHARE = 0.7;

// Новая система нумерации блоков (с 0000001 до 9999999)
export const INITIAL_BLOCK = '0000001';
export const MAX_BLOCK_NUMBER = 9999999;

export const getNextBlockNumber = (currentBlock: string): string => {
  const currentNumber = parseInt(currentBlock, 10);
  
  if (currentNumber < MAX_BLOCK_NUMBER) {
    // Увеличиваем номер блока
    return (currentNumber + 1).toString().padStart(7, '0');
  } else {
    // Если достигли максимального номера, начинаем заново
    return INITIAL_BLOCK;
  }
};
