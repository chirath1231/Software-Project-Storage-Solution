import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import SplashScreen from "../screens/auth/SplashScreen";
import OnboardingScreen from "../screens/auth/OnboardingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";

import MainTabs from "./MainTabs";
import FolderScreen from "../screens/FolderScreen";
import UploadScreen from "../screens/UploadScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PasswordManagerScreen from "../screens/PasswordManagerScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import SupportScreen from "../screens/SupportScreen";
import ClientsScreen from "../screens/ClientsScreen";
import ChatScreen from "../screens/ChatScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthed } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      {!isAuthed ? (
        <Stack.Group>
          <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Folder" component={FolderScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="PasswordManager" component={PasswordManagerScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Clients" component={ClientsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
