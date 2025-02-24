
import { useEffect, useState } from 'react';
import MiningStats from '@/components/MiningStats';
import MiningOutput from '@/components/MiningOutput';
import BlocksList from '@/components/BlocksList';
import { 
  getTelegramUser, 
  initTelegramWebApp, 
  showMainButton, 
  hideMainButton,
  setMainButtonHandler,
  disableClosingBehaviour
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

  useEffect(() => {
    initTelegramWebApp();
    disableClosingBehaviour();
    const telegramUser = getTelegramUser();
    if (telegramUser && telegramUser.username) {
      setUser({ 
        ...telegramUser,
        username: telegramUser.username
      });
    }
  }, []);

  useEffect(() => {
    if (isMining) {
      showMainButton('STOP MINING');
      setMainButtonHandler(() => setIsMining(false));
    } else {
      hideMainButton();
    }
  }, [isMining, setIsMining]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {user && (
          <div className="glass-panel p-4 rounded-lg mb-4 terminal-text">
            Майнер: <span className="text-terminal-nonce">{user.username || user.first_name}</span>
          </div>
        )}

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

        <MiningOutput
          nonce={currentNonce}
          hash={currentHash}
          hashrate={currentHashrate.toFixed(2)}
        />

        {!isMining && (
          <button
            onClick={() => setIsMining(true)}
            className="w-full glass-panel p-3 rounded-lg mb-4 terminal-text text-terminal-nonce hover:bg-white/10 transition-colors"
          >
            START MINING
          </button>
        )}

        <BlocksList blocks={blocks} />
      </div>
    </div>
  );
};

export default Index;
