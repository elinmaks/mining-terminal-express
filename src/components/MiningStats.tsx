import { memo, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { haptic } from '@/utils/telegram';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
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
  currentBlock: string;
}
interface MiningStatsProps {
  personalStats: Stats;
  networkStats: NetworkStats;
  user: {
    username: string;
    first_name: string;
    registered_at?: string;
  } | null;
}
const MiningStats = memo(({
  personalStats,
  networkStats,
  user
}: MiningStatsProps) => {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const handleUserClick = () => {
    haptic.impact('light');
    setShowUserInfo(true);
  };
  return <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="glass-panel p-4 rounded-lg bg-zinc-950">
          <div className="terminal-text text-terminal-text">
            <div className="mb-2">Your Stats:</div>
            {user && <div className="cursor-pointer hover:opacity-80 transition-opacity mb-2" onClick={handleUserClick}>
                Miner: <span className="text-terminal-nonce">{user.username || user.first_name}</span>
              </div>}
            <div>Balance: <span className="text-terminal-hash">{personalStats.balance.toFixed(2)}</span> tokens</div>
            <div>Hashrate: <span className="text-terminal-nonce">{personalStats.hashrate.toFixed(2)}</span> MH/s</div>
            <div>Shares: <span className="text-terminal-rate">{personalStats.shares}</span></div>
            <div>Attempts: <span className="text-terminal-text">{personalStats.attempts}</span></div>
          </div>
        </div>
        
        <div className="glass-panel p-4 rounded-lg bg-zinc-950">
          <div className="terminal-text text-terminal-text">
            <div className="mb-2">Network Stats:</div>
            <div className="font-normal text-zinc-400">Total Hashrate: <span className="text-terminal-hash">{networkStats.totalHashrate.toFixed(2)}</span> MH/s</div>
            <div>Active Miners: <span className="text-terminal-nonce">{networkStats.activeMiners}</span></div>
            <div className="2">Difficulty: <span className="text-terminal-rate">{networkStats.difficulty}</span></div>
            <div>Current Block: <span className="text-terminal-text">#{networkStats.currentBlock}</span></div>
          </div>
        </div>
      </div>

      <Dialog open={showUserInfo} onOpenChange={setShowUserInfo}>
        <DialogContent className="glass-panel sm:max-w-[425px]">
          {user && <div className="text-terminal-text">
              <h3 className="text-lg font-semibold mb-4">Miner Profile</h3>
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-terminal-hash to-terminal-nonce rounded-full mx-auto flex items-center justify-center text-2xl">
                  {user.first_name[0]}
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold">{user.first_name}</p>
                  {user.username && <p className="text-terminal-nonce">@{user.username}</p>}
                  {user.registered_at && <p className="text-sm opacity-70">
                      Зарегистрирован {formatDistanceToNow(new Date(user.registered_at), {
                  locale: ru,
                  addSuffix: true
                })}
                    </p>}
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </>;
});
MiningStats.displayName = 'MiningStats';
export default MiningStats;