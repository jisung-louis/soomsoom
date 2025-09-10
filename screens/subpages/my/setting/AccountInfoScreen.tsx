import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { Surface } from '../../../../components/common/surface/Surface';
import { useAuthStore } from '../../../../stores/authStore';
import { useToast } from '../../../../hooks/useToast';
import { useOnboarding } from '../../../../contexts/OnboardingContext';

const AccountInfoScreen = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const { user, isLoggedIn, logout } = useAuthStore();
    const { resetOnboarding } = useOnboarding();
    
    const handleBack = () => {
        navigation.goBack();
    };

    // 사용자의 소셜 로그인 타입 확인
    const getSocialLoginType = (): '구글' | '애플' | '카카오' => {
        if (!user?.provider) {
            return '구글'; // 기본값
        }
        
        switch (user.provider) {
            case 'google':
                return '구글';
            case 'apple':
                return '애플';
            default:
                return '구글'; // 기본값
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃하시겠어요?',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            //await resetOnboarding(); // 온보딩 상태 리셋
                            showToast({ message: '로그아웃되었습니다.' });
                            //console.log('🔄 온보딩 상태가 리셋되었습니다. 다음 앱 시작 시 온보딩 화면이 표시됩니다.');
                        } catch (error) {
                            console.error('로그아웃 에러:', error);
                            showToast({ message: '로그아웃에 실패했습니다.' });
                        }
                    },
                },
            ]
        );
    };

  return (
    <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <View style={styles.contentContainer}>
            <View style={styles.settingItem}>
                <View>
                    <Text style={styles.settingItemText}>
                        {isLoggedIn ? `${getSocialLoginType()} 계정` : '계정 정보'}
                    </Text>
                    {isLoggedIn && user && (
                        <Text style={styles.userInfoText}>
                            {user.name} ({user.email})
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.loginText}>
                        {isLoggedIn ? '로그아웃' : '로그인'}
                    </Text>
                </TouchableOpacity>
            </View>
            <Surface height={1} color={colors.grayScale100}/>
            <View style={styles.settingItem}>
                <Text style={styles.withdrawText}>회원정보를 삭제하시겠어요?</Text>
                <TouchableOpacity onPress={() => {
                    console.log('회원탈퇴 버튼 클릭');
                    //회원탈퇴 기능 구현
                }}>
                    <Text style={styles.withdrawText}>회원탈퇴</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: 30,
        gap: 16,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingItemText: {
        ...typography.body1,
        color: colors.grayScale900,
    },
    userInfoText: {
        ...typography.body5,
        color: colors.grayScale500,
        marginTop: 4,
    },
    loginText: {
        ...typography.body3,
        color: '#F15F5F' //red
    },
    withdrawText: {
        ...typography.body5,
        color: colors.grayScale400,
    },
});

export default AccountInfoScreen;