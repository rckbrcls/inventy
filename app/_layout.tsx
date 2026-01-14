import "@/polyfills";
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import {
  ThemeProvider,
  useTheme,
} from "@/features/settings/contexts/ThemeContext"; // Apenas o ThemeProvider
import { InventoryProvider } from "@/features/inventory/contexts/InventoryContext";
import { DebtorProvider } from "@/features/debtors/contexts/DebtorContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { isDarkTheme } = useTheme(); // Agora está dentro do ThemeProvider

  return (
    <NavigationThemeProvider value={isDarkTheme ? DarkTheme : DefaultTheme}>
      <InventoryProvider>
        <DebtorProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </DebtorProvider>
      </InventoryProvider>
    </NavigationThemeProvider>
  );
}
