import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeTab from '../../screens/tabs/HomeTab';
import ShopScreen from '../../screens/subpages/home/ShopScreen';

export type HomeStackParamList = {
  HomeTab: undefined;
  ShopScreen: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeTab" component={HomeTab} />
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
