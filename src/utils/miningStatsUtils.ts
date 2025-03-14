
import { MiningStatsState } from '@/hooks/useMiningStats';

/**
 * Увеличивает количество шар в статистике
 * @param prevStats Предыдущая статистика
 * @returns Обновленная статистика
 */
export const incrementShares = (prevStats: MiningStatsState): MiningStatsState => ({
  ...prevStats,
  shares: prevStats.shares + 1
});

/**
 * Увеличивает количество попыток в статистике
 * @param prevStats Предыдущая статистика
 * @param count Количество попыток для добавления
 * @returns Обновленная статистика
 */
export const incrementAttempts = (prevStats: MiningStatsState, count: number): MiningStatsState => ({
  ...prevStats,
  attempts: prevStats.attempts + count
});

/**
 * Обновляет хешрейт в статистике
 * @param prevStats Предыдущая статистика
 * @param hashrate Новый хешрейт
 * @returns Обновленная статистика
 */
export const updateHashrate = (prevStats: MiningStatsState, hashrate: number): MiningStatsState => ({
  ...prevStats,
  hashrate
});

/**
 * Добавляет награду к балансу в статистике
 * @param prevStats Предыдущая статистика
 * @param reward Сумма награды
 * @returns Обновленная статистика
 */
export const addReward = (prevStats: MiningStatsState, reward: number): MiningStatsState => ({
  ...prevStats,
  balance: prevStats.balance + reward
});

/**
 * Сбрасывает количество шар в статистике
 * @param prevStats Предыдущая статистика
 * @returns Обновленная статистика
 */
export const resetShares = (prevStats: MiningStatsState): MiningStatsState => ({
  ...prevStats,
  shares: 0
});

/**
 * Обновляет баланс в статистике
 * @param prevStats Предыдущая статистика
 * @param balance Новый баланс
 * @returns Обновленная статистика
 */
export const updateBalance = (prevStats: MiningStatsState, balance: number): MiningStatsState => ({
  ...prevStats,
  balance
});
