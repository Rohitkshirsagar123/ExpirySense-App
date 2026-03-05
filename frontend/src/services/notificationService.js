import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Global notification handler (foreground behavior) 
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Check if this is the daily reminder check notification - if so, don't show it
    const isReminderCheck = notification.request.content.data?.isReminderCheck === true;
    
    if (isReminderCheck) {
      // Silent notification - process in background but don't display to user
      return {
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
    
    // For all other notifications (actual expiring document notifications) - show them!
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export async function requestNotificationPermissionsIfNeeded() {
  try {
    const settings = await Notifications.getPermissionsAsync();
    
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) {
      return true;
    }

    const result = await Notifications.requestPermissionsAsync();
    
    return result.granted || result.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
  } catch (error) {
    return false;
  }
}

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  try {
    await Notifications.setNotificationChannelAsync("expirysense-reminders", {
      name: "ExpirySense Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  } catch (error) {
  }
}

export async function scheduleLocalNotification({ title, body, date, data }) {
  try {
    await ensureAndroidNotificationChannel();

    const triggerDate =
      date instanceof Date ? date : new Date(date);

    if (isNaN(triggerDate.getTime())) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        data: {
          ...data,
          screen: "Notifications",
        },
      },
      trigger: {
        type: "date",
        date: triggerDate,
        channelId:
          Platform.OS === "android"
            ? "expirysense-reminders"
            : undefined,
      },
    });

    return notificationId;
  } catch (error) {
    return null;
  }
}

export async function cancelScheduledNotification(notificationId) {
  try {
    if (!notificationId) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
  }
}

export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
  }
}

export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    return [];
  }
}


