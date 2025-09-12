import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AlarmTab from '../../screens/tabs/AlarmTab';
import AlarmAddScreen from '../../screens/subpages/alarm/AlarmAddScreen';
import AlarmDismissScreen from '../../screens/subpages/alarm/AlarmDismissScreen';
import MissionAccomplishmentScreen from '../../screens/subpages/alarm/MissionAccomplishmentScreen';
import { MultiStepMission } from '../../utils/mathMissionGenerator';

export type AlarmStackParamList = {
  AlarmTab: undefined;
  AlarmAddScreen: {
    isCreateMode: boolean;
    alarmId?: number;
  };
  AlarmDismissScreen: {
    alarmId: string;
    missionType?: string;
    missionData?: any;
    missionPack?: MultiStepMission;
  };
  MissionAccomplishmentScreen: {
    alarmId: string;
    missionType: string;
    missionData: any;
    missionPack?: MultiStepMission;
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
      <Stack.Screen name="AlarmDismissScreen" component={AlarmDismissScreen} />
      <Stack.Screen name="MissionAccomplishmentScreen" component={MissionAccomplishmentScreen} />
    </Stack.Navigator>
  );
}