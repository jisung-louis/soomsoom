import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecordTab from '../../screens/tabs/RecordTab';
import EmotionSelectScreen from '../../screens/subpages/record/EmotionSelectScreen';
import EmotionRecordScreen from '../../screens/subpages/record/EmotionRecordScreen';
import EmotionRecordHelpScreen from '../../screens/subpages/record/EmotionRecordHelpScreen';

export type RecordStackParamList = {
  RecordTab: { isFirstRecord?: boolean } | undefined;
  EmotionSelectScreen: { date: string };
  EmotionRecordScreen: { date: string; emotion: string } | { diaryId: number };
  EmotionRecordHelpScreen: undefined;
};

const Stack = createStackNavigator<RecordStackParamList>();

export default function RecordStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="RecordTab"
    >
      <Stack.Screen name="RecordTab" component={RecordTab} />
      <Stack.Screen name="EmotionSelectScreen" component={EmotionSelectScreen} />
      <Stack.Screen name="EmotionRecordScreen" component={EmotionRecordScreen} />
      <Stack.Screen name="EmotionRecordHelpScreen" component={EmotionRecordHelpScreen} />
    </Stack.Navigator>
  );
} 