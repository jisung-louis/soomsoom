import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, StyleProp, ViewStyle, FlatList, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Badge from '../../common/badge/Badge';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { Button } from '../../common/buttons/Button';
import PlayTitle from './common/PlayTitle';
import { Banner } from '../../../types';
import { Dimensions } from 'react-native';
import CatCryIcon from '../../../assets/icons/charactors/cat-variation/cat_cry.svg';

interface PlayBannerProps {
  style?: StyleProp<ViewStyle>;
  onPress?: (banner: Banner) => void;
  banners: Banner[];
  isLoading?: boolean;
}

const CARD_WIDTH = Dimensions.get('window').width - 40;

const PlayBanner = ({ style, onPress, banners, isLoading = false }: PlayBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 로딩 중이거나 배너 데이터가 없으면 기본 UI 표시
  if (isLoading) {
    return (
      <View style={[styles.bannerContainer, style]}>
        <PlayTitle title='playBanner' showArrow={false} />
        <View style={styles.card}>
          <View style={[styles.image, { backgroundColor: colors.grayScale100, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color={colors.grayScale400} size='large' />
          </View>
        </View>
      </View>
    );
  } else if (banners.length === 0) {
    return (
      <View style={[styles.bannerContainer, style]}>
        <PlayTitle title='playBanner' showArrow={false} />
        <View style={styles.card}>
          <View style={[styles.image, { backgroundColor: colors.grayScale100, justifyContent: 'center', alignItems: 'center' }]}>
            <CatCryIcon />
            <Text style={[styles.loadingText, { marginTop: 20 }]}>배너를 준비중이에요!</Text>
          </View>
        </View>
      </View>
    );
  }

  // 액티비티 타입에 따른 배지 텍스트 매핑
  const getActivityTypeText = (activityType: string) => {
    switch (activityType) {
      case 'MEDITATION':
        return '명상';
      case 'BREATHING':
        return '호흡';
      case 'SLEEP':
        return '수면';
      case 'FOCUS':
        return '집중';
      default:
        return '활동';
    }
  };

  const renderBannerItem = ({ item: banner }: { item: Banner }) => (
    <View style={styles.card}>
      <ImageBackground
        source={typeof banner.imageUrl === 'string' ? { uri: banner.imageUrl } : banner.imageUrl}
        style={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(11, 11, 11, 0.6)']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.overlayContent}>
            <View style={styles.labelContainer}>
              <Badge title={getActivityTypeText(banner.activityType)} variant='default' />
              <Text style={styles.title}>{banner.description}</Text>
            </View>
            <Button 
              title={banner.buttonText} 
              variant='white' 
              style={{alignSelf: 'center', width: '100%', height: 48}} 
              onPress={() => onPress?.(banner)}
            />
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  return (
    <View style={[styles.bannerContainer, style]}>
      <PlayTitle title='playBanner' showArrow={false} />
      {banners.length > 1 ? (
        <>
        <FlatList
          data={banners}
          renderItem={renderBannerItem}
          keyExtractor={(item) => item.bannerId.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={CARD_WIDTH + 20} // 카드 너비 + 간격(20)
          snapToAlignment="start"
          decelerationRate="fast"
          onScroll={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(contentOffsetX / (CARD_WIDTH + 20));
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
        />
        {/* 페이지 인디케이터 */}
        <View style={styles.pageIndicatorContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.pageIndicator,
                index === currentIndex && styles.pageIndicatorActive
              ]}
            />
          ))}
        </View>
        </>
      ) : (
            renderBannerItem({ item: banners[0] })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    width: CARD_WIDTH, // 고정 너비
    marginRight: 20, // 카드 간 간격
  },
  image: {
    width: '100%',
    height: 380,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  overlayContent: {
    gap : 13,
  },
  labelContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    ...typography.heading7,
    color: colors.white,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.grayScale300,
  },
  pageIndicatorActive: {
    backgroundColor: colors.primary300,
    width: 24,
  },
  loadingText: {
    ...syongsyongTypography.title6,
    color: colors.grayScale600,
  },
});

export default PlayBanner; 