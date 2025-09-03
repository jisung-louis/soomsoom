import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import SubpageHeader, {SUBPAGE_HEADER_HEIGHT} from "../../../components/common/top-navigation/SubpageHeader";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { PlayStackParamList } from "../../../navigations/tabs/PlayStackNavigator";
import { colors } from "../../../constants/colors";
import { sx, sy, sv, ss } from "../../../utils/scale";
import { typography, syongsyongTypography } from "../../../constants/typography";
import LottieView from "lottie-react-native";
import { playIcons } from "../../../constants/icons";
import BubbleTalk from "../../../components/common/bubbletalk/BubbleTalk";
import { radius } from "../../../constants/radius";

const PlayBreathContentScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayBreathContentScreen'>}) => {
    const {content} = route.params;
    const [isPlaying, setIsPlaying] = useState(true);
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();       
    const insets = useSafeAreaInsets();
    const handleBack = () => {
        navigation.goBack();
    }   
    const goToResultScreen = () => {
        navigation.navigate('PlayResultScreen');
    }
    return (
        <>
        {/* TODO: 호흡 데이터(노션 백엔드 페이지의 Activity 단건 조회 부분) 백엔드 API 연동 */}
        {/* TODO: Activity 단건 조회 response body의 timeline 배열 데이터를 재생 시간에 맞춰 contentText, 로띠 애니메이션에 매핑 */}
            <SafeAreaView style={styles.container}>
                <SubpageHeader onBack={handleBack} />
                {/* TODO: 호흡 재생 및 텍스트 매핑 추가 */}
                <View style={[styles.contentContainer, {marginTop: sy(277)-insets.top-SUBPAGE_HEADER_HEIGHT}]}>
                    <Text style={styles.contentText}>5</Text>
                    <Text style={styles.contentText}>깊게 숨을 들이키세요!</Text>
                </View>

                {__DEV__ && (
                    <TouchableOpacity style={{paddingHorizontal: 20}} onPress={() => {goToResultScreen()}}>
                        <Text>{content.title}</Text>
                        <Text>{content.description}</Text>
                        <Text>{content.time}</Text>
                        <Text>{content.type}</Text>
                        <Text>{content.image}</Text>
                        <Text>{isPlaying ? 'playing' : 'paused'}</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
            <LottieView
                source={require('../../../assets/animations/breathing_motion.json')}
                autoPlay
                loop
                style={styles.breathingCatAnimation}
            />
            <View style={[styles.floatingContainer, {bottom: 20 + insets.bottom, right: 20}]}>
                {isPlaying ? (
                    <>
                        <BubbleTalk text="호흡을 잠시 멈출까요?" trianglePosition="right"/>
                        <TouchableOpacity onPress={() => {
                            setIsPlaying(false);
                        }}>
                            <View style={styles.pauseButton}>
                                <Text style={styles.TimeRemainingText}>00:00</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <BubbleTalk text="다시 시작할까요?" trianglePosition="right"/>
                        <TouchableOpacity onPress={() => {
                            setIsPlaying(true);
                        }}>
                            <playIcons.circleed.play width={64} height={64} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary50,
    },
    contentContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
    },
    contentText: {
        ...syongsyongTypography.title4,
    },
    breathingCatAnimation: {
        width: ss(375),
        height: sv(375),
        position: 'absolute',
        bottom: 0,
        zIndex: 999,
    },
    floatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        position: 'absolute',
        zIndex: 1000,
    },
    pauseButton: {
        width: 64,
        height: 64,
        backgroundColor: colors.primary300,
        borderRadius: radius.max,
        alignItems: 'center',
        justifyContent: 'center',
    },
    TimeRemainingText: {
        ...typography.body2,
        color: colors.white,
    },
});

export default PlayBreathContentScreen;