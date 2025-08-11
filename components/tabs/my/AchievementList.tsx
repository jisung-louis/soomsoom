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

const typeMapping = {
  'minute': 'min',
  'count': '회',
}

const AchievementList = ({ achievement, userAchievement }: { achievement: Achievement[], userAchievement: UserAchievement[] }) => {
  const isAchieved = (achievementId: number) => {
    const user = userAchievement.find(ua => ua.id === achievementId);
    const achievementItem = achievement.find(a => a.id === achievementId);
    return user && achievementItem ? user.completionRate >= achievementItem.goal : false;
  };

  return (
    <View>
      {achievement.map((item) => (
        <View key={item.id} style={styles.achievementItemContainer}>
            <View style={styles.achievementItem}>
                <View style={styles.achievementLeft}>
                  {isAchieved(item.id) ? (
                    <BadgeBronze width={48} height={48} />//TODO: 뱃지 색깔(브론즈, 실버, 골드, 히든)에 따라 분기처리
                  ) : (
                    <BadgeEmpty width={48} height={48} />
                  )}
                  <View style={styles.achievementTitle}>
                    <Text style={styles.achievementTitleText}>{item.title}</Text>
                    {isAchieved(item.id) ? (
                        <Text style={styles.achievementCompletionRateText}>{userAchievement.find(ua => ua.id === item.id)?.completionRate}{typeMapping[item.type as keyof typeof typeMapping]}</Text>
                    ) : (
                        <Text style={styles.achievementCompletionRateText}>{userAchievement.find(ua => ua.id === item.id)?.completionRate}{typeMapping[item.type as keyof typeof typeMapping]} / {item.goal}{typeMapping[item.type as keyof typeof typeMapping]}</Text>
                    )}
                    </View>
                </View>
                <View>
                    <Text style={styles.statusText}>
                      {isAchieved(item.id) ? 
                        <Badge title="달성" variant="default"/>
                      : <Badge title="미달성" variant="secondary"/>}
                    </Text>
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