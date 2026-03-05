import {
  scheduleLocalNotification,
} from "./notificationService";
import { requestNotificationPermissionsIfNeeded } from "./notificationService";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REMINDER_TIME, formatReminderTime, getReminderTrigger } from "../config/reminderConfig";
import authApiService from "./authApiService";

const BACKEND_URL = "http://192.168.31.199:3000";
const DAILY_CHECK_NOTIFICATION_ID = "daily-reminder-check";
const SHOWN_NOTIFICATIONS_KEY = "shown_notifications_today";

// Get today's date string for tracking
function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get already shown notifications for today
async function getShownNotificationsForToday() {
  try {
    const data = await AsyncStorage.getItem(SHOWN_NOTIFICATIONS_KEY);
    if (!data) return { date: getTodayDateString(), notifications: [] };
    
    const parsed = JSON.parse(data);
    
    // Reset if it's a new day
    if (parsed.date !== getTodayDateString()) {
      return { date: getTodayDateString(), notifications: [] };
    }
    
    return parsed;
  } catch (error) {
    return { date: getTodayDateString(), notifications: [] };
  }
}

// Save shown notifications for today
async function saveShownNotificationsForToday(notificationIds) {
  try {
    const data = {
      date: getTodayDateString(),
      notifications: notificationIds,
    };
    await AsyncStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(data));
  } catch (error) {
  }
}

// Schedule daily check  - BUT ONLY ONCE
let dailyCheckScheduled = false;

export async function scheduleDailyReminderCheck() {
  try {
    // Prevent scheduling multiple times
    if (dailyCheckScheduled) {
      return;
    }

    // Cancel any existing daily check first
    try {
      await Notifications.cancelScheduledNotificationAsync(DAILY_CHECK_NOTIFICATION_ID);
    } catch (e) {
      // Notification didn't exist yet, that's fine
    }

    // Schedule new daily check using dynamic time from config
    // NOTE: This notification is SILENT - user won't see it, just triggers the check
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: DAILY_CHECK_NOTIFICATION_ID,
      content: {
        title: "Daily Reminder Check",
        body: "Checking for document reminders...",
        data: { isReminderCheck: true },
        // Make this notification SILENT - don't show to user
        sound: null,
        priority: "default",
        _displayInForeground: false,
      },
      trigger: getReminderTrigger(),
    });

    dailyCheckScheduled = true;
    return notificationId;
  } catch (error) {
  }
}

// Check for notifications that should show TODAY
export async function checkAndShowNotificationsForToday(documents, reminderSettings, userId) {
  if (!userId || !Array.isArray(documents)) {
    return;
  }

  try {
    // Call backend to check which documents need notifications TODAY
    
    // Get the Bearer token
    const token = await authApiService.getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/notifications/check-notifications`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        documents,
        reminderSettings,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return;
    }

    const notifications = result.notifications || [];

    if (notifications.length === 0) {
      return;
    }

    // Get already shown notifications for today
    const shownData = await getShownNotificationsForToday();
    const shownNotificationIds = shownData.notifications;

    // Request permissions if needed
    const hasPermission = await requestNotificationPermissionsIfNeeded();
    if (!hasPermission) {
      return;
    }

    // Track which ones we're showing
    const newShownIds = [...shownNotificationIds];
    let shownCount = 0;

    // Show each notification immediately
    for (const notification of notifications) {
      const notifId = `${notification.documentId}-${notification.offsetKey}`;
      
      // Always show notification when trigger fires
      await scheduleLocalNotification({
        title: notification.title,
        body: notification.body,
        date: new Date(Date.now() + 1000), // Show in 1 second
        data: {
          documentId: notification.documentId,
          offsetKey: notification.offsetKey,
        },
      });

      newShownIds.push(notifId);
      shownCount++;
    }
    
    // Save which ones we've shown
    if (shownCount > 0) {
      await saveShownNotificationsForToday(newShownIds);
    }
  } catch (error) {
  }
}

export async function scheduleRemindersForDocuments(
  documents,
  reminderSettings,
  userId
) {
  if (!userId || !Array.isArray(documents)) return;

  try {
    // Check and show notifications for TODAY
    await checkAndShowNotificationsForToday(documents, reminderSettings, userId);
    
    // Also schedule the daily check if not already scheduled
    await scheduleDailyReminderCheck();

  } catch (error) {
  }
}

export async function rescheduleRemindersForUser(documents, reminderSettings, userId) {
  if (!userId || !Array.isArray(documents)) return;

  try {
    // Only schedule the daily check - DO NOT show notifications automatically
    // Notifications will show when the scheduled time triggers (via listeners)
    await scheduleDailyReminderCheck();

  } catch (error) {
  }
}
