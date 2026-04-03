import { Stack } from 'expo-router';
import { CertificationProvider } from '../src/CertificationContext';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <CertificationProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.bgCore,
          },
          headerTintColor: theme.colors.textMain,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 16,
          },
          contentStyle: {
            backgroundColor: theme.colors.bgCore,
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Login' }} />
        <Stack.Screen name="template" options={{ title: 'Initialize Canvas' }} />
        <Stack.Screen name="calibration" options={{ title: 'Calibration' }} />
        <Stack.Screen name="data" options={{ title: 'Roster Pool' }} />
        <Stack.Screen name="generate" options={{ title: 'Execution Engine' }} />
      </Stack>
    </CertificationProvider>
  );
}
