import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";

import Dashboard from "../screens/Dashboard";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function BottomNavigator({ onLogout }) {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,

        tabBarStyle: {
          height: isLandscape ? 60 : 70,
          paddingBottom: Platform.OS === "ios" ? 10 : 6,
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}