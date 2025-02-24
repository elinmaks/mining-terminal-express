
import { useState, useCallback, useEffect } from 'react';
import MiningStats from '@/components/MiningStats';
import MiningOutput from '@/components/MiningOutput';
import BlocksList from '@/components/BlocksList';

const HEX_CHARS = '0123456789abcdef';

const generateHash = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const generateNonce = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const animateString = (str: string, changePercent = 0.1) => {
  const chars = str.split('');
  const numToChange = Math.max(1, Math.floor(chars.length * changePercent));
  
  for (let i = 0; i < numToChange; i++) {
    const pos = Math.floor(Math.random() * chars.length);
    chars[pos] = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
  }
  
  return chars.join('');
};

const Index = () => {
  const [isMining, setIsMining] = useState(true);
  const [currentHash, setCurrentHash] = useState(generateHash());
  const [currentNonce, setCurrentNonce] = useState(generateNonce());
  const [stats, setStats] = useState({
    balance: 0,
    hashrate: 0,
    shares: 0,
    attempts: 0,
    totalHashrate: 0,
    activeMiners: 3,
    difficulty: 3,
    currentBlock: 0x1000000,
  });
  const [blocks, setBlocks] = useState<Array<{ number: string; hash: string; time: string; }>>([]);

  const addFoundBlock = useCallback(() => {
    const blockNum = stats.currentBlock.toString(16).padStart(8, '0');
    const hash = generateHash();
    const time = new Date().toLocaleTimeString();
    
    setBlocks(prev => {
      const newBlocks = [{ number: blockNum, hash, time }, ...prev];
      return newBlocks.slice(0, 5);
    });

    setStats(prev => ({
      ...prev,
      currentBlock: prev.currentBlock + 1
    }));
    
    setCurrentHash(generateHash());
    setCurrentNonce(generateNonce());
  }, [stats.currentBlock]);

  const simulateMining = useCallback(() => {
    if (!isMining) return;

    setStats(prev => {
      const newStats = { ...prev };
      newStats.attempts++;
      if (Math.random() < 0.1) {
        newStats.shares++;
        newStats.balance += 0.01;
      }
      newStats.hashrate = Math.random() * 5 + 8;
      return newStats;
    });

    setCurrentHash(prev => animateString(prev, 0.05));
    setCurrentNonce(prev => animateString(prev, 0.1));

    if (Math.random() < 0.02) {
      addFoundBlock();
    }
  }, [isMining, addFoundBlock]);

  useEffect(() => {
    if (isMining) {
      const interval = setInterval(simulateMining, 200);
      return () => clearInterval(interval);
    }
  }, [isMining, simulateMining]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
