import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ChatSocketProvider } from "./src/context/ChatSocketContext";
import RootNavigator from "./src/navigation/RootNavigator";
import ChatToast from "./src/components/ChatToast";
import AIAssistantButton from "./src/components/AIAssistantButton";

const navigationRef = createNavigationContainerRef();

// Screens where the floating AI bubble would sit over other UI (composer,
// its own chat window) or shouldn't show at all (pre-auth screens).
const HIDE_AI_BUTTON_ON = new Set(["Chat", "AIAssistant", "Splash", "Onboarding", "Login", "SignUp"]);

// Lets a tapped `ceynoa://shared/<token>` or `ceynoa://shared/folder/<token>`
// link (e.g. from a QR code or a pasted link) open straight to the viewer.
// Requires the user to already be signed in — these screens only exist in
// the authenticated navigator, matching the API's IsAuthenticated requirement.
const linking = {
  prefixes: ["ceynoa://"],
  config: {
    screens: {
      SharedFolder: "shared/folder/:token",
      SharedFile: "shared/:token",
    },
  },
};

// Re-renders (via NavThemeWrapper's onStateChange -> forceUpdate) whenever
// the active route changes, so it can read the current route name fresh.
function ChatOverlays() {
  const { isAuthed } = useAuth();
  if (!isAuthed) return null;

  const routeName = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;

  return (
    <>
      <ChatToast
        onPress={(toast) => {
          if (!navigationRef.isReady()) return;
          navigationRef.navigate("Chat", { id: toast.conversationId, name: toast.senderUsername });
        }}
      />
      <AIAssistantButton
        hidden={HIDE_AI_BUTTON_ON.has(routeName)}
        onPress={() => navigationRef.isReady() && navigationRef.navigate("AIAssistant")}
      />
    </>
  );
}

function NavThemeWrapper() {
  const { isDark, c } = useTheme();
  const [, forceUpdate] = useState(0);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: c.bgApp,
      card: c.bgSecondary,
      text: c.textPrimary,
      border: c.border,
      primary: c.accent.orange,
      notification: c.accent.amber,
    },
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      linking={linking}
      onStateChange={() => forceUpdate((n) => n + 1)}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
      <ChatOverlays />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChatSocketProvider>
            <NavThemeWrapper />
          </ChatSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
