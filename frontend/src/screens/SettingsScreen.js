import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
   Alert,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import authApiService from "../services/authApiService";
import { useTheme } from "../context/ThemeContext";


export default function SettingsScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = theme.colors;

  const [pinLockEnabled, setPinLockEnabled] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  //  const handleLogout = async () => {
  //   Alert.alert("Logout", "Are you sure you want to logout?", [
  //     { text: "Cancel" },
  //     {
  //       text: "Logout",
  //       onPress: async () => {
  //         await authService.logout();
  //         navigation.replace("Login");
  //       },
  //     },
  //   ]);
  // };

  const SectionTitle = ({ title }) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
  );

  const RowButton = ({ icon, color, title, subtitle, onPress }) => (
    <Pressable onPress={onPress} style={[styles.rowButton, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>

      <Ionicons name="chevron-forward-outline" size={20} color={colors.textTertiary} />
    </Pressable>
  );

  const RowSwitch = ({ icon, color, title, subtitle, value, onChange }) => (
    <View style={[styles.rowButton, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>

      <Switch value={value} onValueChange={onChange} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
         colors={isDark ? ["#0F172A", "#1a2a4a"] : ["#5B40F5", "#A16EFF"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your app preferences
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isLandscape && { paddingHorizontal: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <SectionTitle title="Profile" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <RowButton
            icon="person-outline"
            color="#2563EB"
            title="Account Details"
            subtitle="Manage your profile information"
          />
        </View>

        {/* Appearance */}
        <SectionTitle title="Appearance" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <RowSwitch
            icon={isDark ? "moon" : "sunny"}
            color="#7C3AED"
            title="Dark Mode"
            subtitle={isDark ? "Light theme" : "Dark theme"}
            value={isDark}
            onChange={toggleTheme}
          />
        </View>

          {/* Notifications */}
        <SectionTitle title="Notifications" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <RowButton
            icon="notifications-outline"
            color="#EA580C"
            title="Reminder Settings"
            subtitle="Manage notification preferences"
            onPress={() => navigation.navigate("Reminder")}
          />
        </View>

        {/* Security */}
        <SectionTitle title="Security" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <RowSwitch
            icon="lock-closed-outline"
            color="#2563EB"
            title="PIN Lock"
            subtitle="Secure app with PIN"
            value={pinLockEnabled}
            onChange={setPinLockEnabled}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <RowSwitch
            icon="shield-checkmark-outline"
            color="#16A34A"
            title="Biometric Lock"
            subtitle="Use fingerprint or Face ID"
            value={biometricEnabled}
            onChange={setBiometricEnabled}
          />
        </View>

        {/* Backup */}
        <SectionTitle title="Backup & Sync" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <RowSwitch
            icon="cloud-outline"
            color="#4F46E5"
            title="Auto Backup"
            subtitle="Backup data to cloud"
            value={autoBackup}
            onChange={setAutoBackup}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <RowButton
            icon="cloud-upload-outline"
            color="#4F46E5"
            title="Backup Now"
            subtitle="Last backup: 2 hours ago"
          />
        </View>

       

        {/* Support */}
        <SectionTitle title="Support" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <RowButton
            icon="help-circle-outline"
            color="#0D9488"
            title="Help & Support"
            subtitle="FAQs and contact us"
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <RowButton
            icon="shield-outline"
            color="#64748B"
            title="Privacy Policy"
            subtitle="View our privacy policy"
          />
        </View>

        {/* Logout */}
        {/* <Pressable style={[styles.logoutButton, { backgroundColor: colors.error + "15", borderColor: colors.error }]} onPress={handleLogout} >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </Pressable> */}

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          ExpirySense v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  headerSubtitle: {
    color: "#E0E7FF",
    marginTop: 6,
  },

  content: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },

  card: {
    borderRadius: 16,
    paddingVertical: 6,
    marginBottom: 16,
    elevation: 2,
  },

  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  divider: {
    height: 1,
    marginLeft: 68,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
  },

  logoutText: {
    fontWeight: "600",
    marginLeft: 8,
  },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 20,
  },
});