import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { requestNotificationPermissionsIfNeeded, ensureAndroidNotificationChannel } from "./src/services/notificationService";
import { scheduleDailyReminderCheck } from "./src/services/reminderService";
import { DocumentsProvider } from "./src/context/DocumentsContext";

// Global navigation ref for deep linking
export const navigationRef = React.createRef();

function MainApp() {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const initNotifications = async () => {
      // Request notification permissions
      await requestNotificationPermissionsIfNeeded();
      
      // Ensure Android notification channel
      await ensureAndroidNotificationChannel();
      
      // IMPORTANT: Schedule the daily reminder check notification
      // This ensures the app checks for document expirations every day
      await scheduleDailyReminderCheck();

      // Handle notification responses (when user taps notification)
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const screen = response.notification.request.content.data?.screen || "Notifications";
        
        if (navigationRef.current) {
          // Navigate to the screen after a small delay to ensure navigation is ready
          setTimeout(() => {
            navigationRef.current.navigate("Notifications");
          }, 100);
        }
      });

      // Handle foreground notifications (when app is open)
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        // You can show a custom alert or toast here if needed
        // console.log("Notification received in foreground:", notification);
      });

      return () => {
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
      };
    };

    initNotifications();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <DocumentsProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <MainApp />
        </SafeAreaProvider>
      </ThemeProvider>
    </DocumentsProvider>
  );
}