import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlayTab from '../../screens/tabs/PlayTab';
import PlayFavoriteScreen from '../../screens/subpages/play/PlayFavoriteScreen';
import PlayHistoryScreen from '../../screens/subpages/play/PlayHistoryScreen';
import PlayDetailScreen from '../../screens/subpages/play/PlayDetailScreen';
import { Activity } from '../../services/contentService';
import { Instructor } from '../../services/instructorService';
import PlayInstructorDetailScreen from '../../screens/subpages/play/PlayInstructorDetailScreen';
import PlayBreathScreen from '../../screens/subpages/play/PlayBreathScreen';
import PlayMeditationScreen from '../../screens/subpages/play/PlayMeditationScreen';
import PlayResultScreen from '../../screens/subpages/play/PlayResultScreen';
import PlayBreathContentScreen from '../../screens/subpages/play/PlayBreathContentScreen';

export type PlayStackParamList = {
  PlayTab: undefined;
  PlayFavoriteScreen: undefined;
  PlayHistoryScreen: undefined;
  PlayDetailScreen: { content: Activity };
  PlayInstructorDetailScreen: { instructorId: number };
  PlayBreathScreen: { content: Activity };
  PlayBreathContentScreen: { content: Activity };
  PlayMeditationScreen: { content: Activity };
  PlayResultScreen: undefined;
};

const Stack = createStackNavigator<PlayStackParamList>();

export default function PlayStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="PlayTab"
    >
      <Stack.Screen name="PlayTab" component={PlayTab} />
      <Stack.Screen name="PlayFavoriteScreen" component={PlayFavoriteScreen} />
      <Stack.Screen name="PlayHistoryScreen" component={PlayHistoryScreen} />
      <Stack.Screen name="PlayDetailScreen" component={PlayDetailScreen}  />
      <Stack.Screen name="PlayInstructorDetailScreen" component={PlayInstructorDetailScreen} />
      <Stack.Screen name="PlayBreathScreen" component={PlayBreathScreen} />
      <Stack.Screen name="PlayMeditationScreen" component={PlayMeditationScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PlayBreathContentScreen" component={PlayBreathContentScreen} />
      <Stack.Screen name="PlayResultScreen" component={PlayResultScreen} />
    </Stack.Navigator>
  );
}