import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { usePlayStore } from '../../../stores/playStore';
import { useAlarmStore } from '../../../stores/alarmStore';

const TestScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        {/* zustand 테스트 */}
        <Text>하트포인트: {useCurrencyStore.getState().heartPoints}</Text>
        <Text>즐겨찾기 컨텐츠: {usePlayStore.getState().favoriteContents.map((content) => content.contentId).join(', ')}</Text>
        <Text>팔로우한 선생님: {usePlayStore.getState().followedTeachers.map((teacher) => teacher.teacherId.join(', '))}</Text>
        <Text>알람: {useAlarmStore.getState().alarmList.map((alarm) => alarm.id).join(', ')}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TestScreen;