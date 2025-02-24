
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
  first_name: string;
  last_name?: string;
  username: string; // Теперь обязательное
  language_code?: string;
  registered_at?: string;
}

export interface NetworkStats {
  totalHashrate: number;
  activeMiners: number;
  currentDifficulty: number;
  targetBlockTime: number;
  averageBlockTime: number;
}
