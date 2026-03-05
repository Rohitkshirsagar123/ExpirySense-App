import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
 const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
              isDark
                ? ["#111827", "#1F2937", "#111827"]   // better dark gradient
                : ["#E0F2FE", "#EEF2FF", "#F5F3FF"]
            }
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
             colors={["#2563EB", "#7C3AED"]}
            style={styles.logoBox}
          >
            <Ionicons name="shield-checkmark-outline" size={60} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.primary }]}>ExpirySense</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track document expiries. Get renewal reminders. Stay stress-free.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoWrapper: {
    marginBottom: 40,
  },

  logoBox: {
  width: 130,
  height: 130,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  elevation: 12, // Android
  shadowColor: "#7C3AED", // iOS
  shadowOpacity: 0.5,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
},

  textContainer: {
    alignItems: "center",
  },

  title: {
    fontSize: width < 400 ? 28 : 32,
    fontWeight: "bold",
    backgroundColor: "transparent",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 300,
  },
});