
import { supabase } from "@/integrations/supabase/client";
import type { Block, TelegramUser } from '@/types/mining';

/**
 * Загружает последние блоки из базы данных
 * @param limit Максимальное количество блоков для загрузки
 * @returns Массив блоков
 */
export const fetchLatestBlocks = async (limit: number = 50): Promise<Block[]> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
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
          reward: Number(item.reward) * 0.7 // MAIN_REWARD_SHARE из констант
        },
        time: new Date(item.timestamp).toLocaleTimeString()
      }));
      
      return formattedBlocks;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return [];
  }
};

/**
 * Сохраняет блок в базу данных и обновляет статистику пользователя
 * @param block Блок для сохранения
 */
export const saveBlock = async (block: Block): Promise<void> => {
  try {
    // Сохраняем блок в базу данных
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
};

/**
 * Активирует Realtime для таблицы blocks
 */
export const enableBlocksRealtime = async (): Promise<void> => {
  try {
    // Проверяем, что таблица blocks включена в публикацию realtime
    const { error } = await supabase.rpc('supabase_functions.http_request', {
      method: 'POST',
      url: '/rest/v1/rpc/realtime_subscription_check',
      headers: { 'Content-Type': 'application/json' },
      body: { table: 'blocks' }
    } as any); // Используем as any для обхода проблемы с типами
    
    if (error) {
      console.error('Ошибка при проверке настроек Realtime:', error);
    }
  } catch (error) {
    console.error('Ошибка при активации Realtime:', error);
  }
};
