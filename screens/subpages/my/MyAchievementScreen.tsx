import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MyStackParamList } from "../../../navigations/tabs/MyStackNavigator";
import SubpageHeader from "../../../components/common/top-navigation/SubpageHeader";
import { syongsyongTypography, typography } from "../../../constants/typography";
import { colors } from "../../../constants/colors";
import LottieView from "lottie-react-native";
import { Surface } from "../../../components/common/surface/Surface";
import CircleTabMenu from "../../../components/common/tabmenu/CircleTabMenu";
import AchievementList from "../../../components/tabs/my/AchievementList";
import { useAchievementStore } from "../../../stores/achievementStore";
import { MyAchievement } from "../../../types";
import BadgeBronze from "../../../assets/icons/my/badge_bronze.svg";
import BadgeSilver from "../../../assets/icons/my/badge_silver.svg";
import BadgeGold from "../../../assets/icons/my/badge_gold.svg";
import BadgeHidden from "../../../assets/icons/my/badge_hidden.svg";

const MyAchievementScreen = () => {
  const [selectedTab, setSelectedTab] = useState<string>('전체');
  const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();

  const {
    userAchievements,
    getAchievedCount,
    getTotalCount,
    scheduleCheck,
    cache,
    resetShownAchievements,
  } = useAchievementStore();

  useEffect(() => {
    scheduleCheck(500);
  }, [scheduleCheck]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cache.size === 0) {
        resetShownAchievements();
      }
    });
    return unsubscribe;
  }, [navigation, cache.size, resetShownAchievements]);

  const filteredAchievements = useMemo(() => {
    let list = Array.from(cache.values());

    if (selectedTab === '달성') {
      list = list.filter(a => a.isAchieved);
    } else if (selectedTab === '미달성') {
      list = list.filter(a => !a.isAchieved);
    }
    return list;
  }, [cache, selectedTab]);

  const userAchievementArray = useMemo(() => {
    return filteredAchievements.map<MyAchievement & { completionRate: number }>((a) => ({
      ...a,
      completionRate: a.progress?.current || 0,
    }));
  }, [filteredAchievements]);

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.systemBadgeContainer}>
            <View style={styles.titleContainer}>
              <Text style={{...syongsyongTypography.title5}}>뱃지</Text>
              {/* <Text style={styles.achievementStats}>
                {cache.size > 0 
                  ? `${Array.from(cache.values()).filter(a => a.isAchieved).length} / ${cache.size} 달성`
                  : `${getAchievedCount()} / ${getTotalCount()} 달성`
                }
              </Text> */}
            </View>
            <View style={styles.systemBadge}>
                <View style={styles.badgeAndTextContainer}>
                    <BadgeBronze width={64} height={64} />
                    <Text style={[styles.bronzeTextColor, styles.badgeTextTypography]}>브론즈 뱃지</Text>
                </View>
                <View style={styles.badgeAndTextContainer}>
                    <BadgeSilver width={64} height={64} />
                    <Text style={[styles.silverTextColor, styles.badgeTextTypography]}>실버 뱃지</Text>
                </View>
                <View style={styles.badgeAndTextContainer}>
                    <BadgeGold width={64} height={64} />
                    <Text style={[styles.goldTextColor, styles.badgeTextTypography]}>골드 뱃지</Text>
                </View>
                {/* {Array.from(userAchievements.values()).some(a => a.grade === 'SPECIAL') && ( */}
                  {/* <View style={styles.badgeAndTextContainer}>
                    <BadgeHidden width={64} height={64} />
                    <Text style={[styles.hiddenTextColor, styles.badgeTextTypography]}>히든 뱃지</Text>
                  </View> */}
                {/* )} */}
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
            <AchievementList 
              achievements={filteredAchievements as any}
            />
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
  hiddenTextColor: {
    color: '#9A68FF',
  },
  badgeTextTypography: {
    ...typography.body5,
  },
  surface: {
    marginVertical: 30,
  },
  contentContainer: {
    gap: 20,
    paddingHorizontal: 20,
  },
  circleTabContainer: {
  },
});

export default MyAchievementScreen;