import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import authApiService from "../services/authApiService";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      // Login with backend API
      const result = await authApiService.login(trimmedEmail, password);

      if (result.success) {
        await AsyncStorage.setItem("isLoggedIn", "true");
        // setLoading(false);
        onLoginSuccess(); // Call the callback here after successful login
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      setError("Login failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={["#4C6EF5", "#7B2FF7"]}
            style={styles.logo}
          >
            <Ionicons name="shield-checkmark-outline" size={34} color="#fff" />
          </LinearGradient>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16, color: colors.text }]}>Password</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textTertiary}
              />
            </Pressable>
          </View>

          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

          <Pressable
            style={styles.buttonWrapper}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#4C6EF5", "#7B2FF7"]}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.rowCenter}>
            <Text style={[styles.muted, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <Text
              style={[styles.link, { color: colors.primary }]}
              onPress={() => navigation.navigate("Register")}
            >
              Create Account
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 80,
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
  },
  form: {
    width: "100%",
    maxWidth: 480,
    marginTop: 10,
  },
  label: { marginBottom: 8, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderRadius: 12,
    elevation: 2,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  buttonWrapper: { width: "100%", marginTop: 24 },
  button: { paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  rowCenter: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  muted: {},
  link: { fontWeight: "700" },
  error: { marginTop: 12, textAlign: "center" },
});