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
import { Ionicons } from "@expo/vector-icons";
import authApiService from "../services/authApiService";
import { useTheme } from "../context/ThemeContext";

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email validation
  const validateEmail = (value) => {
    const re =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  // Strong password validation
  const validatePassword = (pwd) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return strongRegex.test(pwd);
  };

  const handleRegister = async () => {
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be 8+ chars, include upper, lower, number & special char."
      );
      return;
    }

    setLoading(true);

    try {
      // Register user with backend API
      const result = await authApiService.register(trimmedEmail, password, trimmedName);

      if (result.success) {
        setLoading(false);
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => navigation.replace("Login"),
          },
        ]);
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
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
        {/* Header */}
        <View style={styles.top}>
          <LinearGradient
            colors={["#4C6EF5", "#7B2FF7"]}
            style={styles.logo}
          >
            <Ionicons name="shield-checkmark-outline" size={32} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Start managing your documents today
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Ionicons name="person-outline" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="John Doe"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16, color: colors.text }]}>
            Email Address
          </Text>
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

          <Text style={[styles.label, { marginTop: 16, color: colors.text }]}>
            Password
          </Text>
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

          <Text style={[styles.passwordHint, { color: colors.textSecondary }]}>
            Password must include:
            {"\n"}• 8+ characters
            {"\n"}• Upper & lower case
            {"\n"}• Number
            {"\n"}• Special character
          </Text>

          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

          <Pressable
            style={styles.buttonWrapper}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={["#7B2FF7", "#4C6EF5"]}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.rowCenter}>
            <Text style={[styles.muted, { color: colors.textSecondary }]}>
              Already have an account?{" "}
            </Text>
            <Text
              style={[styles.link, { color: colors.primary }]}
              onPress={() => navigation.navigate("Login")}
            >
              Sign In
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
    paddingVertical: 70,
    alignItems: "center",
  },
  top: { alignItems: "center", marginBottom: 20 },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    textAlign: "center",
  },
  form: { width: "100%", maxWidth: 480 },
  label: { marginBottom: 8, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderRadius: 12,
    elevation: 2,
  },
  input: { marginLeft: 10, flex: 1, fontSize: 14 },
  passwordHint: {
    fontSize: 11,
    marginTop: 8,
  },
  buttonWrapper: { width: "100%", marginTop: 24 },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  muted: {},
  link: { fontWeight: "700" },
  error: {
    marginTop: 12,
    textAlign: "center",
  },
});