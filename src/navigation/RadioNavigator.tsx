import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RadioScreen from '../screens/RadioScreen';
import EditRadioConfigScreen from '../screens/EditRadioConfigScreen';

export type RadioStackParamList = {
  RadioHome: { device?: any } | undefined;
  EditRadioConfig: undefined;
};

const Stack = createNativeStackNavigator<RadioStackParamList>();

export default function RadioNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RadioHome" component={RadioScreen} />
      <Stack.Screen name="EditRadioConfig" component={EditRadioConfigScreen} />
    </Stack.Navigator>
  );
}
