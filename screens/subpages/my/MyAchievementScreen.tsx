import React, { useState } from "react";
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

type Achievement = {
  id: number;
  title: string;
  goal: number;
  type: string;
};

type UserAchievement = {
  id: number;
  completionRate: number;
};

const mockAchievement: Achievement[] = [
  {
    id: 1,
    title: '1분 호흡이 어느덧 10분',
    goal: 10,
    type: 'minute',
  },
  {
    id: 2,
    title: '방문횟수 1회',
    goal: 1,
    type: 'count',
  },
  {
    id: 3,
    title: '명상 1회',
    goal: 1,
    type: 'count',
  },
];  

const mockUserAchievement: UserAchievement[] = [
  {
    id: 1,
    completionRate: 5,
  },
  {
    id: 2,
    completionRate: 1,
  },
  {
    id: 3,
    completionRate: 1,
  },
];

// 업적 목록 필터링
const filterAchievement = (
    achievements: Achievement[],
    userAchievements: UserAchievement[],
    selectedTab: string
  ): Achievement[] => {
    return achievements.filter((achievement) => {
      const user = userAchievements.find((ua) => ua.id === achievement.id);
      const completion = user?.completionRate ?? 0;
  
      if (selectedTab === '달성') {
        return completion >= achievement.goal;
      } else if (selectedTab === '미달성') {
        return completion < achievement.goal;
      }
  
      return true; // '전체' 탭일 경우
    });
  };

const MyAchievementScreen = () => {
  const [selectedTab, setSelectedTab] = useState<string>('전체');
  const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };

  const renderTab = () => {
    const filtered = filterAchievement(mockAchievement, mockUserAchievement, selectedTab);
    return <AchievementList achievement={filtered} userAchievement={mockUserAchievement} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.systemBadgeContainer}>
            <Text style={{...syongsyongTypography.title5}}>뱃지</Text>
            <View style={styles.systemBadge}>
                <View style={styles.badgeAndTextContainer}>
                    <BronzeBadge width={64} height={64}/>
                    <Text style={[styles.bronzeTextColor, styles.badgeTextTypography]}>브론즈 뱃지</Text>
                </View>
                <View style={styles.badgeAndTextContainer}>
                    <SilverBadge width={64} height={64}/>
                    <Text style={[styles.silverTextColor, styles.badgeTextTypography]}>실버 뱃지</Text>
                </View>
                <View style={styles.badgeAndTextContainer}>
                    <GoldBadge width={64} height={64}/>
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