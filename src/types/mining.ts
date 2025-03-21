
export interface MinerShare {
  userId: string;
  username: string;
  shares: number;
  hashrate: number;
  lastSeen: number;
}

export interface BlockReward {
  main: number;
  shares: number;
}

export interface Block {
  id: string;
  number: string;  // Формат: 0000001 to 9999999
  hash: string;
  previousHash: string;
  timestamp: number;
  difficulty: 2;
  minerProfileId: string;
  totalShares: number;
  reward: number;
  miner: {
    username: string;
    reward?: number;
    hashrate?: number;
  };
  time?: string;
  shares?: Record<string, number>;
  rewards?: {
    main: number;
    shares: number;
  };
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
  username: string;
  language_code?: string;
}

export interface NetworkStats {
  totalHashrate: number;
  activeMiners: number;
  currentDifficulty: 2;
  targetBlockTime: number;
  averageBlockTime?: number;
}

export interface MinerStats {
  totalBlocksMined: number;
  totalShares: number;
  bestHashrate: number;
  totalReward: number;
  lastShareAt?: string;
}

export interface Balance {
  amount: number;
}

export interface Profile {
  id: string;
  userId: number;
  username: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
}
