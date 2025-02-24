
import { memo } from 'react';

interface Stats {
  balance: number;
  hashrate: number;
  shares: number;
  attempts: number;
}

interface NetworkStats {
  totalHashrate: number;
  activeMiners: number;
  difficulty: number;
  currentBlock: number;
}

interface MiningStatsProps {
  personalStats: Stats;
  networkStats: NetworkStats;
}

const MiningStats = memo(({ personalStats, networkStats }: MiningStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="glass-panel p-4 rounded-lg">
        <div className="terminal-text text-terminal-text">
          <div className="mb-2">Your Stats:</div>
          <div>Balance: <span className="text-terminal-hash">{personalStats.balance.toFixed(2)}</span> tokens</div>
          <div>Hashrate: <span className="text-terminal-nonce">{personalStats.hashrate.toFixed(2)}</span> MH/s</div>
          <div>Shares: <span className="text-terminal-rate">{personalStats.shares}</span></div>
          <div>Attempts: <span className="text-terminal-text">{personalStats.attempts}</span></div>
        </div>
      </div>
      
      <div className="glass-panel p-4 rounded-lg">
        <div className="terminal-text text-terminal-text">
          <div className="mb-2">Network Stats:</div>
          <div>Total Hashrate: <span className="text-terminal-hash">{networkStats.totalHashrate.toFixed(2)}</span> MH/s</div>
          <div>Active Miners: <span className="text-terminal-nonce">{networkStats.activeMiners}</span></div>
          <div>Difficulty: <span className="text-terminal-rate">{networkStats.difficulty}</span></div>
          <div>Current Block: <span className="text-terminal-text">0x{networkStats.currentBlock.toString(16)}</span></div>
        </div>
      </div>
    </div>
  );
});

MiningStats.displayName = 'MiningStats';
export default MiningStats;
