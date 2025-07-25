import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { getQueueStatus, forceSyncQueue } from '../tracking/queue';

export interface UseOfflineResult {
  isOnline: boolean;
  queueSize: number;
  syncQueue: () => Promise<void>;
}

export function useOffline(): UseOfflineResult {
  const [isOnline, setIsOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    checkNetworkStatus();

    let removeListener: (() => void) | undefined;
    
    Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
    }).then(listener => {
      removeListener = () => listener.remove();
    });

    const interval = setInterval(() => {
      const status = getQueueStatus();
      setQueueSize(status.size);
    }, 5000);

    return () => {
      if (removeListener) removeListener();
      clearInterval(interval);
    };
  }, []);

  const checkNetworkStatus = async () => {
    const status = await Network.getStatus();
    setIsOnline(status.connected);
  };

  const syncQueue = async () => {
    await forceSyncQueue();
    const status = getQueueStatus();
    setQueueSize(status.size);
  };

  return {
    isOnline,
    queueSize,
    syncQueue,
  };
}