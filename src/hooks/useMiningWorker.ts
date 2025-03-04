
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Block } from '@/types/mining';

interface UseMiningWorkerProps {
  isMining: boolean;
  difficulty: number;
  lastBlock: Block | null;
  onShare: () => void;
  onMiningProgress: (data: {
    hash: string;
    nonce: number;
    hashrate: number;
    totalHashrate: number;
  }) => void;
  onBlockFound: (data: {
    hash: string;
    nonce: number;
  }) => void;
}

export interface UseMiningWorkerReturn {
  currentHash: string;
  currentNonce: string;
  currentHashrate: number;
  startMining: () => void;
  stopMining: () => void;
}

export const useMiningWorker = ({
  isMining,
  difficulty,
  lastBlock,
  onShare,
  onMiningProgress,
  onBlockFound
}: UseMiningWorkerProps): UseMiningWorkerReturn => {
  const [currentHash, setCurrentHash] = useState('');
  const [currentNonce, setCurrentNonce] = useState('0');
  const [currentHashrate, setCurrentHashrate] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  const startMining = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/miningWorker.ts', import.meta.url), {
        type: 'module'
      });
    }
    
    const data = lastBlock 
      ? `${lastBlock.hash}${lastBlock.number}`
      : '0'.repeat(64);

    workerRef.current.postMessage({
      type: 'start',
      data,
      difficulty
    });
  }, [difficulty, lastBlock]);

  const stopMining = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setCurrentHash('');
      setCurrentNonce('0');
      setCurrentHashrate(0);
    }
  }, []);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/miningWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, nonce, hash, hashrate, totalHashrate } = e.data;
      
      if (type === 'progress') {
        setCurrentHash(hash || '');
        setCurrentNonce(nonce.toString());
        setCurrentHashrate(hashrate);
        onMiningProgress({
          hash: hash || '',
          nonce,
          hashrate,
          totalHashrate
        });
      }
      
      if (type === 'share') {
        onShare();
      }
      
      if (type === 'success') {
        onBlockFound({
          hash,
          nonce
        });

        if (isMining) {
          startMining();
        }
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isMining, onBlockFound, onMiningProgress, onShare, startMining]);

  useEffect(() => {
    if (isMining) {
      startMining();
    } else {
      stopMining();
    }
  }, [isMining, startMining, stopMining]);

  return {
    currentHash,
    currentNonce,
    currentHashrate,
    startMining,
    stopMining
  };
};
