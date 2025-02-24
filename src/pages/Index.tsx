
import { useEffect, useState } from 'react';
import { Grid, Database, ListTodo, ArrowUp } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('mining');
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

    document.body.style.overscrollBehavior = 'none';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
  }, []);

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

  const handleSectionClick = (section: string) => {
    haptic.selection();
    setActiveSection(section);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Панель навигации */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center p-4">
            <button 
              onClick={() => handleSectionClick('mining')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'mining' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'
              }`}
            >
              <Grid className="w-5 h-5" />
              <span className="text-xs">Майнинг</span>
            </button>
            <button 
              onClick={() => handleSectionClick('blockchain')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'blockchain' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="text-xs">Блокчейн</span>
            </button>
            <button 
              onClick={() => handleSectionClick('tasks')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'tasks' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'
              }`}
            >
              <ListTodo className="w-5 h-5" />
              <span className="text-xs">Задания</span>
            </button>
            <button 
              onClick={() => handleSectionClick('upgrade')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'upgrade' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
              <span className="text-xs">Апгрейд</span>
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto pt-[72px]">
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
