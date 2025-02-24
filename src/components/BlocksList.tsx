
import { memo } from 'react';

interface Block {
  number: string;
  hash: string;
  time: string;
}

interface BlocksListProps {
  blocks: Block[];
}

const BlocksList = memo(({ blocks }: BlocksListProps) => {
  return (
    <div className="glass-panel p-4 rounded-lg h-[200px] overflow-y-auto terminal-text">
      <div className="mb-2">Found Blocks:</div>
      {blocks.map((block, index) => (
        <div key={index} className="text-terminal-text mb-1">
          <span className="text-terminal-nonce">#{block.number}</span>{' '}
          <span className="text-terminal-hash">{block.hash.substring(0, 32)}...</span>{' '}
          <span className="opacity-50">{block.time}</span>
        </div>
      ))}
    </div>
  );
});

BlocksList.displayName = 'BlocksList';
export default BlocksList;
