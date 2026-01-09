import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { JobProvider } from '../context/JobContext';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <JobProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f8fafc',
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#ffffff',
            }
          }}
        >
          <Stack.Screen name="index" options={{ title: 'TaskFit' }} />
          <Stack.Screen name="tasks" options={{ title: 'Assess Tasks' }} />
          <Stack.Screen name="result" options={{ title: 'Results', headerBackVisible: false }} />
        </Stack>
      </JobProvider>
    </SafeAreaProvider>
  );
}
