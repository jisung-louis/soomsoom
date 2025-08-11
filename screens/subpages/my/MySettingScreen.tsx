import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { MyStackParamList } from '../../../navigations/tabs/MyStackNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../../constants/colors';
import ArrowRightIcon from '../../../assets/icons/common/arrow_right.svg';
import { typography } from '../../../constants/typography';
import { Surface } from '../../../components/common/surface/Surface';

const MySettingScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={() => {handleBack()}}/>
        <View style={styles.settingContainer}>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('NotificationSettingScreen')}}>
                <Text style={styles.settingItemText}>알림설정</Text>
                <ArrowRightIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('AccountInfoScreen')}}>
                <Text style={styles.settingItemText}>계정정보</Text>
                <ArrowRightIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('NoticeScreen')}}>
                <Text style={styles.settingItemText}>공지사항</Text>
                <ArrowRightIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('InquiryBugScreen')}}>
                <Text style={styles.settingItemText}>문의/버그</Text>
                <ArrowRightIcon width={24} height={24} />
            </TouchableOpacity>
        </View>
        <Surface style={styles.surface}/>
        <View style={styles.termAndPolicyContainer}>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('InformationScreen')}}>
                <Text style={styles.settingItemText}>정보</Text>
                <Text style={styles.versionText}>최신버전</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('TermOfServiceScreen')}}>
                <Text style={styles.settingItemText}>서비스 이용 약관</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('PrivacyPolicyScreen')}}>
                <Text style={styles.settingItemText}>개인정보처리방침</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    settingContainer: {
        paddingHorizontal: 20,
        gap: 16,
        marginTop: 30,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingItemText: {
        ...typography.body1,
        color: colors.grayScale900,
    },
    surface: {
        marginTop: 50,
        marginBottom: 40,
    },
    termAndPolicyContainer: {
        gap: 16,
        paddingHorizontal: 20,
    },
    versionText: {
        color: colors.primary300,
    },
});

export default MySettingScreen;