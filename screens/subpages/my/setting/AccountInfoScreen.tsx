import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { Surface } from '../../../../components/common/surface/Surface';

//TODO: 로그인/로그아웃 기능 구현

const AccountInfoScreen = () => {
    const navigation = useNavigation();
    const handleBack = () => {
        navigation.goBack();
    };

    const isLoggedIn = true;

    const socialLogin: '구글' | '애플' | '카카오' = '구글';

  return (
    <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <View style={styles.contentContainer}>
            <View style={styles.settingItem}>
                <Text style={styles.settingItemText}>{socialLogin} 계정</Text>
                <TouchableOpacity onPress={() => {
                    console.log('로그인/로그아웃 버튼 클릭');
                    if (isLoggedIn) {
                        //로그아웃 기능 구현
                    } else {
                        //로그인 기능 구현
                    }
                }}>
                    <Text style={styles.loginText}>{isLoggedIn ? '로그아웃' : '로그인'}</Text>
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