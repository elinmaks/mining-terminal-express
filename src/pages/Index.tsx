
import { useState, useCallback, useEffect, useRef } from 'react';
import MiningStats from '@/components/MiningStats';
import MiningOutput from '@/components/MiningOutput';
import BlocksList from '@/components/BlocksList';
import { getTelegramUser, initTelegramWebApp } from '@/utils/telegram';
import type { Block, TelegramUser } from '@/types/mining';

const DIFFICULTY = 3;

const Index = () => {
  const [isMining, setIsMining] = useState(true);
  const [currentHash, setCurrentHash] = useState('');
  const [currentNonce, setCurrentNonce] = useState('0');
  const workerRef = useRef<Worker | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  
  const [stats, setStats] = useState({
    balance: 0,
    hashrate: 0,
    shares: 0,
    attempts: 0,
    totalHashrate: 0,
    activeMiners: 3,
    difficulty: DIFFICULTY,
    currentBlock: 0x1000000,
  });

  const [blocks, setBlocks] = useState<Block[]>([]);

  // Инициализация Telegram Web App
  useEffect(() => {
    initTelegramWebApp();
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      setUser(telegramUser);
    }
  }, []);

  // Инициализация Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/miningWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, nonce, hash, currentHash } = e.data;
      
      if (type === 'progress') {
        setCurrentHash(currentHash);
        setCurrentNonce(nonce.toString());
        setStats(prev => ({
          ...prev,
          attempts: prev.attempts + 1000,
          hashrate: Math.random() * 5 + 8 // Это нужно будет заменить на реальный расчет хешрейта
        }));
      }
      
      if (type === 'success') {
        const blockNum = stats.currentBlock.toString(16).padStart(8, '0');
        const time = new Date().toLocaleTimeString();
        const reward = 0.01; // Базовая награда за блок

        setBlocks(prev => {
          const newBlocks = [{
            number: blockNum,
            hash,
            time,
            miner: {
              username: user?.username || 'anonymous',
              reward
            }
          }, ...prev];
          return newBlocks.slice(0, 5);
        });

        setStats(prev => ({
          ...prev,
          currentBlock: prev.currentBlock + 1,
          balance: prev.balance + reward,
          shares: prev.shares + 1
        }));

        // Начинаем майнить следующий блок
        startMining();
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [stats.currentBlock, user]);

  const startMining = useCallback(() => {
    if (!workerRef.current) return;
    
    const data = stats.currentBlock.toString(16);
    workerRef.current.postMessage({
      type: 'start',
      data,
      difficulty: DIFFICULTY
    });
  }, [stats.currentBlock]);

  useEffect(() => {
    if (isMining) {
      startMining();
    }
  }, [isMining, startMining]);

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
            totalHashrate: stats.hashrate * stats.activeMiners,
            activeMiners: stats.activeMiners,
            difficulty: stats.difficulty,
            currentBlock: stats.currentBlock
          }}
        />

        <MiningOutput
          nonce={currentNonce}
          hash={currentHash}
          hashrate={stats.hashrate.toFixed(2)}
        />

        <button
          onClick={() => setIsMining(prev => !prev)}
          className="w-full glass-panel p-3 rounded-lg mb-4 terminal-text text-terminal-nonce hover:bg-white/10 transition-colors"
        >
          {isMining ? 'STOP MINING' : 'START MINING'}
        </button>

        <BlocksList blocks={blocks} />
      </div>
    </div>
  );
};

export default Index;
