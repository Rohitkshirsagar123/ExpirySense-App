import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable,Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

export default function NotificationsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;

  const [notifications, setNotifications] = useState([]);

  const loadDeliveredNotifications = async () => {
    try {
      const list = await Notifications.getPresentedNotificationsAsync();

      // Show only notifications that have real title/body
      const filtered = (list || []).filter(
        (item) =>
          item?.request?.content?.title ||
          item?.request?.content?.body
      );

      // Sort newest first
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      setNotifications(filtered);
    } catch (error) {
      console.log("Error loading delivered notifications:", error);
      setNotifications([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDeliveredNotifications();
    }, [])
  );

  const renderItem = ({ item }) => {
    const content = item.request?.content ?? {};
    const title = content.title || "";
    const body = content.body || "";

    const date =
      item.date instanceof Date
        ? item.date
        : item.date
        ? new Date(item.date)
        : null;

    const dateLabel =
      date && !isNaN(date.getTime())
        ? `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "";

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.surface : "#F8FAFC",
            borderColor: isDark
              ? "rgba(148,163,184,0.35)"
              : "rgba(148,163,184,0.18)",
          },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isDark
                ? "rgba(37,99,235,0.18)"
                : "rgba(59,130,246,0.12)",
            },
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.primary}
          />
        </View>

        <View style={styles.content}>
          {!!title && (
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
          )}

          {!!body && (
            <Text
              style={[styles.body, { color: colors.textSecondary }]}
            >
              {body}
            </Text>
          )}

          {!!dateLabel && (
            <Text
              style={[styles.date, { color: colors.textTertiary }]}
            >
              {dateLabel}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <LinearGradient
        colors={
          isDark ? ["#0F172A", "#1a2a4a"] : ["#5B40F5", "#A16EFF"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              Your recent reminders
            </Text>
          </View>

          <View style={{ width: 32 }} />
        </View>
      </LinearGradient>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="notifications-off-outline"
            size={42}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.emptyText,
              { color: colors.textSecondary },
            ]}
          >
            No notifications yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) =>
            item.request?.identifier ?? String(index)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    paddingRight: 8,
    paddingVertical: 4,
  },

  headerTextGroup: {
    flex: 1,
    marginLeft: 6,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  card: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  body: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },

  date: {
    fontSize: 11,
    opacity: 0.6,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
});