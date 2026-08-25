/**
 * Daily Edition Local Notification Scheduler Service (expo-notifications wrapper)
 */

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

/**
 * Requests local notification permissions from the operating system.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Notifications permission request unavailable on this device/environment', error);
    return false;
  }
}

/**
 * Schedules a recurring daily notification for the specified time (e.g. 08:00 AM).
 */
export async function scheduleDailyEditionNotification(
  hour: number = 8,
  minute: number = 0
): Promise<string | null> {
  try {
    const Notifications = require('expo-notifications');

    // Configure foreground notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Cancel existing scheduled notifications before rescheduling
    await Notifications.cancelAllScheduledNotificationsAsync();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🗞️ המוסף היומי של היום מוכן!',
        body: 'הסודוקו, השחור ופתור והמיני-תשחץ החדשים מחכים לך. שמור על הרצף!',
        sound: true,
        data: { screen: 'home' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.warn('Failed to schedule daily notification', error);
    return null;
  }
}

/**
 * Cancels all pending local scheduled notifications.
 */
export async function cancelDailyEditionNotifications(): Promise<void> {
  try {
    const Notifications = require('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Failed to cancel notifications', error);
  }
}

/**
 * Checks if any daily notification is currently scheduled.
 */
export async function isNotificationScheduled(): Promise<boolean> {
  try {
    const Notifications = require('expo-notifications');
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length > 0;
  } catch (error) {
    return false;
  }
}
