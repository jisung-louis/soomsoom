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
import { decodeJwt } from '../../../../utils/jwt';
import { useAuth } from '../../../../hooks/useAuth';
import CustomAlert from '../../../../components/common/alert/CustomAlert';
import { useSocialLogin } from '../../../../contexts/SocialLoginContext';
import { useScreenAnalytics } from '../../../../hooks/useScreenAnalytics';

const AccountInfoScreen = () => {
    useScreenAnalytics('AccountInfoScreen');

    const navigation = useNavigation();
    const { showToast } = useToast();
    const { lastProviderToken, role } = useAuthStore();
    const { logout, deleteAccount, loading } = useAuth();
    const { resetOnboarding } = useOnboarding();
    const { showSocialLoginModal } = useSocialLogin();
    const [confirmVisible, setConfirmVisible] = React.useState(false);
    
    const handleBack = () => {
        navigation.goBack();
    };

    const user = decodeJwt(lastProviderToken);

    const isSocialLogin = role === 'ROLE_USER';

    // 사용자의 소셜 로그인 타입 확인
    const getSocialLoginType = (): '구글' | '애플' | 'UNKNOWN_PROVIDER' => {
        if (user?.iss?.includes('google')) return '구글';
        if (user?.iss?.includes('apple')) return '애플';
        return 'UNKNOWN_PROVIDER';
    };

    const handleLogoutOrLogin = async () => {
        // 확인 모달 오픈 (확인 시에만 로그아웃 실행)
        if (isSocialLogin) {
            setConfirmVisible(true);
        } else {
            // 로그인 버튼 클릭 시 소셜 로그인 팝업 표시
            showSocialLoginModal();
        }
    };

    const handleWithdraw = () => {
        console.log('회원탈퇴 버튼 클릭');
        Alert.alert(
            '정말로 탈퇴하시겠어요?',
            '\n탈퇴하시면 모든 데이터가 삭제되고 \n복구할 수 없어요.',
            [
                { text: '탈퇴', style: 'destructive', onPress: async () => {
                    try {
                        console.log('회원탈퇴 실행 중...');
                        const result = await deleteAccount();
                        if (result.success) {
                            console.log('회원탈퇴 완료');
                            // deleteAccount에서 이미 토스트 메시지와 상태 초기화를 처리함
                        } else {
                            console.error('회원탈퇴 실패:', result.error);
                        }
                    } catch (error) {
                        console.error('회원탈퇴 중 에러:', error);
                        showToast({ message: '회원탈퇴 중 문제가 발생했어요.' });
                    }
                } },
                { text: '뒤로가기', style: 'cancel', onPress: () => {
                    console.log('회원탈퇴 취소 버튼 클릭');
                } }
            ],
            { cancelable: true }
        );
    };

  return (
    <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <View style={styles.contentContainer}>
            <View style={styles.settingItem}>
                <View>
                    <Text style={styles.settingItemText}>
                        {isSocialLogin ? `${getSocialLoginType()} 계정` : '계정 정보'}
                    </Text>
                    {isSocialLogin && user && (
                        <Text style={styles.userInfoText}>{user.email}</Text>
                    )}
                </View>
                <TouchableOpacity onPress={handleLogoutOrLogin}>
                    <Text style={styles.loginText}>
                        {isSocialLogin ? '로그아웃' : '로그인'}
                    </Text>
                </TouchableOpacity>
            </View>
            <Surface height={1} color={colors.grayScale100}/>
            {isSocialLogin && (
            <View style={styles.settingItem}>
                <Text style={styles.withdrawText}>회원정보를 삭제하시겠어요?</Text>
                <TouchableOpacity 
                    onPress={handleWithdraw}
                    disabled={loading === 'DELETE'}
                    style={loading === 'DELETE' ? styles.disabledButton : null}
                >
                    <Text style={[
                        styles.withdrawText,
                        loading === 'DELETE' && styles.disabledText
                    ]}>
                        {loading === 'DELETE' ? '탈퇴 중...' : '회원탈퇴'}
                    </Text>
                </TouchableOpacity>
            </View>
            )}
        </View>

        {/* 확인 모달 */}
        <CustomAlert
          visible={confirmVisible}
          message="정말 로그아웃하시겠어요?"
          subMessage=""
          buttons={[
            { text: '로그아웃', onPress: async () => {
                setConfirmVisible(false);
                try {
                  // 로그아웃 후 일반 상태로 설정
                  await logout();
                  //showSocialLoginModal();
                  showToast({ message: '로그아웃되었습니다.' });
                } catch {
                  showToast({ message: '로그아웃 중 문제가 발생했어요.' });
                }
              }
            },
            { text: '취소', onPress: () => setConfirmVisible(false) },
            
          ]}
          onClose={() => setConfirmVisible(false)}
          />
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
        alignItems: 'flex-end',
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
    logoutButton: {
    },
    loginText: {
        ...typography.body3,
        color: '#F15F5F' //red
    },
    withdrawText: {
        ...typography.body5,
        color: colors.grayScale400,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: colors.grayScale300,
    },
});

export default AccountInfoScreen;