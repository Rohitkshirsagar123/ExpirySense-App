import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "reminderSettings";

const defaultSettings = {
  remindersEnabled: true,
  days: {
    d30: true,
    d7: true,
    d1: true,
    onExpiry: true,
  },
};

export async function getReminderSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSettings;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      days: {
        ...defaultSettings.days,
        ...(parsed.days || {}),
      },
    };
  } catch (error) {
    console.log("Error loading reminder settings:", error);
    return defaultSettings;
  }
}

export async function saveReminderSettings(settings) {
  try {
    const merged = {
      ...defaultSettings,
      ...settings,
      days: {
        ...defaultSettings.days,
        ...(settings.days || {}),
      },
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.log("Error saving reminder settings:", error);
    return settings;
  }
}

