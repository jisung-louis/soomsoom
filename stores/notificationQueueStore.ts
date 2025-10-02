import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface QueuedNotification {
  id: string;
  type: 'ACHIEVEMENT_UNLOCKED' | 'NEWS_UPDATE' | 'MISSION_COMPLETED';
  payload: any;
  timestamp: number;
}

interface NotificationQueueState {
  queue: QueuedNotification[];
  isProcessing: boolean;
  addToQueue: (notification: Omit<QueuedNotification, 'id' | 'timestamp'>) => void;
  processNext: () => QueuedNotification | null;
  clearQueue: () => void;
  setProcessing: (processing: boolean) => void;
}

export const useNotificationQueueStore = create<NotificationQueueState>()(
  devtools(
    (set, get) => ({
      queue: [],
      isProcessing: false,

      addToQueue: (notification) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        set((state) => ({
          queue: [...state.queue, { ...notification, id, timestamp }],
        }));
        
        console.log('📬 알림 큐에 추가:', { id, type: notification.type, queueLength: get().queue.length });
      },

      processNext: () => {
        const { queue, isProcessing } = get();
        if (isProcessing || queue.length === 0) return null;

        const nextNotification = queue[0];
        set((state) => ({
          queue: state.queue.slice(1),
          isProcessing: true,
        }));

        console.log('📤 알림 큐에서 처리:', { id: nextNotification.id, type: nextNotification.type, remainingQueue: get().queue.length });
        return nextNotification;
      },

      clearQueue: () => {
        set({ queue: [], isProcessing: false });
        console.log('🗑️ 알림 큐 초기화');
      },

      setProcessing: (processing) => {
        set({ isProcessing: processing });
      },
    }),
    {
      name: 'notification-queue-store',
    }
  )
);
