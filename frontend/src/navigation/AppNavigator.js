import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";

import WelcomeScreen from "../screens/WelcomeScreen";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AddDocumentScreen from "../screens/AddDocumentScreen";
import BottomNavigator from "./BottomNavigator";
import ReminderSettingsScreen from "../screens/ReminderSettingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import authApiService from "../services/authApiService";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const checkLoginStatus = async () => {
    try {
      // Verify token with backend
      const result = await authApiService.verifyToken();
      if (result.authenticated) {
        await AsyncStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
      } else {
        await AsyncStorage.setItem("isLoggedIn", "false");
        setIsLoggedIn(false);
      }
    } catch (error) {
      // If verification fails, check AsyncStorage as fallback
      const value = await AsyncStorage.getItem("isLoggedIn");
      setIsLoggedIn(value === "true");
    }
  };

  const handleLogout = async () => {
    await authApiService.logout();
    await AsyncStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);  
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="MainTabs">
          {(props) => (
            <BottomNavigator {...props} onLogout={handleLogout} />
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} onLoginSuccess={checkLoginStatus} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}

       <Stack.Screen name="Reminder" component={ReminderSettingsScreen} />
      <Stack.Screen name="AddDocument" component={AddDocumentScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}