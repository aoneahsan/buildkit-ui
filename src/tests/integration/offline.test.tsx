import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { BuildKitProvider, Button, useOffline } from '../../index';
import { BuildKitUI } from '../../index';
import type { BuildKitConfig } from '../../definitions';

// Mock BuildKitUI plugin
jest.mock('../../index', () => ({
  ...jest.requireActual('../../index'),
  BuildKitUI: {
    initialize: jest.fn().mockResolvedValue({ success: true }),
    trackEvent: jest.fn().mockResolvedValue({ success: true }),
    getOfflineQueueStatus: jest.fn().mockResolvedValue({ 
      queueSize: 0, 
      oldestEventTime: null 
    }),
    syncOfflineQueue: jest.fn().mockResolvedValue({ success: true }),
    clearOfflineQueue: jest.fn().mockResolvedValue({ success: true }),
  }
}));

const mockConfig: BuildKitConfig = {
  tracking: {
    analytics: { firebase: { enabled: true } }
  },
  offline: {
    enabled: true,
    queueSize: 100,
    syncInterval: 5000,
    persistQueue: true
  }
};

const OfflineTestComponent = () => {
  const { isOnline, queueSize, syncQueue, clearQueue } = useOffline();
  
  return (
    <div data-testid="offline-test">
      <p data-testid="online-status">{isOnline ? 'online' : 'offline'}</p>
      <p data-testid="queue-size">{queueSize}</p>
      <Button label="Test Action" onClick={() => {}} />
      <button onClick={syncQueue}>Sync Queue</button>
      <button onClick={clearQueue}>Clear Queue</button>
    </div>
  );
};

describe('Offline Integration Tests', () => {
  let originalOnLine: boolean;
  
  beforeEach(() => {
    originalOnLine = window.navigator.onLine;
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: originalOnLine
    });
  });

  describe('Offline Detection', () => {
    it('should detect online status', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      });

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('online-status')).toHaveTextContent('online');
      });
    });

    it('should detect offline status', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('online-status')).toHaveTextContent('offline');
      });
    });

    it('should respond to online/offline events', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      });

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      // Initially online
      expect(getByTestId('online-status')).toHaveTextContent('online');

      // Go offline
      act(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        });
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(getByTestId('online-status')).toHaveTextContent('offline');
      });

      // Go back online
      act(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true
        });
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(getByTestId('online-status')).toHaveTextContent('online');
      });
    });
  });

  describe('Offline Queue Management', () => {
    it('should queue events when offline', async () => {
      // Set offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Mock queue status
      (BuildKitUI.getOfflineQueueStatus as jest.Mock).mockResolvedValue({
        queueSize: 0,
        oldestEventTime: null
      });

      const { getByText, getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      // Initially no queued events
      expect(getByTestId('queue-size')).toHaveTextContent('0');

      // Click button while offline
      fireEvent.click(getByText('Test Action'));

      // Mock updated queue status
      (BuildKitUI.getOfflineQueueStatus as jest.Mock).mockResolvedValue({
        queueSize: 1,
        oldestEventTime: Date.now()
      });

      // Force re-render to update queue size
      act(() => {
        window.dispatchEvent(new Event('storage'));
      });

      await waitFor(() => {
        expect(getByTestId('queue-size')).toHaveTextContent('1');
      });
    });

    it('should sync queue when coming online', async () => {
      // Start offline with queued events
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      (BuildKitUI.getOfflineQueueStatus as jest.Mock).mockResolvedValue({
        queueSize: 5,
        oldestEventTime: Date.now() - 60000
      });

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      expect(getByTestId('queue-size')).toHaveTextContent('5');

      // Go online
      act(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true
        });
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(BuildKitUI.syncOfflineQueue).toHaveBeenCalled();
      });
    });

    it('should manually sync queue', async () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Sync Queue'));

      await waitFor(() => {
        expect(BuildKitUI.syncOfflineQueue).toHaveBeenCalled();
      });
    });

    it('should clear queue', async () => {
      (BuildKitUI.getOfflineQueueStatus as jest.Mock).mockResolvedValue({
        queueSize: 10,
        oldestEventTime: Date.now() - 120000
      });

      const { getByText, getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      expect(getByTestId('queue-size')).toHaveTextContent('10');

      fireEvent.click(getByText('Clear Queue'));

      // Mock cleared queue
      (BuildKitUI.getOfflineQueueStatus as jest.Mock).mockResolvedValue({
        queueSize: 0,
        oldestEventTime: null
      });

      await waitFor(() => {
        expect(BuildKitUI.clearOfflineQueue).toHaveBeenCalled();
      });
    });
  });

  describe('Offline UI Indicators', () => {
    it('should show offline banner when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <div>Content</div>
        </BuildKitProvider>
      );

      await waitFor(() => {
        const banner = container.querySelector('.buildkit-offline-banner');
        expect(banner).toBeInTheDocument();
      });
    });

    it('should disable form submissions when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      const onSubmit = jest.fn();
      
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <form onSubmit={onSubmit}>
            <Button type="submit" label="Submit" />
          </form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Submit'));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should persist queue to localStorage', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Test Action'));

      await waitFor(() => {
        const queueData = localStorage.getItem('buildkit-offline-queue');
        expect(queueData).toBeTruthy();
        
        const queue = JSON.parse(queueData!);
        expect(queue).toHaveLength(1);
        expect(queue[0]).toMatchObject({
          eventName: 'button_click',
          componentType: 'Button'
        });
      });
    });

    it('should restore queue from localStorage on init', async () => {
      // Pre-populate localStorage with queued events
      const mockQueue = [
        {
          eventName: 'button_click',
          componentType: 'Button',
          timestamp: Date.now() - 60000,
          parameters: { label: 'Test' }
        },
        {
          eventName: 'form_submit',
          componentType: 'Form',
          timestamp: Date.now() - 30000,
          parameters: { formId: 'test-form' }
        }
      ];

      localStorage.setItem('buildkit-offline-queue', JSON.stringify(mockQueue));

      (BuildKitUI.getOfflineQueueStatus as jest.Mock).mockResolvedValue({
        queueSize: 2,
        oldestEventTime: mockQueue[0].timestamp
      });

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('queue-size')).toHaveTextContent('2');
      });
    });
  });

  describe('Auto Sync', () => {
    jest.useFakeTimers();

    it('should auto-sync at configured intervals', async () => {
      const { unmount } = render(
        <BuildKitProvider config={{
          ...mockConfig,
          offline: {
            ...mockConfig.offline,
            syncInterval: 1000 // 1 second for testing
          }
        }}>
          <OfflineTestComponent />
        </BuildKitProvider>
      );

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(BuildKitUI.syncOfflineQueue).toHaveBeenCalled();
      });

      unmount();
    });

    jest.useRealTimers();
  });
});