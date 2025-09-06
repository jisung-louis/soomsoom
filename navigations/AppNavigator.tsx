import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { BottomNavigation, BottomTabKey } from '../components/navigation/BottomNavigation';
import { StyleSheet, Animated } from 'react-native';
import HomeStackNavigator from './tabs/HomeStackNavigator';
import RecordStackNavigator from './tabs/RecordStackNavigator';
import PlayStackNavigator from './tabs/PlayStackNavigator';
import AlarmStackNavigator from './tabs/AlarmStackNavigator';
import MyStackNavigator from './tabs/MyStackNavigator';

export type RootTabParamList = {
  home: undefined;
  record: undefined;
  play: undefined;
  alarm: undefined;
  my: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="home"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
        
      >
        <Tab.Screen name="home" component={HomeStackNavigator} />
        <Tab.Screen name="record" component={RecordStackNavigator} />
        <Tab.Screen name="play" component={PlayStackNavigator} />
        <Tab.Screen name="alarm" component={AlarmStackNavigator} />
        <Tab.Screen name="my" component={MyStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  // 애니메이션 값
  const [fadeAnim] = useState(new Animated.Value(1));
  const [translateY] = useState(new Animated.Value(0));

  // 현재 포커스된 탭의 하위 스크린 이름 가져오기
  const getRouteName = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;
    return routeName;
  };

  // 바텀 네비게이션을 숨겨야 하는 화면들 정의
  const HIDDEN_BOTTOM_NAV_SCREENS: Record<string, string[]> = {
    record: ['EmotionSelectScreen', 'EmotionRecordScreen', 'EmotionRecordHelpScreen'],
    home: ['ShopScreen', 'ShopItemDetailScreen', 'MailboxScreen', 'MailboxDetailScreen', 'TestScreen'],
    play: ['PlayFavoriteScreen', 'PlayHistoryScreen', 'PlayDetailScreen', 'PlayInstructorDetailScreen', 'PlayBreathScreen', 'PlayMeditationScreen', 'PlayResultScreen', 'PlayBreathContentScreen', 'PlayActivityListScreen'],
    alarm: ['AlarmAddScreen', ],
    my: ['MyRoomDecorationPurchaseScreen'],
  };

  // 현재 화면이 숨겨야 하는 화면인지 확인
  const shouldHideBottomNav = () => {
    const currentRoute = state.routes[state.index];
    const tabName = currentRoute.name;
    const screenName = getRouteName(currentRoute);
    
    return HIDDEN_BOTTOM_NAV_SCREENS[tabName]?.includes(screenName) || false;
  };

  // 애니메이션으로 바텀 내비게이션 숨김/표시
  useEffect(() => {
    const hideBottomNav = shouldHideBottomNav();
    
    if (hideBottomNav) {
      // fade-out 및 slide-down 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // fade-in 및 slide-up 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.index, state.routes]);

  return (
    <Animated.View
      style={[
        styles.absoluteBar,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <BottomNavigation
        selectedTab={state.routeNames[state.index] as BottomTabKey}
        onTabPress={(tab) => {
          const idx = state.routeNames.indexOf(tab);
          if (idx !== -1) navigation.navigate(tab);
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  absoluteBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },
});