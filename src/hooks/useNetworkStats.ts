
import { useState, useCallback, useEffect } from 'react';
import type { NetworkStats } from '@/types/mining';
import { 
  INITIAL_DIFFICULTY, 
  TARGET_BLOCK_TIME 
} from '@/constants/mining';

interface UseNetworkStatsProps {
  activeMiners: Set<string>;
  personalHashrate: number;
  onDifficultyUpdate?: (newDifficulty: number) => void;
}

export interface UseNetworkStatsReturn {
  networkStats: NetworkStats;
  setNetworkStats: React.Dispatch<React.SetStateAction<NetworkStats>>;
  updateDifficulty: (newDifficulty: number) => void;
}

export const useNetworkStats = ({
  activeMiners,
  personalHashrate,
  onDifficultyUpdate
}: UseNetworkStatsProps): UseNetworkStatsReturn => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalHashrate: 0,
    activeMiners: 1,
    currentDifficulty: INITIAL_DIFFICULTY,
    targetBlockTime: TARGET_BLOCK_TIME
  });

  const updateDifficulty = useCallback((newDifficulty: number) => {
    setNetworkStats(prev => ({
      ...prev,
      currentDifficulty: newDifficulty
    }));

    if (onDifficultyUpdate) {
      onDifficultyUpdate(newDifficulty);
    }
  }, [onDifficultyUpdate]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        activeMiners: activeMiners.size,
        totalHashrate: personalHashrate * activeMiners.size
      }));
    }, 30000);

    return () => clearInterval(updateInterval);
  }, [activeMiners, personalHashrate, activeMiners.size]);

  return {
    networkStats,
    setNetworkStats,
    updateDifficulty
  };
};
