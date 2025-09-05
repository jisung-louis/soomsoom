import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { usePlayStore } from '../../../stores/playStore';
import { useAlarmStore } from '../../../stores/alarmStore';
import { useRoomStore } from '../../../stores/roomStore';
import { roomItemList } from '../../../data/roomItemData';
import { mockContentData, mockInstructorsData } from '../../../data/playContentData';

const TestScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };
  
  {/* 아이템 아이디 -> 아이템 이름 */}
  const itemIdToName = (itemId: number|null) => {
    if (itemId === null) return '없음';
    return roomItemList.find((item) => item.id === itemId)?.title;
  };

  {/* 컨텐츠 아이디 -> 컨텐츠 이름 */}
  const contentIdToName = (contentId: number) => {
    const content = mockContentData.find((item) => item.id === contentId);
    return content ? content.title.join(' ') : `컨텐츠 ${contentId}`;
  };

  {/* 강사 아이디 -> 강사 이름 */}
  const instructorIdToName = (instructorId: number) => {
    const instructor = mockInstructorsData.find((item) => item.id === instructorId);
    return instructor ? `${instructor.name}` : `강사 ${instructorId}`;
  };
  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Zustand 상태 테스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰(하트포인트) 돈 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>하트포인트</Text>
            <Text style={styles.infoValue}>{useCurrencyStore.getState().heartPoints}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵(즐겨찾기, 팔로우) 유저 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>즐겨찾기 컨텐츠</Text>
            <Text style={styles.infoValue}>
              {usePlayStore.getState().favoriteContents.length > 0 
                ? usePlayStore.getState().favoriteContents.map((content) => contentIdToName(content.contentId)).join(', ')
                : '없음'
              }
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>팔로우한 선생님</Text>
            <Text style={styles.infoValue}>
              {usePlayStore.getState().followedInstructors.length > 0 
                ? usePlayStore.getState().followedInstructors.map((instructor) => instructor.name).join(', ')
                : '없음'
              }
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ 알람 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>알람 목록</Text>
            <Text style={styles.infoValue}>{useAlarmStore.getState().alarmList.map((alarm) => alarm.id).join(', ')||'없음'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 룸 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>보유 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().ownedItems.map((item) => itemIdToName(item)).join(', ')||'없음'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 홈 배치 아이템</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>안경 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.eyewear ? itemIdToName(useRoomStore.getState().placedItems.eyewear) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>모자 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.hat ? itemIdToName(useRoomStore.getState().placedItems.hat) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>프레임1 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.frame1 ? itemIdToName(useRoomStore.getState().placedItems.frame1) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>프레임2 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.frame2 ? itemIdToName(useRoomStore.getState().placedItems.frame2) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>배경 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.background ? itemIdToName(useRoomStore.getState().placedItems.background) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>바닥 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.floor ? itemIdToName(useRoomStore.getState().placedItems.floor) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>선반 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.shelf ? itemIdToName(useRoomStore.getState().placedItems.shelf) : '없음'}</Text>
          </View>
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.title4,
    color: colors.grayScale900,
    marginBottom: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary300,
  },
  infoLabel: {
    ...typography.body4,
    color: colors.grayScale600,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    ...typography.body3,
    color: colors.grayScale900,
    lineHeight: 20,
  },
});

export default TestScreen;