
import { supabase } from '@/integrations/supabase/client';

/**
 * Получает баланс пользователя из базы данных
 * @param userId ID пользователя
 * @returns Баланс пользователя или null если произошла ошибка
 */
export const fetchUserBalance = async (userId: string): Promise<number | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('balances')
      .select('amount')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user balance:', error);
      return null;
    }
    
    return data ? Number(data.amount) : 0;
  } catch (error) {
    console.error('Error in fetchUserBalance:', error);
    return null;
  }
};

/**
 * Обновляет баланс пользователя в базе данных
 * @param userId ID пользователя
 * @param username Имя пользователя
 * @param reward Сумма награды
 * @returns Обновленный баланс или null если произошла ошибка
 */
export const updateUserBalance = async (
  userId: string, 
  username: string,
  reward: number
): Promise<number | null> => {
  if (!userId) return null;
  
  try {
    // Получаем текущий баланс
    const { data, error } = await supabase
      .from('balances')
      .select('amount')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching balance for update:', error);
      return null;
    }
    
    const currentBalance = data ? Number(data.amount) : 0;
    const newBalance = currentBalance + reward;
    
    // Обновляем баланс в базе данных
    if (data) {
      // Обновляем существующую запись
      const { error: updateError } = await supabase
        .from('balances')
        .update({ 
          amount: newBalance, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating balance:', updateError);
        return null;
      }
    } else {
      // Создаём новую запись
      const { error: insertError } = await supabase
        .from('balances')
        .insert({ 
          user_id: userId,
          username: username || 'anonymous',
          amount: newBalance, 
          updated_at: new Date().toISOString() 
        });
      
      if (insertError) {
        console.error('Error inserting balance:', insertError);
        return null;
      }
    }
    
    return newBalance;
  } catch (error) {
    console.error('Error in updateUserBalance:', error);
    return null;
  }
};
