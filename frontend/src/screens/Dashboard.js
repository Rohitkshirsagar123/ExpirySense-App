import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Text, Pressable, RefreshControl, Alert } from "react-native";
import Header from "../components/dashboardHeader";
import DocumentCard from "../components/DocumentCard";
import documentService from "../services/documentService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { getReminderSettings } from "../services/reminderSettingsService";
import { rescheduleRemindersForUser, checkAndShowNotificationsForToday } from "../services/reminderService";
import * as Notifications from "expo-notifications";
import { debugShowAllScheduledNotifications } from "../services/notificationService";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDocuments } from "../context/DocumentsContext";
import authApiService from "../services/authApiService";

// Global check to prevent duplicate notification checks within 5 seconds
let lastCheckTime = 0;
const DEBOUNCE_TIME = 5000; // 5 seconds - prevent duplicate checks

function Section({ title, items, color, icon, theme, onDelete }) {
  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={18} color={color} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        </View>
        <Text style={[styles.sectionCount, { color: theme.colors.textTertiary }]}>({items.length})</Text>
      </View>

      <View style={styles.sectionList}>
        {items.map((item) => (
          <DocumentCard key={item.id} item={item} onDelete={onDelete} />
        ))}
      </View>
    </View>
  );
}

function Dashboard({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { allDocuments, setAllDocuments } = useDocuments();

  const [notificationCount, setNotificationCount] = useState(0);
  const [authReady, setAuthReady] = useState(false);

  // Fetch documents and delivered notification count when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadDocuments();
      refreshDeliveredNotificationCount();

      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  useEffect(() => {
    // Load documents on component mount
    const initializeAuth = async () => {
      const userData = await authApiService.getCurrentUser();
      if (userData) {
        setAuthReady(true);
        loadDocuments(); // Call loadDocuments only after auth state is ready
      } else {
        setAuthReady(false);
        setAllDocuments([]);
      }
    };
    initializeAuth();

    // Foreground listener - when app is open
    let checkInProgress = false;
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      // Check if this is the daily reminder check notification
      if (notification.request.content.data?.isReminderCheck) {
        // Prevent multiple simultaneous checks from BOTH listeners (debounce)
        const now = Date.now();
        if (now - lastCheckTime < DEBOUNCE_TIME) {
          return;
        }
        lastCheckTime = now;
        
        // Prevent multiple simultaneous checks
        if (checkInProgress) {
          return;
        }
        
        // Trigger reminder check - FETCH FRESH DOCUMENTS FROM BACKEND
        checkInProgress = true;
        (async () => {
          try {
            const userData = await authApiService.getCurrentUser();
            const userId = userData?.uid;
            
            if (!userId) {
              return;
            }
            
            const BACKEND_URL = "http://192.168.31.199:3000";
            const token = await authApiService.getAuthToken();
            const headers = {
              'Content-Type': 'application/json',
            };
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${BACKEND_URL}/api/documents/${userId}`, {
              headers: headers,
            });
            const result = await response.json();
            
            if (result.success && result.documents.length > 0) {
              const settings = await getReminderSettings();
              await checkAndShowNotificationsForToday(result.documents, settings, userId);
            }
          } catch (error) {
          } finally {
            checkInProgress = false;
          }
        })();
      }
      
      // Also count delivered notifications
      refreshDeliveredNotificationCount();
    });

    // Background listener - when app is backgrounded/closed
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const notification = response.notification;
      
      // Handle daily reminder check notification
      if (notification.request.content.data?.isReminderCheck) {
        // Prevent duplicate checks from BOTH listeners (debounce)
        const now = Date.now();
        if (now - lastCheckTime < DEBOUNCE_TIME) {
          return;
        }
        lastCheckTime = now;
        
        // Trigger reminder check when app opens
        (async () => {
          try {
            const userData = await authApiService.getCurrentUser();
            const userId = userData?.uid;
            
            if (!userId) return;
            
            const BACKEND_URL = "http://192.168.31.199:3000";
            const token = await authApiService.getAuthToken();
            const headers = {
              'Content-Type': 'application/json',
            };
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${BACKEND_URL}/api/documents/${userId}`, {
              headers: headers,
            });
            const result = await response.json();
            
            if (result.success && result.documents.length > 0) {
              const settings = await getReminderSettings();
              await checkAndShowNotificationsForToday(result.documents, settings, userId);
            }
          } catch (error) {
          }
        })();
      }
    });

    return () => {
      foregroundSubscription.remove(); // Cleanup foreground listener
      responseSubscription.remove(); // Cleanup background listener
    };
  }, []);

  const loadDocuments = async () => {
    try {
      const userData = await authApiService.getCurrentUser();
      const userId = userData?.uid;

      if (!userId) {
        setAllDocuments([]);
        return;
      }

      // Try backend API first
      const BACKEND_URL = "http://192.168.31.199:3000";
      try {
        const token = await authApiService.getAuthToken();
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BACKEND_URL}/api/documents/${userId}`, {
          headers: headers,
          timeout: 5000,
        });
        const result = await response.json();

        if (result.success) {
          setAllDocuments(result.documents);

          // Cache the documents for the current user
          const cacheKey = `cachedDocuments_${userId}`;
          await AsyncStorage.setItem(cacheKey, JSON.stringify(result.documents));

          // Keep reminders in sync when dashboard refreshes
          const settings = await getReminderSettings();
          await rescheduleRemindersForUser(result.documents, settings, userId);
          return;
        }
      } catch (backendError) {
        // Backend not available, fall back to direct Firebase
      }

      // Fallback to direct Firebase if backend fails
      const result = await documentService.getDocuments(userId);

      if (result.success) {
        setAllDocuments(result.documents);

        // Cache the documents for the current user
        const cacheKey = `cachedDocuments_${userId}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(result.documents));

        // Keep reminders in sync when dashboard refreshes
        const settings = await getReminderSettings();
        await rescheduleRemindersForUser(result.documents, settings, userId);
      } else {
        setAllDocuments([]);
      }
    } catch (err) {
      setAllDocuments([]);
    }
  };

  const refreshDeliveredNotificationCount = async () => {
    try {
      const list = await Notifications.getPresentedNotificationsAsync();

      // Filter out system notifications and duplicates
      const uniqueNotifications = list.filter(
        (item, index, self) => {
          const isAppNotification = !item?.request?.identifier?.startsWith("expo-notifications://foreign_notifications");
          const isUnique =
            item?.request?.identifier &&
            self.findIndex((n) => n?.request?.identifier === item?.request?.identifier) === index;
          return isAppNotification && isUnique;
        }
      );

      setNotificationCount(uniqueNotifications.length || 0);
    } catch (error) {
      setNotificationCount(0);
    }
  };

  // Clear cache when user logs out or changes
  const clearCache = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const cacheKey = `cachedDocuments_${userId}`;
        await AsyncStorage.removeItem(cacheKey);
      }
    } catch (err) {
    }
  };

  // Calculate status from expiryDate (DD/MM/YYYY format)
  const getCalculatedStatus = (expiryDate) => {
    const [day, month, year] = expiryDate.split("/").map(Number);
    const expDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = expDate - today;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (days < 0) return "Expired";
    if (days <= 7) return "Expiring Soon";
    return "Safe";
  };

  const expired = allDocuments.filter((d) => getCalculatedStatus(d.expiryDate) === "Expired");
  const expiring = allDocuments.filter((d) => getCalculatedStatus(d.expiryDate) === "Expiring Soon");
  const safe = allDocuments.filter((d) => getCalculatedStatus(d.expiryDate) === "Safe");

  const handleAddDocument = () => {
    navigation.navigate("AddDocument");
  };

  // Define the onRefresh function
  const onRefresh = async () => {
    await loadDocuments();
  };

  // Handle document deletion
  const handleDeleteDocument = async (docId) => {
    try {
      const BACKEND_URL = "http://192.168.31.199:3000";
      const token = await authApiService.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/api/documents/${docId}`, {
        method: 'DELETE',
        headers: headers,
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setAllDocuments(allDocuments.filter(doc => doc.id !== docId));
        // Optional: Show success message
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      alert('Error deleting document: ' + error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        total={allDocuments.length}
        needAction={expired.length + expiring.length}
        safe={safe.length}
        notificationCount={notificationCount}
        onNotificationsPress={() => navigation.navigate("Notifications")}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Section
            title="Expired"
            items={expired}
            color={colors.error}
            icon="warning-outline"
            theme={theme}
            onDelete={handleDeleteDocument}
          />
          <Section
            title="Expiring Soon"
            items={expiring}
            color={colors.warning}
            icon="time-outline"
            theme={theme}
            onDelete={handleDeleteDocument}
          />
          <Section
            title="Safe Documents"
            items={safe}
            color={colors.success}
            icon="shield-checkmark-outline"
            theme={theme}
            onDelete={handleDeleteDocument}
          />
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("AddDocument")}
      >
        <View style={styles.fabInner}>
          <Ionicons name="add" size={28} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  section: { marginBottom: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { marginLeft: 8, fontSize: 16, fontWeight: "700" },
  sectionCount: { fontSize: 13 },
  sectionList: {},
  fab: { position: "absolute", right: 20, bottom: 28 },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7B2FF7",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});