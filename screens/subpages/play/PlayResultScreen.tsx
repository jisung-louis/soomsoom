import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { StackActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import TopNavigation from '../../../components/common/top-navigation/TopNavigation';
import { radius } from '../../../constants/radius';
import ShadowSVG from '../../../assets/icons/charactors/shadow.svg'
import DefaultCharacter from '../../../assets/icons/charactors/default_character.svg'
import CheckIcon from '../../../assets/icons/common/check_active.svg'
import { Button } from '../../../components/common/buttons/Button';

const PlayResultScreen = () => {
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
    const handleBack = () => {
        navigation.goBack();
    };
    const playExit = () => {
        navigation.dispatch(StackActions.pop(3));
    };

    return (
        <View style={styles.background}>
            <SafeAreaView style={styles.container}>
                <TopNavigation
                    isShopButtonVisible={false}
                    isHeartButtonVisible={true}
                    isAddMenuButtonVisible={false}
                />
                <View style={styles.contentContainer}>
                    <View style={styles.characterWrapper}>
                        <ShadowSVG style={styles.shadow} />
                        <DefaultCharacter style={styles.character} />
                    </View>
                    <Text style={{...syongsyongTypography.title4, ...styles.title}}>좋아요! 지금 당신은</Text>
                    <View style={styles.infoBoxContainer}>
                        <View style={styles.infoBox}>
                            <View style={styles.infoTextBoxContainer}>
                                <View style={styles.infoTextRow}>
                                    <CheckIcon width={28} height={28} />
                                    <Text style={styles.infoText}>뇌에 맑은 산소가 가득 차올랐고...</Text>
                                </View>
                                <View style={styles.infoTextRow}>
                                    <CheckIcon width={28} height={28} />
                                    <Text style={styles.infoText}>마음은 하루를 준비할 평온함을 얻고...</Text>
                                </View>
                                <View style={styles.infoTextRow}>
                                    <CheckIcon width={28} height={28} />
                                    <Text style={styles.infoText}>무엇인가 집중할 준비가 되었어요!</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <Button
                    title="확인"
                    size="large"
                    variant="active"
                    style={styles.button}
                    onPress={playExit}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: colors.primary50,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    characterContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    characterWrapper: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    shadow: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
    },
    character: {
        position: 'absolute',
        bottom: 10,
        zIndex: 2,
        right: -9,
    },
    title: {
        marginTop: 30,
        marginBottom: 20,
    },
    infoBoxContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    infoBox: {
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: radius.r16,
    },
    infoTextBoxContainer: {
        gap: 16,
    },
    infoTextRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    infoText: {
        ...typography.body2,
        color: colors.grayScale900,
    },
    button: {
        alignSelf: 'center',
        marginBottom: 20,
    },
});

export default PlayResultScreen;