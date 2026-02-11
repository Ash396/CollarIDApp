import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import SchedulesScreen from './src/screens/SchedulesScreen';
import PowerConsumptionScreen from './src/screens/PowerConsumptionScreen';
import { enableScreens } from 'react-native-screens';
import ScheduleNavigator from './src/navigation/ScheduleNavigator';
import { SchedulesProvider } from './src/context/SchedulesContext';
import { RadioConfigProvider } from './src/context/RadioConfigContext';
import SplashScreen from './src/screens/SplashScreen';
import RadioNavigator from './src/navigation/RadioNavigator';

enableScreens();

const Tab = createBottomTabNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1100); // show splash for 1s
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <RadioConfigProvider>
      <SchedulesProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen
              name="SchedulesTab"
              component={ScheduleNavigator}
              options={{ title: 'Schedules' }}
            />
            <Tab.Screen
              name="RadioTab"
              component={RadioNavigator}
              options={{ title: 'Radio' }}
            />
            <Tab.Screen
              name="Power Consumption"
              component={PowerConsumptionScreen}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SchedulesProvider>
    </RadioConfigProvider>
  );
}
