import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../lib/store';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="menu" options={{ presentation: 'modal' }} />
      </Stack>
    </AppProvider>
  );
}
