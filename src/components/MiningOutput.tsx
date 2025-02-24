import { memo } from 'react';
interface MiningOutputProps {
  nonce: string;
  hash: string;
  hashrate: string;
}
const MiningOutput = memo(({
  nonce,
  hash,
  hashrate
}: MiningOutputProps) => {
  return <div className="glass-panel p-4 rounded-lg mb-4 min-h-[120px] terminal-text bg-zinc-950">
      <div>Mining process started...</div>
      <div className="mt-2">
        nonce: <span className="text-terminal-nonce">{nonce}</span>
      </div>
      <div className="mt-1 break-all">
        hash: <span className="text-terminal-hash">{hash}</span>
      </div>
      <div className="mt-2">
        <span className="text-terminal-rate">mining {hashrate} MH/s</span>
      </div>
    </div>;
});
MiningOutput.displayName = 'MiningOutput';
export default MiningOutput;