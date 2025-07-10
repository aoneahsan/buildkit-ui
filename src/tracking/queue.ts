import type { QueueItem, QueueConfig } from './types';
import { BuildKitUI } from '../index';

const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  maxSize: 1000,
  syncInterval: 60000, // 1 minute
  maxRetries: 3,
  persistQueue: true,
  priorityOrder: true,
};

let queue: QueueItem[] = [];
let queueConfig: QueueConfig = DEFAULT_QUEUE_CONFIG;
let syncTimer: NodeJS.Timeout | null = null;
let isSyncing = false;

/**
 * Initialize the offline queue
 */
export async function initializeQueue(config?: Partial<QueueConfig>): Promise<void> {
  queueConfig = { ...DEFAULT_QUEUE_CONFIG, ...config };
  
  // Load persisted queue if enabled
  if (queueConfig.persistQueue) {
    await loadPersistedQueue();
  }

  // Start sync timer
  startSyncTimer();
}

/**
 * Add item to queue
 */
export function addToQueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
  const queueItem: QueueItem = {
    ...item,
    id: generateQueueItemId(),
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(queueItem);

  // Sort by priority if enabled
  if (queueConfig.priorityOrder) {
    sortQueueByPriority();
  }

  // Trim queue if exceeds max size
  if (queue.length > queueConfig.maxSize) {
    queue = queue.slice(-queueConfig.maxSize);
  }

  // Persist queue if enabled
  if (queueConfig.persistQueue) {
    persistQueue();
  }
}

/**
 * Process queue items
 */
export async function processQueue(): Promise<{ processed: number; failed: number }> {
  if (isSyncing || queue.length === 0) {
    return { processed: 0, failed: 0 };
  }

  isSyncing = true;
  let processed = 0;
  let failed = 0;

  const itemsToProcess = [...queue];
  queue = [];

  for (const item of itemsToProcess) {
    try {
      await processQueueItem(item);
      processed++;
    } catch (error) {
      failed++;
      
      // Retry if under max retries
      if (item.retryCount < queueConfig.maxRetries) {
        item.retryCount++;
        queue.push(item);
      }
    }
  }

  isSyncing = false;

  // Persist updated queue
  if (queueConfig.persistQueue) {
    await persistQueue();
  }

  return { processed, failed };
}

/**
 * Process a single queue item
 */
async function processQueueItem(item: QueueItem): Promise<void> {
  switch (item.type) {
    case 'event':
      await BuildKitUI.trackEvent(item.data);
      break;
    case 'error':
      await BuildKitUI.trackError(item.data);
      break;
    case 'performance':
      await BuildKitUI.trackEvent({
        eventName: 'performance_metric',
        parameters: item.data,
      });
      break;
    default:
      throw new Error(`Unknown queue item type: ${item.type}`);
  }
}

/**
 * Sort queue by priority
 */
function sortQueueByPriority(): void {
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  
  queue.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by timestamp (older first)
    return a.timestamp - b.timestamp;
  });
}

/**
 * Start sync timer
 */
function startSyncTimer(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
  }

  syncTimer = setInterval(async () => {
    const status = await BuildKitUI.getOfflineQueueStatus();
    if (!status.isSyncing && queue.length > 0) {
      await processQueue();
    }
  }, queueConfig.syncInterval);
}

/**
 * Stop sync timer
 */
export function stopSyncTimer(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

/**
 * Load persisted queue from storage
 */
async function loadPersistedQueue(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const stored = localStorage.getItem('buildkit_queue');
      if (stored) {
        queue = JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Failed to load persisted queue:', error);
  }
}

/**
 * Persist queue to storage
 */
async function persistQueue(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.setItem('buildkit_queue', JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Failed to persist queue:', error);
  }
}

/**
 * Clear the queue
 */
export function clearQueue(): void {
  queue = [];
  if (queueConfig.persistQueue) {
    persistQueue();
  }
}

/**
 * Get queue status
 */
export function getQueueStatus(): {
  size: number;
  isProcessing: boolean;
  oldestItem?: number;
} {
  return {
    size: queue.length,
    isProcessing: isSyncing,
    oldestItem: queue[0]?.timestamp,
  };
}

/**
 * Generate queue item ID
 */
function generateQueueItemId(): string {
  return `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Force sync queue
 */
export async function forceSyncQueue(): Promise<{ processed: number; failed: number }> {
  return await processQueue();
}