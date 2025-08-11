import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import ArrowRight from '../../../../assets/icons/common/arrow_right.svg';
import { colors } from '../../../../constants/colors';
import { syongsyongTypography } from '../../../../constants/typography';

const PlayTitle = ({ title, showArrow = true, onPress, style }: { title: 'playMainCard' | 'playShortMeditationList' | 'playRecommendedContentList' | 'playCategoryList', showArrow?: boolean, onPress?: () => void, style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.container, style]}>
    {title === 'playMainCard' && <Text style={{...syongsyongTypography.title5}}>나를 알아가는 마음 운동</Text>}
    {title === 'playShortMeditationList' && <Text style={{...syongsyongTypography.title5}}>회복을 위한, 짧은 5분!</Text>}
    {title === 'playRecommendedContentList' && <Text style={{...syongsyongTypography.title5}}>나를 위한 추천 콘텐츠</Text>}
    {title === 'playCategoryList' && <Text style={{...syongsyongTypography.title5}}>둘러보기</Text>}
    {showArrow && (
      <TouchableOpacity onPress={onPress}>
        <ArrowRight color={colors.grayScale800} width={24} height={24} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
});

export default PlayTitle;