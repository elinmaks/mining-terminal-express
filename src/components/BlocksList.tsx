
import { memo } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { haptic } from '@/utils/telegram';
import type { Block } from '@/types/mining';

interface BlocksListProps {
  blocks: Block[];
}

const BlocksList = memo(({ blocks }: BlocksListProps) => {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const handleBlockClick = (block: Block) => {
    haptic.impact('medium');
    setSelectedBlock(block);
  };

  return (
    <>
      <div className="glass-panel p-4 rounded-lg h-[200px] overflow-y-auto terminal-text">
        <div className="mb-2">Found Blocks:</div>
        {blocks.map((block, index) => (
          <div 
            key={index} 
            className="text-terminal-text mb-1 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
            onClick={() => handleBlockClick(block)}
          >
            <span className="text-terminal-nonce">#{block.number}</span>{' '}
            <span className="text-terminal-hash">{block.hash.substring(0, 32)}...</span>{' '}
            <span className="text-terminal-rate">+{block.miner.reward} ({block.miner.username})</span>{' '}
            <span className="opacity-50">{block.time}</span>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
        <DialogContent className="glass-panel sm:max-w-[425px]">
          {selectedBlock && (
            <div className="text-terminal-text">
              <h3 className="text-lg font-semibold mb-4">Block Details</h3>
              <div className="space-y-2">
                <p>Number: <span className="text-terminal-nonce">#{selectedBlock.number}</span></p>
                <p>Hash: <span className="text-terminal-hash break-all">{selectedBlock.hash}</span></p>
                <p>Previous Hash: <span className="text-terminal-hash break-all">{selectedBlock.previousHash}</span></p>
                <p>Time: <span>{selectedBlock.time}</span></p>
                <p>Difficulty: <span className="text-terminal-nonce">{selectedBlock.difficulty}</span></p>
                <p>Miner: <span className="text-terminal-rate">{selectedBlock.miner.username}</span></p>
                <p>Reward: <span className="text-terminal-rate">{selectedBlock.miner.reward}</span></p>
                <p>Total Shares: <span>{selectedBlock.totalShares}</span></p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

BlocksList.displayName = 'BlocksList';
export default BlocksList;
