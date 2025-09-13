import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import ArrowRight from '../../../../assets/icons/common/arrow_right.svg';
import { colors } from '../../../../constants/colors';
import { syongsyongTypography } from '../../../../constants/typography';

const PlayTitle = ({ title, showArrow = true, onPress, style }: { title: 'playBanner' | 'playShortActivityList' | 'playRecommendedContentList' | 'playCategoryList', showArrow?: boolean, onPress?: () => void, style?: StyleProp<ViewStyle> }) => {
  return (
    showArrow ? (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {title === 'playBanner' && <Text style={{...syongsyongTypography.title5}}>나를 알아가는 마음 운동</Text>}
      {title === 'playShortActivityList' && <Text style={{...syongsyongTypography.title5}}>회복을 위한, 짧은 5분!</Text>}
      {title === 'playRecommendedContentList' && <Text style={{...syongsyongTypography.title5}}>나를 위한 추천 콘텐츠</Text>}
      {title === 'playCategoryList' && <Text style={{...syongsyongTypography.title5}}>둘러보기</Text>}
      <View>
        <ArrowRight color={colors.grayScale800} width={24} height={24} />
      </View>
    </TouchableOpacity>
    ) : (
      <View style={[styles.container, style]}>
        {title === 'playBanner' && <Text style={{...syongsyongTypography.title5}}>나를 알아가는 마음 운동</Text>}
        {title === 'playShortActivityList' && <Text style={{...syongsyongTypography.title5}}>회복을 위한, 짧은 5분!</Text>}
        {title === 'playRecommendedContentList' && <Text style={{...syongsyongTypography.title5}}>나를 위한 추천 콘텐츠</Text>}
        {title === 'playCategoryList' && <Text style={{...syongsyongTypography.title5}}>둘러보기</Text>}
      </View>
  ))
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
});

export default PlayTitle;