
export interface Block {
  number: string;
  hash: string;
  time: string;
  miner: {
    username: string;
    reward: number;
  };
}

export interface MiningResult {
  nonce: number;
  hash: string;
}

export interface TelegramUser {
  id: number;
  username: string;
  first_name: string;
}
