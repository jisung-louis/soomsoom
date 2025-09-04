import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { typography, syongsyongTypography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import MessageIcon from '../../../assets/icons/navigation/topNavigation/message.svg';

type MailData = {
  id: number;
  type: 'news'; //추후 추가(유저끼리의 쪽지, 친구추가 알림 등)
  title: string;
  content: string;
  sendDate: string; //yyyy-MM-dd
  sendTime: string; //HH:mm
  isRead: boolean; //읽었는지 여부
  isDeleted: boolean; //삭제된 것인지 여부
};

const mockMailData: MailData[] = [
  {
    id: 1,
    type: 'news',
    title: '업데이트 진행 소식!',
    content: '메일함',
    sendDate: '2025-01-01',
    sendTime: '12:00',
    isRead: false,
    isDeleted: false,
  },
  {
    id: 2,
    type: 'news',
    title: '일주일간 진행되는 감정기록 이벤트!',
    content: '안녕하세요 집사님들! 이번에 출시를 앞두고 저희를사랑 추첨하여 소정의선물을 드립니다. 추첨에는 개인정보가 활용되지 않습니다.숨숨을 많이 사랑해주세요! 감사합니다!',
    sendDate: '2025-01-02',
    sendTime: '15:00',
    isRead: false,
    isDeleted: false,
  },
];

const isMailboxEmpty = () => {
  if(__DEV__) {
  const isEmpty = mockMailData.length === 0;
  return isEmpty;
  }
  else {
    //TODO: 백엔드 API 연동 
    return true;
  }
};

const typeMap = {
  news: '새로운 소식',
};


const MailboxScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };
  const handleMailboxItemPress = (item: MailData) => {
    console.log(item.title, item.content);
  };
    return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>우편함</Text>
        {!isMailboxEmpty() ? (
          <FlatList
            data={mockMailData}
            keyExtractor={(item) => item.id.toString()}
            style={styles.mailboxList}
            contentContainerStyle={styles.mailboxListContentContainer}
            renderItem={({ item }) => (
              <TouchableOpacity key={item.id} style={styles.mailboxItem} onPress={() => handleMailboxItemPress(item)}>
                <View style={styles.mailboxItemHeaderContainer}>
                  <MessageIcon width={32} height={32} />
                  <View style={styles.mailboxItemRightContainer}>
                    <Text style={styles.mailboxItemType}>{typeMap[item.type]}</Text>
                    <Text style={styles.mailboxItemDate}>{item.sendDate}</Text>
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
            <Text style={styles.emptyText}>우편함이 비어있습니다.</Text>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: '100%',
    justifyContent: 'space-between',
  },
  mailboxItemType: {
    ...typography.body5,
    color: colors.grayScale500,
  },
  mailboxItemDate: {
    ...typography.body5,
    color: colors.grayScale500,
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
  },
  emptyText: {
    ...typography.body5,
    color: colors.grayScale500,
  },
});

export default MailboxScreen;