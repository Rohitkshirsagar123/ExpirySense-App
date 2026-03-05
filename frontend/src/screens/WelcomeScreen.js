import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <LinearGradient
          colors={["#4C6EF5", "#7B2FF7"]}
          style={styles.logoContainer}
        >
          <Ionicons name="shield-checkmark-outline" size={34} color="#fff" />
        </LinearGradient>

        {/* App Name */}
        <Text style={[styles.title, { color: colors.primary }]}>ExpirySense</Text>

        {/* Feature Cards */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconBox, { backgroundColor: "#D1FADF" }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#12B76A" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Expiry Dashboard</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              View all documents Expired / Expiring Soon / Safe
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconBox, { backgroundColor: "#FEE4E2" }]}>
            <Ionicons name="notifications-outline" size={22} color="#F04438" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Automatic Renewal Alerts</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Get notified 30, 7, and 1 day before expiry
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconBox, { backgroundColor: "#E0EAFC" }]}>
            <Ionicons name="lock-closed-outline" size={22} color="#3B82F6" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Secure Document Vault + AI Scan
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Store documents safely with smart scanning
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={["#4C6EF5", "#7B2FF7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </Pressable>

        {/* Login Link */}
        <Text style={[styles.loginText, { color: colors.textSecondary }]}>
          Already have an account?{" "}
          <Text
            style={[styles.loginLink, { color: colors.primary }]}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {"  "}Your documents stay private and secure.
          </Text>
        </View>
      </ScrollView>
  );
}



const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#F9FAFB",
//   },

  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 70,
  },

  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cardText: {
    marginLeft: 12,
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  buttonWrapper: {
    width: "100%",
    marginTop: 30,
  },

  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  loginText: {
    marginTop: 20,
    fontSize: 14,
  },

  loginLink: {
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },

  footerText: {
    fontSize: 12,
  },
});