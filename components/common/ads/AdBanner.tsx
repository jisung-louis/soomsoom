import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../../../constants/ads';

interface AdBannerProps {
  size?: BannerAdSize;
  style?: any;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.BANNER, 
  style 
}) => {
  // 개발 환경에서는 테스트 광고 ID 사용, 프로덕션에서는 실제 광고 단위 ID 사용
  // const adUnitId = __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.BANNER;

  // 출시 전 까지는 테스트 광고 ID 사용
  const adUnitId = TestIds.BANNER;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('광고가 성공적으로 로드되었습니다.');
        }}
        onAdFailedToLoad={(error) => {
          console.log('광고 로드 실패:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdBanner;
