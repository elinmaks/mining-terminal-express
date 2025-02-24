
export const INITIAL_DIFFICULTY = 5;
export const TARGET_BLOCK_TIME = 30;
export const DIFFICULTY_ADJUSTMENT_BLOCKS = 10;
export const BASE_REWARD = 0.1;
export const MAIN_REWARD_SHARE = 0.7;

// Серии блоков
export const BLOCK_SERIES = ['aa', 'as', 'ad', 'af', 'ah', 'ax'];
export const INITIAL_BLOCK = 'aa|0001';
export const BLOCKS_PER_SERIES = 9999;

export const getNextBlockNumber = (currentBlock: string): string => {
  const [series, number] = currentBlock.split('|');
  const currentNumber = parseInt(number, 10);
  
  if (currentNumber < BLOCKS_PER_SERIES) {
    // Увеличиваем номер внутри текущей серии
    return `${series}|${(currentNumber + 1).toString().padStart(4, '0')}`;
  } else {
    // Переходим к следующей серии
    const currentSeriesIndex = BLOCK_SERIES.indexOf(series);
    if (currentSeriesIndex < BLOCK_SERIES.length - 1) {
      return `${BLOCK_SERIES[currentSeriesIndex + 1]}|0001`;
    } else {
      // Если это последняя серия, начинаем заново
      return `${BLOCK_SERIES[0]}|0001`;
    }
  }
};
