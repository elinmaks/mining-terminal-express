
export interface MinerShare {
  userId: string;
  username: string;
  shares: number;
  hashrate: number;
  lastSeen: number;
}

export interface BlockReward {
  main: number;    // Основная награда
  shares: number;  // Награда за шары
}

export interface Block {
  number: string;
  hash: string;
  previousHash: string;
  time: string;
  timestamp: number;
  difficulty: number;
  miner: {
    username: string;
    reward: number;
  };
  shares: { [userId: string]: number };
  totalShares: number;
  rewards: BlockReward;
}

export interface MiningResult {
  nonce: number;
  hash: string;
  isShare?: boolean;
}

export interface TelegramUser {
  id: number;
  username: string;
  first_name: string;
}

export interface NetworkStats {
  totalHashrate: number;
  activeMiners: number;
  currentDifficulty: number;
  targetBlockTime: number;
  averageBlockTime: number;
}
