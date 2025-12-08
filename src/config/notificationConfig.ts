
/**
 * @fileoverview
 * Centralized configuration for the notification system.
 */

interface NotificationConfig {
    // The maximum number of notification toasts that can be visible at once.
    maxVisible: number;

    // The minimum number of total notifications (visible + queued) required
    // before the "Clear All" button is displayed.
    minForClearAll: number;

    // Default duration in milliseconds for a notification to be visible.
    defaultDuration: number;
    
    // Duration in milliseconds when there are many notifications in the queue.
    fastDuration: number;

    // The number of notifications in the queue that triggers the fast duration.
    fastThreshold: number;
}

export const notificationConfig: NotificationConfig = {
    maxVisible: 1,
    minForClearAll: 3, // Logic is now handled in UIContext for show/hide hysteresis
    defaultDuration: 2200, // Um pouco mais rápido que o original
    fastDuration: 1000,    // Rápido quando a fila está grande
    fastThreshold: 5,      // Acima de 5 notificações, a velocidade aumenta
};
