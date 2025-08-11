import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecordStackParamList } from '../../../navigations/tabs/RecordStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import VisualImage from '../../../assets/images/record/EmotionRecordHelp/image.svg';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import EmotionHelpBox from '../../../components/tabs/record/EmotionRecordHelp/EmotionHelpBox';
import {Button} from '../../../components/common/buttons/Button';
import { LinearGradient } from 'expo-linear-gradient';

type EmotionRecordHelpScreenNavigationProp = StackNavigationProp<RecordStackParamList, 'EmotionRecordHelpScreen'>;

const EmotionRecordHelpScreen = () => {
  const navigation = useNavigation<EmotionRecordHelpScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} title="도움말" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* 컨텐츠 1 */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={{...syongsyongTypography.title5}}>마음 일기를 쓰는 건,{"\n"}나를 이해하는 첫 걸음이에요.</Text>
            <Text style={styles.subText}>
              자신의 감정을 말이나 글로 표현하면서 지금 내가 무엇을 느끼고 있는지 더 정확히 인식할 수 있어요.
            </Text>
          </View>
          <View style={styles.visualContainer}>
            <View style={styles.visualImageWrapper}>
              <VisualImage />
            </View>
          </View>
        </View>

        {/* 컨텐츠 2 */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={{...syongsyongTypography.title5}}>마음 일기, 이렇게 도움이 돼요!</Text>
            <EmotionHelpBox
              number={1}
              title="자기 이해 및 감정 인식 변화"
              content="자신의 감정을 글로 표현하는 과정에서 막연했던 감정들이 구체화되고 명확해져요.  '왜 이런 감정을 느끼는지', '어떤 상황에서 특정 감정이 유발되는지' 등 자신의 내면을 깊이 탐색하고 이해하는 데 도움이 돼요!"
              source="Lieberman et al., 2007, Psychological Science"
            />
            <EmotionHelpBox
              number={2}
              title="감정 조절 능력 향상"
              content="격렬한 감정을 느낄 때 이를 글로 옮겨 적으면 감정과 거리를 둘 수 있게 됩니다. 이는 감정에 압도되지 않고 한 발짝 물러서서 객관적으로 바라볼 수 있게 하여감정 조절에 도움을 줍니다."
              source="Lieberman et al., 2007, Psychological Science"
            />
            <EmotionHelpBox
              number={3}
              title="스트레스 감소"
              content="걱정이나 스트레스 요인을 글로 적으면 문제의 본질을 파악하고 해결책을 모색하는 데 도움이 됩니다. 이는 심리적 부담감을 줄이고, 불안 및 우울감을 완화하는효과가 있습니다."
              source="James W. Pennebaker"
            />
            <EmotionHelpBox
              number={4}
              title="문제 해결 및 인지적 재구성"
              content="특정 문제나 어려운 상황에 대해 글로 작성하면,상황을 다각도로 분석하고 이전에는 생각하지 못했던 해결책이나 관점을 발견할 수 있습니다. 또한, 자신의 자동적이고 부정적인 사고 패턴을 인식하고 이를 보다 긍정적이고 건설적인 생각으로 바꾸는 '인지적재구성'을 촉진합니다."
              source="Baikie & Wilhelm, 2005, Advances in Psychiatric Treatment"
            />
          </View>
        </View>

        {/* 확인 버튼*/}
      </ScrollView>
        <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.3 }}
            style={styles.gradientButtonContainer}
            >
            <Button title="확인" variant="active" size="large" onPress={handleBack} activeOpacity={0.8}/>
        </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  titleContainer: {
    gap: 16,
  },
  subText: {
    ...typography.body2,
    color: colors.grayScale500,
  },
  visualContainer: {
    alignItems: 'center',
    borderRadius: radius.r12,
  },
  visualImageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  contentBox: {
    borderRadius: radius.r16,
    backgroundColor: colors.primary50,
    padding: 20,
    gap: 16,
  },
  contentBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  contentBoxTitle: {
    ...typography.body1,
    color: colors.grayScale800,
  },
  contentBoxHeaderLeft: {
    width: 24,
    height: 24,
    borderRadius: radius.r6,
    backgroundColor: colors.primary300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBoxHeaderLeftText: {
    ...typography.body4,
    color: colors.white,
  },
  contentBoxContent: {
  },
  contentBoxContentText: {
    ...typography.body5,
    color: colors.primary900,
    lineHeight: 20,
  },
  sourceText: {
    ...typography.caption4,
    color: colors.primary600,
    alignSelf: 'flex-end',
  },
  gradientButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
  },
});

export default EmotionRecordHelpScreen; 