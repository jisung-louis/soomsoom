import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { typography, syongsyongTypography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import MessageIcon from '../../../assets/icons/navigation/topNavigation/message.svg';
import EmptyIcon from '../../../assets/images/home/mailbox/mailbox_empty.svg';
import { radius } from '../../../constants/radius';
import { useMailboxStore } from '../../../stores/mailboxStore';
import { UserAnnouncement, getAnnouncementDetail } from '../../../services/mailboxService';
dayjs.extend(relativeTime);
dayjs.locale('ko');

const isMailboxEmpty = (announcements: UserAnnouncement[] | undefined | null) => {
  return !announcements || announcements.length === 0;
};

export const typeMap = {
  news: '새로운 소식',
};

const sortAnnouncements = (announcements: UserAnnouncement[] | undefined | null) => {
  const list = Array.isArray(announcements) ? announcements.slice() : [];
  return list.sort((a, b) => {
    return dayjs(b.receivedAt).diff(dayjs(a.receivedAt));
  });
};

const MailboxScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  
  // 우편함 스토어
  const { 
    announcements, 
    announcementsLoading, 
    loadAnnouncements 
  } = useMailboxStore();

  // 화면 진입 시 공지사항 로드
  useEffect(() => {
    loadAnnouncements({ page: 0, size: 20, sort: ['receivedAt,desc'] });
  }, [loadAnnouncements]);

  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleMailboxItemPress = async (item: UserAnnouncement) => {
    try {
      console.log('공지사항 클릭:', item);
      
      // 메일 상세 조회 및 읽음 처리
      const detail = await getAnnouncementDetail(item.userAnnouncementId);
      console.log('메일 상세 조회 완료:', detail);
      
      navigation.navigate('MailboxDetailScreen', { content: detail });
      
      // 읽음 처리 후 목록 새로고침 (읽음 상태 업데이트)
      // loadAnnouncements 내부에서 loadUnreadCount도 호출됨
      await loadAnnouncements({ page: 0, size: 20, sort: ['receivedAt,desc'] });
      
      console.log('📬 메일 읽음 처리 완료, 캐시 동기화됨');
      
    } catch (error) {
      console.error('메일 상세 조회 실패:', error);
    }
  };
  
  const handleRefresh = async () => {
    console.log('MailboxScreen Refresh');
    setRefreshing(true);
    await loadAnnouncements({ page: 0, size: 20, sort: ['receivedAt,desc'] });
    setRefreshing(false);
  };
  

    return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>우편함</Text>
        {!isMailboxEmpty(announcements) ? (
          <FlatList
            data={sortAnnouncements(announcements)}
            keyExtractor={(item) => item.userAnnouncementId.toString()}
            style={styles.mailboxList}
            contentContainerStyle={styles.mailboxListContentContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <TouchableOpacity key={item.userAnnouncementId} style={styles.mailboxItem} onPress={() => handleMailboxItemPress(item)}>
                <View style={styles.mailboxItemHeaderContainer}>
                  <MessageIcon width={32} height={32} />
                  <View style={styles.mailboxItemRightContainer}>
                    <Text style={styles.mailboxItemType}>새로운 소식</Text>
                    <View style={styles.mailboxItemDateAndReadBadgeContainer}>
                      <Text style={styles.mailboxItemDate}>{dayjs(item.receivedAt).fromNow()}</Text>
                      {!item.isRead && (
                        <View style={styles.mailboxItemReadBadge}/>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.mailboxItemTitleContainer}>
                  <Text style={styles.mailboxItemTitle}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.mailboxEmptyContainer}>
            <EmptyIcon width={100} height={100} />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>우편함이 텅 비었어요!</Text>
              <Text style={styles.emptyText}>소식을 기다려주세요!</Text>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingLeft: 28,
    paddingTop: 30,
    gap: 20,
  },
  title: {
    ...syongsyongTypography.title5,
    color: colors.grayScale900,
  },
  mailboxList: {
    flex: 1,
  },
  mailboxListContentContainer: {
    gap: 16,
  },
  mailboxItem: {
    gap: 4,
  },
  mailboxItemHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mailboxItemRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  mailboxItemType: {
    ...typography.body5,
    color: colors.grayScale500,
  },
  mailboxItemDateAndReadBadgeContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  mailboxItemDate: {
    ...typography.body5,
    color: colors.grayScale500,
  },
  mailboxItemReadBadge: {
    width: 8,
    height: 8,
    borderRadius: radius.max,
    backgroundColor: '#F15F5F',
  },
  mailboxItemTitleContainer: {
    paddingLeft: 38,
  },
  mailboxItemTitle: {
    ...typography.body2,
    color: colors.grayScale900,
  },
  mailboxEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  emptyTextContainer: {
    alignItems: 'center',
  },
  emptyText: {
    ...syongsyongTypography.title6,
  },
});

export default MailboxScreen;