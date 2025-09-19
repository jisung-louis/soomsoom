import React, { useState } from 'react';
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
import { useAppConfigStore } from '../../../stores/appConfigStore';
dayjs.extend(relativeTime);
dayjs.locale('ko');

export type MailData = {
  id: number;
  type: 'news'; //추후 추가(유저끼리의 쪽지, 친구추가 알림 등)
  title: string;
  content: string;
  imageUrl?: string;
  sendDate: string; //yyyy-MM-ddTHH:mm:ss.SSSSSS
  isRead: boolean; //읽었는지 여부
  isDeleted: boolean; //삭제된 것인지 여부
};

const mockMailData: MailData[] = [
  {
    id: 1,
    type: 'news',
    title: '업데이트 진행 소식!',
    content: '메일함',
    imageUrl: undefined,
    sendDate: '2025-08-10T18:35:55.741664',
    isRead: false,
    isDeleted: false,
  },
  {
    id: 2,
    type: 'news',
    title: '일주일간 진행되는 감정기록 이벤트!',
    content: '안녕하세요 집사님들! 이번에 출시를 앞두고 저희를사랑 추첨하여 소정의선물을 드립니다. 추첨에는 개인정보가 활용되지 않습니다.숨숨을 많이 사랑해주세요! 감사합니다!',
    imageUrl: undefined,
    sendDate: '2025-09-05T15:00:00.000000',
    isRead: false,
    isDeleted: false,
  },
];

const isMailboxEmpty = () => {
  const { useMockApi } = useAppConfigStore.getState();
  if(useMockApi) {
  const isEmpty = mockMailData.length === 0;
  return isEmpty;
  }
  else {
    //TODO: 백엔드 API 연동 
    return true;
  }
};

export const typeMap = {
  news: '새로운 소식',
};

const sortMailData = (mailData: MailData[]) => {
  return mailData.sort((a, b) => {
    return dayjs(b.sendDate).diff(dayjs(a.sendDate));
  });
};

const MailboxScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const handleBack = () => {
    navigation.goBack();
  };
  const handleMailboxItemPress = (item: MailData) => {
    navigation.navigate('MailboxDetailScreen', { content: item });
  };
  const handleRefresh = () => {
    console.log('MailboxScreen Refresh');
    setRefreshing(true);
    setRefreshing(false);
  };
  

    return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>우편함</Text>
        {!isMailboxEmpty() ? (
          <FlatList
            data={sortMailData(mockMailData)}
            keyExtractor={(item) => item.id.toString()}
            style={styles.mailboxList}
            contentContainerStyle={styles.mailboxListContentContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <TouchableOpacity key={item.id} style={styles.mailboxItem} onPress={() => handleMailboxItemPress(item)}>
                <View style={styles.mailboxItemHeaderContainer}>
                  <MessageIcon width={32} height={32} />
                  <View style={styles.mailboxItemRightContainer}>
                    <Text style={styles.mailboxItemType}>{typeMap[item.type as keyof typeof typeMap]}</Text>
                    <View style={styles.mailboxItemDateAndReadBadgeContainer}>
                      <Text style={styles.mailboxItemDate}>{dayjs(item.sendDate).fromNow()}</Text>
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