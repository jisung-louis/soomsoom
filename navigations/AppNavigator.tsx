import React, { useState, useEffect, forwardRef } from 'react';
import { NavigationContainer, NavigationContainerRef, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { BottomNavigation, BottomTabKey } from '../components/navigation/BottomNavigation';
import { StyleSheet, Animated } from 'react-native';
import { useToast } from '../contexts/ToastContext';
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

const AppNavigator = forwardRef<NavigationContainerRef<any>>((props, ref) => {
  return (
    <NavigationContainer ref={ref}>
      <AppNavigatorContent />
    </NavigationContainer>
  );
});

AppNavigator.displayName = 'AppNavigator';

export default AppNavigator;

function AppNavigatorContent() {
  const { setHasBottomNavigation } = useToast();

  return (
    <Tab.Navigator
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} setHasBottomNavigation={setHasBottomNavigation} />}
    >
      <Tab.Screen 
        name="home" 
        component={HomeStackNavigator}
        options={{ lazy: false }}
      />
      <Tab.Screen 
        name="record" 
        component={RecordStackNavigator}
        options={{ lazy: false }}
      />
      <Tab.Screen 
        name="play" 
        component={PlayStackNavigator}
        options={{ lazy: false }}
      />
      <Tab.Screen 
        name="alarm" 
        component={AlarmStackNavigator}
        options={{ lazy: false }}
      />
      <Tab.Screen 
        name="my" 
        component={MyStackNavigator}
        options={{ lazy: false }}
      />
    </Tab.Navigator>
  );
}

function CustomTabBar({ state, navigation, setHasBottomNavigation }: BottomTabBarProps & { setHasBottomNavigation: (hasBottomNav: boolean) => void }) {
  // 애니메이션 값
  const [fadeAnim] = useState(new Animated.Value(1));
  const [translateY] = useState(new Animated.Value(0));
  const [poppingTabs, setPoppingTabs] = useState<Set<string>>(new Set());

  // 현재 포커스된 탭의 하위 스크린 이름 가져오기
  const getRouteName = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;
    return routeName;
  };

  // 바텀 네비게이션을 숨겨야 하는 화면들 정의
  const HIDDEN_BOTTOM_NAV_SCREENS: Record<string, string[]> = {
    record: ['EmotionSelectScreen', 'EmotionRecordScreen', 'EmotionRecordHelpScreen',
      //'RecordTab',
    ],
    home: ['ShopScreen', 'ShopItemDetailScreen', 'MailboxScreen', 'MailboxDetailScreen', 'TestScreen'],
    play: ['PlayFavoriteScreen', 'PlayHistoryScreen', 'PlayDetailScreen', 'PlayInstructorDetailScreen', 'PlayBreathScreen', 'PlayMeditationScreen', 'PlayResultScreen', 'PlayBreathContentScreen', 'PlayActivityListScreen'],
    alarm: ['AlarmAddScreen', 'AlarmDismissScreen', 'MissionAccomplishmentScreen'],
    my: ['MyRoomDecorationPurchaseScreen', 'MyAchievementScreen'],
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
    
    // ToastContext에 바텀 네비게이션 상태 업데이트
    setHasBottomNavigation(!hideBottomNav);
    
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
          // popToTop 진행 중인 탭은 터치 무시
          if (poppingTabs.has(tab)) return;
          const idx = state.routeNames.indexOf(tab);
          if (idx !== -1) {
            // 1) 먼저 대상 탭으로 이동하여 현재 탭의 pop 애니메이션이 보이지 않게 함
            navigation.navigate(tab);
            // 2) 다음 틱에서 비활성 탭들의 스택만 루트로 초기화 (오프스크린에서 처리)
            setTimeout(() => {
              const rootState: any = navigation.getState();
              const routes = rootState?.routes ?? state.routes;
              routes.forEach((route: any) => {
                if (route.name !== tab) {
                  const childState = route.state;
                  if (childState && childState.type === 'stack' && childState.index > 0) {
                    // 시작: 해당 탭을 isPopping 상태로 표시
                    setPoppingTabs((prev) => new Set(prev).add(route.name));
                    navigation.dispatch({
                      ...StackActions.popToTop(),
                      target: childState.key,
                    });
                    // 종료: 약간의 지연 후 isPopping 해제
                    setTimeout(() => {
                      setPoppingTabs((prev) => {
                        const next = new Set(prev);
                        next.delete(route.name);
                        return next;
                      });
                    }, 200);
                  }
                }
              });
            }, 0);
          }
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