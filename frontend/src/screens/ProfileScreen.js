import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import authApiService from "../services/authApiService";
import { useTheme } from "../context/ThemeContext";
import { useDocuments } from "../context/DocumentsContext";

export default function ProfileScreen({ navigation, onLogout }) {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { allDocuments } = useDocuments();
  const expiringCount = useMemo(() => {
    return allDocuments.filter((doc) => {
      const [day, month, year] = doc.expiryDate.split("/").map(Number);
      const expDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeDiff = expDate - today;
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7; // Include today in the expiring count
    }).length;
  }, [allDocuments]);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await authApiService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

   const handleLogout = async () => {
  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel" },
    {
      text: "Logout",
      onPress: async () => {
        await authApiService.logout();
        onLogout();   
      },
    },
  ]);
};

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <LinearGradient
          colors={isDark ? [colors.surface, colors.surfaceAlt] : ["#2563EB", "#7C3AED"]}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={22} color={isDark ? colors.text : "#fff"} />
            </Pressable>

            <Text style={[styles.headerTitle, { color: isDark ? colors.text : "#fff" }]}>My Profile</Text>

            <View style={{ width: 22 }} />
          </View>
        </LinearGradient>

        {/* PROFILE CARD */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface },
            isLandscape && { marginHorizontal: width * 0.15 },
          ]}
        >
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={["#7B2FF7", "#A64FFF"]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>

            <View style={styles.cameraIcon}>
              <Ionicons name="camera-outline" size={14} color="#fff" />
            </View>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>

          <View style={styles.verifiedRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#16A34A"
            />
            <Text style={styles.verifiedText}>Verified Account</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statBoxBlue, { backgroundColor: isDark ? "rgba(167, 139, 250, 0.15)" : "#DBEAFE" }]}>
              <Text style={[styles.statNumberBlue, { color: isDark ? colors.primaryLight : "#2563EB" }]}>{allDocuments.length}</Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : "#6B7280" }]}>Documents</Text>
            </View>

            <View style={[styles.statBoxOrange, { backgroundColor: isDark ? "rgba(217, 119, 6, 0.15)" : "#FFEDD5" }]}>
              <Text style={[styles.statNumberOrange, { color: isDark ? "#D97706" : "#EA580C" }]}>{expiringCount}</Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : "#6B7280" }]}>Expiring</Text>
            </View>

            <View style={[styles.statBoxPurple, { backgroundColor: isDark ? "rgba(196, 181, 253, 0.15)" : "#EDE9FE" }]}>
              <Text style={[styles.statNumberPurple, { color: isDark ? colors.primaryLight : "#7C3AED" }]}>100%</Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : "#6B7280" }]}>Safety Score</Text>
            </View>
          </View>
        </View>

        {/* PERSONAL INFO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textSecondary : "#6B7280" }]}>Personal Information</Text>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <InfoRow
              icon="mail-outline"
              label="Email Address"
              value={user?.email}
              colors={colors}
              isDark={isDark}
            />
            <InfoRow
              icon="person-outline"
              label="Full Name"
              value={user?.name}
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textSecondary : "#6B7280" }]}>Quick Actions</Text>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <ActionRow
              icon="document-text-outline"
              title="My Documents"
              subtitle="View your saved documents"
              onPress={() => navigation.navigate("MainTabs", { screen: "Dashboard" })}
              colors={colors}
              isDark={isDark}
            />
            <ActionRow
              icon="shield-outline"
              title="Account Security"
              subtitle="Password & security settings"
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        {/* LOGOUT */}
        <Pressable style={[styles.logoutBtn, { borderColor: isDark ? colors.error : "#FCA5A5" }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/* ---------- Small Components ---------- */

const InfoRow = ({ icon, label, value, colors, isDark }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color={colors.primary} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={[styles.label, { color: isDark ? colors.textSecondary : "#6B7280" }]}>{label}</Text>
      <Text style={[styles.value, { color: isDark ? colors.text : "#111827" }]}>{value}</Text>
    </View>
  </View>
);

const ActionRow = ({ icon, title, subtitle, onPress, colors, isDark }) => (
  <Pressable style={styles.row} onPress={onPress}>
    <Ionicons name={icon} size={20} color={colors.primary} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={[styles.actionTitle, { color: isDark ? colors.text : "#111827" }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: isDark ? colors.textSecondary : "#6B7280" }]}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={16} color={isDark ? colors.textTertiary : "#9CA3AF"} />
  </Pressable>
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 45,
    paddingBottom: 120,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  profileCard: {
    marginHorizontal: 20,
    marginTop: -90,
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    elevation: 6,
  },

  avatarWrapper: { position: "relative", marginBottom: 10 },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },

  cameraIcon: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#2563EB",
    padding: 6,
    borderRadius: 20,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },

  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  verifiedText: {
    marginLeft: 5,
    color: "#16A34A",
    fontWeight: "500",
  },

  statsContainer: {
    flexDirection: "row",
    marginTop: 18,
    gap: 8,
  },

  statBoxBlue: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },

  statBoxOrange: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },

  statBoxPurple: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },

  statNumberBlue: { fontWeight: "700", fontSize: 18 },
  statNumberOrange: { fontWeight: "700", fontSize: 18 },
  statNumberPurple: { fontWeight: "700", fontSize: 18 },

  statLabel: { fontSize: 11, marginTop: 2 },

  section: { paddingHorizontal: 20, marginTop: 30 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 10,
  },

  card: {
    borderRadius: 20,
    paddingVertical: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  label: { fontSize: 11 },
  value: { fontSize: 15, fontWeight: "600" },

  actionTitle: { fontSize: 15, fontWeight: "600" },
  actionSubtitle: { fontSize: 12 },

  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
  },

  logoutText: {
    marginLeft: 8,
    fontWeight: "600",
  },
});