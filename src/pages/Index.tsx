
import { useEffect, useState } from 'react';
import MiningStats from '@/components/MiningStats';
import MiningOutput from '@/components/MiningOutput';
import BlocksList from '@/components/BlocksList';
import { 
  getTelegramUser, 
  initTelegramWebApp, 
  showMainButton,
  setMainButtonHandler,
  haptic
} from '@/utils/telegram';
import type { TelegramUser } from '@/types/mining';
import { useMining } from '@/hooks/useMining';

const Index = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const {
    isMining,
    setIsMining,
    currentHash,
    currentNonce,
    currentHashrate,
    stats,
    networkStats,
    blocks,
    activeMiners
  } = useMining(user);

  // Инициализация Telegram Web App
  useEffect(() => {
    initTelegramWebApp();
    const telegramUser = getTelegramUser();
    if (telegramUser && telegramUser.username) {
      setUser({ 
        ...telegramUser,
        username: telegramUser.username
      });
    }

    // Устанавливаем стили для предотвращения сворачивания
    document.body.style.overscrollBehavior = 'none';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
  }, []);

  // Управление главной кнопкой
  useEffect(() => {
    const buttonText = isMining ? 'STOP MINING' : 'START MINING';
    showMainButton(buttonText);
    setMainButtonHandler(() => {
      haptic.impact('medium');
      setIsMining(!isMining);
    });
  }, [isMining, setIsMining]);

  const handleStartMining = () => {
    haptic.impact('medium');
    setIsMining(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto p-4">
          <MiningStats
            personalStats={{
              balance: stats.balance,
              hashrate: stats.hashrate,
              shares: stats.shares,
              attempts: stats.attempts
            }}
            networkStats={{
              totalHashrate: stats.hashrate * activeMiners.size,
              activeMiners: activeMiners.size,
              difficulty: networkStats.currentDifficulty,
              currentBlock: parseInt(blocks[0]?.number || '1000000', 16)
            }}
            user={user}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-[280px] pb-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <MiningOutput
            nonce={currentNonce}
            hash={currentHash}
            hashrate={currentHashrate.toFixed(2)}
          />

          {!isMining && (
            <button
              onClick={handleStartMining}
              className="w-full glass-panel p-3 rounded-lg mb-4 terminal-text text-terminal-nonce hover:bg-white/10 transition-colors"
            >
              START MINING
            </button>
          )}

          <BlocksList blocks={blocks} />
        </div>
      </div>
    </div>
  );
};

export default Index;
