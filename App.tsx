import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import SchedulesScreen from './src/screens/SchedulesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AccountScreen from './src/screens/AccountScreen';
import { enableScreens } from 'react-native-screens';
import ScheduleNavigator from './src/navigation/ScheduleNavigator';
import { SchedulesProvider } from './src/context/SchedulesContext';
import SplashScreen from './src/screens/SplashScreen';

enableScreens();

const Tab = createBottomTabNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200); // show splash for 1s
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SchedulesProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen
            name="SchedulesTab"
            component={ScheduleNavigator}
            options={{ title: 'Schedules' }}
          />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SchedulesProvider>
  );
}
