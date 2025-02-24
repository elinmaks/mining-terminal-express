import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { Block, TelegramUser, NetworkStats } from '@/types/mining';
import { 
  INITIAL_DIFFICULTY, 
  TARGET_BLOCK_TIME, 
  DIFFICULTY_ADJUSTMENT_BLOCKS,
  BASE_REWARD,
  MAIN_REWARD_SHARE,
  INITIAL_BLOCK 
} from '@/constants/mining';
import { haptic } from '@/utils/telegram';

export const useMining = (user: TelegramUser | null) => {
  const [isMining, setIsMining] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const [currentNonce, setCurrentNonce] = useState('0');
  const [currentHashrate, setCurrentHashrate] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const [activeMiners, setActiveMiners] = useState<Set<string>>(new Set());
  
  const [stats, setStats] = useState({
    balance: 0,
    hashrate: 0,
    shares: 0,
    attempts: 0
  });

  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalHashrate: 0,
    activeMiners: 1,
    currentDifficulty: INITIAL_DIFFICULTY,
    targetBlockTime: TARGET_BLOCK_TIME,
    averageBlockTime: TARGET_BLOCK_TIME
  });

  const [blocks, setBlocks] = useState<Block[]>([]);
  const lastBlockRef = useRef<Block | null>(null);

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
    newDifficulty = Math.max(1, Math.min(newDifficulty, networkStats.currentDifficulty * 2));

    return Math.round(newDifficulty);
  }, [networkStats.currentDifficulty]);

  const handleNewBlock = useCallback((block: Block) => {
    setBlocks(prev => {
      const newBlocks = [block, ...prev].slice(0, 50);
      
      if (newBlocks.length % DIFFICULTY_ADJUSTMENT_BLOCKS === 0) {
        const newDifficulty = calculateNewDifficulty(newBlocks);
        setNetworkStats(prev => ({
          ...prev,
          currentDifficulty: newDifficulty
        }));
      }
      
      return newBlocks;
    });

    if (block.miner.username) {
      setActiveMiners(prev => new Set(prev).add(block.miner.username));
    }
  }, [calculateNewDifficulty]);

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
    const updateInterval = setInterval(() => {
      const now = Date.now();
      setActiveMiners(prev => {
        const active = new Set(prev);
        Array.from(active).forEach(miner => {
          const lastBlock = blocks.find(b => b.miner.username === miner);
          if (lastBlock && now - lastBlock.timestamp > 5 * 60 * 1000) {
            active.delete(miner);
          }
        });
        return active;
      });

      setNetworkStats(prev => ({
        ...prev,
        activeMiners: activeMiners.size,
        totalHashrate: stats.hashrate * activeMiners.size
      }));
    }, 30000);

    return () => clearInterval(updateInterval);
  }, [activeMiners, blocks, stats.hashrate]);

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
        haptic.notification('success');
        const now = Date.now();
        const blockNum = lastBlockRef.current 
          ? getNextBlockNumber(lastBlockRef.current.number)
          : INITIAL_BLOCK;

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

  useEffect(() => {
    if (isMining) {
      startMining();
    } else {
      stopMining();
    }
  }, [isMining, startMining, stopMining]);

  return {
    isMining,
    setIsMining,
    currentHash,
    currentNonce,
    currentHashrate,
    stats,
    networkStats,
    blocks,
    activeMiners
  };
};
