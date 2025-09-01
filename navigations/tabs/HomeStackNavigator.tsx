import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeTab from '../../screens/tabs/HomeTab';
import ShopScreen from '../../screens/subpages/home/ShopScreen';
import ShopItemDetailScreen from '../../screens/subpages/home/ShopItemDetailScreen';
import TestScreen from '../../screens/subpages/home/TestScreen';

export type HomeStackParamList = {
  HomeTab: undefined;
  ShopScreen: undefined;
  ShopItemDetailScreen: { itemId: number };
  TestScreen: undefined;
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
      <Stack.Screen name="ShopItemDetailScreen" component={ShopItemDetailScreen} />
      <Stack.Screen name="TestScreen" component={TestScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
