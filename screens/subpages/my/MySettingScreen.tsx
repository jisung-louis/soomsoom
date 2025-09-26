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
import { TERMS_URL, PRIVACY_URL, INQUIRY_BUG_URL } from '../../../constants/externalUrl';
import { useOpenExternalLink } from '../../../hooks/useOpenExternalLink';
import { checkLatestVersion } from '../../../services/versionService';
import { storeUrlForPlatform } from '../../../constants/externalUrl';

const MySettingScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
  const openExternalLink = useOpenExternalLink();
  const [isLatest, setIsLatest] = React.useState<boolean | null>(null);
  const [checking, setChecking] = React.useState<boolean>(false);
  const handleBack = () => {
    navigation.goBack();
  };
  const handleOpenExternalLink = async (url: string) => {
    await openExternalLink(url);
  };
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setChecking(true);
        const res = await checkLatestVersion();
        if (!mounted) return;
        setIsLatest(!!res.isLatest);
      } catch {
        if (!mounted) return;
        setIsLatest(null);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={() => {handleBack()}}/>
        <View style={styles.settingContainer}>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('NotificationSettingScreen')}}>
                <Text style={styles.settingItemText}>알림설정</Text>
                <ArrowRightIcon width={24} height={24} color={colors.grayScale900} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {navigation.navigate('AccountInfoScreen')}}>
                <Text style={styles.settingItemText}>계정정보</Text>
                <ArrowRightIcon width={24} height={24} color={colors.grayScale900} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {handleOpenExternalLink(INQUIRY_BUG_URL)}}>
                <Text style={styles.settingItemText}>문의/버그</Text>
                <ArrowRightIcon width={24} height={24} color={colors.grayScale900} />
            </TouchableOpacity>
        </View>
        <Surface style={styles.surface}/>
        <View style={styles.termAndPolicyContainer}>
            <View style={styles.settingItem}>
                <Text style={styles.settingItemText}>정보</Text>
                {isLatest === false ? (
                  <TouchableOpacity onPress={() => handleOpenExternalLink(storeUrlForPlatform)}>
                    <Text style={[styles.versionText]}>업데이트 필요</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.versionText}>{checking ? '확인 중...' : '최신버전'}</Text>
                )}
            </View>
            <TouchableOpacity style={styles.settingItem} onPress={() => {handleOpenExternalLink(TERMS_URL)}}>
                <Text style={styles.settingItemText}>서비스 이용 약관</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => {handleOpenExternalLink(PRIVACY_URL)}}>
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