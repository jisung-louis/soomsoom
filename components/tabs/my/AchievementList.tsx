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

{/*
🔍 내 업적 목록 조회 결과: {
  "content": [
    {
      "achievementId": 1,
      "name": "1회 일기 작성",
      "description": "감정일기 1회 작성",
      "phrase": "1회도 중요해요",
      "grade": "BRONZE",
      "category": "DIARY",
      "isAchieved": true,
      "achievedAt": "2025-09-25T15:48:10.534055",
      "progress": {
        "currentValue": 1,
        "targetValue": 1,
        "unit": "회"
      }
    }
  ],
  "page": {
    "size": 50,
    "number": 1,
    "totalElements": 1,
    "totalPages": 1
  }
}
  */}

const AchievementList = ({ achievements }: { achievements: MyAchievement[] }) => {

  return (
    <View>
      {achievements.map((item) => (
        <View key={item.achievementId} style={styles.achievementItemContainer}>
            <View style={styles.achievementItem}>
                <View style={styles.achievementLeft}>
                  {renderBadgeIcon(item.grade, item.isAchieved)}
                  <View style={styles.achievementTitle}>
                    <Text style={styles.achievementTitleText}>{item.name}</Text>
                    <View style={styles.achievementLeftBottomContainer}>
                      <Text style={styles.achievementDescriptionText}>
                        {item.description}
                      </Text>
                      <Text style={styles.achievementDescriptionText}>∙</Text>
                      <View style={styles.achievementCompletionRateTextContainer}>
                        <Text style={styles.achievementCompletionRateText}>
                          {item.progress?.currentValue}
                        </Text>
                        <Text style={styles.achievementCompletionRateText}>/</Text>
                        <Text style={styles.achievementCompletionRateText}>
                          {item.progress?.targetValue}{item.progress?.unit}
                        </Text>
                      </View>
                    </View>
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
    achievementLeftBottomContainer: {
      flexDirection: 'row',
      gap: 4,
    },
    achievementDescriptionText: {
      ...typography.caption2,
      color: colors.grayScale600,
    },
    achievementCompletionRateTextContainer: {
      flexDirection: 'row',
      gap: 1,
    },
    achievementCompletionRateText: {
      ...typography.caption2,
      color: colors.grayScale800,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
export default AchievementList;