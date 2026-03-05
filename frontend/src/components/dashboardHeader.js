import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const BACKEND_URL = "http://192.168.31.199:3000"; // Update with your local IP from ipconfig

function Header({ total, needAction, safe, notificationCount = 0, onNotificationsPress }) {
  const { theme, isDark } = useTheme();

  const handleNotificationPress = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/notificationtesting`);
      const data = await response.json();

      if (data.success) {
        onNotificationsPress && onNotificationsPress();
      } else {
        onNotificationsPress && onNotificationsPress();
      }
    } catch (error) {
      onNotificationsPress && onNotificationsPress();
    }
  };
  const colors = theme.colors;
  return (
    <LinearGradient
      colors={isDark ? ["#0F172A", "#1a2a4a"] : ["#5B40F5", "#A16EFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
        </View>

        <View style={styles.rightIcons}>
          <Pressable
            style={styles.notifIcon}
            onPress={handleNotificationPress}
            android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
          >
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Text>
              </View>
            )}
          </Pressable>
          {/* <View style={styles.settingsIcon}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </View> */}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardBlue, { backgroundColor: isDark ? "#1E3A8A" : "#E0E7FF" }]}>
          <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{total}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Docs</Text>
        </View>

        <View style={[styles.statCard, styles.statCardRed, { backgroundColor: isDark ? "#7F1D1D" : "#FEE4E2" }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{needAction}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Need Action</Text>
        </View>

        <View style={[styles.statCard, styles.statCardGreen, { backgroundColor: isDark ? "#064E3B" : "#DCFCF0" }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{safe}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Safe</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export default Header;

const styles = StyleSheet.create({
  header: {
    paddingTop: 30,
    paddingHorizontal: 18,
    paddingBottom: 28,
    // borderBottomLeftRadius: 28,
    // borderBottomRightRadius: 28,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    backgroundColor: "rgba(255,255,255,0.25)",
    width: 44,
    height: 44,
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(15,23,42,0.5)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: "hidden",
  },

  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  // settingsIcon: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 10,
  //   backgroundColor: "rgba(255,255,255,0.2)",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },

  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
    gap: 8,
  },

  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  statCardBlue: {
    backgroundColor: "#E0E7FF",
  },

  statCardRed: {
    backgroundColor: "#FEE4E2",
  },

  statCardGreen: {
    backgroundColor: "#DCFCF0",
  },

  middleCard: {
    backgroundColor: "rgba(255,255,255,0.26)",
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },

  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
});