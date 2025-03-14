
import { useEffect, useState } from 'react';
import { Grid, Database, ListTodo, ArrowUp } from 'lucide-react';
import MiningStats from '@/components/MiningStats';
import MiningOutput from '@/components/MiningOutput';
import BlocksList from '@/components/BlocksList';
import { getTelegramUser, initTelegramWebApp, showMainButton, setMainButtonHandler, haptic } from '@/utils/telegram';
import type { TelegramUser } from '@/types/mining';
import { useMining } from '@/hooks/useMining';
import { enableBlocksRealtime } from '@/services/blockService';
import { INITIAL_BLOCK } from '@/constants/mining';

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
    
    // Активируем Realtime для таблицы blocks
    enableBlocksRealtime();
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

  const currentBlockNumber = blocks.length > 0 ? blocks[0].number : INITIAL_BLOCK;

  return <div className="flex flex-col h-screen bg-background">
      {/* Панель навигации */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center p-4 bg-zinc-950">
            <button onClick={() => handleSectionClick('mining')} className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${activeSection === 'mining' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'}`}>
              <Grid className="w-5 h-5" />
              <span className="text-xs">Майнинг</span>
            </button>
            <button onClick={() => handleSectionClick('blockchain')} className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${activeSection === 'blockchain' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'}`}>
              <Database className="w-5 h-5" />
              <span className="text-xs">Блокчейн</span>
            </button>
            <button onClick={() => handleSectionClick('tasks')} className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${activeSection === 'tasks' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'}`}>
              <ListTodo className="w-5 h-5" />
              <span className="text-xs">Задания</span>
            </button>
            <button onClick={() => handleSectionClick('upgrade')} className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${activeSection === 'upgrade' ? 'text-terminal-hash bg-white/10' : 'text-terminal-text hover:text-terminal-hash'}`}>
              <ArrowUp className="w-5 h-5" />
              <span className="text-xs">Апгрейд</span>
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto pt-[72px] scroll-heavy">
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
              currentBlock: currentBlockNumber
            }} 
            user={user} 
          />

          <MiningOutput 
            nonce={currentNonce} 
            hash={currentHash} 
            hashrate={currentHashrate.toFixed(2)} 
          />

          {!isMining && blocks.length === 0 && (
            <div className="glass-panel p-6 rounded-lg text-center mb-4">
              <h3 className="text-lg mb-2">Майнинг не запущен</h3>
              <p className="text-sm text-gray-400 mb-4">Нажмите кнопку "START MINING" чтобы начать майнинг</p>
              <button 
                onClick={handleStartMining}
                className="bg-terminal-hash text-black font-semibold py-2 px-6 rounded hover:bg-opacity-90 transition-colors"
              >
                Начать майнинг
              </button>
            </div>
          )}

          <BlocksList blocks={blocks} />
        </div>
      </div>
    </div>;
};

export default Index;
