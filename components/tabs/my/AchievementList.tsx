import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radius } from "../../../constants/radius";
import { colors } from "../../../constants/colors";
import { typography } from "../../../constants/typography";
import BadgeEmpty from "../../../assets/icons/my/badge_empty.svg";
import BadgeBronze from "../../../assets/icons/my/badge_bronze.svg";
import BadgeSilver from "../../../assets/icons/my/badge_silver.svg";
import BadgeGold from "../../../assets/icons/my/badge_gold.svg";
import BadgeHidden from "../../../assets/icons/my/badge_hidden.svg";
import Badge from "../../../components/common/badge/Badge";
import { Achievement } from "../../../types";
import { UserAchievement } from "../../../stores/achievementStore";
import LottieView from "lottie-react-native";

// typeMapping은 더 이상 사용하지 않음 - 새로운 구조에서는 conditions에서 targetValue를 직접 사용

// 뱃지 아이콘 렌더링 함수 (새로운 구조에 맞게 수정)
const renderBadgeIcon = (grade: string, isAchieved: boolean, width: number = 48, height: number = 48) => {
  if (!isAchieved) {
    return <BadgeEmpty width={width} height={height} />;
  }

  switch (grade) {
    case 'BRONZE':  
      return <LottieView
                source={require('../../../assets/animations/badge/bronze_action.json')}
                autoPlay
                loop
                style={{ width, height }}
              />;
    case 'SILVER':
      return <LottieView
              source={require('../../../assets/animations/badge/silver_action.json')}
              autoPlay
              loop
              style={{ width, height }}
            />;
    case 'GOLD':
      return <LottieView
              source={require('../../../assets/animations/badge/gold_action.json')}
              autoPlay
              loop
              style={{ width, height }}
            />;
    case 'SPECIAL':
      return <LottieView
              source={require('../../../assets/animations/badge/hidden_action.json')}
              autoPlay
              loop
              style={{ width, height }}
            />;
    default:
      return <BadgeEmpty width={width} height={height} />;
  }
};

const AchievementList = ({ achievement, userAchievement }: { achievement: Achievement[], userAchievement: UserAchievement[] }) => {
  const isAchieved = (achievementId: number) => {
    const user = userAchievement.find(ua => ua.id === achievementId);
    return user?.isAchieved ?? false;
  };

  const getProgressText = (achievementId: number) => {
    const user = userAchievement.find(ua => ua.id === achievementId);
    const achievementItem = achievement.find(a => a.id === achievementId);
    
    if (!user || !achievementItem) return '0 / 1';
    
    const targetValue = achievementItem.conditions[0]?.targetValue || 1;
    const current = user.completionRate;
    
    if (user.isAchieved) {
      return `${targetValue} / ${targetValue}`;
    } else {
      return `${current} / ${targetValue}`;
    }
  };

  return (
    <View>
      {achievement.map((item) => (
        <View key={item.id} style={styles.achievementItemContainer}>
            <View style={styles.achievementItem}>
                <View style={styles.achievementLeft}>
                  {renderBadgeIcon(item.grade, isAchieved(item.id))}
                  <View style={styles.achievementTitle}>
                    <Text style={styles.achievementTitleText}>{item.name}</Text>
                    <Text style={styles.achievementCompletionRateText}>
                      {getProgressText(item.id)}
                    </Text>
                    </View>
                </View>
                <View>
                    {isAchieved(item.id) ? 
                      <Badge title="달성" variant="default"/>
                    : <Badge title="미달성" variant="secondary"/>}
                </View>
            </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
    achievementItemContainer: {
        padding: 12,
        borderRadius: radius.r8,
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
        marginBottom: 10,
    },
    achievementItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    achievementLeft: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    achievementTitle: {
      gap: 4,
    },
    achievementTitleText: {
      ...typography.body4,
      color: colors.grayScale900,
    },
    achievementCompletionRateText: {
      ...typography.caption2,
      color: colors.grayScale600,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
export default AchievementList;