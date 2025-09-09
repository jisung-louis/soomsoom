import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MyStackParamList } from "../../../navigations/tabs/MyStackNavigator";
import SubpageHeader from "../../../components/common/top-navigation/SubpageHeader";
import { syongsyongTypography, typography } from "../../../constants/typography";
import { colors } from "../../../constants/colors";
import BronzeBadge from "../../../assets/icons/my/badge_bronze.svg";
import SilverBadge from "../../../assets/icons/my/badge_silver.svg";
import GoldBadge from "../../../assets/icons/my/badge_gold.svg";
import { Surface } from "../../../components/common/surface/Surface";
import CircleTabMenu from "../../../components/common/tabmenu/CircleTabMenu";
import AchievementList from "../../../components/tabs/my/AchievementList";
import { useAchievementStore } from "../../../stores/achievementStore";

// 타입은 types/index.ts에서 import
import { Achievement } from "../../../types";
import { UserAchievement } from "../../../stores/achievementStore";
import LottieView from "lottie-react-native";

// 업적 목록 필터링 (새로운 구조 기반)
const filterAchievement = (
    achievementDefinitions: Map<number, Achievement>,
    userAchievements: Map<number, UserAchievement>,
    selectedTab: string,
    dynamicCache?: Map<number, any>
  ): Achievement[] => {
    return Array.from(achievementDefinitions.values()).filter((achievement) => {
      // 동적 캐시가 있으면 우선 사용
      if (dynamicCache && dynamicCache.has(achievement.id)) {
        const dynamicData = dynamicCache.get(achievement.id);
        const isAchieved = dynamicData.isAchieved;
        
        if (selectedTab === '달성') {
          return isAchieved;
        } else if (selectedTab === '미달성') {
          return !isAchieved;
        }
        return true;
      }
      
      // 사용자 업적 데이터 사용
      const userAchievement = userAchievements.get(achievement.id);
      const isAchieved = userAchievement?.isAchieved ?? false;
      
      if (selectedTab === '달성') {
        return isAchieved;
      } else if (selectedTab === '미달성') {
        return !isAchieved;
      }
      
      return true; // '전체' 탭일 경우
    });
  };

const MyAchievementScreen = () => {
  const [selectedTab, setSelectedTab] = useState<string>('전체');
  const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
  
  // 업적 스토어 사용 (새로운 팝업 시스템과 연동)
  const { 
    achievementDefinitions,
    userAchievements, 
    getAchievedCount,
    getTotalCount,
    scheduleCheck,
    cache,  // 동적 데이터 캐시 사용
    resetShownAchievements
  } = useAchievementStore();

  // 컴포넌트 마운트 시 업적 체크
  useEffect(() => {
    // 화면 진입 시 업적 체크 (새로 달성한 업적이 있는지 확인)
    scheduleCheck(500);
  }, [scheduleCheck]);

  // 화면 포커스 시 캐시 상태 확인 및 리셋
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 캐시가 비어있으면 팝업 기록도 초기화 (완전 리셋 상태)
      if (cache.size === 0) {
        resetShownAchievements();
      }
    });

    return unsubscribe;
  }, [navigation, cache.size, resetShownAchievements]);

  const handleBack = () => {
    navigation.goBack();
  };

  const renderTab = () => {
    const filtered = filterAchievement(achievementDefinitions, userAchievements, selectedTab, cache);
    
    // cache 데이터를 우선 사용하여 userAchievement 배열 생성
    const userAchievementArray = Array.from(achievementDefinitions.keys()).map(achievementId => {
      // cache에 데이터가 있으면 우선 사용
      if (cache.has(achievementId)) {
        const cacheData = cache.get(achievementId);
        if (cacheData) {
          return {
            id: achievementId,
            completionRate: cacheData.progress?.current || 0,
            isAchieved: cacheData.isAchieved,
            achievedAt: cacheData.achievedAt,
            lastUpdated: new Date()
          };
        }
      }
      
      // cache에 없으면 userAchievements에서 가져오기
      const userAchievement = userAchievements.get(achievementId);
      return userAchievement || {
        id: achievementId,
        completionRate: 0,
        isAchieved: false,
        achievedAt: null,
        lastUpdated: new Date()
      };
    });
    
    return <AchievementList achievement={filtered} userAchievement={userAchievementArray} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.systemBadgeContainer}>
            <View style={styles.titleContainer}>
              <Text style={{...syongsyongTypography.title5}}>뱃지</Text>
              <Text style={styles.achievementStats}>
                {cache.size > 0 
                  ? `${Array.from(cache.values()).filter(a => a.isAchieved).length} / ${cache.size} 달성`
                  : `${getAchievedCount()} / ${getTotalCount()} 달성`
                }
              </Text>
            </View>
            <View style={styles.systemBadge}>
                <View style={styles.badgeAndTextContainer}>
                    <LottieView
                      source={require('../../../assets/animations/badge/bronze_action.json')}
                      autoPlay
                      loop
                      style={{ width: 64, height: 64 }}
                    />
                    <Text style={[styles.bronzeTextColor, styles.badgeTextTypography]}>브론즈 뱃지</Text>
                </View>
                <View style={styles.badgeAndTextContainer}>
                    <LottieView
                      source={require('../../../assets/animations/badge/silver_action.json')}
                      autoPlay
                      loop
                      style={{ width: 64, height: 64 }}
                    />
                    <Text style={[styles.silverTextColor, styles.badgeTextTypography]}>실버 뱃지</Text>
                </View>
                <View style={styles.badgeAndTextContainer}>
                    <LottieView
                      source={require('../../../assets/animations/badge/gold_action.json')}
                      autoPlay
                      loop
                      style={{ width: 64, height: 64 }}
                    />
                    <Text style={[styles.goldTextColor, styles.badgeTextTypography]}>골드 뱃지</Text>
                </View>
            </View>
        </View>
        <Surface style={styles.surface}/>
        <View style={styles.contentContainer}>
            <View style={styles.circleTabContainer}>
                <CircleTabMenu
                    tabs={['전체', '달성', '미달성']}
                    selectedTab={selectedTab}
                    onPress={(tab) => setSelectedTab(tab)}
                />
            </View>
            {renderTab()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  systemBadgeContainer: {
    marginTop: 30,
    gap: 20,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementStats: {
    ...typography.body5,
    color: colors.grayScale600,
  },
  systemBadge: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  badgeAndTextContainer: {
    alignItems: 'center',
    gap: 10,
  },
  bronzeTextColor: {
    color: colors.primary900,
  },
  silverTextColor: {
    color: colors.grayScale800,
  },
  goldTextColor: {
    color: '#E2B100',
  },
  badgeTextTypography: {
    ...typography.body5,
  },
  surface: {
    marginVertical: 50,
  },
  contentContainer: {
    gap: 20,
    paddingHorizontal: 20,
  },
  circleTabContainer: {
  },
});

export default MyAchievementScreen;