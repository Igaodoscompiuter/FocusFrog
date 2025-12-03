
/**
 * @fileoverview
 * Centralized configuration for the notification system.
 * This file makes it easy to tweak the behavior of notifications without
 * digging into multiple component or context files.
 */

interface NotificationConfig {
    // The maximum number of notification toasts that can be visible at once.
    maxVisible: number;

    // The minimum number of total notifications (visible + queued) required
    // before the "Clear All" button is displayed.
    minForClearAll: number;

    // Default duration in milliseconds for a notification to be visible
    // before it automatically dismisses.
    defaultDuration: number;
}

export const notificationConfig: NotificationConfig = {
    maxVisible: 1,
    minForClearAll: 3,
    defaultDuration: 2500, // Duração de 2.5 segundos
};
