import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AlarmTab from '../../screens/tabs/AlarmTab';
import AlarmAddScreen from '../../screens/subpages/alarm/AlarmAddScreen';

export type AlarmStackParamList = {
  AlarmTab: undefined;
  AlarmAddScreen: {
    isCreateMode: boolean;
    alarmId?: number;
  };
};

const Stack = createStackNavigator<AlarmStackParamList>();

export default function AlarmStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="AlarmTab"
    >
      <Stack.Screen name="AlarmTab" component={AlarmTab} />
      <Stack.Screen name="AlarmAddScreen" component={AlarmAddScreen} />
    </Stack.Navigator>
  );
}