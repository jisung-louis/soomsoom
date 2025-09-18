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
import { MyAchievement } from "../../../types";
import Badge from "../../../components/common/badge/Badge";

// 뱃지 아이콘 렌더링 함수 (새로운 구조에 맞게 수정)
const renderBadgeIcon = (grade: string, isAchieved: boolean, width: number = 48, height: number = 48) => {
  if (!isAchieved) {
    return <BadgeEmpty width={width} height={height} />;
  }

  switch (grade) {
    case 'BRONZE':  
      return <BadgeBronze width={width} height={height} />;
    case 'SILVER':
      return <BadgeSilver width={width} height={height} />;
    case 'GOLD':
      return <BadgeGold width={width} height={height} />;
    case 'SPECIAL':
      return <BadgeHidden width={width} height={height} />;
    default:
      return <BadgeEmpty width={width} height={height} />;
  }
};

const AchievementList = ({ achievements }: { achievements: MyAchievement[] }) => {
  const getProgressText = (a: MyAchievement) => {
    const targetValue = a.progress?.target ?? 1;
    const current = a.progress?.current ?? 0;
    if (a.isAchieved) {
      return `${targetValue} / ${targetValue}`;
    }
    return `${current} / ${targetValue}`;
  };

  return (
    <View>
      {achievements.map((item) => (
        <View key={item.achievementId} style={styles.achievementItemContainer}>
            <View style={styles.achievementItem}>
                <View style={styles.achievementLeft}>
                  {renderBadgeIcon(item.grade, item.isAchieved)}
                  <View style={styles.achievementTitle}>
                    <Text style={styles.achievementTitleText}>{item.name}</Text>
                    <Text style={styles.achievementCompletionRateText}>
                      {getProgressText(item)}
                    </Text>
                    </View>
                </View>
                <View>
                    {item.isAchieved ? 
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