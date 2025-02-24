import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import MiningStats from '@/components/MiningStats';
import MiningOutput from '@/components/MiningOutput';
import BlocksList from '@/components/BlocksList';
import { 
  getTelegramUser, 
  initTelegramWebApp, 
  showMainButton, 
  hideMainButton,
  setMainButtonHandler 
} from '@/utils/telegram';
import type { Block, TelegramUser, NetworkStats } from '@/types/mining';

// Константы
const INITIAL_DIFFICULTY = 5; // Изменено с 3 на 5
const TARGET_BLOCK_TIME = 30; // 30 секунд
const DIFFICULTY_ADJUSTMENT_BLOCKS = 10;
const BASE_REWARD = 0.1;
const MAIN_REWARD_SHARE = 0.7; // 70% основному майнеру

const Index = () => {
  const [isMining, setIsMining] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const [currentNonce, setCurrentNonce] = useState('0');
  const [currentHashrate, setCurrentHashrate] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  
  const [stats, setStats] = useState({
    balance: 0,
    hashrate: 0,
    shares: 0,
    attempts: 0
  });

  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalHashrate: 0,
    activeMiners: 3,
    currentDifficulty: INITIAL_DIFFICULTY,
    targetBlockTime: TARGET_BLOCK_TIME,
    averageBlockTime: TARGET_BLOCK_TIME
  });

  const [blocks, setBlocks] = useState<Block[]>([]);
  const lastBlockRef = useRef<Block | null>(null);

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
  }, []);

  // Управление главной кнопкой Telegram
  useEffect(() => {
    if (isMining) {
      showMainButton('STOP MINING');
      setMainButtonHandler(() => setIsMining(false));
    } else {
      hideMainButton();
    }
  }, [isMining]);

  // Расчет новой сложности
  const calculateNewDifficulty = useCallback((blocks: Block[]) => {
    if (blocks.length < DIFFICULTY_ADJUSTMENT_BLOCKS) return networkStats.currentDifficulty;

    const relevantBlocks = blocks.slice(0, DIFFICULTY_ADJUSTMENT_BLOCKS);
    const averageTime = relevantBlocks.reduce((sum, block, index, arr) => {
      if (index === 0) return sum;
      const timeDiff = block.timestamp - arr[index - 1].timestamp;
      return sum + timeDiff;
    }, 0) / (DIFFICULTY_ADJUSTMENT_BLOCKS - 1);

    const timeRatio = TARGET_BLOCK_TIME / averageTime;
    let newDifficulty = networkStats.currentDifficulty * timeRatio;

    // Ограничиваем изменение сложности
    newDifficulty = Math.max(1, Math.min(newDifficulty, networkStats.currentDifficulty * 2));

    return Math.round(newDifficulty);
  }, [networkStats.currentDifficulty]);

  // Обработка нового блока
  const handleNewBlock = useCallback((block: Block) => {
    setBlocks(prev => {
      const newBlocks = [block, ...prev].slice(0, 50);
      
      // Обновляем сложность каждые DIFFICULTY_ADJUSTMENT_BLOCKS блоков
      if (newBlocks.length % DIFFICULTY_ADJUSTMENT_BLOCKS === 0) {
        const newDifficulty = calculateNewDifficulty(newBlocks);
        setNetworkStats(prev => ({
          ...prev,
          currentDifficulty: newDifficulty
        }));
      }
      
      return newBlocks;
    });
  }, [calculateNewDifficulty]);

  // Инициализация Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/miningWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, nonce, hash, hashrate, totalHashrate } = e.data;
      
      if (type === 'progress') {
        setCurrentHash(hash || '');
        setCurrentNonce(nonce.toString());
        setCurrentHashrate(hashrate);
        setStats(prev => ({
          ...prev,
          attempts: prev.attempts + 1000,
          hashrate: totalHashrate
        }));
      }
      
      if (type === 'share') {
        setStats(prev => ({
          ...prev,
          shares: prev.shares + 1
        }));
      }
      
      if (type === 'success') {
        const now = Date.now();
        const blockNum = lastBlockRef.current 
          ? (parseInt(lastBlockRef.current.number, 16) + 1).toString(16).padStart(8, '0')
          : (0x1000000).toString(16);

        const newBlock: Block = {
          number: blockNum,
          hash,
          previousHash: lastBlockRef.current?.hash || '0'.repeat(64),
          time: new Date().toLocaleTimeString(),
          timestamp: now,
          difficulty: networkStats.currentDifficulty,
          miner: {
            username: user?.username || 'anonymous',
            reward: BASE_REWARD * MAIN_REWARD_SHARE
          },
          shares: { [user?.id.toString() || 'anonymous']: stats.shares },
          totalShares: stats.shares,
          rewards: {
            main: BASE_REWARD * MAIN_REWARD_SHARE,
            shares: BASE_REWARD * (1 - MAIN_REWARD_SHARE)
          }
        };

        lastBlockRef.current = newBlock;
        handleNewBlock(newBlock);

        setStats(prev => ({
          ...prev,
          balance: prev.balance + newBlock.miner.reward,
          shares: 0
        }));

        toast({
          title: "Блок найден!",
          description: `Награда: ${newBlock.miner.reward.toFixed(8)}`,
          variant: "default",
        });

        if (isMining) {
          startMining();
        }
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [networkStats.currentDifficulty, user, handleNewBlock, isMining]);

  const startMining = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/miningWorker.ts', import.meta.url), {
        type: 'module'
      });
    }
    
    const data = lastBlockRef.current 
      ? `${lastBlockRef.current.hash}${lastBlockRef.current.number}`
      : '0'.repeat(64);

    workerRef.current.postMessage({
      type: 'start',
      data,
      difficulty: networkStats.currentDifficulty
    });
  }, [networkStats.currentDifficulty]);

  const stopMining = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setCurrentHash('');
      setCurrentNonce('0');
      setCurrentHashrate(0);
    }
  }, []);

  useEffect(() => {
    if (isMining) {
      startMining();
    } else {
      stopMining();
    }
  }, [isMining, startMining, stopMining]);

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
            totalHashrate: stats.hashrate * networkStats.activeMiners,
            activeMiners: networkStats.activeMiners,
            difficulty: networkStats.currentDifficulty,
            currentBlock: parseInt(lastBlockRef.current?.number || '1000000', 16)
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
